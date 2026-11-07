"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CloudUpload,
  CreditCard,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { CommandPill } from "@/components/docs/CommandPill";
import { Select } from "@/components/ui/Select";
import { CardGrid, Callout, DocSection, PageHeader } from "@/components/docs/ui";

type DbChoice = "mongodb" | "postgresql";
type StorageChoice = "cloudinary" | "s3" | "local";
type PaymentChoice = "cod" | "sslcommerz" | "stripe";

const DB_OPTIONS: { id: DbChoice; name: string; desc: string }[] = [
  { id: "mongodb", name: "MongoDB", desc: "Mongoose ODM on Atlas or a local replica set" },
  { id: "postgresql", name: "PostgreSQL", desc: "Drizzle ORM with typed SQL migrations" }
];

const STORAGE_OPTIONS: { id: StorageChoice; name: string; desc: string }[] = [
  { id: "cloudinary", name: "Cloudinary", desc: "CDN transformations on the fly" },
  { id: "s3", name: "AWS S3 / R2", desc: "Direct presigned PUT uploads" },
  { id: "local", name: "Local disk", desc: "Single server, dev or VPS" }
];

const PAYMENT_OPTIONS: { id: PaymentChoice; name: string; desc: string }[] = [
  { id: "cod", name: "Cash on delivery", desc: "Pay on receipt, no redirect" },
  { id: "sslcommerz", name: "SSLCommerz", desc: "Cards, bKash and Nagad (BD)" },
  { id: "stripe", name: "Stripe", desc: "Global cards and wallets" }
];

const FEATURE_OPTIONS: { id: string; label: string }[] = [
  { id: "cart", label: "Cart" },
  { id: "coupons", label: "Coupons" },
  { id: "reviews", label: "Reviews" },
  { id: "brands", label: "Brands" },
  { id: "wishlist", label: "Wishlist" },
  { id: "shipping", label: "Shipping rates" },
  { id: "social-boost", label: "Social boost" },
  { id: "notifications", label: "Notifications" }
];

const LAYOUT_OPTIONS = ["fashion", "electronics", "grocery", "landing"] as const;
const THEME_OPTIONS = ["minimal", "bold", "elegant"] as const;

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    title: "Zero unselected code",
    body: "Choose MongoDB and no Drizzle or PostgreSQL tables are generated. Choose Cloudinary and the S3 SDK is never installed."
  },
  {
    icon: Layers,
    iconClass: "text-primary",
    title: "Strict layering",
    body: "Routes, controllers, services and repository interfaces. Controllers and services never import database models or vendor SDKs."
  },
  {
    icon: Database,
    iconClass: "text-blue-600 dark:text-blue-400",
    title: "Dual database parity",
    body: "Every data module ships MongoDB and PostgreSQL implementations that pass the same contract suite."
  },
  {
    icon: Sparkles,
    iconClass: "text-amber-500",
    title: "Dynamic module loader",
    body: "Modules listed in store.config.json mount at startup, so app.ts needs no manual imports."
  }
];

function OptionButton({
  selected,
  onClick,
  children,
  className = ""
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? "border-primary bg-secondary/60 shadow-sm"
          : "border-border hover:border-primary/40 hover:bg-secondary/30"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function ChoiceGroup({
  step,
  icon: Icon,
  title,
  children
}: {
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {step}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function DocsHomePage() {
  const [db, setDb] = useState<DbChoice>("postgresql");
  const [storage, setStorage] = useState<StorageChoice>("s3");
  const [payments, setPayments] = useState<PaymentChoice[]>(["cod", "sslcommerz"]);
  const [features, setFeatures] = useState<string[]>(["cart", "coupons", "reviews", "brands", "shipping"]);
  const [layout, setLayout] = useState<(typeof LAYOUT_OPTIONS)[number]>("fashion");
  const [theme, setTheme] = useState<(typeof THEME_OPTIONS)[number]>("minimal");

  const togglePayment = (id: PaymentChoice) => {
    setPayments((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const toggleFeature = (id: string) => {
    setFeatures((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const generatedCommand = [
    "npx create-storeblocks my-shop \\",
    `  --db ${db} \\`,
    `  --storage ${storage} \\`,
    `  --payments ${payments.join(",")} \\`,
    `  --features ${features.join(",")} \\`,
    `  --layout ${layout} \\`,
    `  --theme ${theme} \\`,
    "  --yes"
  ].join("\n");

  return (
    <div className="space-y-16">
      <PageHeader
        eyebrow="Next-generation e-commerce foundation"
        icon={Sparkles}
        title="StoreBlocks Documentation"
        description="StoreBlocks is an open-source CLI (npx create-storeblocks) that scaffolds a modular, production-ready full-stack store in minutes. Pick your database, storage, payments and features, then add your environment variables and launch."
      >
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="#quickstart"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Quick start
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="#configurator"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Configure your store
          </Link>
        </div>
      </PageHeader>

      <DocSection
        id="quickstart"
        title="Quick start"
        description="Scaffold a project, then configure and run it locally."
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1 · Scaffold</p>
          <CommandPill command="npx create-storeblocks my-shop" />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">2 · Configure and run</p>
          <CommandPill command="cd my-shop && cp .env.example .env && npm run dev" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Add your database and adapter keys to .env before starting. The API runs on port 4000 and the storefront on port 3000.
          </p>
        </div>
      </DocSection>

      <DocSection
        id="configurator"
        title="Project configurator"
        description="Choose your stack and copy the matching scaffold command."
      >
        <div className="grid min-w-0 gap-8 lg:grid-cols-2">
          <div className="min-w-0 space-y-8">
            <ChoiceGroup step={1} icon={Database} title="Database">
              <div className="grid gap-3 sm:grid-cols-2">
                {DB_OPTIONS.map((option) => (
                  <OptionButton key={option.id} selected={db === option.id} onClick={() => setDb(option.id)}>
                    <span className="text-sm font-semibold">{option.name}</span>
                    <span className="text-xs text-muted-foreground">{option.desc}</span>
                  </OptionButton>
                ))}
              </div>
            </ChoiceGroup>

            <ChoiceGroup step={2} icon={CloudUpload} title="Media storage">
              <div className="grid gap-3 sm:grid-cols-3">
                {STORAGE_OPTIONS.map((option) => (
                  <OptionButton key={option.id} selected={storage === option.id} onClick={() => setStorage(option.id)}>
                    <span className="text-sm font-semibold">{option.name}</span>
                    <span className="text-xs text-muted-foreground">{option.desc}</span>
                  </OptionButton>
                ))}
              </div>
            </ChoiceGroup>

            <ChoiceGroup step={3} icon={CreditCard} title="Payment gateways (select one or more)">
              <div className="grid gap-3 sm:grid-cols-3">
                {PAYMENT_OPTIONS.map((option) => {
                  const selected = payments.includes(option.id);
                  return (
                    <OptionButton key={option.id} selected={selected} onClick={() => togglePayment(option.id)}>
                      <span className="flex w-full items-center justify-between text-sm font-semibold">
                        {option.name}
                        {selected && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </OptionButton>
                  );
                })}
              </div>
            </ChoiceGroup>

            <ChoiceGroup step={4} icon={Boxes} title="Features">
              <div className="flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map((feature) => {
                  const selected = features.includes(feature.id);
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => toggleFeature(feature.id)}
                      aria-pressed={selected}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {feature.label}
                    </button>
                  );
                })}
              </div>
            </ChoiceGroup>

            <ChoiceGroup step={5} icon={Layers} title="Theme and layout">
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label="Theme"
                  value={theme}
                  onChange={setTheme}
                  options={THEME_OPTIONS.map((t) => ({ value: t, label: t }))}
                />
                <Select
                  label="Layout"
                  value={layout}
                  onChange={setLayout}
                  options={LAYOUT_OPTIONS.map((l) => ({ value: l, label: l }))}
                />
              </div>
            </ChoiceGroup>
          </div>

          <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
            <CodeBlock label="Generated command" code={generatedCommand} />
            <Callout tone="info" title="Non-interactive by design">
              Add <code className="font-mono text-xs">--yes</code> to skip prompts in CI. Every flag above has a matching
              interactive prompt in the CLI.
            </Callout>
          </div>
        </div>
      </DocSection>

      <DocSection
        id="principles"
        title="Core architecture rules"
        description="The guarantees every generated project keeps."
      >
        <CardGrid>
          {PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <div key={principle.title} className="space-y-2 rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Icon className={`h-5 w-5 ${principle.iconClass}`} aria-hidden="true" />
                  <span>{principle.title}</span>
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{principle.body}</p>
              </div>
            );
          })}
        </CardGrid>
      </DocSection>

      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Ready to see how the pieces fit?</p>
          <p className="text-sm text-muted-foreground">Read the layering rules and the module loader in the architecture guide.</p>
        </div>
        <Link
          href="/docs/architecture"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Architecture guide
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
