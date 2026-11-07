import Link from "next/link";
import { ArrowRight, Battery, Headphones, Keyboard, Laptop, Monitor, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreTemplate, TemplateHomeProps, TemplateProduct } from "../types";

const CATEGORIES = [
  { title: "Laptops", icon: Laptop },
  { title: "Audio", icon: Headphones },
  { title: "Keyboards", icon: Keyboard },
  { title: "Displays", icon: Monitor }
];

const SPEC_ROWS = [
  { label: "Connectivity", value: "Bluetooth 5.3 / USB-C" },
  { label: "Battery", value: "Up to 40 hours" },
  { label: "Warranty", value: "2 years" },
  { label: "Weight", value: "320 g" }
];

const samples: TemplateProduct[] = [
  { id: "e1", name: "Pro 14 Ultrabook", slug: "pro-14-ultrabook", priceMinor: 14500000, currency: "BDT", category: "Laptops", stock: 6, rating: 4.7 },
  { id: "e2", name: "ANC Wireless Headphones", slug: "anc-wireless-headphones", priceMinor: 1850000, currency: "BDT", category: "Audio", stock: 16, rating: 4.6 },
  { id: "e3", name: "75% Hot-Swap Keyboard", slug: "75-hot-swap-keyboard", priceMinor: 680000, currency: "BDT", category: "Keyboards", stock: 9, rating: 4.8 },
  { id: "e4", name: "27 in 4K IPS Monitor", slug: "27-4k-ips-monitor", priceMinor: 3290000, currency: "BDT", category: "Displays", stock: 0, rating: 4.5 },
  { id: "e5", name: "Compact Wireless Earbuds", slug: "compact-wireless-earbuds", priceMinor: 790000, currency: "BDT", category: "Audio", stock: 3, rating: 4.3 },
  { id: "e6", name: "Gaming Laptop 16 GB", slug: "gaming-laptop-16gb", priceMinor: 16900000, currency: "BDT", category: "Laptops", stock: 2, rating: 4.4 }
];

function ElectronicsHome({ products, shopHref }: TemplateHomeProps) {
  return (
    <div className="pb-8">
      {/* Spec-led hero */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Tested. Benchmarked. Warrantied.
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Performance gear, <span className="text-primary">compared clearly</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              Real specifications side by side, so you can pick the right device without the guesswork.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {["Hot-swap switches", "Wireless 2.4 GHz", "1-year warranty", "Free set-up help"].map((chip) => (
                <span key={chip} className="rounded-md border border-border bg-card px-2.5 py-1 font-mono">{chip}</span>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={shopHref} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Shop all devices
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={shopHref} className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent">
                Compare models
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-primary/5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Example spec sheet</p>
              <Battery className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <dl className="mt-5 divide-y divide-border">
              {SPEC_ROWS.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-mono font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                href={shopHref}
                className="group flex items-center justify-between rounded-xl border border-border bg-card px-5 py-5 transition-colors hover:border-primary/50"
              >
                <span className="flex items-center gap-3 font-semibold">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  {category.title}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Top rated */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-primary">Top rated</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Benchmarked favourites</h2>
          </div>
          <Link href={shopHref} className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
            All products
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Compare band */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-primary/30 bg-accent p-6 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Compare up to four models side by side</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">Check specs, warranty and stock in one view before you buy.</p>
          </div>
          <Link href={shopHref} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Start comparing
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export const electronicsTemplate: StoreTemplate = {
  id: "electronics",
  category: "Electronics & gadgets",
  cliLayout: "electronics",
  name: "Tech & Electronics",
  tagline: "Dark slate, cyan accents, spec-first",
  description: "Spec-sheet hero, category shortcuts and a comparison band for gadgets and computing.",
  tokens: {
    background: "220 30% 6%",
    foreground: "210 25% 96%",
    card: "220 25% 10%",
    primary: "190 95% 50%",
    "primary-foreground": "220 40% 6%",
    muted: "220 22% 13%",
    "muted-foreground": "215 14% 62%",
    accent: "200 50% 16%",
    border: "220 20% 18%"
  },
  samples,
  Home: ElectronicsHome
};
