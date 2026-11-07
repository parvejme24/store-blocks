import Link from "next/link";
import { Database, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function DatabasesDocPage() {
  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Introduction
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Dual Database Support
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          StoreBlocks gives store creators the freedom to choose either MongoDB or PostgreSQL. Both options implement the identical repository contracts.
        </p>
      </div>

      {/* Comparison Grid */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div id="mongodb" className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold">MongoDB + Mongoose</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Ideal for document-based workflows and managed clusters like MongoDB Atlas.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
            <li><strong>Mongoose v8</strong> schemas with automatic indexing.</li>
            <li>Embedded sub-documents for fast read performance.</li>
            <li>Multi-document transactions via <code>session.withTransaction()</code>.</li>
            <li>IDs converted from <code>ObjectId</code> to <code>string</code> inside the repository.</li>
          </ul>
        </div>

        <div id="postgresql" className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">PostgreSQL + Drizzle ORM</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Ideal for relational architectures, SQL lovers, and managed databases like Supabase, Neon, or Railway.
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
            <li><strong>Drizzle ORM</strong> with lightweight query builder and zero overhead.</li>
            <li><code>UUIDv4</code> primary keys mapped to <code>string</code> domain types.</li>
            <li>Typed migrations generated automatically with <code>drizzle-kit</code>.</li>
            <li>Transactions run through <code>db.transaction()</code>.</li>
          </ul>
        </div>
      </section>

      {/* Parity Rules */}
      <section id="parity" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Contract Parity Rules</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-lg border bg-card p-4">
            <span className="font-semibold text-foreground">1. Shared Domain Types Only</span>: Repositories always return shared types from <code>shared/</code>, never Mongoose Documents or raw SQL rows.
          </div>
          <div className="rounded-lg border bg-card p-4">
            <span className="font-semibold text-foreground">2. String IDs</span>: <code>_id</code> in Mongo and <code>uuid</code> in Postgres are normalized to <code>string</code> before leaving the repository layer.
          </div>
          <div className="rounded-lg border bg-card p-4">
            <span className="font-semibold text-foreground">3. Integer Minor Money</span>: Prices and totals are strictly stored as integer minor units (poisha / cents), never floating-point numbers.
          </div>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="border-t pt-8 flex items-center justify-between">
        <Link
          href="/docs/architecture"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Architecture Guide
        </Link>
        <Link
          href="/docs/storage"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Media Storage Guide <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

