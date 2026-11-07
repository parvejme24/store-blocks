"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Inbox } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Column } from "@/admin/features";

type Row = Record<string, unknown>;
type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; rows: Row[] };

function formatCell(value: unknown, format?: Column["format"], row?: Row): string {
  if (value === null || value === undefined || value === "") return "—";
  if (format === "money") {
    const currency = typeof row?.currency === "string" ? row.currency : "BDT";
    return formatPrice(Number(value), currency);
  }
  if (format === "date") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function StatusPill({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-medium capitalize">
      {value.replace(/_/g, " ")}
    </span>
  );
}

/**
 * Lists records from a backend endpoint. Shows a skeleton while loading, a clear
 * message if the API is unreachable or needs sign-in, an empty state, and a table
 * on wide screens that becomes stacked cards on phones.
 */
export function ResourceList({
  endpoint,
  columns,
  emptyTitle,
  emptyBody
}: {
  endpoint: string;
  columns: Column[];
  emptyTitle: string;
  emptyBody: string;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiGet<Row[] | { items?: Row[] }>(endpoint).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: "error", message: result.message });
        return;
      }
      const data = result.data;
      const rows = Array.isArray(data) ? data : (data as { items?: Row[] })?.items ?? [];
      setState({ status: "ready", rows });
    });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  if (state.status === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading" className="space-y-3 rounded-2xl border border-border bg-card p-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-semibold">Could not load data</p>
          <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
          <p className="mt-2 break-all font-mono text-xs text-muted-foreground">GET {endpoint}</p>
        </div>
      </div>
    );
  }

  if (state.rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-4 text-lg font-semibold">{emptyTitle}</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{emptyBody}</p>
      </div>
    );
  }

  const rows = state.rows;

  return (
    <div className="space-y-4">
      {/* Wide screens: table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border md:block">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <motion.tr
                key={String(row.id ?? index)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(index, 10) * 0.03 }}
                className="border-t border-border transition-colors hover:bg-accent/40"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle">
                    {column.format === "status" ? (
                      <StatusPill value={String(row[column.key] ?? "unknown")} />
                    ) : (
                      formatCell(row[column.key], column.format, row)
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones and tablets: stacked cards */}
      <ul className="grid gap-3 md:hidden">
        {rows.map((row, index) => (
          <li key={String(row.id ?? index)} className="rounded-2xl border border-border bg-card p-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {columns.map((column) => (
                <div key={column.key} className={`min-w-0 ${columns.indexOf(column) === 0 ? "col-span-2" : ""}`}>
                  <dt className="text-xs text-muted-foreground">{column.label}</dt>
                  <dd className="mt-0.5 truncate font-medium">
                    {column.format === "status" ? (
                      <StatusPill value={String(row[column.key] ?? "unknown")} />
                    ) : (
                      formatCell(row[column.key], column.format, row)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
