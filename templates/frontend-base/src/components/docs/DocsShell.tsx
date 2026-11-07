"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Menu,
  Search,
  Store,
  X
} from "lucide-react";
import {
  DOC_GROUPS,
  DOC_PAGES,
  filterDocGroups,
  type DocPage
} from "./nav";

const TOP_LINKS = [
  { title: "Roadmap", href: "/docs/planning" },
  { title: "Tools", href: "/docs/tools" },
  { title: "CLI", href: "/docs/cli" },
  { title: "Modules", href: "/docs/modules" }
];

function trimTrailingSlash(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** Tracks the URL hash so the active section in the sidebar can be highlighted. */
function useUrlHash(pathname: string) {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace("#", ""));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  return [hash, setHash] as const;
}

type SidebarNavProps = {
  pathname: string;
  query: string;
  onQueryChange: (value: string) => void;
  onNavigate: () => void;
};

function SidebarNav({ pathname, query, onQueryChange, onNavigate }: SidebarNavProps) {
  const [hash, setHash] = useUrlHash(pathname);
  const groups = useMemo(() => filterDocGroups(query), [query]);
  const q = query.trim().toLowerCase();

  return (
    <nav aria-label="Documentation" className="space-y-7">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Filter documentation"
          aria-label="Filter documentation"
          className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {groups.length === 0 && (
        <p className="px-2 text-sm text-muted-foreground">No pages match &ldquo;{query}&rdquo;.</p>
      )}

      {groups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <div key={group.label} className="space-y-2">
            <div className="flex items-center gap-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <GroupIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{group.label}</span>
            </div>

            <ul className="space-y-0.5">
              {group.pages.map((page: DocPage) => {
                const active = page.href === pathname;
                const showAnchors = (active || q.length > 0) && (page.anchors?.length ?? 0) > 0;
                const anchors = (page.anchors ?? []).filter(
                  (anchor) => !q || anchor.title.toLowerCase().includes(q) || page.title.toLowerCase().includes(q)
                );

                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-secondary font-semibold text-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
                      <span>{page.title}</span>
                    </Link>

                    {showAnchors && anchors.length > 0 && (
                      <ul className="mt-1 ml-4 space-y-0.5 border-l pl-3">
                        {anchors.map((anchor) => {
                          const current = active && hash === anchor.hash;
                          return (
                            <li key={anchor.hash}>
                              <Link
                                href={`${page.href}#${anchor.hash}`}
                                onClick={() => {
                                  setHash(anchor.hash);
                                  onNavigate();
                                }}
                                className={`-ml-px block border-l-2 py-1 pl-2.5 text-[13px] transition-colors ${
                                  current
                                    ? "border-primary font-medium text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {anchor.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function PagerLink({
  page,
  direction
}: {
  page: DocPage;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={page.href}
      className={`group flex flex-col gap-1.5 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40 ${
        isPrev ? "items-start" : "items-end text-right"
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {isPrev ? "Previous" : "Next"}
      </span>
      <span className="flex items-center gap-2 font-semibold">
        {isPrev && <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />}
        <span>{page.title}</span>
        {!isPrev && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />}
      </span>
    </Link>
  );
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = trimTrailingSlash(usePathname());
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock page scroll and support Escape while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const index = DOC_PAGES.findIndex((page) => page.href === pathname);
  const current = index >= 0 ? DOC_PAGES[index] : undefined;
  const prev = index > 0 ? DOC_PAGES[index - 1] : undefined;
  const next = index >= 0 && index < DOC_PAGES.length - 1 ? DOC_PAGES[index + 1] : undefined;
  const group = DOC_GROUPS.find((g) => g.pages.some((page) => page.href === pathname));

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open documentation menu"
              aria-expanded={mobileOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-secondary lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link href="/docs" className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>StoreBlocks</span>
            </Link>

            <span className="hidden rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              Docs
            </span>
          </div>

          <nav aria-label="Top" className="hidden items-center gap-6 text-sm md:flex">
            {TOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.title}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
          >
            <span>Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-screen-2xl grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[288px_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto border-r py-8 pl-8 pr-6 lg:block">
          <SidebarNav
            pathname={pathname}
            query={query}
            onQueryChange={setQuery}
            onNavigate={closeMobile}
          />
        </aside>

        <main className="min-w-0 px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          {group && current && (
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/docs" className="transition-colors hover:text-foreground">Docs</Link>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <span>{group.label}</span>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <span className="font-medium text-foreground">{current.title}</span>
            </nav>
          )}

          <div className="mx-auto w-full max-w-3xl xl:max-w-4xl">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>

            {(prev || next) && (
              <nav aria-label="Pagination" className="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2">
                {prev ? <PagerLink page={prev} direction="prev" /> : <div />}
                {next ? <PagerLink page={next} direction="next" /> : <div />}
              </nav>
            )}
          </div>
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close documentation menu"
            onClick={closeMobile}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Documentation navigation"
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r bg-background shadow-2xl"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b px-5">
              <span className="font-semibold">Documentation</span>
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <SidebarNav
                pathname={pathname}
                query={query}
                onQueryChange={setQuery}
                onNavigate={closeMobile}
              />
            </div>
          </div>
        </div>
      )}

      <footer className="border-t">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>StoreBlocks documentation. Open-source, modular e-commerce scaffolding.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/docs" className="transition-colors hover:text-foreground">Overview</Link>
            <Link href="/docs/planning" className="transition-colors hover:text-foreground">Roadmap</Link>
            <Link href="/docs/architecture" className="transition-colors hover:text-foreground">Architecture</Link>
            <Link href="/docs/modules" className="transition-colors hover:text-foreground">Modules</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
