import { z } from "zod";
import {
  paginationQuerySchema,
  moneyMinorSchema
} from "../../../shared-base/src/index.js";

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned"
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const paymentStatusSchema = z.enum(["unpaid", "paid", "failed", "refunded"]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const orderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  sku: z.string(),
  priceMinor: moneyMinorSchema,
  quantity: z.number().int().min(1),
  subtotalMinor: moneyMinorSchema
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderCustomerSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required")
});

export type OrderCustomer = z.infer<typeof orderCustomerSchema>;

export const orderShippingAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().optional(),
  country: z.string().default("Bangladesh")
});

export type OrderShippingAddress = z.infer<typeof orderShippingAddressSchema>;

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: orderStatusSchema.default("pending"),
  paymentStatus: paymentStatusSchema.default("unpaid"),
  paymentMethod: z.string(),
  transactionId: z.string().optional(),
  customer: orderCustomerSchema,
  shippingAddress: orderShippingAddressSchema,
  items: z.array(orderItemSchema),
  subtotalMinor: moneyMinorSchema,
  shippingMinor: moneyMinorSchema.default(0),
  discountMinor: moneyMinorSchema.default(0),
  totalMinor: moneyMinorSchema,
  currency: z.string().length(3).default("BDT"),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

export const checkoutItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1")
});

export const checkoutInputSchema = z.object({
  items: z.array(checkoutItemInputSchema).min(1, "Order must have at least one item"),
  customer: orderCustomerSchema,
  shippingAddress: orderShippingAddressSchema,
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional()
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const orderQuerySchema = paginationQuerySchema.extend({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  q: z.string().optional()
});

export type OrderQuery = z.infer<typeof orderQuerySchema>;

