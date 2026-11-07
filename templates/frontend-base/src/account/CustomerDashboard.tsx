"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, LogIn, Package, UserRound } from "lucide-react";
import { ResourceList } from "@/components/data/ResourceList";
import { apiGet } from "@/lib/api";

type Tab = "overview" | "orders" | "wishlist" | "profile";

const TABS: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "profile", label: "Profile", icon: UserRound }
];

const ORDER_COLUMNS = [
  { key: "orderNumber", label: "Order" },
  { key: "status", label: "Status", format: "status" as const },
  { key: "totalMinor", label: "Total", format: "money" as const },
  { key: "createdAt", label: "Placed", format: "date" as const }
];

const WISHLIST_COLUMNS = [
  { key: "name", label: "Product" },
  { key: "priceMinor", label: "Price", format: "money" as const },
  { key: "addedAt", label: "Saved", format: "date" as const }
];

type Profile = { name?: string; email?: string; phone?: string };

function ProfilePanel() {
  const [state, setState] = useState<{ status: "loading" } | { status: "error"; message: string } | { status: "ready"; profile: Profile }>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiGet<Profile>("/api/users/profile").then((result) => {
      if (cancelled) return;
      setState(result.ok ? { status: "ready", profile: result.data } : { status: "error", message: result.message });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return <div className="h-40 animate-pulse rounded-2xl bg-muted" aria-busy="true" />;
  }
  if (state.status === "error") {
    return <SignInPrompt message={state.message} />;
  }

  const fields = [
    { label: "Name", value: state.profile.name },
    { label: "Email", value: state.profile.email },
    { label: "Phone", value: state.profile.phone }
  ];

  return (
    <dl className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6">
      {fields.map((field) => (
        <div key={field.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{field.label}</dt>
          <dd className="mt-1 truncate font-medium">{field.value || "Not added yet"}</dd>
        </div>
      ))}
    </dl>
  );
}

function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <LogIn className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-4 font-semibold">Sign in to see your account</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/** Customer account area: orders, wishlist and profile, all read from the API. */
export function CustomerDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">My account</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back</h1>
      </header>

      <nav aria-label="Account sections" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto border-b border-border px-1">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`relative whitespace-nowrap px-3 pb-3 pt-2 text-sm font-medium transition-colors ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {active && (
                <motion.span
                  layoutId="account-tab-indicator"
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {TABS.filter((t) => t.id !== "overview").map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-semibold">{item.label}</span>
                      <span className="block text-sm text-muted-foreground">View your {item.label.toLowerCase()}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {tab === "orders" && (
            <ResourceList endpoint="/api/orders" columns={ORDER_COLUMNS} emptyTitle="No orders yet" emptyBody="Your orders appear here after checkout." />
          )}
          {tab === "wishlist" && (
            <ResourceList endpoint="/api/wishlist" columns={WISHLIST_COLUMNS} emptyTitle="Your wishlist is empty" emptyBody="Save products you like and they appear here." />
          )}
          {tab === "profile" && <ProfilePanel />}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
