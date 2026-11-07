import Link from "next/link";
import { ArrowRight, Beef, Clock, Coffee, Croissant, Leaf, Milk, Package, Truck } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreTemplate, TemplateHomeProps, TemplateProduct } from "../types";

const AISLES = [
  { title: "Produce", icon: Leaf },
  { title: "Dairy & Eggs", icon: Milk },
  { title: "Bakery", icon: Croissant },
  { title: "Meat & Fish", icon: Beef },
  { title: "Pantry", icon: Package },
  { title: "Drinks", icon: Coffee }
];

const samples: TemplateProduct[] = [
  { id: "g1", name: "Farm Eggs (12 pcs)", slug: "farm-eggs-12", priceMinor: 18000, currency: "BDT", category: "Dairy & Eggs", stock: 40, rating: 4.8 },
  { id: "g2", name: "Organic Bananas (1 kg)", slug: "organic-bananas-1kg", priceMinor: 9500, currency: "BDT", category: "Produce", stock: 25, rating: 4.6 },
  { id: "g3", name: "Sourdough Loaf", slug: "sourdough-loaf", priceMinor: 32000, currency: "BDT", category: "Bakery", stock: 6, rating: 4.9 },
  { id: "g4", name: "Whole Milk (1 L)", slug: "whole-milk-1l", priceMinor: 11000, currency: "BDT", category: "Dairy & Eggs", stock: 0, rating: 4.5 },
  { id: "g5", name: "Cold-Pressed Orange Juice (1 L)", slug: "orange-juice-1l", priceMinor: 26000, currency: "BDT", category: "Drinks", stock: 18, rating: 4.4 },
  { id: "g6", name: "Basmati Rice (5 kg)", slug: "basmati-rice-5kg", priceMinor: 74000, currency: "BDT", category: "Pantry", stock: 33, rating: 4.7 }
];

function GroceryHome({ products, shopHref }: TemplateHomeProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Delivery hero */}
      <section className="grid gap-8 rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:p-14">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            Farm-fresh, picked daily
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Fresh groceries, delivered today
          </h1>
          <p className="max-w-lg text-sm leading-relaxed opacity-90 sm:text-base">
            Vegetables, dairy, bakery and pantry staples, packed for quick delivery to your door.
          </p>
          <Link
            href={shopHref}
            className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
          >
            Start shopping
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="space-y-3 rounded-2xl bg-primary-foreground/10 p-5 text-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5" aria-hidden="true" />
            <span>
              Next delivery slot <strong className="font-semibold">4:00 PM to 6:00 PM</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5" aria-hidden="true" />
            <span>Free delivery on qualifying orders</span>
          </div>
        </div>
      </section>

      {/* Aisles */}
      <section>
        <h2 className="mb-5 text-xl font-bold tracking-tight">Shop by aisle</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {AISLES.map((aisle) => {
            const Icon = aisle.icon;
            return (
              <Link
                key={aisle.title}
                href={shopHref}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center text-xs font-medium transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {aisle.title}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fresh picks */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Fresh picks</h2>
            <p className="mt-1 text-sm text-muted-foreground">Restocked this morning</p>
          </div>
          <Link href={shopHref} className="text-sm font-semibold text-primary hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Deals band */}
      <section className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-accent p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-sm font-semibold text-primary">Weekly deals</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Stock up and save on pantry staples</h2>
        </div>
        <Link href={shopHref} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          View deals
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}

export const groceryTemplate: StoreTemplate = {
  id: "grocery",
  category: "Grocery & daily essentials",
  cliLayout: "grocery",
  name: "Fresh Grocery",
  tagline: "Green, fresh and quick to shop",
  description: "Delivery-slot hero, aisle shortcuts and a quick-scan grid for supermarkets and daily essentials.",
  tokens: {
    background: "90 30% 97%",
    foreground: "150 25% 10%",
    card: "0 0% 100%",
    primary: "142 60% 30%",
    "primary-foreground": "0 0% 100%",
    muted: "120 15% 93%",
    "muted-foreground": "150 8% 38%",
    accent: "45 80% 92%",
    border: "140 15% 88%"
  },
  samples,
  Home: GroceryHome
};
