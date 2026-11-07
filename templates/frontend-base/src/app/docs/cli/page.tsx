import Link from "next/link";
import { Terminal, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CliDocPage() {
  const flags = [
    { flag: "--db <database>", desc: "Database choice: mongodb or postgresql", default: "interactive prompt" },
    { flag: "--storage <provider>", desc: "Media storage: cloudinary, s3, or local", default: "interactive prompt" },
    { flag: "--payments <list>", desc: "Comma-separated gateways (cod,sslcommerz,stripe)", default: "interactive prompt" },
    { flag: "--features <list>", desc: "Comma-separated optional features (cart,coupons,reviews,brands,wishlist,shipping)", default: "none" },
    { flag: "--layout <layout>", desc: "Storefront layout: fashion, electronics, grocery, landing", default: "fashion" },
    { flag: "--theme <theme>", desc: "Design theme: minimal, bold, elegant", default: "minimal" },
    { flag: "-y, --yes", desc: "Skip interactive prompts and use supplied flags or defaults", default: "false" }
  ];

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
          create-storeblocks CLI
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          The StoreBlocks CLI scaffolder (<code>npx create-storeblocks</code>) turns your setup choices into a complete full-stack project with zero unselected code.
        </p>
      </div>

      {/* Flags Reference */}
      <section id="flags" className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Command Line Options & Flags</h2>
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="w-full overflow-x-auto rounded-xl border border-border"><table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">Flag</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {flags.map((f) => (
                  <tr key={f.flag}>
                    <td className="p-3 font-mono text-xs text-primary font-medium">{f.flag}</td>
                    <td className="p-3 text-muted-foreground">{f.desc}</td>
                    <td className="p-3 font-mono text-xs">{f.default}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>
      </section>

      {/* 10-Step Generation Pipeline */}
      <section id="pipeline" className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">The 10-Step Generation Pipeline</h2>
        <div className="space-y-3">
          {[
            { step: "1. Prompt", desc: "Collects user choices via @clack/prompts or parses CLI flags." },
            { step: "2. Resolve", desc: "Recursively resolves dependsOn modules and checks required adapter choices." },
            { step: "3. Plan", desc: "Determines variant folder mappings and dependencies to install." },
            { step: "4. Base Copy", desc: "Copies templates/backend-base, templates/frontend-base, and templates/shared-base." },
            { step: "5. Module Copy", desc: "Copies selected module templates into the generated backend/src/modules/ folder." },
            { step: "6. Variant Flattening", desc: "Lifts the selected database implementation files (MongoDB or PostgreSQL) up into the module root and deletes other variants." },
            { step: "7. Config Generation", desc: "Writes store.config.json containing active modules list and selected stack metadata." },
            { step: "8. Environment Variables", desc: "Dynamically writes .env.example with only the exact keys needed by the selected stack." },
            { step: "9. Dependency Merging", desc: "Merges npm dependencies from all selected modules into the backend package.json." },
            { step: "10. Git Initialization", desc: "Initializes a Git repository with .gitignore and creates the initial scaffolding commit." }
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 rounded-lg border bg-card p-3.5 text-sm">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">{item.step}</strong>:{" "}
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="border-t pt-8 flex items-center justify-between">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quick Start
        </Link>
        <Link
          href="/docs/architecture"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Architecture Guide <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

