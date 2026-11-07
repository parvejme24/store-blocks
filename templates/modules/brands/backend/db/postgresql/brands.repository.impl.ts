import { eq, and, sql, asc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
  BrandQuery
} from "../../../shared/brands.schemas.js";
import { BrandRepository } from "../../brands.repository.js";
import { brands, BrandRow } from "./brands.schema.js";

function rowToBrand(row: BrandRow): Brand {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logo: (row.logo || null) as any,
    website: row.website || undefined,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export class PostgresBrandRepository implements BrandRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findMany(query: BrandQuery): Promise<Paginated<Brand>> {
    const client = this.resolveClient();
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.q) {
      conditions.push(sql`${brands.name} ILIKE ${`%${query.q}%`}`);
    }
    if (query.isActive !== undefined) {
      conditions.push(eq(brands.isActive, query.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      client.select().from(brands).where(whereClause).orderBy(asc(brands.name)).limit(limit).offset(offset),
      client.select({ count: sql<number>`count(*)` }).from(brands).where(whereClause)
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows.map(rowToBrand),
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Brand | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(brands).where(eq(brands.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToBrand(row);
  }

  async findBySlug(slug: string, tx?: TxContext): Promise<Brand | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(brands).where(eq(brands.slug, slug)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToBrand(row);
  }

  async create(input: CreateBrandInput, tx?: TxContext): Promise<Brand> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(brands)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        logo: input.logo as any,
        website: input.website,
        isActive: input.isActive
      })
      .returning();

    return rowToBrand(rows[0]!);
  }

  async update(id: string, input: UpdateBrandInput, tx?: TxContext): Promise<Brand | null> {
    const client = this.resolveClient(tx);
    const updateValues: Record<string, any> = {
      updatedAt: new Date()
    };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.slug !== undefined) updateValues.slug = input.slug;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.logo !== undefined) updateValues.logo = input.logo;
    if (input.website !== undefined) updateValues.website = input.website;
    if (input.isActive !== undefined) updateValues.isActive = input.isActive;

    const rows = await client
      .update(brands)
      .set(updateValues)
      .where(eq(brands.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToBrand(row);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client.delete(brands).where(eq(brands.id, id)).returning({ id: brands.id });
    return rows.length > 0;
  }
}

