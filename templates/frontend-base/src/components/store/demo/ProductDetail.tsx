"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { TemplateProduct } from "@/templates/types";
import type { ProductDetail as Details } from "@/templates/demo/details";
import { ProductCard } from "../ProductCard";
import { useDemoCart, useStoreBasePath } from "../StoreProviders";

function stockStatus(stock: number | undefined) {
  if (stock === undefined) return { label: "Availability on request", tone: "text-muted-foreground" };
  if (stock <= 0) return { label: "Out of stock", tone: "text-destructive" };
  if (stock <= 5) return { label: `Only ${stock} left`, tone: "text-amber-500" };
  return { label: "In stock", tone: "text-emerald-500" };
}

/** Product details page body: image, price, quantity, add to cart, specs and related items. */
export function ProductDetail({
  product,
  details,
  related
}: {
  product: TemplateProduct;
  details: Details;
  related: TemplateProduct[];
}) {
  const router = useRouter();
  const basePath = useStoreBasePath();
  const cart = useDemoCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock !== undefined && product.stock <= 0;
  const maxQuantity = product.stock !== undefined && product.stock > 0 ? product.stock : 99;
  const stock = stockStatus(product.stock);

  function addToCart() {
    cart.addItem(product, quantity);
    setAdded(true);
  }

  function buyNow() {
    cart.addItem(product, quantity);
    router.push(`${basePath}/cart`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={`${basePath}/products`} className="hover:text-foreground">Shop</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`${basePath}/products?category=${encodeURIComponent(product.category ?? "")}`} className="hover:text-foreground">
              {product.category ?? "All products"}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate text-foreground" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-muted via-card to-accent">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.imageAlt ?? product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-16 w-16 text-primary/40" aria-hidden="true" />
              <p className="text-sm font-medium text-muted-foreground">{product.category}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm font-medium text-primary">{details.brand}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {product.rating !== undefined && (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                {product.rating.toFixed(1)} rating
              </span>
            )}
            <span className={`font-medium ${stock.tone}`}>{stock.label}</span>
          </div>

          <p className="mt-6 text-3xl font-bold tabular-nums">{formatPrice(product.priceMinor, product.currency)}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{details.description}</p>

          {/* Purchase */}
          <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium">Quantity</span>
              <div className="inline-flex items-center rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || outOfStock}
                  aria-label="Decrease quantity"
                  className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-accent disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span aria-live="polite" className="w-10 text-center text-sm font-semibold tabular-nums">{outOfStock ? 0 : quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity || outOfStock}
                  aria-label="Increase quantity"
                  className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-accent disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={addToCart}
                disabled={outOfStock || !cart.ready}
                className="btn-brand justify-center disabled:opacity-50"
              >
                {added ? <Check className="h-4 w-4" aria-hidden="true" /> : <ShoppingBag className="h-4 w-4" aria-hidden="true" />}
                {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
              </button>
              <button
                type="button"
                onClick={buyNow}
                disabled={outOfStock || !cart.ready}
                className="btn-ghost justify-center disabled:opacity-50"
              >
                Buy now
              </button>
            </div>
            {added && (
              <p role="status" className="text-sm text-emerald-500">
                {quantity} added. <Link href={`${basePath}/cart`} className="font-medium underline underline-offset-4">View cart</Link>
              </p>
            )}
          </div>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3"><Truck className="h-4 w-4 text-primary" aria-hidden="true" />Delivery in 2 to 4 days inside the city.</li>
            <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />Easy returns within 7 days.</li>
          </ul>
        </div>
      </div>

      {/* Highlights */}
      <section aria-labelledby="highlights" className="mt-16 grid gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-1">
          <h2 id="highlights" className="font-semibold">Highlights</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {details.highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-semibold">Product details</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Brand</dt>
              <dd className="mt-1 font-medium">{details.brand}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="mt-1 font-medium">{product.category ?? "General"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Currency</dt>
              <dd className="mt-1 font-medium">{product.currency}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">SKU</dt>
              <dd className="mt-1 font-mono font-medium">{product.id.toUpperCase()}-{product.slug.slice(0, 6).toUpperCase()}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
