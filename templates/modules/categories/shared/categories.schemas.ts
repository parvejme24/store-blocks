import { z } from "zod";
import { storedFileSchema } from "../../../shared-base/src/index.js";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().default(""),
  parentId: z.string().nullable().default(null),
  image: storedFileSchema.nullable().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().default(""),
  parentId: z.string().nullable().optional().default(null),
  image: storedFileSchema.nullable().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true)
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const categoryQuerySchema = z.object({
  parentId: z.string().nullable().optional(),
  isActive: z
    .preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean())
    .optional()
});

export type CategoryQuery = z.infer<typeof categoryQuerySchema>;

