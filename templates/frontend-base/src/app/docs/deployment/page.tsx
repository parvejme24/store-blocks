"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Server,
  Database,
  CloudUpload,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ExternalLink
} from "lucide-react";

export default function DeploymentGuidePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <Rocket className="h-3.5 w-3.5" />
          <span>Production Launch Blueprint</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Zero-Code Deployment Guide
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          StoreBlocks stores are designed for zero-code deployments. Configure your cloud database, fill in environment secrets on your hosting platforms, and go live.
        </p>
      </div>

      {/* Target Hosting Platforms Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent text-accent-foreground p-2.5">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Frontend Storefront (Vercel)</h3>
              <p className="text-xs text-muted-foreground">Next.js 15 App Router with SSR and Edge Caching</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deploy the <code className="font-mono text-foreground font-semibold">frontend/</code> directory directly to Vercel with zero custom build configuration.
          </p>
          <div className="rounded-xl bg-code p-3 font-mono text-xs text-code-foreground border border-border space-y-1">
            <div>Framework: Next.js</div>
            <div>Root Directory: frontend</div>
            <div>Build Command: npm run build</div>
            <div>Output: .next</div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 text-primary p-2.5">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Backend API (Render / Railway)</h3>
              <p className="text-xs text-muted-foreground">Express 5 hardened API with dynamic module loader</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deploy the <code className="font-mono text-foreground font-semibold">backend/</code> directory as a web service on Render, Railway, or any Node.js container host.
          </p>
          <div className="rounded-xl bg-code p-3 font-mono text-xs text-code-foreground border border-border space-y-1">
            <div>Runtime: Node.js 18+</div>
            <div>Root Directory: backend</div>
            <div>Build Command: npm run build</div>
            <div>Start Command: npm run start</div>
          </div>
        </div>
      </section>

      {/* Production Database Setup */}
      <section id="databases" className="scroll-mt-24 rounded-2xl border bg-card p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">1. Cloud Database Setup</h2>
            <p className="text-xs text-muted-foreground">MongoDB Atlas or Neon Serverless PostgreSQL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3 rounded-xl border p-4 bg-secondary/30">
            <h4 className="font-bold text-sm text-foreground">If using MongoDB (Atlas):</h4>
            <ol className="space-y-1.5 list-decimal list-inside text-muted-foreground leading-relaxed">
              <li>Create a free cluster on MongoDB Atlas</li>
              <li>Under Database Access, create a user with read/write privileges</li>
              <li>Under Network Access, allow IP access (0.0.0.0/0 for serverless)</li>
              <li>Copy standard connection string into your backend environment:</li>
            </ol>
            <div className="font-mono bg-background p-2 rounded border truncate">
              MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/my_shop?retryWrites=true&w=majority
            </div>
          </div>

          <div className="space-y-3 rounded-xl border p-4 bg-secondary/30">
            <h4 className="font-bold text-sm text-foreground">If using PostgreSQL (Neon / Supabase):</h4>
            <ol className="space-y-1.5 list-decimal list-inside text-muted-foreground leading-relaxed">
              <li>Create a PostgreSQL project on Neon.tech or Supabase</li>
              <li>Copy the pooled connection URL</li>
              <li>Run initial migration locally or via deploy hook: <code className="font-mono font-semibold">npm run db:migrate</code></li>
              <li>Provide connection string into backend environment:</li>
            </ol>
            <div className="font-mono bg-background p-2 rounded border truncate">
              DATABASE_URL=postgresql://user:pass@ep-cool-pool.neon.tech/my_shop?sslmode=require
            </div>
          </div>
        </div>
      </section>

      {/* Media Storage CORS Configuration */}
      <section id="cors" className="scroll-mt-24 rounded-2xl border bg-card p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <CloudUpload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">2. Media Storage Direct Upload CORS</h2>
            <p className="text-xs text-muted-foreground">Crucial step for S3 / Cloudflare R2 browser uploads</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Because StoreBlocks uses <strong>direct signed uploads</strong> (files flow straight from the customer/admin browser to your storage bucket), your S3 or Cloudflare R2 bucket must enable CORS for your frontend domain:
        </p>

        <div className="relative rounded-xl bg-code p-4 font-mono text-xs text-code-foreground border border-border">
          <pre>{`[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": [
      "https://my-shop.vercel.app",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"]
  }
]`}</pre>
        </div>
      </section>

      {/* Production Checklist */}
      <section id="checklist" className="scroll-mt-24 rounded-2xl border bg-card p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">3. Production Launch Checklist</h2>
            <p className="text-xs text-muted-foreground">Verify all security invariants before opening for public transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {[
            "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET replaced with high-entropy 64-character strings",
            "FRONTEND_URL environment variable set to production domain (used for CORS and cookies)",
            "SSL/TLS enabled on both frontend and backend custom domains",
            "Payment Gateway mode switched from sandbox/test to live production keys",
            "Webhook URLs registered on payment gateways (e.g. https://api.my-shop.com/api/payments/webhook)",
            "Initial admin account seeded with strong password via npm run seed:admin",
            "Storage bucket lifecycle policy configured for orphaned temporary uploads",
            "Health check ping /api/health added to your uptime monitor (Better Uptime, UptimeRobot)"
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg border bg-secondary/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

