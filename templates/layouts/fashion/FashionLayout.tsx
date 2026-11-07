"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, Eye, Heart, ArrowRight } from "lucide-react";

export interface FashionProduct {
  id: string;
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  images: { key: string; alt?: string }[];
  colors?: string[];
  sizes?: string[];
  tag?: string;
}

export function FashionLayout({ products = [] }: { products?: FashionProduct[] }) {
  const [selectedColor, setSelectedColor] = useState<Record<string, string>>({});

  return (
    <div className="space-y-16">
      {/* Fashion Editorial Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white p-8 md:p-20 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur tracking-widest uppercase">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Autumn / Winter Capsule
          </div>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-tight">
            Effortless Elegance, <span className="font-serif italic font-normal">Modern Silhouettes</span>
          </h1>
          <p className="text-neutral-300 text-base md:text-lg max-w-lg font-light leading-relaxed">
            Curated seasonal collection crafted from sustainable Italian wool and natural fibres. Designed to outlast trends.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="#collection"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 shadow-md"
            >
              Explore Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#lookbook"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </section>

      {/* Swatch & Variant Grid */}
      <section id="collection" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Ready to Wear</span>
            <h2 className="text-3xl font-light tracking-tight">Seasonal Arrivals</h2>
          </div>
          <div className="flex gap-2">
            {["All", "Coats", "Knitwear", "Tailoring", "Accessories"].map((filter, i) => (
              <button
                key={filter}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
            No products uploaded yet. Visit the Admin Catalog to populate items with swatches and sizes.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => {
              const activeColor = selectedColor[p.id] || p.colors?.[0] || "#111827";
              return (
                <div key={p.id} className="group flex flex-col space-y-3">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0].key}
                        alt={p.images[0].alt || p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400">
                        <ShoppingBag className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                    {p.tag && (
                      <span className="absolute top-3 left-3 rounded-md bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                        {p.tag}
                      </span>
                    )}
                    <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button className="rounded-full bg-white/90 p-2 text-neutral-800 shadow hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/products/slug/${p.slug}`}
                        className="rounded-full bg-white/90 p-2 text-neutral-800 shadow hover:bg-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <Link href={`/products/slug/${p.slug}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                      <span className="font-semibold">
                        {(p.priceMinor / 100).toLocaleString()} {p.currency}
                      </span>
                    </div>

                    {/* Color Swatches */}
                    {p.colors && p.colors.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {p.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor({ ...selectedColor, [p.id]: color })}
                            className={`h-4 w-4 rounded-full border border-white shadow-sm transition-transform ${
                              activeColor === color ? "ring-2 ring-primary ring-offset-1 scale-110" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    )}

                    {/* Available Sizes */}
                    {p.sizes && p.sizes.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Sizes: {p.sizes.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lookbook Banner */}
      <section id="lookbook" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center rounded-3xl border bg-muted/40 p-8 md:p-12">
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Behind The Seams</span>
          <h3 className="text-2xl md:text-4xl font-light tracking-tight">Crafted for Movement & Longevity</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Every garment begins with bespoke fabric sourcing and finishes with hand-pressed hems. Explore our visual lookbook and sizing guide.
          </p>
          <div className="pt-2">
            <button className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90">
              Download Sizing Guide (PDF)
            </button>
          </div>
        </div>
        <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-muted-foreground border">
          <span className="text-sm font-medium">Lookbook Editorial Showcase</span>
        </div>
      </section>
    </div>
  );
}

