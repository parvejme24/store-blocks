"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Download, Plus, PackageCheck, ShoppingCart, Ticket, Trash2, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { formatDisplayDate, todayIso } from "@/lib/dates";
import { downloadCsv, toCsv } from "@/lib/csv";
import { withStatusEvent, orderTimelineSteps, type OrderStatus, type TimelineStep } from "@/lib/order-timeline";
import { COUPON_KIND_OPTIONS, describeCoupon, evaluateCoupon, type CartLine, type CouponKind, type CouponRule } from "@/lib/coupons";
import { OrderTimeline } from "@/components/store/OrderTimeline";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_OPTIONS,
  fromMinor,
  newId,
  orderSchema,
  toInt,
  toMinor,
  useEntityForm,
  couponSchema
} from "../demo/schemas";
import {
  COURIERS,
  type DemoCoupon,
  type DemoDataset,
  type DemoOrder,
  type DemoShipment,
  type DemoUpdate,
  type PaymentStatus,
  type ShipmentStatus
} from "../demo/dataset";
import {
  BUTTON,
  ConfirmDialog,
  EmptyState,
  Field,
  INPUT,
  Panel,
  Pill,
  RowActions,
  Sheet,
  SheetFooter,
  StatCard,
  Table,
  Td,
  TEXTAREA,
  Toggle,
  Toolbar,
  Tr,
  type Tone
} from "../ui/primitives";

/* ============================ Shared ============================ */

export const ORDER_TONE: Record<OrderStatus, Tone> = {
  pending: "warn",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "good",
  cancelled: "bad"
};

export const PAYMENT_TONE: Record<PaymentStatus, Tone> = { unpaid: "warn", paid: "good", refunded: "neutral" };

const SHIPPED_STATES: OrderStatus[] = ["shipped", "delivered"];

/** Shipment timeline stages, in order. */
const SHIPMENT_STAGES: { key: ShipmentStatus; label: string }[] = [
  { key: "picked_up", label: "Picked up" },
  { key: "in_transit", label: "In transit" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" }
];

const SHIPMENT_LABEL: Record<ShipmentStatus, string> = {
  picked_up: "Picked up",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned"
};

const SHIPMENT_TONE: Record<ShipmentStatus, Tone> = {
  picked_up: "info",
  in_transit: "info",
  out_for_delivery: "warn",
  delivered: "good",
  returned: "bad"
};

const SHIPMENT_NEXT: Partial<Record<ShipmentStatus, ShipmentStatus>> = {
  picked_up: "in_transit",
  in_transit: "out_for_delivery",
  out_for_delivery: "delivered"
};

const SHIPMENT_NOTE: Record<ShipmentStatus, string> = {
  picked_up: "Picked up",
  in_transit: "In transit between hubs",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered and paid",
  returned: "Returned to the store"
};

/** Timeline steps for a shipment, shaped like the order timeline. */
function shipmentSteps(status: ShipmentStatus, events: DemoShipment["events"]): TimelineStep[] {
  const at = (key: ShipmentStatus) => events.find((e) => e.status === key);
  if (status === "returned") {
    const returned = at("returned");
    return [
      ...SHIPMENT_STAGES.slice(0, 1).map((s) => ({ key: s.key, label: s.label, at: at(s.key)?.at, note: at(s.key)?.note, state: "done" as const })),
      { key: "returned", label: "Returned", at: returned?.at, note: returned?.note, state: "cancelled" as const }
    ];
  }
  const reached = SHIPMENT_STAGES.findIndex((s) => s.key === status);
  const last = SHIPMENT_STAGES.length - 1;
  return SHIPMENT_STAGES.map((stage, i) => {
    const state: TimelineStep["state"] = i < reached || (i === reached && reached === last) ? "done" : i === reached ? "current" : "upcoming";
    return { key: stage.key, label: stage.label, at: at(stage.key)?.at, note: at(stage.key)?.note, state };
  });
}

/** The order's status-driven timeline, shared by the drawer and the list. */
function OrderDetailTimeline({ order }: { order: DemoOrder }) {
  return <OrderTimeline steps={orderTimelineSteps(order.status, order.events)} />;
}

/* ============================ Orders ============================ */

type OrderFormValues = {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  phone: string;
  address: string;
  city: string;
  notes: string;
};

function OrderDrawer({ order, data, update, onClose }: { order: DemoOrder; data: DemoDataset; update: DemoUpdate; onClose: () => void }) {
  const form = useEntityForm<OrderFormValues>(
    {
      status: order.status,
      paymentStatus: order.paymentStatus,
      phone: order.phone,
      address: order.address,
      city: order.city,
      notes: order.notes
    },
    orderSchema
  );
  const { values, errors, set } = form;
  const submit = form.submit((v) => {
    const today = todayIso();
    update((d) => ({
      ...d,
      orders: d.orders.map((o) =>
        o.id !== order.id
          ? o
          : {
              ...o,
              status: v.status,
              paymentStatus: v.paymentStatus,
              phone: v.phone.trim(),
              address: v.address.trim(),
              city: v.city.trim(),
              notes: v.notes.trim(),
              events: v.status === order.status ? o.events : withStatusEvent(o.events, v.status, today, `Status set to ${v.status}`)
            }
      ),
      shipments:
        v.status === "delivered"
          ? d.shipments.map((s) => (s.orderId === order.id && s.status !== "delivered" ? { ...s, status: "delivered" as ShipmentStatus } : s))
          : d.shipments
    }));
    onClose();
  });
  const currency = data.settings.currency;
  const shipment = data.shipments.find((s) => s.orderId === order.id);

  return (
    <div className="flex min-h-full flex-col">
      <div className="space-y-8 px-4 py-6 sm:px-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Status timeline</h3>
          <div className="rounded-xl border border-border/80 bg-background/40 p-4">
            <OrderDetailTimeline order={order} />
          </div>
          {shipment && (
            <p className="text-xs text-muted-foreground">
              Courier: {shipment.courier} · tracking <span className="font-mono">{shipment.trackingCode}</span>
            </p>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Items</h3>
          <ul className="divide-y divide-border/70 rounded-xl border border-border/80">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.quantity}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.sku} · {item.quantity} × {formatPrice(item.unitMinor, currency)}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums">{formatPrice(item.unitMinor * item.quantity, currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-4">
            <div><dt className="text-xs text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotalMinor, currency)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Discount{order.couponCode ? ` · ${order.couponCode}` : ""}</dt><dd className="tabular-nums">−{formatPrice(order.discountMinor, currency)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Shipping and tax</dt><dd className="tabular-nums">{formatPrice(order.shippingMinor + order.taxMinor, currency)}</dd></div>
            <div><dt className="text-xs font-semibold text-foreground">Total</dt><dd className="font-semibold tabular-nums">{formatPrice(order.totalMinor, currency)}</dd></div>
          </dl>
          <p className="text-xs text-muted-foreground">Payment: {PAYMENT_METHOD_LABEL[order.paymentMethod]}. Items and prices are a record of the sale.</p>
        </section>

        <form id="order-form" onSubmit={submit} noValidate className="space-y-4">
          <h3 className="text-sm font-semibold">Update order</h3>
          <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
            <Field control>
              <Select<OrderStatus>
                label="Order status"
                value={values.status}
                options={ORDER_STATUS_OPTIONS.map((o) => ({ value: o.value as OrderStatus, label: o.label }))}
                onChange={(v) => set("status", v)}
              />
            </Field>
            <Field control>
              <Select<PaymentStatus>
                label="Payment status"
                value={values.paymentStatus}
                options={PAYMENT_STATUS_OPTIONS.map((o) => ({ value: o.value as PaymentStatus, label: o.label }))}
                onChange={(v) => set("paymentStatus", v)}
              />
            </Field>
            <Field label="Customer phone" error={errors.phone}>
              <input value={values.phone} onChange={(e) => set("phone", e.target.value)} className={INPUT} aria-invalid={!!errors.phone} />
            </Field>
            <Field label="City" error={errors.city}>
              <input value={values.city} onChange={(e) => set("city", e.target.value)} className={INPUT} aria-invalid={!!errors.city} />
            </Field>
            <Field label="Delivery address" error={errors.address} className="sm:col-span-2">
              <textarea value={values.address} onChange={(e) => set("address", e.target.value)} rows={2} className={TEXTAREA} aria-invalid={!!errors.address} />
            </Field>
            <Field label="Internal notes" error={errors.notes} className="sm:col-span-2" hint="Not shown to the customer">
              <textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={TEXTAREA} />
            </Field>
          </div>
        </form>
      </div>
      <SheetFooter>
        <button type="button" onClick={onClose} className={BUTTON.secondary}>Cancel</button>
        <button type="submit" form="order-form" className={BUTTON.primary}>Save order</button>
      </SheetFooter>
    </div>
  );
}

function csvFor(orders: DemoOrder[], data: DemoDataset): string {
  const money = (minor: number) => fromMinor(minor);
  const shipmentFor = (id: string) => data.shipments.find((s) => s.orderId === id);
  const rows = orders.map((o) => {
    const shipment = shipmentFor(o.id);
    return [
      o.orderNumber,
      o.createdAt,
      o.customer,
      o.email,
      o.phone,
      o.city,
      o.address,
      o.items.map((i) => `${i.quantity}x ${i.name}`).join("; "),
      money(o.subtotalMinor),
      money(o.discountMinor),
      money(o.shippingMinor),
      money(o.taxMinor),
      money(o.totalMinor),
      o.couponCode ?? "",
      PAYMENT_METHOD_LABEL[o.paymentMethod],
      o.paymentStatus,
      o.status,
      shipment?.courier ?? "",
      shipment?.trackingCode ?? ""
    ];
  });
  return toCsv(
    ["Order", "Date", "Customer", "Email", "Phone", "City", "Address", "Items", "Subtotal", "Discount", "Shipping", "Tax", "Total", "Coupon", "Payment method", "Payment status", "Status", "Courier", "Tracking"],
    rows
  );
}

export function OrdersPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  // The date is read after mount, so server and browser render the same first frame.
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayIso()), []);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [scope, setScope] = useState<"today" | "all" | "custom">("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [pending, setPending] = useState<DemoOrder[] | null>(null);

  const range = scope === "all" ? { from: "", to: "" } : scope === "today" ? { from: today, to: today } : { from, to };
  const visible = useMemo(() => {
    if (scope === "today" && !today) return [];
    return data.orders
      .filter((o) => (!range.from || o.createdAt >= range.from) && (!range.to || o.createdAt <= range.to))
      .filter((o) => status === "all" || o.status === status)
      .filter((o) => o.orderNumber.includes(query) || o.customer.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    // range is derived from scope/today/from/to, which are the real dependencies here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.orders, scope, today, from, to, status, query]);

  const visibleIds = visible.map((o) => o.id);
  const selectedVisible = selected.filter((id) => visibleIds.includes(id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;
  const someChecked = selectedVisible.length > 0 && !allChecked;
  const toggleAll = () => setSelected(allChecked ? [] : visibleIds);
  const toggleOne = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const drawerOrder = data.orders.find((o) => o.id === drawerId);
  const revenue = visible.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.totalMinor, 0);

  const scopeLabel =
    scope === "today" ? (today ? `Today · ${formatDisplayDate(today)}` : "Today") : scope === "all" ? "All dates" : from && to ? `${formatDisplayDate(from)} – ${formatDisplayDate(to)}` : "Pick a date range";

  function deleteOrders(orders: DemoOrder[]) {
    const ids = orders.map((o) => o.id);
    update((d) => ({
      ...d,
      orders: d.orders.filter((o) => !ids.includes(o.id)),
      shipments: d.shipments.filter((s) => !ids.includes(s.orderId))
    }));
    setSelected((cur) => cur.filter((id) => !ids.includes(id)));
    setPending(null);
  }

  function exportCsv() {
    const rows = selectedVisible.length > 0 ? visible.filter((o) => selectedVisible.includes(o.id)) : visible;
    const name = scope === "today" ? `orders-${today || "today"}.csv` : scope === "all" ? "orders-all.csv" : `orders-${from || "start"}-to-${to || "end"}.csv`;
    downloadCsv(name, csvFor(rows, data));
  }

  const deletable = (orders: DemoOrder[]) => orders.filter((o) => !SHIPPED_STATES.includes(o.status));
  const selectedOrders = visible.filter((o) => selectedVisible.includes(o.id));
  const shipmentFor = (id: string) => data.shipments.find((s) => s.orderId === id);

  const pendingDeletable = pending ? deletable(pending) : [];
  const pendingSkipped = pending ? pending.length - pendingDeletable.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Orders" value={String(visible.length)} hint={scopeLabel} icon={ShoppingCart} />
        <StatCard label="Net value" value={formatPrice(revenue, data.settings.currency)} hint="Excludes cancelled" />
        <StatCard label="Needs action" value={String(visible.filter((o) => o.status === "pending" || o.status === "confirmed").length)} hint="Pending or confirmed" />
        <StatCard label="Unpaid" value={String(visible.filter((o) => o.paymentStatus === "unpaid" && o.status !== "cancelled").length)} hint="Not cancelled" />
      </div>

      <Panel
        title="Orders"
        description="Shows today's orders by default. Pick a range or choose All dates to see everything."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv} disabled={visible.length === 0} className={BUTTON.secondary}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export CSV{selectedVisible.length ? ` (${selectedVisible.length})` : ""}
            </button>
            <button type="button" onClick={() => setPending(visible)} disabled={visible.length === 0} className={BUTTON.danger}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete all shown
            </button>
          </div>
        }
      >
        {/* Date scope */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div role="group" aria-label="Date range" className="inline-flex w-full rounded-lg border border-border/80 bg-background/40 p-1 sm:w-auto">
            {(
              [
                ["today", "Today"],
                ["all", "All dates"],
                ["custom", "Date range"]
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={scope === value}
                onClick={() => setScope(value)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none ${
                  scope === value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {scope === "custom" && (
            <div className="grid grid-cols-2 gap-3 sm:w-[24rem]">
              <Field label="From">
                <DatePicker label="From date" value={from} onChange={setFrom} placeholder="Start" />
              </Field>
              <Field label="To">
                <DatePicker label="To date" value={to} onChange={setTo} placeholder="End" />
              </Field>
            </div>
          )}
        </div>

        <Toolbar search={query} onSearch={setQuery} placeholder="Search order or customer">
          <div className="w-44">
            <Select<string>
              label="Status"
              value={status}
              options={[{ value: "all", label: "All statuses" }, ...ORDER_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))]}
              onChange={setStatus}
            />
          </div>
        </Toolbar>

        {/* Bulk bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/40 px-4 py-2.5 text-sm">
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox checked={allChecked ? true : someChecked ? "indeterminate" : false} onCheckedChange={toggleAll} aria-label="Select all shown orders" />
            <span className="text-muted-foreground">
              {selectedVisible.length > 0 ? `${selectedVisible.length} selected` : `${visible.length} ${visible.length === 1 ? "order" : "orders"} shown`}
            </span>
          </label>
          {selectedVisible.length > 0 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelected([])} className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">
                Clear
              </button>
              <button type="button" onClick={() => setPending(selectedOrders)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">
                Delete selected
              </button>
            </div>
          )}
        </div>

        {data.orders.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No orders yet" body="Orders appear here once customers check out." />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={scope === "today" ? "No orders today" : "No orders match"}
            body={scope === "today" ? "Orders placed today appear here. Look at another date or see every order." : "Try another date range or status."}
            action={
              <button type="button" onClick={() => setScope("all")} className={BUTTON.secondary}>
                Show all orders
              </button>
            }
          />
        ) : (
          <Table head={["Order", "Customer", "Items", "Total", "Payment", "Status", ""]}>
            {visible.map((o) => (
              <Tr key={o.id}>
                <Td>
                  <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox checked={selected.includes(o.id)} onCheckedChange={() => toggleOne(o.id)} aria-label={`Select order ${o.orderNumber}`} />
                    <span className="min-w-0">
                      <span className="block font-semibold">{o.orderNumber}</span>
                      <span className="block text-xs text-muted-foreground">{formatDisplayDate(o.createdAt)}</span>
                    </span>
                  </label>
                </Td>
                <Td label="Customer">
                  <span className="min-w-0 text-right">
                    <span className="block font-medium">{o.customer}</span>
                    <span className="block text-xs text-muted-foreground">{o.city}</span>
                  </span>
                </Td>
                <Td label="Items" className="tabular-nums">{o.items.reduce((s, i) => s + i.quantity, 0)}</Td>
                <Td label="Total" className="tabular-nums font-medium">{formatPrice(o.totalMinor, o.currency)}</Td>
                <Td label="Payment">
                  <span className="flex flex-col items-end gap-1">
                    <Pill tone={PAYMENT_TONE[o.paymentStatus]}>{o.paymentStatus}</Pill>
                    <span className="text-[11px] text-muted-foreground">{PAYMENT_METHOD_LABEL[o.paymentMethod]}</span>
                  </span>
                </Td>
                <Td label="Status">
                  <Pill tone={ORDER_TONE[o.status]}>{o.status}</Pill>
                </Td>
                <Td>
                  <RowActions
                    name={`order ${o.orderNumber}`}
                    onEdit={() => setDrawerId(o.id)}
                    onDelete={() => setPending([o])}
                  />
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>

      <Sheet open={!!drawerOrder} title={drawerOrder ? `Order ${drawerOrder.orderNumber}` : "Order"} description={drawerOrder ? `${drawerOrder.customer} · placed ${formatDisplayDate(drawerOrder.createdAt)}` : undefined} onClose={() => setDrawerId(null)} width="max-w-2xl">
        {drawerOrder && <OrderDrawer key={drawerOrder.id} order={drawerOrder} data={data} update={update} onClose={() => setDrawerId(null)} />}
      </Sheet>

      <ConfirmDialog
        open={pending !== null}
        title={pending && pending.length > 1 ? `Delete ${pending.length} orders?` : `Delete order ${pending?.[0]?.orderNumber ?? ""}?`}
        body={
          pendingSkipped > 0
            ? `${pendingDeletable.length} orders will be removed. ${pendingSkipped} shipped or delivered ${pendingSkipped === 1 ? "order is" : "orders are"} kept, since they are part of the sales record.`
            : "The orders and their shipments are removed from the dashboard. This cannot be undone."
        }
        confirmLabel={`Delete ${pendingDeletable.length} ${pendingDeletable.length === 1 ? "order" : "orders"}`}
        blockedReason={pending && pendingDeletable.length === 0 ? "Shipped and delivered orders cannot be deleted. Cancel an order to keep its record." : undefined}
        onConfirm={() => pending && deleteOrders(pendingDeletable)}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

/* ============================ Couriers ============================ */

type ShipmentFormValues = { orderId: string; courier: string; phone: string; address: string; city: string };

const shipmentFormSchema = z.object({
  orderId: z.string().min(1, "Choose an order."),
  courier: z.string().min(1, "Choose a courier."),
  phone: z.string().trim().regex(/^\+?[0-9][0-9 -]{7,15}$/, "Enter a valid phone number."),
  address: z.string().trim().min(5, "Enter the delivery address."),
  city: z.string().trim().min(2, "Enter a city.")
});

function NewShipmentForm({ data, update, onClose }: { data: DemoDataset; update: DemoUpdate; onClose: () => void }) {
  const ready = data.orders.filter((o) => o.status === "confirmed" || o.status === "processing");
  const first = ready[0];
  const form = useEntityForm<ShipmentFormValues>(
    {
      orderId: first?.id ?? "",
      courier: COURIERS[0],
      phone: first?.phone ?? "",
      address: first?.address ?? "",
      city: first?.city ?? ""
    },
    shipmentFormSchema
  );
  const { values, errors, set, patch, fail } = form;
  const order = ready.find((o) => o.id === values.orderId);
  const weightGrams = order ? order.items.reduce((sum, item) => sum + (data.products.find((p) => p.id === item.productId)?.weightGrams ?? 0) * item.quantity, 0) : 0;
  const codAmountMinor = order && order.paymentMethod === "cod" && order.paymentStatus !== "paid" ? order.totalMinor : 0;

  const submit = form.submit((v) => {
    const chosen = ready.find((o) => o.id === v.orderId);
    if (!chosen) return fail("orderId", "Choose an order that is ready to ship.");
    const today = todayIso();
    const number = data.shipments.reduce((max, s) => Math.max(max, Number(s.trackingCode.split("-")[1]) || 0), 70100) + 1;
    const trackingCode = `${v.courier.slice(0, 2).toUpperCase()}-${number}`;
    const weight = chosen.items.reduce((sum, item) => sum + (data.products.find((p) => p.id === item.productId)?.weightGrams ?? 0) * item.quantity, 0);
    const cod = chosen.paymentMethod === "cod" && chosen.paymentStatus !== "paid" ? chosen.totalMinor : 0;
    const shipment: DemoShipment = {
      id: newId("ship"),
      orderId: chosen.id,
      orderNumber: chosen.orderNumber,
      courier: v.courier,
      trackingCode,
      recipient: chosen.customer,
      phone: v.phone.trim(),
      destination: `${v.address.trim()}, ${v.city.trim()}`,
      itemsSummary: chosen.items.map((item) => `${item.quantity}× ${item.name}`).join(", "),
      weightGrams: weight,
      codAmountMinor: cod,
      status: "picked_up",
      events: [{ status: "picked_up", at: today, note: `Picked up by ${v.courier} · ${trackingCode}` }],
      createdAt: today
    };
    update((d) => ({
      ...d,
      shipments: [shipment, ...d.shipments],
      orders: d.orders.map((o) =>
        o.id === chosen.id ? { ...o, status: "shipped" as OrderStatus, events: withStatusEvent(o.events, "shipped", today, `Handed to ${v.courier} · ${trackingCode}`) } : o
      )
    }));
    onClose();
  });

  if (ready.length === 0) {
    return (
      <div className="px-6 py-10 text-sm text-muted-foreground">
        No confirmed or processing orders are waiting for dispatch. Confirm an order first, then create its shipment.
      </div>
    );
  }

  return (
    <form id="shipment-form" onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="space-y-8 px-4 py-6 sm:px-6">
        <section className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          <Field control error={errors.orderId} className="sm:col-span-2">
            <Select<string>
              label="Order"
              value={values.orderId}
              onChange={(id) => {
                const next = ready.find((o) => o.id === id);
                patch({ orderId: id, phone: next?.phone ?? "", address: next?.address ?? "", city: next?.city ?? "" });
              }}
              options={ready.map((o) => ({ value: o.id, label: `${o.orderNumber} · ${o.customer}`, description: o.city }))}
            />
          </Field>
          <Field control error={errors.courier}>
            <Select<string> label="Courier" value={values.courier} onChange={(v) => set("courier", v)} options={COURIERS.map((c) => ({ value: c, label: c }))} />
          </Field>
          <Field label="Recipient phone" error={errors.phone}>
            <input value={values.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" className={INPUT} aria-invalid={!!errors.phone} />
          </Field>
          <Field label="Delivery address" error={errors.address} className="sm:col-span-2">
            <textarea value={values.address} onChange={(e) => set("address", e.target.value)} rows={2} className={TEXTAREA} aria-invalid={!!errors.address} />
          </Field>
          <Field label="City" error={errors.city}>
            <input value={values.city} onChange={(e) => set("city", e.target.value)} className={INPUT} aria-invalid={!!errors.city} />
          </Field>
        </section>

        {order && (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Parcel contents</h3>
            <ul className="divide-y divide-border/70 rounded-xl border border-border/80">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0 truncate">{item.quantity}× {item.name}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{item.sku}</span>
                </li>
              ))}
            </ul>
            <dl className="grid grid-cols-3 gap-3 rounded-xl bg-muted/40 p-4 text-sm">
              <div><dt className="text-xs text-muted-foreground">Weight</dt><dd className="font-medium tabular-nums">{(weightGrams / 1000).toFixed(2)} kg</dd></div>
              <div><dt className="text-xs text-muted-foreground">Cash on delivery</dt><dd className="font-medium tabular-nums">{codAmountMinor ? formatPrice(codAmountMinor, order.currency) : "Prepaid"}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Payment</dt><dd className="font-medium">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</dd></div>
            </dl>
          </section>
        )}
      </div>
      <SheetFooter>
        <button type="button" onClick={onClose} className={BUTTON.secondary}>Cancel</button>
        <button type="submit" form="shipment-form" className={BUTTON.primary}>Create shipment</button>
      </SheetFooter>
    </form>
  );
}

function ShipmentDrawer({ shipment, data, update, onClose }: { shipment: DemoShipment; data: DemoDataset; update: DemoUpdate; onClose: () => void }) {
  const next = SHIPMENT_NEXT[shipment.status];
  const active = shipment.status !== "delivered" && shipment.status !== "returned";

  function move(status: ShipmentStatus) {
    const today = todayIso();
    const note = SHIPMENT_NOTE[status];
    update((d) => ({
      ...d,
      shipments: d.shipments.map((s) => (s.id === shipment.id ? { ...s, status, events: [...s.events.filter((e) => e.status !== status), { status, at: today, note }] } : s)),
      orders:
        status === "delivered"
          ? d.orders.map((o) =>
              o.id === shipment.orderId
                ? {
                    ...o,
                    status: "delivered" as OrderStatus,
                    paymentStatus: (shipment.codAmountMinor > 0 ? "paid" : o.paymentStatus) as PaymentStatus,
                    events: withStatusEvent(o.events, "delivered", today, "Delivered by courier")
                  }
                : o
            )
          : d.orders
    }));
  }

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Delivery timeline</h3>
        <div className="rounded-xl border border-border/80 bg-background/40 p-4">
          <OrderTimeline steps={shipmentSteps(shipment.status, shipment.events)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {next && (
            <button type="button" onClick={() => move(next)} className={BUTTON.primary}>
              Mark {SHIPMENT_LABEL[next].toLowerCase()}
            </button>
          )}
          {active && (
            <button type="button" onClick={() => move("returned")} className={BUTTON.danger}>
              Mark returned
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border/80 p-4 text-sm">
        <div><p className="text-xs text-muted-foreground">Courier</p><p className="font-medium">{shipment.courier}</p></div>
        <div><p className="text-xs text-muted-foreground">Tracking code</p><p className="font-mono font-medium">{shipment.trackingCode}</p></div>
        <div><p className="text-xs text-muted-foreground">Recipient</p><p className="font-medium">{shipment.recipient}</p></div>
        <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium tabular-nums">{shipment.phone}</p></div>
        <div className="col-span-2"><p className="text-xs text-muted-foreground">Destination</p><p className="font-medium">{shipment.destination}</p></div>
        <div className="col-span-2"><p className="text-xs text-muted-foreground">Contents</p><p className="font-medium">{shipment.itemsSummary}</p></div>
        <div><p className="text-xs text-muted-foreground">Weight</p><p className="font-medium tabular-nums">{(shipment.weightGrams / 1000).toFixed(2)} kg</p></div>
        <div><p className="text-xs text-muted-foreground">Cash to collect</p><p className="font-medium tabular-nums">{shipment.codAmountMinor ? formatPrice(shipment.codAmountMinor, data.settings.currency) : "Prepaid"}</p></div>
      </section>
      <button type="button" onClick={onClose} className={`${BUTTON.secondary} w-full sm:w-auto`}>Close</button>
    </div>
  );
}

export function CouriersPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [creating, setCreating] = useState(false);
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [pending, setPending] = useState<DemoShipment | null>(null);
  const ready = data.orders.filter((o) => o.status === "confirmed" || o.status === "processing").length;
  const shipment = data.shipments.find((s) => s.id === shipmentId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Ready to ship" value={String(ready)} hint="Confirmed or processing" icon={PackageCheck} />
        <StatCard label="On the road" value={String(data.shipments.filter((s) => s.status !== "delivered" && s.status !== "returned").length)} hint="Picked up or delivering" icon={Truck} />
        <StatCard label="Delivered" value={String(data.shipments.filter((s) => s.status === "delivered").length)} />
        <StatCard
          label="Cash to collect"
          value={formatPrice(data.shipments.filter((s) => s.status !== "delivered" && s.status !== "returned").reduce((sum, s) => sum + s.codAmountMinor, 0), data.settings.currency)}
          hint="Cash on delivery"
        />
      </div>

      <Panel
        title="Shipments"
        description="Hand confirmed orders to a Bangladeshi courier. Each shipment has its own delivery timeline."
        action={
          <button type="button" onClick={() => setCreating(true)} className={BUTTON.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New shipment
          </button>
        }
      >
        {data.shipments.length === 0 ? (
          <EmptyState icon={Truck} title="No shipments yet" body="Create a shipment from a confirmed order to hand it to a courier." />
        ) : (
          <Table head={["Order", "Courier", "Recipient", "Cash on delivery", "Status", ""]}>
            {data.shipments.map((s) => (
              <Tr key={s.id}>
                <Td>
                  <button type="button" onClick={() => setShipmentId(s.id)} className="text-left">
                    <span className="block font-semibold hover:text-primary">{s.orderNumber}</span>
                    <span className="block font-mono text-xs text-muted-foreground">{s.trackingCode}</span>
                  </button>
                </Td>
                <Td label="Courier">{s.courier}</Td>
                <Td label="Recipient">
                  <span className="min-w-0 text-right">
                    <span className="block font-medium">{s.recipient}</span>
                    <span className="block text-xs text-muted-foreground">{s.destination}</span>
                  </span>
                </Td>
                <Td label="Cash on delivery" className="tabular-nums">{s.codAmountMinor ? formatPrice(s.codAmountMinor, data.settings.currency) : "Prepaid"}</Td>
                <Td label="Status">
                  <Pill tone={SHIPMENT_TONE[s.status]}>{SHIPMENT_LABEL[s.status]}</Pill>
                </Td>
                <Td>
                  <RowActions name={`shipment ${s.trackingCode}`} onEdit={() => setShipmentId(s.id)} onDelete={() => setPending(s)} />
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>

      <Sheet open={creating} title="New shipment" description="Pick a confirmed order. Contents, weight and cash to collect fill in automatically." onClose={() => setCreating(false)} width="max-w-2xl">
        {creating && <NewShipmentForm data={data} update={update} onClose={() => setCreating(false)} />}
      </Sheet>

      <Sheet open={!!shipment} title={shipment ? `Shipment ${shipment.trackingCode}` : "Shipment"} description={shipment ? `${shipment.courier} · ${shipment.orderNumber}` : undefined} onClose={() => setShipmentId(null)} width="max-w-xl">
        {shipment && <ShipmentDrawer key={shipment.id} shipment={shipment} data={data} update={update} onClose={() => setShipmentId(null)} />}
      </Sheet>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete shipment ${pending?.trackingCode ?? ""}?`}
        body="The tracking record is removed. The order status does not change, so update the order if needed."
        confirmLabel="Delete shipment"
        onConfirm={() => {
          if (pending) update((d) => ({ ...d, shipments: d.shipments.filter((s) => s.id !== pending.id) }));
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

/* ============================ Coupons ============================ */

type CouponValues = {
  code: string;
  description: string;
  kind: CouponKind;
  value: string;
  minOrder: string;
  buyQty: string;
  getQty: string;
  scopeType: "all" | "category" | "product";
  scopeCategoryId: string;
  scopeProductId: string;
  usageLimit: string;
  expiresAt: string;
  active: boolean;
};

function couponToRule(v: CouponValues, data: DemoDataset, id: string, usedCount: number): CouponRule {
  const categoryName = data.categories.find((c) => c.id === v.scopeCategoryId)?.name ?? "";
  const scope: CouponRule["scope"] =
    v.scopeType === "category" ? { type: "category", categoryName } : v.scopeType === "product" ? { type: "product", productId: v.scopeProductId } : { type: "all" };
  const kind = v.kind;
  return {
    id,
    code: v.code.trim().toUpperCase(),
    description: v.description.trim(),
    kind,
    value: kind === "percent" ? Number(v.value) : kind === "fixed" ? toMinor(v.value) : kind === "buy_x_get_y" ? Number(v.value) || 100 : 0,
    minOrderMinor: kind === "buy_x_get_y" ? 0 : toMinor(v.minOrder),
    buyQty: kind === "buy_x_get_y" ? toInt(v.buyQty) : 1,
    getQty: kind === "buy_x_get_y" ? toInt(v.getQty) : 1,
    scope,
    usageLimit: v.usageLimit.trim() ? toInt(v.usageLimit) : null,
    usedCount,
    expiresAt: v.expiresAt || null,
    active: v.active
  };
}

/** A small cart of this store's products, to show what a coupon does. */
function previewCart(data: DemoDataset): CartLine[] {
  return data.products.slice(0, 3).map((p) => ({
    productId: p.id,
    name: p.name,
    categoryName: data.categories.find((c) => c.id === p.categoryId)?.name ?? "",
    unitMinor: p.priceMinor,
    quantity: 2
  }));
}

function CouponDrawer({ existing, data, onSave, onCancel }: { existing?: DemoCoupon; data: DemoDataset; onSave: (coupon: DemoCoupon) => void; onCancel: () => void }) {
  const scope = existing?.scope;
  const form = useEntityForm<CouponValues>(
    {
      code: existing?.code ?? "",
      description: existing?.description ?? "",
      kind: existing?.kind ?? "percent",
      value: existing ? (existing.kind === "fixed" ? fromMinor(existing.value) : String(existing.value)) : "",
      minOrder: existing ? fromMinor(existing.minOrderMinor) : "",
      buyQty: existing ? String(existing.buyQty) : "2",
      getQty: existing ? String(existing.getQty) : "1",
      scopeType: scope?.type ?? "all",
      scopeCategoryId: scope?.type === "category" ? (data.categories.find((c) => c.name === scope.categoryName)?.id ?? "") : (data.categories[0]?.id ?? ""),
      scopeProductId: scope?.type === "product" ? scope.productId : (data.products[0]?.id ?? ""),
      usageLimit: existing?.usageLimit ? String(existing.usageLimit) : "",
      expiresAt: existing?.expiresAt ?? "",
      active: existing?.active ?? true
    },
    couponSchema
  );
  const { values, errors, set, fail } = form;
  const kind = values.kind;
  const usesValue = kind === "percent" || kind === "fixed" || kind === "buy_x_get_y";
  const usesMinimum = kind === "percent" || kind === "fixed" || kind === "free_shipping";

  // The preview is built from the same rule the checkout will use.
  const today = todayIso();
  const previewRule = couponToRule(values, data, existing?.id ?? "preview", existing?.usedCount ?? 0);
  const previewResult = previewRule.code && (usesValue ? values.value.trim() !== "" : true)
    ? evaluateCoupon(previewRule, previewCart(data), data.zones[0]?.flatRateMinor ?? 0, today || "0000-00-00", data.settings.currency)
    : null;

  const submit = form.submit((v) => {
    const code = v.code.trim().toUpperCase();
    if (data.coupons.some((c) => c.code === code && c.id !== existing?.id)) return fail("code", "That code already exists.");
    onSave(couponToRule(v, data, existing?.id ?? newId("cp"), existing?.usedCount ?? 0));
  });

  return (
    <form id="coupon-form" onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="space-y-8 px-4 py-6 sm:px-6">
        <section className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          <Field label="Code" error={errors.code} hint="Shoppers type this">
            <input value={values.code} onChange={(e) => set("code", e.target.value.toUpperCase())} className={`${INPUT} font-mono uppercase`} aria-invalid={!!errors.code} />
          </Field>
          <Field control>
            <Select<CouponKind>
              label="Offer type"
              value={kind}
              onChange={(v) => {
                set("kind", v);
                // Buy X, get Y defaults to free items, so the preview works straight away.
                if (v === "buy_x_get_y" && !values.value.trim()) set("value", "100");
              }}
              options={COUPON_KIND_OPTIONS.map((o) => ({ value: o.value, label: o.label, description: o.description }))}
            />
          </Field>
          <Field label="Description" error={errors.description} className="sm:col-span-2">
            <input value={values.description} onChange={(e) => set("description", e.target.value)} placeholder="Shown to customers at checkout" className={INPUT} />
          </Field>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold">Offer</h3>
          <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {kind === "percent" && (
              <Field label="Percent off" error={errors.value}>
                <input inputMode="decimal" value={values.value} onChange={(e) => set("value", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.value} />
              </Field>
            )}
            {kind === "fixed" && (
              <Field label={`Amount off (${data.settings.currency})`} error={errors.value}>
                <input inputMode="decimal" value={values.value} onChange={(e) => set("value", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.value} />
              </Field>
            )}
            {kind === "buy_x_get_y" && (
              <>
                <Field label="Buy" error={errors.buyQty} hint="Items">
                  <input inputMode="numeric" value={values.buyQty} onChange={(e) => set("buyQty", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.buyQty} />
                </Field>
                <Field label="Get" error={errors.getQty} hint="Items discounted">
                  <input inputMode="numeric" value={values.getQty} onChange={(e) => set("getQty", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.getQty} />
                </Field>
                <Field label="Discount on the free items" error={errors.value} hint="100 = free" className="sm:col-span-2">
                  <input inputMode="decimal" value={values.value} onChange={(e) => set("value", e.target.value)} placeholder="100" className={`${INPUT} tabular-nums`} aria-invalid={!!errors.value} />
                </Field>
              </>
            )}
            {usesMinimum && (
              <Field label={`Minimum spend (${data.settings.currency})`} error={errors.minOrder} hint="0 for none">
                <input inputMode="decimal" value={values.minOrder} onChange={(e) => set("minOrder", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.minOrder} />
              </Field>
            )}
          </div>
        </section>

        {kind !== "free_shipping" && (
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Applies to</h3>
            <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
              <Field control>
                <Select<"all" | "category" | "product">
                  label="Items"
                  value={values.scopeType}
                  onChange={(v) => set("scopeType", v)}
                  options={[
                    { value: "all", label: "Every item in the cart" },
                    { value: "category", label: "Items in a category" },
                    { value: "product", label: "One product" }
                  ]}
                />
              </Field>
              {values.scopeType === "category" && (
                <Field control error={errors.scopeCategoryId}>
                  <Select<string> label="Category" value={values.scopeCategoryId} onChange={(v) => set("scopeCategoryId", v)} options={data.categories.map((c) => ({ value: c.id, label: c.name }))} />
                </Field>
              )}
              {values.scopeType === "product" && (
                <Field control error={errors.scopeProductId}>
                  <Select<string> label="Product" value={values.scopeProductId} onChange={(v) => set("scopeProductId", v)} options={data.products.map((p) => ({ value: p.id, label: p.name }))} />
                </Field>
              )}
            </div>
          </section>
        )}

        <section className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
          <Field label="Usage limit" error={errors.usageLimit} hint="Blank for unlimited">
            <input inputMode="numeric" value={values.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.usageLimit} />
          </Field>
          <Field control error={errors.expiresAt}>
            <DatePicker label="Expires on" value={values.expiresAt} onChange={(v) => set("expiresAt", v)} invalid={!!errors.expiresAt} placeholder="No expiry" />
          </Field>
          <div className="sm:col-span-2">
            <Toggle checked={values.active} onChange={(v) => set("active", v)} label="Active" description="Turn off to pause this code without deleting it." />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Preview</h3>
          <div className="rounded-xl border border-border/80 bg-background/40 p-4 text-sm">
            <p className="font-medium">{previewRule.code || "CODE"}: {describeCoupon(previewRule, data.settings.currency)}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example cart: 2 each of three products</p>
            {previewResult ? (
              previewResult.valid ? (
                <p className="mt-1 text-emerald-600 dark:text-emerald-400">
                  Applies: {previewResult.summary}. Discount <span className="font-semibold tabular-nums">{formatPrice(previewResult.discountMinor, data.settings.currency)}</span>
                </p>
              ) : (
                <p className="mt-1 text-amber-600 dark:text-amber-400">{previewResult.reason}</p>
              )
            ) : (
              <p className="mt-1 text-muted-foreground">Fill in the offer to see how it applies to a cart.</p>
            )}
          </div>
        </section>
      </div>
      <SheetFooter>
        <button type="button" onClick={onCancel} className={BUTTON.secondary}>Cancel</button>
        <button type="submit" form="coupon-form" className={BUTTON.primary}>{existing ? "Save coupon" : "Create coupon"}</button>
      </SheetFooter>
    </form>
  );
}

export function CouponsPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [sheet, setSheet] = useState<{ mode: "new" } | { mode: "edit"; id: string } | null>(null);
  const [pending, setPending] = useState<DemoCoupon | null>(null);
  const editing = sheet?.mode === "edit" ? data.coupons.find((c) => c.id === sheet.id) : undefined;
  const redeemed = data.coupons.reduce((s, c) => s + c.usedCount, 0);

  function save(coupon: DemoCoupon) {
    update((d) => ({
      ...d,
      coupons: d.coupons.some((c) => c.id === coupon.id) ? d.coupons.map((c) => (c.id === coupon.id ? coupon : c)) : [coupon, ...d.coupons]
    }));
    setSheet(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        <StatCard label="Offers" value={String(data.coupons.length)} hint={`${data.coupons.filter((c) => c.active).length} active`} icon={Ticket} />
        <StatCard label="Redemptions" value={String(redeemed)} hint="All time" />
        <StatCard label="Buy X, get Y" value={String(data.coupons.filter((c) => c.kind === "buy_x_get_y").length)} hint="Multi-item deals" />
      </div>

      <Panel
        title="Coupons and offers"
        description="Percentage and fixed discounts, free shipping, and buy X get Y deals on products or categories."
        action={
          <button type="button" onClick={() => setSheet({ mode: "new" })} className={BUTTON.primary}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New offer
          </button>
        }
      >
        {data.coupons.length === 0 ? (
          <EmptyState icon={Ticket} title="No offers yet" body="Create a coupon or a buy X, get Y deal to run a promotion." />
        ) : (
          <Table head={["Code", "Offer", "Type", "Used", "Status", ""]}>
            {data.coupons.map((c) => (
              <Tr key={c.id}>
                <Td>
                  <p className="font-mono font-semibold">{c.code}</p>
                  <p className="text-xs text-muted-foreground">{c.description || "No description"}</p>
                </Td>
                <Td label="Offer" className="text-right text-sm">{describeCoupon(c, data.settings.currency)}</Td>
                <Td label="Type">
                  <Pill tone="info">{COUPON_KIND_OPTIONS.find((o) => o.value === c.kind)?.label ?? c.kind}</Pill>
                </Td>
                <Td label="Used" className="tabular-nums">
                  {c.usedCount}
                  {c.usageLimit ? <span className="text-muted-foreground"> / {c.usageLimit}</span> : null}
                </Td>
                <Td label="Status">
                  <button
                    type="button"
                    onClick={() => update((d) => ({ ...d, coupons: d.coupons.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)) }))}
                    aria-label={`${c.active ? "Deactivate" : "Activate"} ${c.code}`}
                    className="transition-opacity hover:opacity-80"
                  >
                    <Pill tone={c.active ? "good" : "neutral"}>{c.active ? "Active" : "Inactive"}</Pill>
                  </button>
                </Td>
                <Td>
                  <RowActions name={`coupon ${c.code}`} onEdit={() => setSheet({ mode: "edit", id: c.id })} onDelete={() => setPending(c)} />
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>

      <Sheet open={sheet !== null && (sheet.mode === "new" || !!editing)} title={editing ? `Edit ${editing.code}` : "New offer"} description="Pick the offer type first. The fields below change to match." onClose={() => setSheet(null)} width="max-w-2xl">
        {sheet !== null && <CouponDrawer key={sheet.mode === "edit" ? sheet.id : "new"} existing={editing} data={data} onSave={save} onCancel={() => setSheet(null)} />}
      </Sheet>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete ${pending?.code ?? "coupon"}?`}
        body="Customers can no longer use this code. Orders that used it keep the discount."
        confirmLabel="Delete coupon"
        onConfirm={() => {
          if (pending) update((d) => ({ ...d, coupons: d.coupons.filter((c) => c.id !== pending.id) }));
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

export function SalesPanel({ feature, data, update }: { feature: "orders" | "couriers" | "coupons"; data: DemoDataset; update: DemoUpdate }) {
  if (feature === "orders") return <OrdersPanel data={data} update={update} />;
  if (feature === "couriers") return <CouriersPanel data={data} update={update} />;
  return <CouponsPanel data={data} update={update} />;
}
