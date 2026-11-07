import { z } from "zod";
import { storedFileSchema, paginationQuerySchema } from "../../../shared-base/src/index.js";

export const brandSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Brand name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().default(""),
  logo: storedFileSchema.nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Brand = z.infer<typeof brandSchema>;

export const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().default(""),
  logo: storedFileSchema.nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().default(true)
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;

export const updateBrandSchema = createBrandSchema.partial();
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export const brandQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  isActive: z
    .preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean())
    .optional()
});

export type BrandQuery = z.infer<typeof brandQuerySchema>;

