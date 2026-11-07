import { Check, Circle, XCircle } from "lucide-react";
import type { TimelineStep } from "@/lib/order-timeline";

/**
 * Vertical order-status timeline. Server-renderable (no state), so the storefront
 * tracking page and the admin dashboard both use it. Done steps are filled, the
 * current step is outlined in the primary colour, and upcoming steps are muted.
 */
export function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol aria-label="Order status" className="relative space-y-0">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const done = step.state === "done";
        const cancelled = step.state === "cancelled";
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0" aria-current={step.state === "current" ? "step" : undefined}>
            {!last && (
              <span
                aria-hidden="true"
                className={`absolute left-[0.95rem] top-8 h-[calc(100%-2rem)] w-0.5 rounded-full ${done ? "bg-primary" : "bg-border"}`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background ${
                done
                  ? "bg-primary text-primary-foreground"
                  : cancelled
                    ? "bg-destructive/15 text-destructive"
                    : step.state === "current"
                      ? "bg-primary/15 text-primary ring-primary/20"
                      : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-4 w-4" aria-hidden="true" /> : cancelled ? <XCircle className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-3 w-3 fill-current" aria-hidden="true" />}
            </span>
            <div className="min-w-0 pt-1">
              <p className={`text-sm font-semibold ${step.state === "upcoming" ? "text-muted-foreground" : "text-foreground"}`}>
                {step.label}
                {step.state === "current" && <span className="ml-2 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Now</span>}
              </p>
              {step.at && <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">{step.at}{step.note && step.note !== step.label ? ` · ${step.note}` : ""}</p>}
              {!step.at && step.state === "upcoming" && <p className="mt-0.5 text-xs text-muted-foreground">Waiting</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
