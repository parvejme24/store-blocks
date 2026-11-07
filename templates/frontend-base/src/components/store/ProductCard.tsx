"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingBag, Star } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useStoreBasePath } from "./StoreProviders";

export type ProductCardData = {
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  category?: string;
  imageUrl?: string;
  imageAlt?: string;
  stock?: number;
  rating?: number;
};

function stockLabel(stock: number | undefined) {
  if (stock === undefined) return null;
  if (stock <= 0) return { text: "Out of stock", className: "text-destructive" };
  if (stock <= 5) return { text: `Only ${stock} left`, className: "text-amber-500" };
  return { text: "In stock", className: "text-emerald-500" };
}

/**
 * Product tile for grids. Colours come from the active template's tokens.
 * Fades in when it scrolls into view and lifts slightly on hover.
 */
export function ProductCard({ product }: { product: ProductCardData }) {
  const stock = stockLabel(product.stock);
  const basePath = useStoreBasePath();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-muted via-card to-accent">
        {product.imageUrl ? (
          // Product images come from the configured storage provider, so they are not optimized here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-primary/40" aria-hidden="true" />
          </div>
        )}
        {product.category && (
          <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full border border-border bg-background/70 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur sm:left-3 sm:top-3">
            {product.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground">
            <Link href={`${basePath}/products/${product.slug}`} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
            {product.rating !== undefined && (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                {product.rating.toFixed(1)}
              </span>
            )}
            {stock && <span className={`font-medium ${stock.className}`}>{stock.text}</span>}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-sm font-semibold tabular-nums text-foreground sm:text-base">
            {formatPrice(product.priceMinor, product.currency)}
          </span>
          <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View &rarr;
          </span>
        </div>
      </div>
    </motion.article>
  );
}
