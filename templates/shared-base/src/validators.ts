import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional()
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const moneyMinorSchema = z
  .number()
  .int({ message: "Money must be integer minor units (e.g. cents/poisha)" })
  .min(0, { message: "Amount cannot be negative" });

export const storedFileSchema = z.object({
  key: z.string().min(1),
  provider: z.enum(["cloudinary", "s3", "local"]),
  alt: z.string().optional()
});

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required")
});

export const slugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required")
});

