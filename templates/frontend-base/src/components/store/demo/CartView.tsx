"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useDemoCart, useStoreBasePath } from "../StoreProviders";
import type { DemoZone } from "@/admin/demo/dataset";

/**
 * Shipping estimate for the cart, using the first delivery zone. The real rate is
 * set at checkout from the chosen zone. Mirrors the free-over threshold rule.
 */
export function shippingFor(zone: DemoZone | undefined, subtotalMinor: number) {
  if (!zone) return 0;
  return subtotalMinor >= zone.freeOverMinor ? 0 : zone.flatRateMinor;
}

/** Cart page body. Quantities and removals are saved in this browser, per theme. */
export function CartView({ zones, currency }: { zones: DemoZone[]; currency: string }) {
  const basePath = useStoreBasePath();
  const cart = useDemoCart();
  const shipping = shippingFor(zones[0], cart.subtotalMinor);
  const total = cart.subtotalMinor + (cart.lines.length > 0 ? shipping : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Your cart</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Shopping cart</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {cart.count} {cart.count === 1 ? "item" : "items"}
        </p>
      </header>

      {!cart.ready ? (
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-muted" aria-busy="true" />
      ) : cart.lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-20 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a product to see it here.</p>
          <Link href={`${basePath}/products`} className="btn-brand mt-6">Browse products</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {cart.lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-4 p-4 sm:gap-6 sm:p-5">
                <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-accent sm:h-28 sm:w-24">
                  <ShoppingBag className="h-7 w-7 text-primary/40" aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`${basePath}/products/${product.slug}`} className="line-clamp-2 font-medium hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
                    <p className="mt-1 text-sm tabular-nums">{formatPrice(product.priceMinor, product.currency)}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(product.id, quantity - 1)}
                        disabled={quantity <= 1}
                        aria-label={`Decrease quantity of ${product.name}`}
                        className="flex h-8 w-8 items-center justify-center hover:bg-accent disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(product.id, quantity + 1)}
                        disabled={product.stock !== undefined && quantity >= product.stock}
                        aria-label={`Increase quantity of ${product.name}`}
                        className="flex h-8 w-8 items-center justify-center hover:bg-accent disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold tabular-nums">{formatPrice(product.priceMinor * quantity, product.currency)}</span>
                      <button
                        type="button"
                        onClick={() => cart.removeItem(product.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside aria-label="Order summary" className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-semibold">Order summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(cart.subtotalMinor, currency)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Shipping (estimate)</dt>
                <dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping, currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(total, currency)}</dd>
              </div>
            </dl>
            <Link href={`${basePath}/checkout`} className="btn-brand w-full justify-center">Proceed to checkout</Link>
            <button
              type="button"
              onClick={() => cart.clear()}
              className="w-full text-center text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Clear cart
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
