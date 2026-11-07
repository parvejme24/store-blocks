import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TxContext } from "../../../../../shared-base/src/index.js";
import { Wishlist } from "../../../shared/wishlist.schemas.js";
import { WishlistRepository } from "../../wishlist.repository.js";
import { wishlists, WishlistRow } from "./wishlist.schema.js";

function rowToWishlist(row: WishlistRow): Wishlist {
  return {
    id: row.id,
    userId: row.userId,
    productIds: (row.productIds || []) as any,
    updatedAt: row.updatedAt
  };
}

export class PostgresWishlistRepository implements WishlistRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findByUserId(userId: string, tx?: TxContext): Promise<Wishlist | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(wishlists).where(eq(wishlists.userId, userId)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToWishlist(row);
  }

  async save(wishlist: Wishlist, tx?: TxContext): Promise<Wishlist> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(wishlists)
      .values({
        userId: wishlist.userId,
        productIds: wishlist.productIds as any
      })
      .onConflictDoUpdate({
        target: wishlists.userId,
        set: {
          productIds: wishlist.productIds as any,
          updatedAt: new Date()
        }
      })
      .returning();

    return rowToWishlist(rows[0]!);
  }
}

