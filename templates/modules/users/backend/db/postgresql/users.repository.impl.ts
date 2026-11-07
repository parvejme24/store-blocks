import { eq, and, sql, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  User,
  UserWithPassword,
  CreateUserInput,
  AdminUpdateUserInput,
  UserQuery
} from "../../../shared/users.schemas.js";
import { UserRepository } from "../../users.repository.js";
import { users, UserRow } from "./users.schema.js";

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as any,
    phone: row.phone || undefined,
    addresses: (row.addresses || []) as any,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function rowToUserWithPassword(row: UserRow): UserWithPassword {
  const user = rowToUser(row);
  return {
    ...user,
    passwordHash: row.passwordHash
  };
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findMany(query: UserQuery): Promise<Paginated<User>> {
    const client = this.resolveClient();
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.q) {
      conditions.push(
        sql`(${users.name} ILIKE ${`%${query.q}%`} OR ${users.email} ILIKE ${`%${query.q}%`})`
      );
    }
    if (query.role) {
      conditions.push(eq(users.role, query.role));
    }
    if (query.isActive !== undefined) {
      conditions.push(eq(users.isActive, query.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      client.select().from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
      client.select({ count: sql<number>`count(*)` }).from(users).where(whereClause)
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows.map(rowToUser),
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<User | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(users).where(eq(users.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToUser(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    const client = this.resolveClient();
    const rows = await client.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToUser(row);
  }

  async findWithPasswordByEmail(email: string): Promise<UserWithPassword | null> {
    const client = this.resolveClient();
    const rows = await client.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToUserWithPassword(row);
  }

  async create(input: CreateUserInput, passwordHash: string, tx?: TxContext): Promise<User> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(users)
      .values({
        name: input.name,
        email: input.email.toLowerCase().trim(),
        passwordHash,
        role: input.role || "customer",
        phone: input.phone,
        addresses: input.addresses || [],
        isActive: input.isActive ?? true
      })
      .returning();

    return rowToUser(rows[0]!);
  }

  async update(id: string, input: AdminUpdateUserInput, tx?: TxContext): Promise<User | null> {
    const client = this.resolveClient(tx);
    const updateValues: Record<string, any> = {
      updatedAt: new Date()
    };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.phone !== undefined) updateValues.phone = input.phone;
    if (input.addresses !== undefined) updateValues.addresses = input.addresses;
    if (input.role !== undefined) updateValues.role = input.role;
    if (input.isActive !== undefined) updateValues.isActive = input.isActive;

    const rows = await client
      .update(users)
      .set(updateValues)
      .where(eq(users.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToUser(row);
  }

  async updatePassword(id: string, passwordHash: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return rows.length > 0;
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return rows.length > 0;
  }
}

