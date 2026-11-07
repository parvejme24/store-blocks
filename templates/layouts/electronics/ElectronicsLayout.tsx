"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, Zap, SlidersHorizontal, ArrowRight, Check, ShoppingBag } from "lucide-react";

export interface ElectronicsProduct {
  id: string;
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  images: { key: string; alt?: string }[];
  specs?: Record<string, string>;
  warranty?: string;
  inStock?: boolean;
}

export function ElectronicsLayout({ products = [] }: { products?: ElectronicsProduct[] }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const comparedProducts = products.filter((p) => compareIds.includes(p.id));

  return (
    <div className="space-y-12">
      {/* Electronics Hero with Tech Badge */}
      <section className="rounded-2xl border bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-8 md:p-14 text-white shadow-lg">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-mono text-blue-400 border border-blue-500/30">
            <Cpu className="h-3.5 w-3.5" />
            Next-Gen Hardware Catalog
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            High-Performance Tech & Components
          </h1>
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
            Direct-sourced laptops, processors, peripherals, and developer hardware with verified manufacturer warranties and rapid dispatch.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="#products"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-500"
            >
              Browse Specifications <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <ShieldCheck className="h-8 w-8 text-blue-500 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold">Official Warranty</h4>
            <p className="text-xs text-muted-foreground">Up to 3-year official manufacturer replacement warranty</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <Zap className="h-8 w-8 text-amber-500 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold">Next-Day Dispatch</h4>
            <p className="text-xs text-muted-foreground">Order before 4 PM for guaranteed next-day courier delivery</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <SlidersHorizontal className="h-8 w-8 text-emerald-500 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold">Compare Matrix</h4>
            <p className="text-xs text-muted-foreground">Compare technical benchmarks & specs side-by-side</p>
          </div>
        </div>
      </div>

      {/* Product Grid with Specs */}
      <section id="products" className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Technical Catalog</h2>
          <span className="text-xs text-muted-foreground font-mono">
            Comparing {compareIds.length} of 3 items
          </span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No electronics catalog entries found. Add devices and spec tables in the Admin Dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const isCompared = compareIds.includes(p.id);
              return (
                <div key={p.id} className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
                  <div className="space-y-4">
                    <div className="relative aspect-video w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0].key}
                          alt={p.images[0].alt || p.name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        <Link href={`/products/slug/${p.slug}`} className="hover:text-primary">
                          {p.name}
                        </Link>
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-lg font-extrabold text-foreground">
                          {(p.priceMinor / 100).toLocaleString()} {p.currency}
                        </span>
                        {p.warranty && (
                          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                            {p.warranty}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spec Summary Table */}
                    {p.specs && (
                      <div className="rounded-lg bg-secondary/50 p-2.5 font-mono text-xs space-y-1">
                        {Object.entries(p.specs).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b border-border/40 pb-0.5 last:border-0 last:pb-0">
                            <span className="text-muted-foreground">{key}</span>
                            <span className="font-semibold text-foreground">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2 pt-2 border-t">
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border transition ${
                        isCompared
                          ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      {isCompared ? "Compared" : "Compare"}
                    </button>
                    <Link
                      href={`/products/slug/${p.slug}`}
                      className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      View Specs
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Side-by-Side Comparison Drawer / Modal if items are selected */}
      {comparedProducts.length > 0 && (
        <section className="rounded-xl border bg-card p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Specs Comparison Matrix</h3>
            <button
              onClick={() => setCompareIds([])}
              className="text-xs text-muted-foreground hover:underline"
            >
              Clear Comparison
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparedProducts.map((p) => (
              <div key={p.id} className="rounded-lg border p-4 bg-secondary/30 space-y-2 text-xs">
                <div className="font-bold text-sm">{p.name}</div>
                <div className="text-primary font-semibold">{(p.priceMinor / 100).toLocaleString()} {p.currency}</div>
                <div className="space-y-1 pt-2">
                  {p.specs ? (
                    Object.entries(p.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground">{k}:</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Standard specifications</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

