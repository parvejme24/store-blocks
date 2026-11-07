import { eq, and, sql, ilike, gte, lte, desc, asc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQuery
} from "../../../shared/products.schemas.js";
import { ProductRepository } from "../../products.repository.js";
import { products, ProductRow } from "./products.schema.js";

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceMinor: row.priceMinor,
    compareAtPriceMinor: row.compareAtPriceMinor ?? null,
    currency: row.currency,
    sku: row.sku,
    stock: row.stock,
    images: (row.images || []) as any,
    variants: (row.variants || []) as any,
    categoryIds: (row.categoryIds || []) as any,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export class PostgresProductRepository implements ProductRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findMany(query: ProductQuery): Promise<Paginated<Product>> {
    const client = this.resolveClient();
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.q) {
      conditions.push(
        sql`(${products.name} ILIKE ${`%${query.q}%`} OR ${products.description} ILIKE ${`%${query.q}%`})`
      );
    }
    if (query.category) {
      conditions.push(sql`${products.categoryIds} @> ${JSON.stringify([query.category])}`);
    }
    if (query.inStock) {
      conditions.push(sql`${products.stock} > 0`);
    }
    if (query.minPrice !== undefined) {
      conditions.push(gte(products.priceMinor, query.minPrice));
    }
    if (query.maxPrice !== undefined) {
      conditions.push(lte(products.priceMinor, query.maxPrice));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy = desc(products.createdAt);
    if (query.sort) {
      const isDesc = query.sort.startsWith("-");
      const field = isDesc ? query.sort.slice(1) : query.sort;
      if (field === "priceMinor") {
        orderBy = isDesc ? desc(products.priceMinor) : asc(products.priceMinor);
      } else if (field === "name") {
        orderBy = isDesc ? desc(products.name) : asc(products.name);
      } else if (field === "createdAt") {
        orderBy = isDesc ? desc(products.createdAt) : asc(products.createdAt);
      }
    }

    const [rows, totalResult] = await Promise.all([
      client.select().from(products).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
      client.select({ count: sql<number>`count(*)` }).from(products).where(whereClause)
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows.map(rowToProduct),
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Product | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(products).where(eq(products.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToProduct(row);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const client = this.resolveClient();
    const rows = await client.select().from(products).where(eq(products.slug, slug)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToProduct(row);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const client = this.resolveClient();
    const rows = await client.select().from(products).where(eq(products.sku, sku)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToProduct(row);
  }

  async create(input: CreateProductInput, tx?: TxContext): Promise<Product> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(products)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        priceMinor: input.priceMinor,
        compareAtPriceMinor: input.compareAtPriceMinor,
        currency: input.currency,
        sku: input.sku,
        stock: input.stock,
        images: input.images as any,
        variants: input.variants as any,
        categoryIds: input.categoryIds as any,
        isActive: input.isActive
      })
      .returning();

    return rowToProduct(rows[0]!);
  }

  async update(id: string, input: UpdateProductInput, tx?: TxContext): Promise<Product | null> {
    const client = this.resolveClient(tx);
    const updateValues: Record<string, any> = {
      updatedAt: new Date()
    };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.slug !== undefined) updateValues.slug = input.slug;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.priceMinor !== undefined) updateValues.priceMinor = input.priceMinor;
    if (input.compareAtPriceMinor !== undefined) updateValues.compareAtPriceMinor = input.compareAtPriceMinor;
    if (input.currency !== undefined) updateValues.currency = input.currency;
    if (input.sku !== undefined) updateValues.sku = input.sku;
    if (input.stock !== undefined) updateValues.stock = input.stock;
    if (input.images !== undefined) updateValues.images = input.images;
    if (input.variants !== undefined) updateValues.variants = input.variants;
    if (input.categoryIds !== undefined) updateValues.categoryIds = input.categoryIds;
    if (input.isActive !== undefined) updateValues.isActive = input.isActive;

    const rows = await client
      .update(products)
      .set(updateValues)
      .where(eq(products.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToProduct(row);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client.delete(products).where(eq(products.id, id)).returning({ id: products.id });
    return rows.length > 0;
  }

  async decrementStock(id: string, qty: number, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client
      .update(products)
      .set({
        stock: sql`${products.stock} - ${qty}`,
        updatedAt: new Date()
      })
      .where(and(eq(products.id, id), gte(products.stock, qty)))
      .returning({ id: products.id });

    return rows.length > 0;
  }
}

