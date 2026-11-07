import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { StoredFile } from "../../../../../shared-base/src/index.js";

export const settings = pgTable("settings", {
  id: text("id").primaryKey().default("default"),
  storeName: text("store_name").notNull().default("StoreBlocks Store"),
  storeDescription: text("store_description").notNull().default("Your modular e-commerce store"),
  logo: jsonb("logo").$type<StoredFile | null>(),
  favicon: jsonb("favicon").$type<StoredFile | null>(),
  email: text("email").notNull().default("store@example.com"),
  phone: text("phone").notNull().default("+8801700000000"),
  address: text("address").notNull().default("Dhaka, Bangladesh"),
  currency: varchar("currency", { length: 3 }).notNull().default("BDT"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type SettingsRow = typeof settings.$inferSelect;
export type InsertSettingsRow = typeof settings.$inferInsert;

