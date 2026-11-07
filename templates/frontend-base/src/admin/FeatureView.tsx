"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Lock, Plug, Send } from "lucide-react";
import { ResourceList } from "@/components/data/ResourceList";
import { API_URL, apiGet } from "@/lib/api";
import { canAccess, FEATURE_GROUPS, getFeature, type FeatureId } from "./features";
import { PageHeader } from "./ui/primitives";
import { DemoFeature } from "./DemoFeature";
import { useDemo, useRole } from "./AdminShell";

const EASE = [0.22, 1, 0.36, 1] as const;

const KPI_SOURCES = [
  { label: "Products", endpoint: "/api/products" },
  { label: "Orders", endpoint: "/api/orders" },
  { label: "Customers", endpoint: "/api/users" },
  { label: "Coupons", endpoint: "/api/coupons" }
] as const;

function useCount(endpoint: string) {
  const [count, setCount] = useState<number | null | "error">(null);
  useEffect(() => {
    let cancelled = false;
    apiGet<unknown[] | { items?: unknown[] }>(endpoint).then((result) => {
      if (cancelled) return;
      if (!result.ok) return setCount("error");
      const data = result.data;
      setCount(Array.isArray(data) ? data.length : ((data as { items?: unknown[] })?.items?.length ?? 0));
    });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);
  return count;
}

function KpiCard({ label, endpoint }: { label: string; endpoint: string }) {
  const count = useCount(endpoint);
  const value = count === null ? "…" : count === "error" ? "—" : String(count);
  const hint = count === "error" ? "Sign in or start the API" : count === 0 ? "None yet" : "From the API";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <p className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function NotificationTest() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  async function send() {
    setStatus("sending");
    try {
      const res = await fetch(`${API_URL}/api/notifications/test`, { method: "POST", credentials: "include" });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <p className="font-semibold">Send a test email</p>
      <p className="text-sm text-muted-foreground">Uses the SMTP settings in backend/.env.</p>
      <button
        type="button"
        onClick={send}
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        {status === "sending" ? "Sending…" : "Send test email"}
      </button>
      {status === "sent" && <p className="text-sm text-emerald-500">Test email sent.</p>}
      {status === "failed" && <p className="text-sm text-destructive">Could not send. Check the API and SMTP settings.</p>}
    </div>
  );
}

/** One page template for every dashboard feature, connected to its backend endpoint. */
export function FeatureView({ featureId }: { featureId: FeatureId }) {
  const { role } = useRole();
  const demo = useDemo();
  const feature = getFeature(featureId);
  if (!feature) return null;

  const Icon = feature.icon;

  return (
    <motion.div
      key={featureId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-8"
    >
      <PageHeader
        eyebrow={FEATURE_GROUPS.find((g) => g.ids.includes(featureId))?.label}
        title={feature.label}
        icon={Icon}
        description={demo ? `${feature.description} Demo data: changes stay in this browser session.` : feature.description}
        actions={
          <span className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <Plug className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate font-mono">{demo ? `Demo · ${demo.data.themeId}` : API_URL}</span>
          </span>
        }
      />

      {demo && canAccess(role, featureId) ? (
        <DemoFeature featureId={featureId} />
      ) : !canAccess(role, featureId) ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <Lock className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 font-semibold">Not available for this role</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Switch &ldquo;Viewing as&rdquo; to a role with access to {feature.label.toLowerCase()}.
          </p>
        </div>
      ) : featureId === "overview" ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          {KPI_SOURCES.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} endpoint={kpi.endpoint} />
          ))}
        </div>
      ) : featureId === "notifications" ? (
        <NotificationTest />
      ) : feature.endpoint ? (
        <ResourceList
          endpoint={feature.endpoint}
          columns={feature.columns}
          emptyTitle={feature.emptyTitle}
          emptyBody={feature.emptyBody}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-semibold">Demo feature</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {feature.label} is shown with demo data on each store theme&apos;s admin, such as /themes/fashion/admin.
          </p>
        </div>
      )}
    </motion.div>
  );
}
