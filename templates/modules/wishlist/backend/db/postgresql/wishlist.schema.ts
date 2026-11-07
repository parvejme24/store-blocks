import { pgTable, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";

export const wishlists = pgTable("wishlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),
  productIds: jsonb("product_ids").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type WishlistRow = typeof wishlists.$inferSelect;
export type InsertWishlistRow = typeof wishlists.$inferInsert;

