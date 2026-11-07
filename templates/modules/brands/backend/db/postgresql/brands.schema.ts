import { pgTable, uuid, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { StoredFile } from "../../../../../shared-base/src/index.js";

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  logo: jsonb("logo").$type<StoredFile | null>(),
  website: text("website"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type BrandRow = typeof brands.$inferSelect;
export type InsertBrandRow = typeof brands.$inferInsert;

