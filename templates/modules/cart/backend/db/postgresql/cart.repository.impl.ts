import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TxContext } from "../../../../../shared-base/src/index.js";
import { Cart } from "../../../shared/cart.schemas.js";
import { CartRepository } from "../../cart.repository.js";
import { carts, CartRow } from "./cart.schema.js";

function rowToCart(row: CartRow): Cart {
  return {
    id: row.id,
    userId: row.userId || undefined,
    guestToken: row.guestToken || undefined,
    items: row.items || [],
    subtotalMinor: row.subtotalMinor,
    currency: row.currency,
    updatedAt: row.updatedAt
  };
}

export class PostgresCartRepository implements CartRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findByUserId(userId: string, tx?: TxContext): Promise<Cart | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToCart(row);
  }

  async findByGuestToken(guestToken: string, tx?: TxContext): Promise<Cart | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(carts).where(eq(carts.guestToken, guestToken)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToCart(row);
  }

  async save(cart: Cart, tx?: TxContext): Promise<Cart> {
    const client = this.resolveClient(tx);
    let existingRow: CartRow | undefined;

    if (cart.userId) {
      const rows = await client.select().from(carts).where(eq(carts.userId, cart.userId)).limit(1);
      existingRow = rows[0];
    } else if (cart.guestToken) {
      const rows = await client.select().from(carts).where(eq(carts.guestToken, cart.guestToken)).limit(1);
      existingRow = rows[0];
    }

    if (existingRow) {
      const updated = await client
        .update(carts)
        .set({
          items: cart.items as any,
          subtotalMinor: cart.subtotalMinor,
          currency: cart.currency,
          updatedAt: new Date()
        })
        .where(eq(carts.id, existingRow.id))
        .returning();

      return rowToCart(updated[0]!);
    }

    const inserted = await client
      .insert(carts)
      .values({
        userId: cart.userId,
        guestToken: cart.guestToken,
        items: cart.items as any,
        subtotalMinor: cart.subtotalMinor,
        currency: cart.currency
      })
      .returning();

    return rowToCart(inserted[0]!);
  }

  async deleteByGuestToken(guestToken: string, tx?: TxContext): Promise<void> {
    const client = this.resolveClient(tx);
    await client.delete(carts).where(eq(carts.guestToken, guestToken));
  }
}

