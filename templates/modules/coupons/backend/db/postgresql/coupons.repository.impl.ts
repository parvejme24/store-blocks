import { eq, and, sql, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Coupon,
  DiscountType,
  CreateCouponInput,
  UpdateCouponInput,
  CouponQuery
} from "../../../shared/coupons.schemas.js";
import { CouponRepository } from "../../coupons.repository.js";
import { coupons, CouponRow } from "./coupons.schema.js";

function rowToCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discountType as DiscountType,
    discountValue: row.discountValue,
    minOrderMinor: row.minOrderMinor,
    maxDiscountMinor: row.maxDiscountMinor ?? null,
    usageLimit: row.usageLimit ?? null,
    usedCount: row.usedCount,
    expiresAt: row.expiresAt ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export class PostgresCouponRepository implements CouponRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findMany(query: CouponQuery): Promise<Paginated<Coupon>> {
    const client = this.resolveClient();
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.q) {
      conditions.push(sql`${coupons.code} ILIKE ${`%${query.q}%`}`);
    }
    if (query.isActive !== undefined) {
      conditions.push(eq(coupons.isActive, query.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      client.select().from(coupons).where(whereClause).orderBy(desc(coupons.createdAt)).limit(limit).offset(offset),
      client.select({ count: sql<number>`count(*)` }).from(coupons).where(whereClause)
    ]);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows.map(rowToCoupon),
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Coupon | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToCoupon(row);
  }

  async findByCode(code: string, tx?: TxContext): Promise<Coupon | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToCoupon(row);
  }

  async create(input: CreateCouponInput, tx?: TxContext): Promise<Coupon> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(coupons)
      .values({
        code: input.code.toUpperCase(),
        discountType: input.discountType,
        discountValue: input.discountValue,
        minOrderMinor: input.minOrderMinor || 0,
        maxDiscountMinor: input.maxDiscountMinor,
        usageLimit: input.usageLimit,
        expiresAt: input.expiresAt,
        isActive: input.isActive ?? true
      })
      .returning();

    return rowToCoupon(rows[0]!);
  }

  async update(id: string, input: UpdateCouponInput, tx?: TxContext): Promise<Coupon | null> {
    const client = this.resolveClient(tx);
    const updateValues: Record<string, any> = {
      updatedAt: new Date()
    };
    if (input.code !== undefined) updateValues.code = input.code.toUpperCase();
    if (input.discountType !== undefined) updateValues.discountType = input.discountType;
    if (input.discountValue !== undefined) updateValues.discountValue = input.discountValue;
    if (input.minOrderMinor !== undefined) updateValues.minOrderMinor = input.minOrderMinor;
    if (input.maxDiscountMinor !== undefined) updateValues.maxDiscountMinor = input.maxDiscountMinor;
    if (input.usageLimit !== undefined) updateValues.usageLimit = input.usageLimit;
    if (input.expiresAt !== undefined) updateValues.expiresAt = input.expiresAt;
    if (input.isActive !== undefined) updateValues.isActive = input.isActive;

    const rows = await client
      .update(coupons)
      .set(updateValues)
      .where(eq(coupons.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToCoupon(row);
  }

  async incrementUsage(id: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client
      .update(coupons)
      .set({
        usedCount: sql`${coupons.usedCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(coupons.id, id))
      .returning({ id: coupons.id });

    return rows.length > 0;
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client.delete(coupons).where(eq(coupons.id, id)).returning({ id: coupons.id });
    return rows.length > 0;
  }
}

