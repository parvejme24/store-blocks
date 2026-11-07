import { z } from "zod";

export const wishlistSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productIds: z.array(z.string()).default([]),
  updatedAt: z.coerce.date()
});

export type Wishlist = z.infer<typeof wishlistSchema>;

export const toggleWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required")
});

export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>;

