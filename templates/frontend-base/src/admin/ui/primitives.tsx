"use client";

import { Children, cloneElement, isValidElement, useEffect, useId, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Eye, MoreHorizontal, Pencil, Search, Trash2, X, type LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- Style tokens (all colours come from theme tokens) ---------- */

export const INPUT =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-background/60 px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

export const TEXTAREA = `${INPUT} h-auto min-h-24 py-2.5 leading-relaxed`;

export const BUTTON = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:opacity-50",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card/60 px-4 text-sm font-medium transition hover:bg-accent disabled:opacity-50",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-destructive/40 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-40"
} as const;

/**
 * Renders children in document.body, so fixed overlays are not trapped by a
 * transformed or overflow-clipped ancestor (for example a page animation).
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}

/* ---------- Layout ---------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  return (
    <header className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-accent/40 p-5 shadow-sm sm:rounded-3xl sm:p-8 md:flex-row md:items-center md:justify-between">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative min-w-0 space-y-2">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="flex min-w-0 items-center gap-3 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
          {Icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/25">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0 truncate sm:whitespace-normal">{title}</span>
        </h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="relative flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  id,
  className = ""
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card/70 shadow-sm shadow-black/5 backdrop-blur-sm ${className}`.trim()}>
      {(title || action) && (
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            {title && <h2 className="font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="min-w-0 space-y-4 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card to-card/60 p-4 shadow-sm transition-colors hover:border-primary/30 sm:p-5">
      <div aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <p className="min-w-0 text-xs font-medium text-muted-foreground sm:text-sm">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="relative mt-3 truncate text-lg font-bold tabular-nums tracking-tight sm:text-2xl">{value}</p>
      {hint && <p className="relative mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ---------- Tables ----------
 * Below the large breakpoint each row becomes a card with labelled values, so
 * nothing needs a sideways scrollbar on phones or tablets. From `lg` it is a
 * normal table. Columns are passed to rows automatically; the first column is
 * the row title and has no label.
 */

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="min-w-0 lg:overflow-hidden lg:rounded-xl lg:border lg:border-border/80">
      <table className="block w-full text-left text-sm lg:table">
        <thead className="hidden bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-header-group">
          <tr>
            {head.map((h, i) => (
              <th key={`${h}-${i}`} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block space-y-3 lg:table-row-group lg:space-y-0 lg:divide-y lg:divide-border/70">
          {Children.map(children, (child) =>
            isValidElement<{ labels?: string[] }>(child) && child.type === Tr ? cloneElement(child, { labels: head }) : child
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Tr({ children, labels = [] }: { children: React.ReactNode; labels?: string[] }) {
  return (
    <tr className="group/row block rounded-2xl border border-border/70 bg-card/60 p-3 shadow-sm lg:table-row lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:hover:bg-accent/20">
      {Children.map(children, (child, i) =>
        isValidElement<{ label?: string }>(child) ? cloneElement(child as ReactElement<{ label?: string }>, { label: i === 0 ? undefined : labels[i] || undefined }) : child
      )}
    </tr>
  );
}

export function Td({ children, className = "", label }: { children: React.ReactNode; className?: string; label?: string }) {
  if (label) {
    return (
      <td className={`flex min-w-0 items-center justify-between gap-4 border-t border-border/50 py-2.5 text-right first:border-t-0 lg:table-cell lg:border-0 lg:px-4 lg:py-3 lg:text-left lg:align-middle ${className}`}>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:hidden">{label}</span>
        <span className="flex min-w-0 max-w-[65%] flex-wrap items-center justify-end gap-2 lg:contents">{children}</span>
      </td>
    );
  }
  return <td className={`block min-w-0 py-2 lg:table-cell lg:px-4 lg:py-3 lg:align-middle ${className}`}>{children}</td>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr className="block lg:table-row">
      <td colSpan={colSpan} className="block px-4 py-12 text-center text-sm text-muted-foreground lg:table-cell">
        {children}
      </td>
    </tr>
  );
}

/* ---------- Small parts ---------- */

export type Tone = "good" | "warn" | "bad" | "neutral" | "info";

const TONES: Record<Tone, { pill: string; dot: string }> = {
  good: { pill: "bg-emerald-500/12 text-emerald-600 ring-emerald-500/25 dark:text-emerald-400", dot: "bg-emerald-500" },
  warn: { pill: "bg-amber-500/12 text-amber-600 ring-amber-500/25 dark:text-amber-400", dot: "bg-amber-500" },
  bad: { pill: "bg-destructive/12 text-destructive ring-destructive/25", dot: "bg-destructive" },
  info: { pill: "bg-primary/12 text-primary ring-primary/25", dot: "bg-primary" },
  neutral: { pill: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground" }
};

export function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${TONES[tone].pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${TONES[tone].dot}`} aria-hidden="true" />
      {children}
    </span>
  );
}

export function Thumb({ src, alt, icon: Icon, size = "h-10 w-10" }: { src?: string | null; alt: string; icon: LucideIcon; size?: string }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-muted to-accent ring-1 ring-inset ring-border`}>
      {src ? (
        // Demo uploads are data URLs, which next/image does not optimise.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Icon className="h-4 w-4 text-primary/60" aria-hidden="true" />
      )}
    </span>
  );
}

/** Per-row actions in a shadcn dropdown menu. Edit opens the drawer; Delete asks for confirmation. */
export function RowActions({ name, onView, onEdit, onDelete }: { name: string; onView?: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-foreground lg:h-8 lg:w-8"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        {onView && (
          <DropdownMenuItem onSelect={onView}>
            <Eye aria-hidden="true" />
            View details
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil aria-hidden="true" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Toolbar({
  search,
  onSearch,
  placeholder = "Search",
  children
}: {
  search?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-3 md:flex md:items-center">
      {onSearch && (
        <label className="relative block min-w-0 md:max-w-xs md:flex-1">
          <span className="sr-only">{placeholder}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" value={search ?? ""} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} className={`${INPUT} pl-9`} />
        </label>
      )}
      {children && <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center md:ml-auto">{children}</div>}
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  className = "",
  control = false,
  children
}: {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  /** For controls that draw their own label (such as Select): only shows the error. */
  control?: boolean;
  children: React.ReactNode;
}) {
  // Every field reserves the same label row and error row, so fields in one grid row
  // stay aligned whether or not an error or hint is showing.
  const message = (
    <span role={error ? "alert" : undefined} className="block min-h-4 text-xs leading-4 text-destructive">
      {error ?? ""}
    </span>
  );
  if (control) {
    return (
      <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
        {children}
        {message}
      </div>
    );
  }
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label className="flex min-w-0 flex-col gap-1.5">
        <span className="flex h-4 items-center justify-between gap-2 text-xs font-medium leading-4 text-muted-foreground">
          <span className="truncate">{label}</span>
          {hint && <span className="shrink-0 truncate text-right font-normal text-muted-foreground/80">{hint}</span>}
        </span>
        {children}
      </label>
      {message}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId();
  const descriptionId = `${id}-description`;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/40 p-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium leading-5">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="mt-0.5 text-xs leading-4 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-describedby={description ? descriptionId : undefined} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Overlays ---------- */

/**
 * Slide-over panel for create and edit forms. Full width on phones, a side panel
 * from `sm`. The header and footer stay fixed while the body scrolls.
 */
export function Sheet({
  open,
  title,
  description,
  onClose,
  children,
  width = "max-w-2xl"
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Escape closes the innermost layer first: an open select, dropdown or calendar.
      if (e.key === "Escape" && !document.querySelector('[data-radix-popper-content-wrapper] [data-state="open"]')) onClose();
    };
    // Capture phase: this runs before Radix closes its popup, so Escape closes the popup first.
    window.addEventListener("keydown", onKey, true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
              className={`absolute inset-y-0 right-0 flex h-dvh w-full ${width} flex-col border-l border-border bg-card shadow-2xl`}
            >
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/80 px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold tracking-tight">{title}</h2>
                  {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/** Footer for form sheets. Stacks full-width buttons on phones; sits fixed at the bottom of the panel. */
export function SheetFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 mt-auto flex flex-col-reverse gap-2 border-t border-border/80 bg-card/95 px-4 py-3 backdrop-blur sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-4 [&>button]:w-full sm:[&>button]:w-auto">
      {children}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  blockedReason,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  /** When set, deleting is blocked and this explains why. */
  blockedReason?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-body"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
            >
              <h2 id="confirm-title" className="text-lg font-semibold">{title}</h2>
              <p id="confirm-body" className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              {blockedReason && <p className="mt-3 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">{blockedReason}</p>}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 [&>button]:w-full sm:[&>button]:w-auto">
                <button type="button" onClick={onCancel} className={BUTTON.secondary}>Cancel</button>
                <button type="button" onClick={onConfirm} disabled={!!blockedReason} className={BUTTON.danger}>
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
