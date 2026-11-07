import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  minOrderMinor: integer("min_order_minor").notNull().default(0),
  maxDiscountMinor: integer("max_discount_minor"),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type CouponRow = typeof coupons.$inferSelect;
export type InsertCouponRow = typeof coupons.$inferInsert;

