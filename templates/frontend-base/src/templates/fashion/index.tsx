import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreTemplate, TemplateHomeProps, TemplateProduct } from "../types";

const CATEGORIES = [
  { title: "Women", blurb: "Dresses, tailoring and knitwear" },
  { title: "Men", blurb: "Shirts, outerwear and essentials" },
  { title: "Accessories", blurb: "Bags, belts and leather goods" }
];

const samples: TemplateProduct[] = [
  { id: "f1", name: "Relaxed Linen Shirt", slug: "relaxed-linen-shirt", priceMinor: 186000, currency: "BDT", category: "Shirts", stock: 22, rating: 4.5 },
  { id: "f2", name: "Wool Blend Overcoat", slug: "wool-blend-overcoat", priceMinor: 920000, currency: "BDT", category: "Outerwear", stock: 4, rating: 4.9 },
  { id: "f3", name: "Pleated Midi Skirt", slug: "pleated-midi-skirt", priceMinor: 215000, currency: "BDT", category: "Women", stock: 14, rating: 4.4 },
  { id: "f4", name: "Structured Leather Tote", slug: "structured-leather-tote", priceMinor: 640000, currency: "BDT", category: "Accessories", stock: 7, rating: 4.7 },
  { id: "f5", name: "Ribbed Merino Crewneck", slug: "ribbed-merino-crewneck", priceMinor: 265000, currency: "BDT", category: "Knitwear", stock: 0, rating: 4.6 },
  { id: "f6", name: "Tapered Chino Trousers", slug: "tapered-chino-trousers", priceMinor: 158000, currency: "BDT", category: "Men", stock: 30, rating: 4.2 }
];

function FashionHome({ products, shopHref }: TemplateHomeProps) {
  return (
    <div>
      {/* Editorial hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div className="space-y-7">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Autumn / Winter edit</p>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Dressed for the season ahead
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Considered tailoring, natural fibres and quiet details, made to be worn every day.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={shopHref} className="inline-flex items-center justify-center gap-2 bg-primary px-7 py-3.5 text-sm font-semibold tracking-wide text-primary-foreground transition-opacity hover:opacity-90">
              Shop new in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href={shopHref} className="inline-flex items-center justify-center border border-foreground/20 px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors hover:bg-accent">
              Explore men
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-accent via-muted to-card">
          <div className="absolute inset-x-6 bottom-6 space-y-1 bg-background/85 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lookbook 01</p>
            <p className="font-serif text-2xl">The tailored coat</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((category) => (
            <Link key={category.title} href={shopHref} className="group flex min-h-[12rem] flex-col justify-end border border-border bg-card p-6 transition-colors hover:bg-accent">
              <h2 className="font-serif text-2xl">{category.title}</h2>
              <p className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                {category.blurb}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* New in */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">New in</h2>
          <Link href={shopHref} className="text-sm font-medium underline-offset-4 hover:underline">
            Shop all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Quote band */}
      <section className="bg-accent">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="font-serif text-2xl italic leading-relaxed sm:text-3xl">
            &ldquo;Quiet luxury, made to be worn daily.&rdquo;
          </p>
          <Link href={shopHref} className="mt-8 inline-block text-xs font-semibold uppercase tracking-[0.2em] underline-offset-4 hover:underline">
            Discover the collection
          </Link>
        </div>
      </section>
    </div>
  );
}

export const fashionTemplate: StoreTemplate = {
  id: "fashion",
  category: "Fashion & apparel",
  cliLayout: "fashion",
  name: "Fashion Editorial",
  tagline: "Light, serif and editorial",
  description: "Magazine-style hero, category tiles and a new-in grid for apparel and accessories.",
  tokens: {
    background: "40 33% 98%",
    foreground: "24 10% 10%",
    card: "40 30% 100%",
    primary: "24 10% 10%",
    "primary-foreground": "40 33% 98%",
    muted: "36 20% 94%",
    "muted-foreground": "24 6% 42%",
    accent: "30 25% 91%",
    border: "30 12% 86%"
  },
  samples,
  Home: FashionHome
};
