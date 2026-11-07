"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Sparkles,
  LayoutTemplate,
  Check,
  Eye,
  Shirt,
  Cpu,
  Apple,
  Flame,
  ArrowRight
} from "lucide-react";

export default function ThemesAndLayoutsPage() {
  const [selectedTheme, setSelectedTheme] = useState<"minimal" | "bold" | "elegant">("minimal");
  const [selectedLayout, setSelectedLayout] = useState<"fashion" | "electronics" | "grocery" | "landing">("fashion");

  const themes = [
    {
      id: "minimal",
      name: "Minimal",
      tagline: "Clean, Monochromatic & Modernist",
      description: "Neutral grayscale base with sharp typography, subtle 6px border radiuses, and restraint in shadow styling. Ideal for design-forward apparel, architecture, and homeware brands.",
      tokens: {
        radius: "0.375rem (6px)",
        primary: "hsl(0 0% 9%)",
        background: "hsl(0 0% 100%)",
        card: "hsl(0 0% 100%)",
        border: "hsl(0 0% 89.8%)"
      }
    },
    {
      id: "bold",
      name: "Bold",
      tagline: "High Contrast, Energetic & Punchy",
      description: "Vibrant high-contrast indigo palette, heavy border radiuses (12px), prominent elevation shadows, and animated hover effects. Ideal for streetwear, consumer tech, and activewear.",
      tokens: {
        radius: "0.75rem (12px)",
        primary: "hsl(221.2 83.2% 53.3%)",
        background: "hsl(210 40% 98%)",
        card: "hsl(0 0% 100%)",
        border: "hsl(214.3 31.8% 91.4%)"
      }
    },
    {
      id: "elegant",
      name: "Elegant",
      tagline: "Warm Terracotta, Luxurious & Refined",
      description: "Sophisticated serif headings, warm amber/terracotta primary tones, gentle 8px borders, and soft warm-glow elevations. Ideal for luxury perfumes, jewelry, artisanal goods, and fine dining.",
      tokens: {
        radius: "0.5rem (8px)",
        primary: "hsl(24.6 95% 53.1%)",
        background: "hsl(30 20% 99%)",
        card: "hsl(0 0% 100%)",
        border: "hsl(20 14.3% 90%)"
      }
    }
  ] as const;

  const layouts = [
    {
      id: "fashion",
      name: "Fashion & Apparel",
      icon: Shirt,
      description: "Editorial lookbook hero banners, interactive color swatches, size selector matrices, and high-aspect-ratio product cards tailored for garments.",
      features: [
        "Interactive color swatches with instant preview",
        "Size selector buttons with inventory awareness",
        "Editorial Lookbook banner component",
        "Wishlist heart toggles on hover"
      ]
    },
    {
      id: "electronics",
      name: "Electronics & Hardware",
      icon: Cpu,
      description: "Technical spec comparison matrices, official warranty badges, next-day dispatch counters, and detailed spec table accordions.",
      features: [
        "Side-by-side comparison matrix for up to 3 devices",
        "Official warranty badges (e.g. 2-Year Manufacturer Warranty)",
        "Technical specification key-value summary rows",
        "In-stock & dispatch turnaround indicators"
      ]
    },
    {
      id: "grocery",
      name: "Grocery & Daily Fresh",
      icon: Apple,
      description: "Sticky category navigation ribbon, unit and weight pricing (per kg, per 500g), and rapid 1-click quantity stepper buttons.",
      features: [
        "Sticky horizontal category filter ribbon",
        "Weight & volume pricing (e.g. per kg, per pack)",
        "Fast increment/decrement cart counter on cards",
        "60-minute delivery slot status indicator"
      ]
    },
    {
      id: "landing",
      name: "Single-Product Landing (COD Funnel)",
      icon: Flame,
      description: "High-converting single-product sales page with hero benefits, customer reviews, FAQ accordion, and an inline Cash on Delivery (COD) order form.",
      features: [
        "Single high-converting sales funnel structure",
        "Inline Cash on Delivery checkout form (no cart needed)",
        "Social proof badges and star rating testimonials",
        "Expandable FAQ accordion to resolve customer objections"
      ]
    }
  ] as const;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Palette className="h-3.5 w-3.5" />
          <span>Styling & Presentation Engine</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Themes & Storefront Layouts
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          StoreBlocks separates visual design tokens (themes) from business domain presentation (layouts). Mix and match any theme with any product-type layout with zero CSS conflicts.
        </p>
      </div>

      {/* Visual Themes Section */}
      <section id="themes" className="scroll-mt-24 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Design Themes (CSS Variables)</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Themes are fully compatible with Tailwind CSS and shadcn/ui. Choose your theme during scaffolding or switch at runtime in the Admin Dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`cursor-pointer rounded-2xl border bg-card p-6 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : "hover:border-primary/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">{theme.name}</h3>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-primary block">{theme.tagline}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{theme.description}</p>
                </div>

                <div className="mt-6 rounded-xl bg-secondary/50 p-3 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius:</span>
                    <span>{theme.tokens.radius}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primary:</span>
                    <span className="truncate max-w-[120px]">{theme.tokens.primary}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Storefront Layouts Section */}
      <section id="layouts" className="scroll-mt-24 space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Product-Type Layouts</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            StoreBlocks provides purpose-built layouts optimized for specific retail verticals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {layouts.map((layout) => {
            const Icon = layout.icon;
            const isSelected = selectedLayout === layout.id;
            return (
              <div
                key={layout.id}
                id={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={`cursor-pointer rounded-2xl border bg-card p-6 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected ? "border-primary ring-2 ring-primary/20 shadow-md" : "hover:border-primary/40"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">{layout.name}</h3>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        Active Layout
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{layout.description}</p>

                  <div className="space-y-1.5 pt-2 border-t">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Built-in Features
                    </h5>
                    <ul className="space-y-1 text-xs text-foreground/90">
                      {layout.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-primary font-bold">›</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

