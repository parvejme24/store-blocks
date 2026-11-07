import { pgTable, uuid, text, integer, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { ProductVariant } from "../../shared/products.schemas.js";
import { StoredFile } from "../../../../../shared-base/src/index.js";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  priceMinor: integer("price_minor").notNull(),
  compareAtPriceMinor: integer("compare_at_price_minor"),
  currency: varchar("currency", { length: 3 }).notNull().default("BDT"),
  sku: text("sku").notNull().unique(),
  stock: integer("stock").notNull().default(0),
  images: jsonb("images").$type<StoredFile[]>().notNull().default([]),
  variants: jsonb("variants").$type<ProductVariant[]>().notNull().default([]),
  categoryIds: jsonb("category_ids").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type ProductRow = typeof products.$inferSelect;
export type InsertProductRow = typeof products.$inferInsert;

