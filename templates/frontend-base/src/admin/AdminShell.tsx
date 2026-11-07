"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Menu, Store, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { ADMIN_FEATURES, ADMIN_ROLES, FEATURE_GROUPS, canAccess, type AdminFeature, type RoleId } from "./features";
import type { DemoDataset } from "./demo/dataset";
import { Portal } from "./ui/primitives";

const STORAGE_KEY = "storeblocks-admin-role";

type RoleContextValue = { role: RoleId; setRole: (role: RoleId) => void };
const RoleContext = createContext<RoleContextValue>({ role: "owner", setRole: () => {} });

/** The role currently being viewed. Used by feature pages to show or hide content. */
export function useRole() {
  return useContext(RoleContext);
}

type DemoContextValue = {
  data: DemoDataset;
  update: (change: (current: DemoDataset) => DemoDataset) => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);

/** Demo data and its updater. Null when the dashboard is connected to the live API. */
export function useDemo() {
  return useContext(DemoContext);
}

function readStoredRole(): RoleId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "owner" || stored === "manager" || stored === "staff") return stored;
  } catch {
    // Storage can be blocked (private mode). Fall back to the default role.
  }
  return "owner";
}

/** Maps a feature's /admin path onto this dashboard's base path (e.g. /themes/grocery/admin). */
export function featureHref(basePath: string, feature: AdminFeature) {
  return `${basePath}${feature.href.slice("/admin".length)}`;
}

/**
 * Admin dashboard shell. The same shell serves the main /admin route and each
 * theme's own admin at /themes/<id>/admin. With a dataset it runs on demo data.
 *
 * Layout: a fixed-height sidebar on large screens, a sticky top bar on every
 * screen size, and a slide-in menu below the large breakpoint.
 */
export function AdminShell({
  children,
  basePath = "/admin",
  storefrontHref = "/",
  dataset
}: {
  children: React.ReactNode;
  basePath?: string;
  storefrontHref?: string;
  dataset?: DemoDataset;
}) {
  const pathname = usePathname();
  const [role, setRoleState] = useState<RoleId>("owner");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState<DemoDataset | undefined>(dataset);

  useEffect(() => {
    setRoleState(readStoredRole());
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  function setRole(next: RoleId) {
    setRoleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors; the choice still applies for this visit.
    }
  }

  const update = useCallback((change: (current: DemoDataset) => DemoDataset) => {
    setData((current) => (current ? change(current) : current));
  }, []);

  const demo = useMemo(() => (data ? { data, update } : null), [data, update]);

  const visibleFeatures = ADMIN_FEATURES.filter((feature) => canAccess(role, feature.id));
  const roleOptions = ADMIN_ROLES.map((r) => ({ value: r.id, label: r.label, description: r.description }));
  const dashboardName = data ? `${data.storeName} admin` : "Store admin";

  // The feature the visitor is on, for the breadcrumb in the top bar.
  const current =
    ADMIN_FEATURES.find((f) => f.id !== "overview" && pathname.startsWith(featureHref(basePath, f))) ??
    ADMIN_FEATURES[0];
  const currentGroup = FEATURE_GROUPS.find((g) => g.ids.includes(current.id))?.label;

  const nav = (
    <nav aria-label="Admin" className="space-y-4">
      {FEATURE_GROUPS.map((group) => {
        const items = visibleFeatures.filter((feature) => group.ids.includes(feature.id));
        if (items.length === 0) return null;
        return (
          <div key={group.label} className="space-y-0.5">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">{group.label}</p>
            {items.map((feature) => {
              const Icon = feature.icon;
              const href = featureHref(basePath, feature);
              const active = feature.id === "overview" ? pathname === basePath : pathname.startsWith(href);
              return (
                <Link
                  key={feature.id}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  {active && <span aria-hidden="true" className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />}
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} aria-hidden="true" />
                  {feature.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href={basePath} className="flex min-w-0 items-center gap-2.5 font-semibold">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/25">
        <Store className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="truncate">{dashboardName}</span>
    </Link>
  );

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <DemoContext.Provider value={demo}>
        <div className="flex min-h-dvh bg-background text-foreground">
          {/* Sidebar: large screens only. Fits the viewport, so it does not scroll on normal laptop heights. */}
          <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/80 bg-card/70 backdrop-blur-xl lg:flex">
            <div className="flex h-16 shrink-0 items-center border-b border-border/70 px-5">{brand}</div>
            <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-5">{nav}</div>
            <div className="shrink-0 border-t border-border/70 p-4">
              <Link href={storefrontHref} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground">
                View storefront
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Top bar: every screen size. */}
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl sm:px-6">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open admin menu"
                aria-expanded={drawerOpen}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card/60 transition-colors hover:bg-accent lg:hidden"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="min-w-0 flex-1">
                <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                  {currentGroup && <span className="truncate">{currentGroup}</span>}
                  {currentGroup && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                  <span aria-current="page" className="truncate font-medium text-foreground">{current.label}</span>
                </nav>
                <p className="truncate text-sm font-semibold sm:hidden">{current.label}</p>
              </div>

              <div className="hidden w-44 md:block">
                <Select<RoleId> label="Viewing as" value={role} onChange={setRole} options={roleOptions} className="[&>span:first-child]:sr-only" />
              </div>

              <Link
                href={storefrontHref}
                aria-label="View storefront"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-card/60 px-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Store className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Storefront</span>
              </Link>
            </header>

            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </main>
          </div>

          {/* Menu drawer for small and medium screens. Rendered in a portal so it always covers the viewport. */}
          <Portal>
            <AnimatePresence>
              {drawerOpen && (
                <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <button
                    type="button"
                    aria-label="Close admin menu"
                    onClick={() => setDrawerOpen(false)}
                    className="absolute inset-0 bg-background/70 backdrop-blur-sm"
                  />
                  <motion.aside
                    role="dialog"
                    aria-modal="true"
                    aria-label="Admin navigation"
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 320, damping: 34 }}
                    className="absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col border-r border-border bg-card shadow-2xl"
                  >
                    <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 px-5">
                      {brand}
                      <button
                        type="button"
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Close"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-5">{nav}</div>
                    <div className="shrink-0 border-t border-border/70 p-4">
                      <Select<RoleId> label="Viewing as" value={role} onChange={setRole} options={roleOptions} />
                    </div>
                  </motion.aside>
                </motion.div>
              )}
            </AnimatePresence>
          </Portal>
        </div>
      </DemoContext.Provider>
    </RoleContext.Provider>
  );
}
