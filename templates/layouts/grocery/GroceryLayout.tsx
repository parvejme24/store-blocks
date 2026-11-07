"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Apple, ShoppingBasket, Plus, Minus, Check, Clock, Truck, ShoppingBag } from "lucide-react";

export interface GroceryProduct {
  id: string;
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  images: { key: string; alt?: string }[];
  unit?: string; // e.g. "1 kg", "500 g", "Dozen"
  category?: string;
  origin?: string;
}

export function GroceryLayout({ products = [] }: { products?: GroceryProduct[] }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Fresh Produce", "Dairy & Eggs", "Bakery", "Meat & Seafood", "Pantry Essentials"];

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-10">
      {/* Grocery Delivery Banner */}
      <section className="rounded-2xl bg-emerald-700 text-white p-6 md:p-10 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-semibold">
              <Apple className="h-3.5 w-3.5 text-emerald-300" />
              100% Farm Fresh Guarantee
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Fresh Groceries Delivered in 60 Minutes
            </h1>
            <p className="text-emerald-100 text-sm md:text-base max-w-xl">
              Organic vegetables, dairy, farm eggs, and pantry staples picked daily and delivered to your doorstep.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur p-4 text-xs space-y-2 border border-white/20 min-w-[220px]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-300" />
              <span>Next Delivery Slot: <strong>4:00 PM - 6:00 PM</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-300" />
              <span>Free Delivery on orders over <strong>৳500</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Category Ribbon */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur py-3 border-y">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grocery Catalog Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">{activeCategory} Items</h2>
          <span className="text-xs text-muted-foreground">{filteredProducts.length} items available</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No grocery items listed in this section yet. Add products with units and weights in the Admin Dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((p) => {
              const qty = quantities[p.id] || 0;
              return (
                <div key={p.id} className="flex flex-col justify-between rounded-xl border bg-card p-3 shadow-xs hover:shadow transition">
                  <div className="space-y-2">
                    <div className="relative aspect-square w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0].key}
                          alt={p.images[0].alt || p.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <ShoppingBasket className="h-8 w-8 text-muted-foreground/30" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                        <Link href={`/products/slug/${p.slug}`} className="hover:underline">
                          {p.name}
                        </Link>
                      </h4>
                      <p className="text-[11px] text-muted-foreground">{p.unit || "per pack"}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t">
                    <span className="text-xs font-bold text-foreground">
                      {(p.priceMinor / 100).toLocaleString()} {p.currency}
                    </span>

                    {/* Quick Quantity Counter */}
                    {qty === 0 ? (
                      <button
                        onClick={() => updateQuantity(p.id, 1)}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-500"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    ) : (
                      <div className="flex items-center rounded-md border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-xs">
                        <button
                          onClick={() => updateQuantity(p.id, -1)}
                          className="px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-bold text-emerald-800 dark:text-emerald-200">{qty}</span>
                        <button
                          onClick={() => updateQuantity(p.id, 1)}
                          className="px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

