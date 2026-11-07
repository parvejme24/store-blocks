import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const shippingZones = pgTable("shipping_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  rateMinor: integer("rate_minor").notNull(),
  freeShippingThresholdMinor: integer("free_shipping_threshold_minor"),
  estimatedDays: text("estimated_days").notNull().default("2-3 business days"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type ShippingZoneRow = typeof shippingZones.$inferSelect;
export type InsertShippingZoneRow = typeof shippingZones.$inferInsert;

