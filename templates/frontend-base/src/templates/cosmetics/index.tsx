import Link from "next/link";
import { ArrowRight, Droplets, Leaf, Sparkles, Sun } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreTemplate, TemplateHomeProps, TemplateProduct } from "../types";

const CONCERNS = [
  { title: "Hydration", icon: Droplets },
  { title: "Brightening", icon: Sun },
  { title: "Anti-ageing", icon: Sparkles },
  { title: "Calm & clear", icon: Leaf }
];

const ROUTINE = [
  { step: "01", title: "Cleanse", body: "Start with a gentle wash that leaves skin comfortable." },
  { step: "02", title: "Treat", body: "Layer a serum or essence for your main concern." },
  { step: "03", title: "Protect", body: "Finish with moisturiser and daily sun protection." }
];

const samples: TemplateProduct[] = [
  { id: "c1", name: "Hydrating Hyaluronic Serum", slug: "hydrating-hyaluronic-serum", priceMinor: 165000, currency: "BDT", category: "Skincare", stock: 26, rating: 4.8 },
  { id: "c2", name: "Gentle Foaming Cleanser", slug: "gentle-foaming-cleanser", priceMinor: 72000, currency: "BDT", category: "Skincare", stock: 40, rating: 4.6 },
  { id: "c3", name: "Velvet Matte Lip Tint", slug: "velvet-matte-lip-tint", priceMinor: 48000, currency: "BDT", category: "Makeup", stock: 3, rating: 4.5 },
  { id: "c4", name: "Daily Mineral Sunscreen SPF 50", slug: "mineral-sunscreen-spf50", priceMinor: 98000, currency: "BDT", category: "Sun care", stock: 19, rating: 4.9 },
  { id: "c5", name: "Repair Hair Mask", slug: "repair-hair-mask", priceMinor: 88000, currency: "BDT", category: "Haircare", stock: 0, rating: 4.3 },
  { id: "c6", name: "Vitamin C Brightening Cream", slug: "vitamin-c-brightening-cream", priceMinor: 124000, currency: "BDT", category: "Skincare", stock: 11, rating: 4.7 }
];

function CosmeticsHome({ products, shopHref }: TemplateHomeProps) {
  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Skin-first beauty</p>
        <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Glow that starts with your routine
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Simple, effective formulas organised by what your skin needs most.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={shopHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Shop bestsellers
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href={shopHref} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold transition-colors hover:bg-accent">
            Build my routine
          </Link>
        </div>
      </section>

      {/* Shop by concern */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="mb-4 text-center text-sm font-medium text-muted-foreground">Shop by concern</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CONCERNS.map((concern) => {
            const Icon = concern.icon;
            return (
              <Link
                key={concern.title}
                href={shopHref}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-sm font-semibold transition-colors hover:border-primary/40"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {concern.title}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Bestsellers</h2>
          <p className="mt-2 text-muted-foreground">Rated by people with real routines</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Routine */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-accent p-6 sm:p-12">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">A simple three-step routine</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ROUTINE.map((item) => (
              <div key={item.step} className="rounded-2xl bg-card p-6">
                <p className="text-sm font-bold text-primary">{item.step}</p>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto mt-16 grid max-w-5xl gap-6 px-4 text-center text-sm sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold">Free returns</p>
          <p className="mt-1 text-muted-foreground">Within 14 days of delivery</p>
        </div>
        <div>
          <p className="font-semibold">Secure checkout</p>
          <p className="mt-1 text-muted-foreground">Cards, mobile banking and cash on delivery</p>
        </div>
        <div>
          <p className="font-semibold">Gift wrapping</p>
          <p className="mt-1 text-muted-foreground">Add a card message at checkout</p>
        </div>
      </section>
    </div>
  );
}

export const cosmeticsTemplate: StoreTemplate = {
  id: "cosmetics",
  category: "Beauty & cosmetics",
  cliLayout: "cosmetics",
  name: "Beauty & Skincare",
  tagline: "Soft rose, routine-first",
  description: "Concern-based shopping, bestseller grid and a three-step routine for cosmetics and skincare.",
  tokens: {
    background: "340 40% 98%",
    foreground: "330 20% 12%",
    card: "0 0% 100%",
    primary: "336 50% 52%",
    "primary-foreground": "0 0% 100%",
    muted: "340 30% 95%",
    "muted-foreground": "330 8% 45%",
    accent: "30 60% 94%",
    border: "340 25% 90%"
  },
  samples,
  Home: CosmeticsHome
};
