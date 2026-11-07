import { eq, and, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Review,
  ReviewQuery
} from "../../../shared/reviews.schemas.js";
import { ReviewRepository, CreateReviewData } from "../../reviews.repository.js";
import { reviews, ReviewRow } from "./reviews.schema.js";

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.productId,
    userId: row.userId,
    userName: row.userName,
    rating: row.rating,
    comment: row.comment,
    isApproved: row.isApproved,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export class PostgresReviewRepository implements ReviewRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findMany(query: ReviewQuery): Promise<Paginated<Review>> {
    const client = this.resolveClient();
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.productId) {
      conditions.push(eq(reviews.productId, query.productId));
    }
    if (query.isApproved !== undefined) {
      conditions.push(eq(reviews.isApproved, query.isApproved));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      client.select().from(reviews).where(whereClause).orderBy(desc(reviews.createdAt)).limit(limit).offset(offset),
      client.select().from(reviews).where(whereClause)
    ]);

    const total = totalResult.length;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: rows.map(rowToReview),
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Review | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToReview(row);
  }

  async create(data: CreateReviewData, tx?: TxContext): Promise<Review> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(reviews)
      .values({
        productId: data.productId,
        userId: data.userId,
        userName: data.userName,
        rating: data.rating,
        comment: data.comment,
        isApproved: data.isApproved
      })
      .returning();

    return rowToReview(rows[0]!);
  }

  async updateApproval(id: string, isApproved: boolean, tx?: TxContext): Promise<Review | null> {
    const client = this.resolveClient(tx);
    const rows = await client
      .update(reviews)
      .set({ isApproved, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToReview(row);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client.delete(reviews).where(eq(reviews.id, id)).returning({ id: reviews.id });
    return rows.length > 0;
  }
}

