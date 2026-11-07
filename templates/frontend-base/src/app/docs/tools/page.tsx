"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Terminal,
  FileCheck2,
  Database,
  Play,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Cpu,
  Layers
} from "lucide-react";

export default function ToolsGuidePage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const tools = [
    {
      id: "cli",
      title: "create-storeblocks CLI",
      category: "Scaffolding & Code Generation",
      description: "Interactive project scaffolder that resolves module dependencies, flattens database variants, generates tailored environment files, and initializes git repositories.",
      command: "npx create-storeblocks my-shop",
      codeExample: `# Interactive wizard mode
npx create-storeblocks my-shop

# Non-interactive CI automated mode
npx create-storeblocks my-shop \\
  --db postgresql \\
  --storage s3 \\
  --payments cod,sslcommerz \\
  --features cart,coupons,reviews,brands,shipping \\
  --layout fashion \\
  --theme minimal \\
  --yes`,
      keyFeatures: [
        "Recursive dependency resolution from dependsOn in module manifests",
        "Enforces single-storage adapter and at least one payment gateway",
        "Dynamic .env.example with only selected variables",
        "Strips unchosen database variants, leaving zero dead code",
        "Installs dependencies via npm workspaces and commits initial git state"
      ]
    },
    {
      id: "manifest-validator",
      title: "Manifest Validator (validate:manifests)",
      category: "Architecture & Quality Assurance",
      description: "Automated schema validator powered by Zod. Scans every module.json in templates/modules to verify backend routes, database variant paths, environment definitions, and dependencies.",
      command: "npm run validate:manifests",
      codeExample: `# Validate all manifests across monorepo
npm run validate:manifests

# Console Output:
# 🔍 Validating module manifests in templates/modules...
# ✅ Successfully validated 20 module manifests.`,
      keyFeatures: [
        "Verifies manifest.json complies with ModuleManifestSchema",
        "Checks that declared variant directories (db/mongodb, db/postgresql) exist on disk",
        "Validates semver compatibility and module naming conventions",
        "Supports namespaced adapter identifiers (storage-<name>, payment-<name>)",
        "Runs automatically in CI before any package build"
      ]
    },
    {
      id: "db-migrations",
      title: "Database Migration & Studio Tools",
      category: "Database & ORM Management",
      description: "Full management suite for PostgreSQL with Drizzle ORM and MongoDB Mongoose. Provides schema discovery, automated migration generation, and local web GUI studio.",
      command: "npm run db:generate && npm run db:migrate",
      codeExample: `# 1. Generate SQL migration files from Drizzle schemas
npm run db:generate

# 2. Apply pending migrations to the PostgreSQL database
npm run db:migrate

# 3. Launch Drizzle Studio Web GUI on localhost:4983
npm run db:studio`,
      keyFeatures: [
        "Glob discovery finds all *.schema.ts files in active modules",
        "Zero manual SQL migration authoring required",
        "Atomic transactional execution of schema updates",
        "Drizzle Studio allows browsing, querying, and updating records visually"
      ]
    },
    {
      id: "seeding",
      title: "Seed Scripts (seed:admin & seed:demo)",
      category: "Data Provisioning",
      description: "Automated database seed utilities that bootstrap administrator accounts and realistic sample catalog entries.",
      command: "npm run seed:demo",
      codeExample: `# Seed Initial Administrator (from ADMIN_EMAIL & ADMIN_PASSWORD)
npm run seed:admin

# Seed Demo Storefront Catalog (Products, Categories, Brands, Reviews)
npm run seed:demo`,
      keyFeatures: [
        "Idempotent execution: will not overwrite existing admin passwords",
        "Populates categories hierarchy with SEO slugs and banner images",
        "Creates multi-variant products (size, color) with integer minor unit pricing",
        "Pre-populates approved and verified customer reviews"
      ]
    },
    {
      id: "contract-tests",
      title: "Vitest Contract Test Suites",
      category: "Dual-Database Testing",
      description: "Reusable repository and adapter contract test suites exported from @storeblocks/module-kit. Run identical test assertions against both MongoDB and PostgreSQL implementations.",
      command: "npm run test:contracts",
      codeExample: `import { describeRepositoryContract } from "@storeblocks/module-kit";
import { MongoProductRepository } from "./db/mongodb/products.repository.impl";
import { DrizzleProductRepository } from "./db/postgresql/products.repository.impl";

// Runs identical test assertions on MongoDB:
describeRepositoryContract({
  name: "MongoDB ProductRepository",
  createRepository: async () => new MongoProductRepository(),
  createSampleInput: () => ({ name: "Sample Dress", priceMinor: 25000, currency: "BDT" }),
  createUpdatedInput: () => ({ name: "Updated Dress", priceMinor: 30000 })
}, { describe, it, expect });`,
      keyFeatures: [
        "Ensures absolute contract parity regardless of underlying database engine",
        "Validates pagination, filtering, transactions, and string ID normalization",
        "Includes StorageAdapter and PaymentAdapter contract harnesses"
      ]
    },
    {
      id: "doctor",
      title: "Diagnostic Doctor Utility (CLI Doctor)",
      category: "Health & Troubleshooting",
      description: "Comprehensive pre-flight and runtime diagnostics tool that tests database connection strings, storage bucket access, payment gateway API keys, and environment variables.",
      command: "npx create-storeblocks doctor",
      codeExample: `# Run pre-flight checks inside generated store
npx create-storeblocks doctor

# Diagnostic Report:
# [✓] Node.js version >= 18.0.0
# [✓] Database connection (PostgreSQL pool reachable)
# [✓] Media storage (S3 bucket read/write permissions confirmed)
# [✓] Payment gateways (SSLCommerz credentials verified)
# [✓] Required .env secrets loaded without defaults`,
      keyFeatures: [
        "Catches misconfigured CORS or S3 IAM policies before deployment",
        "Verifies JWT secret length and entropy",
        "Checks database pool connectivity with timeout alarms",
        "Outputs actionable suggestions for every identified failure"
      ]
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Wrench className="h-3.5 w-3.5" />
          <span>Ecosystem Tooling Reference</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          StoreBlocks Application Tools
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          StoreBlocks provides a comprehensive suite of developer CLI tools, manifest validators, database migration runners, and automated diagnostic utilities.
        </p>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className="flex flex-col justify-between rounded-xl border bg-card p-4 transition hover:border-primary/50 hover:shadow-xs"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {t.category}
              </span>
              <h3 className="text-sm font-bold mt-1 text-foreground">{t.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
            </div>
            <div className="mt-3 font-mono text-[11px] text-code-foreground truncate bg-muted/50 px-2 py-1 rounded">
              {t.command}
            </div>
          </a>
        ))}
      </div>

      {/* Detailed Tool Sections */}
      <div className="space-y-12">
        {tools.map((tool) => (
          <section
            key={tool.id}
            id={tool.id}
            className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs space-y-6 scroll-mt-20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {tool.category}
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{tool.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(tool.command)}
                  className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-mono font-medium text-foreground hover:bg-muted transition"
                >
                  {copiedCmd === tool.command ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" /> {tool.command}
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>

            {/* Code / Command Example */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Terminal Usage / Implementation
              </span>
              <div className="relative rounded-xl bg-code p-4 font-mono text-xs text-code-foreground border border-border overflow-x-auto">
                <pre>{tool.codeExample}</pre>
              </div>
            </div>

            {/* Key Features List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Key Capabilities & Guarantees
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {tool.keyFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground/90">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

