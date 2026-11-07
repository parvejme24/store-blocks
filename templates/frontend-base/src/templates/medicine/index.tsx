import Link from "next/link";
import { ArrowRight, Baby, Bandage, HeartPulse, Pill, Search, ShieldCheck, Stethoscope, Thermometer } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreTemplate, TemplateHomeProps, TemplateProduct } from "../types";

const CATEGORIES = [
  { title: "Pain relief", icon: Pill },
  { title: "Vitamins", icon: HeartPulse },
  { title: "Baby care", icon: Baby },
  { title: "First aid", icon: Bandage },
  { title: "Fever & cold", icon: Thermometer },
  { title: "Health devices", icon: Stethoscope }
];

const samples: TemplateProduct[] = [
  { id: "m1", name: "Pain Relief Tablets (20 pcs)", slug: "pain-relief-tablets-20", priceMinor: 6500, currency: "BDT", category: "Pain relief", stock: 60, rating: 4.6 },
  { id: "m2", name: "Daily Multivitamin (30 tabs)", slug: "daily-multivitamin-30", priceMinor: 42000, currency: "BDT", category: "Vitamins", stock: 24, rating: 4.7 },
  { id: "m3", name: "Digital Thermometer", slug: "digital-thermometer", priceMinor: 35000, currency: "BDT", category: "Health devices", stock: 9, rating: 4.8 },
  { id: "m4", name: "Baby Gentle Wipes (80 pcs)", slug: "baby-gentle-wipes-80", priceMinor: 18000, currency: "BDT", category: "Baby care", stock: 0, rating: 4.5 },
  { id: "m5", name: "First Aid Kit, Home", slug: "first-aid-kit-home", priceMinor: 95000, currency: "BDT", category: "First aid", stock: 14, rating: 4.4 },
  { id: "m6", name: "Cough Syrup (100 ml)", slug: "cough-syrup-100ml", priceMinor: 12500, currency: "BDT", category: "Fever & cold", stock: 3, rating: 4.3 }
];

function MedicineHome({ products, shopHref }: TemplateHomeProps) {
  return (
    <div className="pb-8">
      {/* Hero with search */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Genuine products, checked at checkout
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Your pharmacy, <span className="text-primary">open online</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              Medicines, vitamins, baby care and first-aid essentials, with clear labels and simple reordering.
            </p>
            <form action={shopHref} className="flex max-w-xl gap-2 rounded-xl border border-border bg-card p-2">
              <label className="flex flex-1 items-center gap-2 px-2">
                <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Search medicines and health products</span>
                <input
                  type="search"
                  name="q"
                  placeholder="Search medicines, vitamins, devices"
                  className="w-full bg-transparent py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <button type="submit" className="rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">
                Search
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["Upload prescription", "Pharmacist review for restricted items"],
              ["Fast delivery", "Same-day in selected areas"],
              ["Easy reorder", "Repeat your usual order in one tap"],
              ["Secure payments", "Cash on delivery and cards"]
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5">
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-xl font-bold tracking-tight">Shop by health need</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                href={shopHref}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 text-sm font-medium transition-colors hover:border-primary/50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {category.title}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular this week</h2>
            <p className="mt-1 text-sm text-muted-foreground">Restocked regularly</p>
          </div>
          <Link href={shopHref} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Prescription band */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Have a prescription?</h2>
            <p className="mt-1 max-w-xl text-sm opacity-90">Upload it at checkout. Restricted items are reviewed before your order is confirmed.</p>
          </div>
          <Link href={shopHref} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-semibold text-foreground">
            Upload prescription
          </Link>
        </div>
      </section>
    </div>
  );
}

export const medicineTemplate: StoreTemplate = {
  id: "medicine",
  name: "Pharmacy & Health",
  tagline: "Clean teal, clear and trustworthy",
  description: "Health-need categories, a prominent search and a prescription band for pharmacies and health stores.",
  category: "Medicine & pharmacy",
  cliLayout: "medicine",
  tokens: {
    background: "180 30% 98%",
    foreground: "200 30% 12%",
    card: "0 0% 100%",
    primary: "172 70% 30%",
    "primary-foreground": "0 0% 100%",
    muted: "180 20% 94%",
    "muted-foreground": "200 10% 40%",
    accent: "190 50% 92%",
    border: "185 20% 86%"
  },
  samples,
  Home: MedicineHome
};
