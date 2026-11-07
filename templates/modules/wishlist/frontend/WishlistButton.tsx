"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useGetWishlistQuery, useToggleWishlistMutation } from "./wishlistApi";

export function WishlistButton({ productId }: { productId: string }) {
  const { data } = useGetWishlistQuery();
  const [toggleWishlist, { isLoading }] = useToggleWishlistMutation();

  const isFavorited = data?.data?.productIds?.includes(productId) ?? false;

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => toggleWishlist(productId)}
      className={`rounded-full p-2 transition shadow-xs ${
        isFavorited
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/90 text-neutral-700 hover:bg-white dark:bg-neutral-800 dark:text-neutral-200"
      }`}
      title={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
    >
      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
    </button>
  );
}

