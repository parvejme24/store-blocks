"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Rocket,
  Code2,
  Terminal,
  Database,
  CloudUpload,
  CreditCard,
  Palette,
  Server
} from "lucide-react";

const phases = [
  {
    phase: "Phase 0",
    name: "Foundation & Monorepo",
    status: "Completed",
    version: "v0.0.1",
    deliverables: [
      "npm workspaces configuration without pnpm dependency",
      "Module-kit contracts, Zod manifest schema, and validator",
      "Central code style, tsconfig.base.json, and git hygiene",
      "Documentation blueprints: architecture.md, contracts.md, conventions.md"
    ]
  },
  {
    phase: "Phase 1",
    name: "Modular Backend Core",
    status: "Completed",
    version: "v0.1.0",
    deliverables: [
      "Express 5 hardened shell (helmet, cors, rate-limit, compression, pino logger)",
      "Dynamic module loader mounting routers based on store.config.json",
      "Shared Zod domain types: Product, Category, Order, User, Settings, Auth",
      "Full dual-database parity with MongoDB Mongoose & PostgreSQL Drizzle ORM",
      "UnitOfWork transaction abstraction supporting ACID cross-module consistency"
    ]
  },
  {
    phase: "Phase 2",
    name: "CLI MVP (create-storeblocks)",
    status: "Completed",
    version: "v0.2.0",
    deliverables: [
      "Interactive Clack prompts and non-interactive CLI flags with --yes",
      "Recursive dependency resolution (dependsOn) & adapter enforcement (uses)",
      "Variant resolution (strips unselected DB code and unneeded vendor SDKs)",
      "Automatic tailored .env.example, store.config.json, and package.json generator",
      "Git repository initialization and first commit"
    ]
  },
  {
    phase: "Phase 3",
    name: "Pluggable Media Storage",
    status: "Completed",
    version: "v0.3.0",
    deliverables: [
      "StorageAdapter contract with getUploadUrl, delete, getPublicUrl",
      "Direct browser-to-cloud signed uploads (bypassing Express backend bottleneck)",
      "Cloudinary adapter with signed transforms and WebP/AVIF auto-formatting",
      "S3 / S3-compatible adapter (AWS S3, Cloudflare R2, MinIO, DO Spaces)",
      "Local disk storage adapter for self-hosted VPS development"
    ]
  },
  {
    phase: "Phase 4",
    name: "Cart, Checkout & Payments",
    status: "Completed",
    version: "v0.4.0",
    deliverables: [
      "Cart module supporting guest carts, item merging on login, and stock reservations",
      "Shipping zones: Flat rate, inside/outside Dhaka thresholds, free shipping tier",
      "Cash on Delivery (COD) adapter with instant order confirmation",
      "SSLCommerz gateway adapter with IPN and sandbox validation",
      "Stripe global gateway adapter with Checkout Sessions and webhook HMAC verification",
      "Idempotent webhook processing preventing double-order settlement"
    ]
  },
  {
    phase: "Phase 5",
    name: "PostgreSQL + Drizzle ORM Parity",
    status: "Completed",
    version: "v0.5.0",
    deliverables: [
      "PostgreSQL connection pooling with pg and Drizzle ORM client",
      "Normalized relational schema mirroring MongoDB document entities",
      "100% repository parity: ProductRepository, OrderRepository, CartRepository",
      "Strict ID string abstraction isolating UUID vs ObjectId inside repository boundary",
      "Reusable Vitest contract test suites verifying identical behavior on both engines"
    ]
  },
  {
    phase: "Phase 6",
    name: "Storefront & Admin Dashboard",
    status: "Completed",
    version: "v0.6.0",
    deliverables: [
      "Next.js 15 App Router with Tailwind CSS, Lucide React, and Motion animations",
      "Per-request Redux Toolkit makeStore() and RTK Query baseApi injection",
      "SEO-optimized Server Components with structured JSON-LD schema",
      "Admin Dashboard (/admin) for product management, orders, categories, and settings",
      "Full documentation website UI (/docs) with interactive configurator"
    ]
  },
  {
    phase: "Phase 7",
    name: "Extended Feature Modules",
    status: "Completed",
    version: "v0.7.0",
    deliverables: [
      "Brands module: Catalog filtering, brand slugs, and logo showcases",
      "Reviews module: Verified-purchase badges, star ratings, and admin moderation queue",
      "Coupons module: Percentage/fixed discounts, expiration dates, minimum cart values",
      "Social Boost: Open Graph tags, Facebook/WhatsApp share buttons, Meta Pixel events",
      "Wishlist module: Customer favorites with instant heart toggle",
      "Notifications module: Transactional order emails and SMS dispatch triggers"
    ]
  },
  {
    phase: "Phase 8",
    name: "Themes & Product-Type Layouts",
    status: "Completed",
    version: "v0.8.0",
    deliverables: [
      "Design tokens: Minimal, Bold, and Elegant CSS variables",
      "Fashion layout: Lookbook hero, color swatches, and size guides",
      "Electronics layout: Technical spec comparison matrix and warranty badges",
      "Grocery layout: Sticky category navigation, weight selectors, and 60-min delivery",
      "Single-product landing layout: High-converting COD sales funnel with inline form"
    ]
  },
  {
    phase: "Phase 9",
    name: "Zero-Code Setup & Deployment",
    status: "In Progress",
    version: "v0.9.0",
    deliverables: [
      "Comprehensive deployment blueprints (Vercel, Render, Railway, Docker)",
      "Database deployment guides (MongoDB Atlas, Neon PostgreSQL, Supabase)",
      "Automated seed scripts: npm run seed:admin and npm run seed:demo",
      "create-storeblocks doctor diagnostic health checker CLI command"
    ]
  },
  {
    phase: "Phase 10",
    name: "Open-Source Readiness",
    status: "Planned",
    version: "v0.10.0",
    deliverables: [
      "Public documentation portal at storeblocks.dev",
      "Interactive contributor guides for adding new modules and payment adapters",
      "Automated GitHub Actions CI matrix running cross-DB contract suites",
      "Security audit and vulnerability disclosure program"
    ]
  },
  {
    phase: "Phase 11",
    name: "Public Launch (v1.0)",
    status: "Planned",
    version: "v1.0.0",
    deliverables: [
      "Production-ready npm release: npx create-storeblocks@latest",
      "Global showcase of live stores built with StoreBlocks",
      "Multi-currency runtime conversion",
      "Community Discord and contributor rewards program"
    ]
  }
];

export default function PlanningPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  const filteredPhases = selectedStatus === "All"
    ? phases
    : phases.filter((p) => p.status.toLowerCase() === selectedStatus.toLowerCase());

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>Strategic Planning & Execution Roadmap</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          StoreBlocks Planning & Roadmap
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          The comprehensive multi-phase roadmap guiding the architectural design, module contracts, CLI scaffolder, and ecosystem rollout of StoreBlocks.
        </p>
      </div>

      {/* Guiding Principles Banner */}
      <section id="principles" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Zero Code Edits</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every store customization happens through CLI prompts, environment variables, or the admin dashboard. End users never touch boilerplate code to launch.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Layers className="h-4 w-4 text-primary" />
            <span>Contracts Over Coupling</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Services talk to repository interfaces, never directly to database engines or third-party vendor SDKs. Any module or adapter is swappable with zero ripple effects.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Safe & Parity by Default</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Direct browser uploads eliminate server payload attacks. Every module ships with 100% dual parity across MongoDB and PostgreSQL.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div id="progression" className="scroll-mt-24 flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold tracking-tight">Phase Progression</h2>
        <div className="flex gap-2">
          {["All", "Completed", "In Progress", "Planned"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedStatus === st
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap Phase Timeline */}
      <div className="space-y-6">
        {filteredPhases.map((phase) => (
          <div
            key={phase.phase}
            className="rounded-2xl border bg-card p-6 shadow-xs transition hover:shadow-md space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10">
                  {phase.phase}
                </span>
                <h3 className="text-lg font-bold text-foreground">{phase.name}</h3>
                <span className="font-mono text-xs text-muted-foreground">({phase.version})</span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
                    phase.status === "Completed"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : phase.status === "In Progress"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {phase.status === "Completed" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {phase.status}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Key Architectural Deliverables
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {phase.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-foreground/90">
                    <span className="text-primary font-bold">›</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Next Step Callout */}
      <div className="rounded-2xl border bg-secondary/30 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-bold">Ready to see how StoreBlocks tools work?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore the Developer Tools guide to see how the CLI, manifest validator, and migration utilities operate.
          </p>
        </div>
        <Link
          href="/docs/tools"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition flex-shrink-0"
        >
          Developer Tools Guide <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

