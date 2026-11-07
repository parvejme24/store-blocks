"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { Select } from "@/components/ui/Select";
import { StoreFrame } from "@/components/store/StoreFrame";
import { DEFAULT_TEMPLATE } from "@/templates/registry";

export type ProductsViewProduct = Product;

export interface Product {
  id: string;
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  category: string;
  stock: number;
}

type SortKey = "name" | "price-asc" | "price-desc";

export function ProductsView({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("name");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(q);
        const matchCat = selectedCategory === "All" || p.category === selectedCategory;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceMinor - b.priceMinor;
        if (sortBy === "price-desc") return b.priceMinor - a.priceMinor;
        return a.name.localeCompare(b.name);
      });
  }, [search, selectedCategory, sortBy]);

  return (
    <StoreFrame template={DEFAULT_TEMPLATE}>
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Heading */}
      <header className="space-y-3">
        <p className="text-sm font-medium text-violet-300">Catalog</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">All products</h1>
        <p className="text-muted-foreground">
          Showing {filtered.length} of {products.length} products
        </p>
      </header>

      {/* Toolbar */}
      <div className="mt-10 space-y-4 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-violet-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div className="sm:w-56">
            <Select<SortKey>
              label="Sort products"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "name", label: "Name" },
                { value: "price-asc", label: "Price: low to high" },
                { value: "price-desc", label: "Price: high to low" }
              ]}
            />
          </div>
        </div>

        <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {categories.map((cat) => {
            const selected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selected}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 text-primary-foreground shadow-md shadow-violet-600/25"
                    : "border-border text-muted-foreground hover:border-violet-400/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-20 text-center">
            <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-semibold">No products match</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  name: product.name,
                  slug: product.slug,
                  priceMinor: product.priceMinor,
                  currency: product.currency,
                  category: product.category,
                  stock: product.stock
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </StoreFrame>
  );
}
