"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";
import { ProductItem } from "./productsApi";

export interface ProductCardProps {
  product: ProductItem;
  onAddToCart?: (product: ProductItem) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formattedPrice = (product.priceMinor / 100).toLocaleString();
  const formattedComparePrice = product.compareAtPriceMinor
    ? (product.compareAtPriceMinor / 100).toLocaleString()
    : null;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md">
      <div className="space-y-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          {product.images?.[0] ? (
            <img
              src={product.images[0].key}
              alt={product.images[0].alt || product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
          )}

          {product.stock <= 0 && (
            <span className="absolute top-2 left-2 rounded bg-zinc-900/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Out of Stock
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
            <Link href={`/products/slug/${product.slug}`} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              {formattedPrice} {product.currency}
            </span>
            {formattedComparePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formattedComparePrice} {product.currency}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 pt-2 border-t">
        <Link
          href={`/products/slug/${product.slug}`}
          className="flex-1 rounded-lg border bg-background py-2 text-center text-xs font-semibold text-foreground transition hover:bg-muted"
        >
          Details
        </Link>
        {onAddToCart && product.stock > 0 && (
          <button
            onClick={() => onAddToCart(product)}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

