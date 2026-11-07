import { z } from "zod";
import { paginationQuerySchema, moneyMinorSchema } from "../../../shared-base/src/index.js";

export const discountTypeSchema = z.enum(["percentage", "fixed"]);
export type DiscountType = z.infer<typeof discountTypeSchema>;

export const couponSchema = z.object({
  id: z.string(),
  code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
  discountType: discountTypeSchema,
  discountValue: z.number().int().min(1, "Discount value must be positive"),
  minOrderMinor: moneyMinorSchema.default(0),
  maxDiscountMinor: moneyMinorSchema.nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  usedCount: z.number().int().default(0),
  expiresAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Coupon = z.infer<typeof couponSchema>;

export const createCouponSchema = z.object({
  code: z.string().min(2).toUpperCase(),
  discountType: discountTypeSchema,
  discountValue: z.number().int().min(1),
  minOrderMinor: moneyMinorSchema.optional().default(0),
  maxDiscountMinor: moneyMinorSchema.nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional().default(true)
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = createCouponSchema.partial();
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

export const applyCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  subtotalMinor: moneyMinorSchema
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

export const couponQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  isActive: z
    .preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean())
    .optional()
});

export type CouponQuery = z.infer<typeof couponQuerySchema>;

