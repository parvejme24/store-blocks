import { z } from "zod";
import {
  paginationQuerySchema,
  moneyMinorSchema,
  storedFileSchema
} from "../../../shared-base/src/index.js";

export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "Variant SKU is required"),
  priceMinor: moneyMinorSchema.optional(),
  stock: z.number().int().min(0, "Variant stock cannot be negative"),
  attributes: z.record(z.string()).optional()
});

export type ProductVariant = z.infer<typeof productVariantSchema>;

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().default(""),
  priceMinor: moneyMinorSchema,
  compareAtPriceMinor: moneyMinorSchema.nullable().optional(),
  currency: z.string().length(3).default("BDT"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  images: z.array(storedFileSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  categoryIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().default(""),
  priceMinor: moneyMinorSchema,
  compareAtPriceMinor: moneyMinorSchema.nullable().optional(),
  currency: z.string().length(3).default("BDT"),
  sku: z.string().min(1, "SKU is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  images: z.array(storedFileSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  categoryIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  inStock: z
    .preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean())
    .optional()
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

