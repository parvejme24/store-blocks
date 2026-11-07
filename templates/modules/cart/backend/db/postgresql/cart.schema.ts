import { pgTable, uuid, text, integer, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { CartItem } from "../../shared/cart.schemas.js";

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  guestToken: text("guest_token"),
  items: jsonb("items").$type<CartItem[]>().notNull().default([]),
  subtotalMinor: integer("subtotal_minor").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("BDT"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type CartRow = typeof carts.$inferSelect;
export type InsertCartRow = typeof carts.$inferInsert;

