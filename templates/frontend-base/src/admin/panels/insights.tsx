"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { CheckCircle2, CircleDollarSign, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { formatPrice, formatCompactPrice } from "@/lib/format";
import type { DemoDataset } from "../demo/dataset";
import { EmptyRow, Panel, Pill, StatCard, Table, Td, Tr, type Tone } from "../ui/primitives";
import { DEMO_TODAY } from "../demo/dataset";
import { addMonthsIso } from "@/lib/dates";
import { ORDER_TONE, PAYMENT_TONE } from "./sales";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EASE = [0.22, 1, 0.36, 1] as const;

/** "2026-03-12" -> "12 Mar 2026". String-based so server and browser match. */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ""} ${y}`;
}

/** Net revenue per month for the six months ending at the demo date (cancelled orders excluded). */
function useMonthly(data: DemoDataset) {
  return useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const key = addMonthsIso(DEMO_TODAY, i - 5);
      return { key, label: MONTHS[Number(key.slice(5, 7)) - 1] };
    });
    const totals = new Map(months.map((m) => [m.key, 0]));
    const cancelledTotals = new Map(months.map((m) => [m.key, 0]));
    const orderCounts = new Map(months.map((m) => [m.key, 0]));

    for (const order of data.orders) {
      const key = order.createdAt.slice(0, 7);
      if (!totals.has(key)) continue;

      if (order.status === "cancelled") {
        cancelledTotals.set(key, (cancelledTotals.get(key) ?? 0) + order.totalMinor);
      } else {
        totals.set(key, (totals.get(key) ?? 0) + order.totalMinor);
        orderCounts.set(key, (orderCounts.get(key) ?? 0) + 1);
      }
    }

    const values = months.map((m) => totals.get(m.key) ?? 0);
    const max = Math.max(...values, 1);
    const bars = months.map((m, i) => ({
      label: m.label,
      key: m.key,
      value: values[i],
      ordersCount: orderCounts.get(m.key) ?? 0,
      cancelledValue: cancelledTotals.get(m.key) ?? 0,
      pct: Math.round((values[i] / max) * 100)
    }));

    const totalNet = values.reduce((sum, v) => sum + v, 0);
    const totalCancelled = Array.from(cancelledTotals.values()).reduce((sum, v) => sum + v, 0);
    const avgMonthly = Math.round(totalNet / 6);

    return { bars, totalNet, totalCancelled, avgMonthly };
  }, [data.orders]);
}

function MonthlyChart({ data, height = "h-48" }: { data: DemoDataset; height?: string }) {
  const { bars, totalNet, totalCancelled, avgMonthly } = useMonthly(data);
  const currency = data.settings.currency;

  return (
    <div className="space-y-4">
      {/* 6-Month Metric Summary Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-muted-foreground block text-[11px]">6-Month Net Total</span>
            <span className="font-bold text-foreground text-sm tabular-nums">
              {formatPrice(totalNet, currency)}
            </span>
          </div>
          <div className="hidden sm:block border-l border-border/60 pl-4">
            <span className="text-muted-foreground block text-[11px]">Monthly Average</span>
            <span className="font-semibold text-foreground tabular-nums">
              {formatPrice(avgMonthly, currency)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] font-medium text-foreground">
          <span className="text-muted-foreground">Excluded cancellations:</span>
          <span className="font-semibold text-destructive tabular-nums">
            {formatPrice(totalCancelled, currency)}
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className={`flex ${height} items-end gap-2 sm:gap-4 pt-2`} role="img" aria-label="Net revenue by month">
        {bars.map((bar, i) => (
          <div key={bar.label} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2">
            {/* Value Label above bar */}
            <span className="text-[10px] sm:text-[11px] font-semibold tabular-nums text-foreground/80 opacity-90 transition-opacity group-hover:opacity-100">
              {formatCompactPrice(bar.value, currency)}
            </span>

            {/* Bar container */}
            <div className="w-full flex-1 flex items-end">
              <motion.div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary/50 via-primary/80 to-primary shadow-md shadow-primary/10 transition-colors group-hover:brightness-110"
                style={{ minHeight: "6px" }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(bar.pct, 4)}%` }}
                transition={{ duration: 0.7, delay: i * 0.07, ease: EASE }}
                title={`${bar.label}: ${formatPrice(bar.value, currency)} (${bar.ordersCount} paid orders, excludes ${formatPrice(bar.cancelledValue, currency)} cancelled)`}
              />
            </div>

            {/* Month label */}
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewPanel({ data }: { data: DemoDataset }) {
  const currency = data.settings.currency;
  const paid = data.orders.filter((o) => o.status !== "cancelled");
  const revenue = paid.reduce((sum, o) => sum + o.totalMinor, 0);
  const average = paid.length ? Math.round(revenue / paid.length) : 0;
  const lowStock = data.products.filter((p) => p.stock <= p.reorderLevel);
  const needsAction = data.orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const pendingReviews = data.reviews.filter((r) => !r.approved).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Net revenue" value={formatPrice(revenue, currency)} hint={`${paid.length} orders · excludes cancelled`} icon={CircleDollarSign} />
        <StatCard label="Average order" value={formatPrice(average, currency)} hint="Per paid order" icon={TrendingUp} />
        <StatCard label="Orders to action" value={String(needsAction)} hint="Pending or confirmed" icon={ShoppingCart} />
        <StatCard label="Customers" value={String(data.customers.length)} hint={`${data.customers.filter((c) => c.active).length} active`} icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Revenue, last six months" description="Net of cancellations" className="lg:col-span-2">
          <MonthlyChart data={data} />
        </Panel>
        <Panel title="Attention needed">
          <ul className="space-y-3 text-sm">
            <Alert tone={lowStock.length ? "warn" : "good"} label={lowStock.length ? `${lowStock.length} products low on stock` : "Stock levels are healthy"} />
            <Alert tone={needsAction ? "info" : "good"} label={needsAction ? `${needsAction} orders waiting for action` : "No orders waiting"} />
            <Alert tone={pendingReviews ? "warn" : "good"} label={pendingReviews ? `${pendingReviews} reviews awaiting approval` : "All reviews approved"} />
          </ul>
          {lowStock.length > 0 && (
            <ul className="mt-4 divide-y divide-border/70 border-t border-border/70 pt-3">
              {lowStock.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{p.name}</span>
                  <Pill tone={p.stock === 0 ? "bad" : "warn"}>{p.stock === 0 ? "Out" : `${p.stock} left`}</Pill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent orders">
        <Table head={["Order", "Customer", "Total", "Payment", "Status", "Placed"]}>
          {data.orders.length === 0 && <EmptyRow colSpan={6}>No orders yet.</EmptyRow>}
          {data.orders.slice(0, 6).map((o) => (
            <Tr key={o.id}>
              <Td className="font-semibold">{o.orderNumber}</Td>
              <Td>{o.customer}</Td>
              <Td className="tabular-nums">{formatPrice(o.totalMinor, o.currency)}</Td>
              <Td>
                <Pill tone={PAYMENT_TONE[o.paymentStatus]}>{o.paymentStatus}</Pill>
              </Td>
              <Td>
                <Pill tone={ORDER_TONE[o.status]}>{o.status}</Pill>
              </Td>
              <Td className="text-muted-foreground">{formatDate(o.createdAt)}</Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}

function Alert({ tone, label }: { tone: Tone; label: string }) {
  const icon = tone === "good" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" /> : <Package className="h-4 w-4 text-amber-500" aria-hidden="true" />;
  return (
    <li className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </li>
  );
}

export function RevenuePanel({ data }: { data: DemoDataset }) {
  const currency = data.settings.currency;
  const paid = data.orders.filter((o) => o.status !== "cancelled");
  const net = paid.reduce((sum, o) => sum + o.totalMinor, 0);
  const gross = data.orders.reduce((sum, o) => sum + o.totalMinor, 0);
  const cancelled = data.orders.filter((o) => o.status === "cancelled").reduce((sum, o) => sum + o.totalMinor, 0);
  const tax = paid.reduce((sum, o) => sum + o.taxMinor, 0);
  const cost = paid.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity * (data.products.find((p) => p.id === i.productId)?.costMinor ?? 0), 0), 0);
  const grossProfit = net - tax - cost;

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const order of paid) {
      for (const item of order.items) totals.set(item.category, (totals.get(item.category) ?? 0) + item.unitMinor * item.quantity);
    }
    const rows = Array.from(totals, ([category, value]) => ({ category, value })).sort((a, b) => b.value - a.value);
    const max = Math.max(...rows.map((r) => r.value), 1);
    return rows.map((r) => ({ ...r, pct: Math.round((r.value / max) * 100) }));
  }, [paid]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Net revenue" value={formatPrice(net, currency)} hint="After cancellations" icon={CircleDollarSign} />
        <StatCard label="Gross order value" value={formatPrice(gross, currency)} hint={`${formatPrice(cancelled, currency)} cancelled`} />
        <StatCard label="Tax collected" value={formatPrice(tax, currency)} hint="Remit to the authority" />
        <StatCard label="Estimated gross profit" value={formatPrice(grossProfit, currency)} hint="Net minus tax minus cost" icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Revenue by month" description="Net of cancellations" className="lg:col-span-2">
          <MonthlyChart data={data} height="h-56" />
        </Panel>
        <Panel title="Sales by category">
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No paid orders yet.</p>
          ) : (
            <ul className="space-y-4">
              {byCategory.map((row) => (
                <li key={row.category} className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{row.category}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{formatPrice(row.value, currency)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary" initial={{ width: 0 }} animate={{ width: `${row.pct}%` }} transition={{ duration: 0.6, ease: EASE }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Paid orders" description="Orders counted in net revenue">
        <Table head={["Order", "Customer", "Items", "Tax", "Total", "Placed"]}>
          {paid.length === 0 && <EmptyRow colSpan={6}>No paid orders yet.</EmptyRow>}
          {paid.map((o) => (
            <Tr key={o.id}>
              <Td className="font-semibold">{o.orderNumber}</Td>
              <Td>{o.customer}</Td>
              <Td className="tabular-nums">{o.items.reduce((s, i) => s + i.quantity, 0)}</Td>
              <Td className="tabular-nums text-muted-foreground">{formatPrice(o.taxMinor, o.currency)}</Td>
              <Td className="tabular-nums font-medium">{formatPrice(o.totalMinor, o.currency)}</Td>
              <Td className="text-muted-foreground">{formatDate(o.createdAt)}</Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}

/** Overview or revenue, chosen by feature id. */
export function InsightsPanel({ feature, data }: { feature: "overview" | "revenue"; data: DemoDataset }) {
  return feature === "overview" ? <OverviewPanel data={data} /> : <RevenuePanel data={data} />;
}
