import { z } from "zod";
import { paginationQuerySchema } from "../../../shared-base/src/index.js";

export const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  userName: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
  isApproved: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type Review = z.infer<typeof reviewSchema>;

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, "Comment is required")
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const approveReviewSchema = z.object({
  isApproved: z.boolean()
});

export type ApproveReviewInput = z.infer<typeof approveReviewSchema>;

export const reviewQuerySchema = paginationQuerySchema.extend({
  productId: z.string().optional(),
  isApproved: z
    .preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean())
    .optional()
});

export type ReviewQuery = z.infer<typeof reviewQuerySchema>;

