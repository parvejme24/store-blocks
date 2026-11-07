import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Plus, Store, Zap } from "lucide-react";
import { CommandPill } from "@/components/docs/CommandPill";
import { Reveal } from "@/components/motion/Reveal";
import { STORE_TEMPLATES } from "@/templates/registry";
import { ThemeCard, type ThemeCardData } from "./ThemeCard";
import { WhySection } from "./WhySection";
import { SeoContent } from "./SeoContent";

const THEME_CARDS: ThemeCardData[] = STORE_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  tagline: t.tagline,
  description: t.description,
  category: t.category,
  cliLayout: t.cliLayout,
  thumbnail: t.thumbnail,
  tokens: t.tokens
}));

const INSTALL_COMMAND = "npx create-storeblocks my-shop";

const STEPS = [
  { title: "Choose a store type", body: "Pick grocery, fashion, cosmetics and more, plus your database, storage and payments." },
  { title: "Add your environment variables", body: "Copy .env.example to .env and fill in the keys for the services you selected." },
  { title: "Run locally, then deploy", body: "npm run dev starts the API and storefront. The docs cover Vercel, Render and Railway." }
];

const FLOATING_CHIPS = ["Grocery", "Fashion", "Cosmetics", "Medicine", "Organic", "Electronics"];

const SECTION = "scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8";
const SECTION_HEAD = "mx-auto max-w-2xl text-center";
const EYEBROW = "text-sm font-semibold uppercase tracking-[0.16em] text-violet-300";

export function StoreBlocksLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/30">
              <Store className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
            </span>
            <span>StoreBlocks</span>
          </Link>
          <nav aria-label="Landing" className="hidden items-center gap-6 text-sm md:flex">
            <a href="#why" className="text-muted-foreground transition-colors hover:text-foreground">Why</a>
            <a href="#types" className="text-muted-foreground transition-colors hover:text-foreground">Store types</a>
            <a href="#install" className="text-muted-foreground transition-colors hover:text-foreground">Install</a>
            <Link href="/docs" className="text-muted-foreground transition-colors hover:text-foreground">Docs</Link>
          </nav>
          <a href="#install" className="btn-brand !px-4 !py-2 text-xs sm:text-sm">Get started</a>
        </div>
      </header>

      <main>
        {/* Hero with animated background */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="animate-grid-drift absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            <div className="animate-aurora absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-violet-600/35 blur-[110px] sm:h-[36rem] sm:w-[36rem]" />
            <div className="animate-aurora absolute -right-24 top-16 h-[24rem] w-[24rem] rounded-full bg-fuchsia-600/25 blur-[110px] [animation-delay:-7s] sm:h-[30rem] sm:w-[30rem]" />
          </div>

          <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-violet-300" aria-hidden="true" />
              Open-source e-commerce scaffolder
            </p>

            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:mt-8 sm:text-5xl lg:text-6xl">
              Launch a complete online store in <span className="text-gradient">minutes, not months</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              StoreBlocks generates an API, a storefront and an admin dashboard with only the features you choose.
            </p>

            <div className="mx-auto mt-8 max-w-lg sm:mt-10">
              <CommandPill command={INSTALL_COMMAND} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:flex sm:justify-center">
              <Link href="/docs" className="btn-brand">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Read the docs
              </Link>
              <a href="#types" className="btn-ghost">
                See store types
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <ul className="mt-12 flex flex-wrap justify-center gap-2 sm:mt-16" aria-label="Store types you can build">
              {FLOATING_CHIPS.map((chip, index) => (
                <li
                  key={chip}
                  className="animate-float rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
                  style={{ animationDelay: `${-index * 0.9}s` }}
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Problem and solution */}
        <section id="why" className={SECTION}>
          <Reveal>
            <WhySection />
          </Reveal>
        </section>

        {/* Store types */}
        <section id="types" className={SECTION}>
          <Reveal>
          <div className={SECTION_HEAD}>
            <p className={EYEBROW}>Store types</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Build the store your category needs</h2>
            <p className="mt-4 text-muted-foreground">
              Each type has its own theme, layout and sample catalogue. Open a demo to see it as a full website.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            {THEME_CARDS.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}

            <Link
              href="/docs"
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-transparent p-6 text-center transition-colors hover:border-primary/40 hover:bg-card/60"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/15">
                <Plus className="h-5 w-5 text-violet-200" aria-hidden="true" />
              </span>
              <span className="font-semibold">Need another type?</span>
              <span className="max-w-[16rem] text-sm text-muted-foreground">Add a theme folder and register it. The docs show how.</span>
            </Link>
          </div>
          </Reveal>
        </section>

        {/* Install */}
        <section id="install" className={SECTION}>
          <Reveal>
          <div className={SECTION_HEAD}>
            <p className={EYEBROW}>Install</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Three steps to a running store</h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-4">
            <CommandPill command={INSTALL_COMMAND} />
            <CommandPill command="cd my-shop && npm run dev" />
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              Copy .env.example to .env and add your keys before running. The API runs on port 4000 and the storefront on port 3000.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-200">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="relative mt-12 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-950 via-zinc-950 to-fuchsia-950/70 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div aria-hidden="true" className="animate-aurora absolute -top-24 left-1/2 h-64 w-[36rem] max-w-none -translate-x-1/2 rounded-full bg-violet-600/30 blur-[100px]" />
            <h2 className="relative text-2xl font-bold tracking-tight sm:text-3xl">Read the guide before your first store</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Setup, architecture, payments, storage and deployment, with the commands and variables for each.
            </p>
            <div className="relative mt-8">
              <Link href="/docs#quickstart" className="btn-brand">
                Open the documentation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          </Reveal>
        </section>
        <SeoContent />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <p>StoreBlocks. Open-source, modular e-commerce scaffolding.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link href="/docs" className="transition-colors hover:text-foreground">Documentation</Link>
            <Link href="/docs/architecture" className="transition-colors hover:text-foreground">Architecture</Link>
            <Link href="/docs/modules" className="transition-colors hover:text-foreground">Modules</Link>
            <Link href="/shop" className="transition-colors hover:text-foreground">Shop demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
