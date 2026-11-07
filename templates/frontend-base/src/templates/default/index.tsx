import Link from "next/link";
import { ArrowRight, Boxes, CreditCard, Database, Layers } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreTemplate, TemplateHomeProps, TemplateProduct } from "../types";

const STATS = [
  { value: "19", label: "Modules" },
  { value: "2", label: "Database engines" },
  { value: "3", label: "Storage adapters" },
  { value: "3", label: "Payment gateways" }
];

const FEATURES = [
  { icon: Boxes, title: "Modular by default", body: "Select only the modules you need. Code for everything else is never generated." },
  { icon: Database, title: "MongoDB or PostgreSQL", body: "Every repository ships both implementations and passes the same contract tests." },
  { icon: CreditCard, title: "Payments that fit your market", body: "Cash on delivery, SSLCommerz and Stripe behind one adapter interface." },
  { icon: Layers, title: "Themes and layouts", body: "Fashion, electronics, grocery and cosmetics templates built on shared design tokens." }
];

const samples: TemplateProduct[] = [
  { id: "d1", name: "Classic Oxford Cotton Shirt", slug: "classic-oxford-cotton-shirt", priceMinor: 245000, currency: "BDT", category: "Apparel", stock: 18, rating: 4.6 },
  { id: "d2", name: "Tailored Italian Wool Blazer", slug: "tailored-italian-wool-blazer", priceMinor: 890000, currency: "BDT", category: "Outerwear", stock: 5, rating: 4.8 },
  { id: "d3", name: "Minimalist Leather Backpack", slug: "minimalist-leather-backpack", priceMinor: 520000, currency: "BDT", category: "Accessories", stock: 12, rating: 4.4 },
  { id: "d4", name: "High-Performance Mechanical Keyboard", slug: "high-performance-mechanical-keyboard", priceMinor: 680000, currency: "BDT", category: "Electronics", stock: 8, rating: 4.7 },
  { id: "d5", name: "Organic Single-Origin Coffee Beans (500g)", slug: "organic-single-origin-coffee-beans", priceMinor: 125000, currency: "BDT", category: "Grocery", stock: 45, rating: 4.9 },
  { id: "d6", name: "Ergonomic Lumbar Desk Chair", slug: "ergonomic-lumbar-desk-chair", priceMinor: 1450000, currency: "BDT", category: "Living", stock: 0, rating: 4.3 }
];

function DefaultHome({ products, shopHref }: TemplateHomeProps) {
  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="bg-dot-grid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="glow-violet absolute left-1/2 top-[-12rem] -z-10 h-[38rem] w-[60rem] max-w-none -translate-x-1/2 opacity-60"
        />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8 lg:pt-32">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Scaffolded with StoreBlocks
          </p>

          <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Commerce built from <span className="text-gradient">modular blocks</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Choose your database, storage and payments. Add your environment variables and launch a fast, SEO-ready storefront.
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href={shopHref} className="btn-brand">
              Shop the catalog
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/docs" className="btn-ghost">
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-background/80 px-6 py-6 text-center">
              <dt className="order-2 mt-1 text-xs font-medium text-muted-foreground">{stat.label}</dt>
              <dd className="order-1 text-3xl font-bold tracking-tight tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Featured</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Fresh arrivals</h2>
          </div>
          <Link href={shopHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            View all products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Why StoreBlocks</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Everything a store needs, nothing it doesn&apos;t</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-inset ring-primary/20">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-12 sm:py-16">
          <div aria-hidden="true" className="glow-violet absolute -top-24 left-1/2 h-80 w-[44rem] max-w-none -translate-x-1/2 opacity-50" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Ready to launch your store?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
            Scaffold with the CLI, choose your stack, and go from local development to production with one guide.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/docs#quickstart" className="btn-brand">Quick start guide</Link>
            <Link href="/docs/deployment" className="btn-ghost">Deployment guide</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export const defaultTemplate: StoreTemplate = {
  id: "default",
  category: "General store",
  cliLayout: "general",
  name: "Modern Dark",
  tagline: "Black and violet, built for any catalogue",
  description: "A general-purpose dark theme with a bold hero and a clean product grid.",
  tokens: {
    background: "265 35% 4%",
    foreground: "270 30% 97%",
    card: "265 28% 7%",
    primary: "265 90% 66%",
    "primary-foreground": "0 0% 100%",
    muted: "265 20% 11%",
    "muted-foreground": "260 12% 65%",
    accent: "268 45% 18%",
    border: "265 24% 16%"
  },
  samples,
  Home: DefaultHome
};
