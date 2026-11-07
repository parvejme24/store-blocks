import { eq, and, asc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TxContext } from "../../../../../shared-base/src/index.js";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQuery
} from "../../../shared/categories.schemas.js";
import { CategoryRepository } from "../../categories.repository.js";
import { categories, CategoryRow } from "./categories.schema.js";

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parentId,
    image: (row.image || null) as any,
    order: row.order,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export class PostgresCategoryRepository implements CategoryRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findMany(query?: CategoryQuery): Promise<Category[]> {
    const client = this.resolveClient();
    const conditions = [];

    if (query?.parentId !== undefined) {
      if (query.parentId === null) {
        conditions.push(eq(categories.parentId, null as any));
      } else {
        conditions.push(eq(categories.parentId, query.parentId));
      }
    }
    if (query?.isActive !== undefined) {
      conditions.push(eq(categories.isActive, query.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await client
      .select()
      .from(categories)
      .where(whereClause)
      .orderBy(asc(categories.order), asc(categories.name));

    return rows.map(rowToCategory);
  }

  async findById(id: string, tx?: TxContext): Promise<Category | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(categories).where(eq(categories.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToCategory(row);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const client = this.resolveClient();
    const rows = await client.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToCategory(row);
  }

  async create(input: CreateCategoryInput, tx?: TxContext): Promise<Category> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(categories)
      .values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        parentId: input.parentId || null,
        image: input.image || null,
        order: input.order,
        isActive: input.isActive
      })
      .returning();

    return rowToCategory(rows[0]!);
  }

  async update(id: string, input: UpdateCategoryInput, tx?: TxContext): Promise<Category | null> {
    const client = this.resolveClient(tx);
    const updateValues: Record<string, any> = {
      updatedAt: new Date()
    };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.slug !== undefined) updateValues.slug = input.slug;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.parentId !== undefined) updateValues.parentId = input.parentId;
    if (input.image !== undefined) updateValues.image = input.image;
    if (input.order !== undefined) updateValues.order = input.order;
    if (input.isActive !== undefined) updateValues.isActive = input.isActive;

    const rows = await client
      .update(categories)
      .set(updateValues)
      .where(eq(categories.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToCategory(row);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    return rows.length > 0;
  }
}

