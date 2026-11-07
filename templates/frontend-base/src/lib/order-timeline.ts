import { addDaysIso } from "./dates";

/**
 * Order lifecycle and its timeline. Pure data and functions, so the storefront
 * tracking page and the admin dashboard show the same steps.
 */

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderEvent = { status: OrderStatus; at: string; note: string };

/** The happy path, in order. Cancelled orders leave the path. */
export const ORDER_STAGES: { key: Exclude<OrderStatus, "cancelled">; label: string }[] = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Packing" },
  { key: "shipped", label: "Handed to courier" },
  { key: "delivered", label: "Delivered" }
];

const STAGE_NOTE: Record<Exclude<OrderStatus, "cancelled">, string> = {
  pending: "Order received",
  confirmed: "Order confirmed",
  processing: "Packing your order",
  shipped: "Handed to the courier",
  delivered: "Delivered to the customer"
};

/** Events an order has reached, one per stage, dated from its placement day. */
export function buildOrderEvents(status: OrderStatus, placedOn: string): OrderEvent[] {
  if (status === "cancelled") {
    return [
      { status: "pending", at: placedOn, note: STAGE_NOTE.pending },
      { status: "cancelled", at: addDaysIso(placedOn, 1), note: "Cancelled" }
    ];
  }
  const reached = ORDER_STAGES.findIndex((stage) => stage.key === status);
  return ORDER_STAGES.slice(0, reached + 1).map((stage, i) => ({
    status: stage.key,
    at: addDaysIso(placedOn, i),
    note: STAGE_NOTE[stage.key]
  }));
}

/**
 * Records a status change. Keeps one event per status, so moving an order back
 * and forth does not duplicate steps. The newest event for a status wins.
 */
export function withStatusEvent(events: OrderEvent[], status: OrderStatus, at: string, note?: string): OrderEvent[] {
  const label = status === "cancelled" ? "Cancelled" : (ORDER_STAGES.find((s) => s.key === status)?.label ?? status);
  const event: OrderEvent = { status, at, note: note ?? label };
  return [...events.filter((e) => e.status !== status), event].sort((a, b) => stageIndex(a.status) - stageIndex(b.status));
}

function stageIndex(status: OrderStatus) {
  if (status === "cancelled") return ORDER_STAGES.length;
  return ORDER_STAGES.findIndex((stage) => stage.key === status);
}

export type TimelineStep = {
  key: string;
  label: string;
  at?: string;
  note?: string;
  state: "done" | "current" | "upcoming" | "cancelled";
};

/** The steps a timeline shows: done, current and upcoming for the path, or a cancelled step. */
export function orderTimelineSteps(status: OrderStatus, events: OrderEvent[]): TimelineStep[] {
  if (status === "cancelled") {
    const placed = events.find((e) => e.status === "pending");
    const cancelled = events.find((e) => e.status === "cancelled");
    return [
      { key: "pending", label: "Order placed", at: placed?.at, note: placed?.note, state: "done" },
      { key: "cancelled", label: "Cancelled", at: cancelled?.at, note: cancelled?.note, state: "cancelled" }
    ];
  }
  const reached = ORDER_STAGES.findIndex((stage) => stage.key === status);
  const last = ORDER_STAGES.length - 1;
  return ORDER_STAGES.map((stage, i) => {
    const event = events.find((e) => e.status === stage.key);
    const state: TimelineStep["state"] = i < reached || (i === reached && reached === last) ? "done" : i === reached ? "current" : "upcoming";
    return { key: stage.key, label: stage.label, at: event?.at, note: event?.note, state };
  });
}
