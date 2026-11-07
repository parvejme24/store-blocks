import { pgTable, uuid, text, integer, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { OrderItem, OrderCustomer, OrderShippingAddress } from "../../shared/orders.schemas.js";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  customer: jsonb("customer").$type<OrderCustomer>().notNull(),
  shippingAddress: jsonb("shipping_address").$type<OrderShippingAddress>().notNull(),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotalMinor: integer("subtotal_minor").notNull(),
  shippingMinor: integer("shipping_minor").notNull().default(0),
  discountMinor: integer("discount_minor").notNull().default(0),
  totalMinor: integer("total_minor").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("BDT"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type OrderRow = typeof orders.$inferSelect;
export type InsertOrderRow = typeof orders.$inferInsert;

