import { z } from "zod";
import { moneyMinorSchema } from "../../../shared-base/src/index.js";

export const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  sku: z.string(),
  priceMinor: moneyMinorSchema,
  quantity: z.number().int().min(1),
  subtotalMinor: moneyMinorSchema,
  image: z.string().optional()
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  guestToken: z.string().optional(),
  items: z.array(cartItemSchema).default([]),
  subtotalMinor: moneyMinorSchema.default(0),
  currency: z.string().length(3).default("BDT"),
  updatedAt: z.coerce.date()
});

export type Cart = z.infer<typeof cartSchema>;

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1)
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative")
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const mergeCartSchema = z.object({
  guestToken: z.string().min(1, "Guest token is required")
});

export type MergeCartInput = z.infer<typeof mergeCartSchema>;

