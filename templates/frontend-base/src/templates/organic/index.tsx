import Link from "next/link";
import { ArrowRight, Coffee, Droplets, Flame, Flower2, Nut, Wheat } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreTemplate, TemplateHomeProps, TemplateProduct } from "../types";

const CATEGORIES = [
  { title: "Honey & spreads", icon: Flower2 },
  { title: "Tea & coffee", icon: Coffee },
  { title: "Oils & ghee", icon: Droplets },
  { title: "Dry fruits & nuts", icon: Nut },
  { title: "Whole grains", icon: Wheat },
  { title: "Spices", icon: Flame }
];

const samples: TemplateProduct[] = [
  { id: "o1", name: "Wild Forest Honey (500 g)", slug: "wild-forest-honey-500g", priceMinor: 85000, currency: "BDT", category: "Honey & spreads", stock: 20, rating: 4.9 },
  { id: "o2", name: "Cold-Pressed Mustard Oil (1 L)", slug: "mustard-oil-1l", priceMinor: 32000, currency: "BDT", category: "Oils & ghee", stock: 35, rating: 4.6 },
  { id: "o3", name: "Green Tea, Loose Leaf (100 g)", slug: "green-tea-loose-100g", priceMinor: 27000, currency: "BDT", category: "Tea & coffee", stock: 0, rating: 4.7 },
  { id: "o4", name: "Roasted Almonds (250 g)", slug: "roasted-almonds-250g", priceMinor: 54000, currency: "BDT", category: "Dry fruits & nuts", stock: 11, rating: 4.8 },
  { id: "o5", name: "Stone-Ground Wheat Flour (2 kg)", slug: "stone-ground-wheat-2kg", priceMinor: 26000, currency: "BDT", category: "Whole grains", stock: 40, rating: 4.5 },
  { id: "o6", name: "Ground Turmeric (200 g)", slug: "ground-turmeric-200g", priceMinor: 19000, currency: "BDT", category: "Spices", stock: 4, rating: 4.6 }
];

function OrganicHome({ products, shopHref }: TemplateHomeProps) {
  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Natural, minimally processed</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            From local farms <span className="text-primary">to your table</span>
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
            Honey, oils, grains and spices with the farm and harvest date shown on every product.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={shopHref} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Shop the harvest
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href={shopHref} className="inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold transition-colors hover:bg-accent">
              Meet the farms
            </Link>
          </div>
        </div>

        <div className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-muted to-card">
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-background/85 p-5 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">This season</p>
            <p className="mt-1 text-lg font-semibold">Wild forest honey, harvested in spring</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                href={shopHref}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-3 py-5 text-center text-sm font-medium transition-colors hover:border-primary/50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {category.title}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pantry favourites</h2>
          <p className="mt-2 text-muted-foreground">Small batches, clearly labelled</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Story band */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-accent px-6 py-14 text-center sm:px-12">
          <p className="text-xl font-semibold leading-relaxed sm:text-2xl">
            &ldquo;Every jar, bottle and bag shows where it came from and when it was made.&rdquo;
          </p>
          <Link href={shopHref} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            Browse all products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export const organicTemplate: StoreTemplate = {
  id: "organic",
  name: "Organic & Natural",
  tagline: "Earthy greens and warm cream",
  description: "Farm-origin hero, pantry categories and a story band for organic, natural and specialty food.",
  category: "Organic & natural food",
  cliLayout: "organic",
  tokens: {
    background: "70 30% 96%",
    foreground: "100 20% 12%",
    card: "0 0% 100%",
    primary: "95 40% 30%",
    "primary-foreground": "0 0% 100%",
    muted: "70 20% 92%",
    "muted-foreground": "100 10% 40%",
    accent: "40 50% 90%",
    border: "80 15% 84%"
  },
  samples,
  Home: OrganicHome
};
