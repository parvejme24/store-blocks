import Link from "next/link";
import { Cpu, ArrowLeft, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function ArchitectureDocPage() {
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
          Architecture & System Design
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          How StoreBlocks modules, variants, interfaces, and adapters fit together to allow plug-and-play e-commerce without tight coupling.
        </p>
      </div>

      {/* Layering Section */}
      <section id="layering" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">The 5-Layer Backend Architecture</h2>
        <p className="text-sm text-muted-foreground">
          StoreBlocks enforces a strict unidirectional separation of concerns across every module:
        </p>
        <div className="rounded-lg bg-secondary/30 p-4 font-mono text-xs sm:text-sm text-center border">
          <span className="text-primary font-bold">Route</span>
          <span className="mx-2 text-muted-foreground">→</span>
          <span className="text-primary font-bold">Controller</span>
          <span className="mx-2 text-muted-foreground">→</span>
          <span className="text-primary font-bold">Service</span>
          <span className="mx-2 text-muted-foreground">→</span>
          <span className="text-primary font-bold">Repository (Interface)</span>
          <span className="mx-2 text-muted-foreground">→</span>
          <span className="text-emerald-600 font-bold">Mongoose | Drizzle</span>
        </div>

        <div className="grid gap-3 pt-2">
          <div className="rounded-lg border bg-card p-4 text-sm">
            <span className="font-semibold text-primary">1. Route</span>: Express route definition with Zod validation middlewares (validates <code>body</code>, <code>query</code>, <code>params</code>).
          </div>
          <div className="rounded-lg border bg-card p-4 text-sm">
            <span className="font-semibold text-primary">2. Controller</span>: Pure HTTP transport in/out. Parses request arguments, passes to service, and sets response HTTP status codes (200, 201, 204).
          </div>
          <div className="rounded-lg border bg-card p-4 text-sm">
            <span className="font-semibold text-primary">3. Service</span>: Business rules, domain validation, price re-computation, stock checks, and cross-module coordination. Receives and returns only shared domain types.
          </div>
          <div className="rounded-lg border bg-card p-4 text-sm">
            <span className="font-semibold text-primary">4. Repository Interface</span>: Database-agnostic contract (<code>findById</code>, <code>create</code>, <code>update</code>, <code>decrementStock</code>) with <code>string</code> IDs and integer minor money units.
          </div>
          <div className="rounded-lg border bg-card p-4 text-sm">
            <span className="font-semibold text-primary">5. Database Implementations</span>: Concrete ORM queries. Never exposed outside the repository folder.
          </div>
        </div>
      </section>

      {/* Dynamic Loader */}
      <section id="dynamic-loader" className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Dynamic Module Loader</h2>
        <p className="text-sm text-muted-foreground">
          Instead of hard-coding imports in <code>app.ts</code>, the Express server reads the selected modules dynamically from <code>store.config.json</code> at startup:
        </p>
        <div className="rounded-lg bg-code p-4 font-mono text-xs text-code-foreground border border-border">
          <pre>{`// backend/src/app.ts
import config from "../../store.config.json";

for (const name of config.modules) {
  const mod = await import(\`./modules/\${name}/index.js\`);
  if (mod.router && mod.basePath) {
    app.use(mod.basePath, mod.router);
  }
}`}</pre>
        </div>
        <p className="text-sm text-muted-foreground">
          Adding or removing a module from your store requires zero edits to server boilerplate code.
        </p>
      </section>

      {/* UnitOfWork */}
      <section id="contracts" className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">UnitOfWork & Atomic Transactions</h2>
        <p className="text-sm text-muted-foreground">
          Multi-step writes (such as checkout, atomic stock decrements, and coupon redemption) execute through the <code>UnitOfWork</code> interface:
        </p>
        <div className="rounded-lg bg-code p-4 font-mono text-xs text-code-foreground border border-border">
          <pre>{`export interface UnitOfWork {
  run<T>(fn: (tx: TxContext) => Promise<T>): Promise<T>;
}

// In checkout:
return this.uow.run(async (tx) => {
  await this.productRepo.decrementStock(productId, qty, tx);
  const order = await this.orderRepo.create(orderData, tx);
  return order;
});`}</pre>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li><strong>MongoDB</strong>: Wraps <code>session.withTransaction()</code> using a ClientSession.</li>
          <li><strong>PostgreSQL</strong>: Wraps <code>db.transaction()</code> via Drizzle ORM.</li>
        </ul>
      </section>

      {/* Navigation Footer */}
      <div className="border-t pt-8 flex items-center justify-between">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Getting Started
        </Link>
        <Link
          href="/docs/modules"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Explore Module Catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

