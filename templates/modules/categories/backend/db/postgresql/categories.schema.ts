import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { StoredFile } from "../../../../../shared-base/src/index.js";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  parentId: uuid("parent_id"),
  image: jsonb("image").$type<StoredFile | null>(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type CategoryRow = typeof categories.$inferSelect;
export type InsertCategoryRow = typeof categories.$inferInsert;

