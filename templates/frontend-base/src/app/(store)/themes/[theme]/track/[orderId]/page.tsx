import { notFound } from "next/navigation";
import { StoreFrame } from "@/components/store/StoreFrame";
import { OrderTimeline } from "@/components/store/OrderTimeline";
import { buildDemoDataset } from "@/admin/demo/dataset";
import { formatDisplayDate } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { orderTimelineSteps } from "@/lib/order-timeline";
import { STORE_TEMPLATES } from "@/templates/registry";

export function generateStaticParams() {
  return STORE_TEMPLATES.flatMap((template) =>
    buildDemoDataset(template).orders.map((order) => ({ theme: template.id, orderId: order.id }))
  );
}

/**
 * Order tracking for shoppers: status timeline, items and courier tracking code.
 * Shows only what the customer needs. Internal notes and other customers' details stay in the admin.
 */
export default async function ThemeTrackPage({ params }: { params: Promise<{ theme: string; orderId: string }> }) {
  const { theme: themeId, orderId } = await params;
  const template = STORE_TEMPLATES.find((t) => t.id === themeId);
  if (!template) notFound();

  const data = buildDemoDataset(template);
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) notFound();
  const shipment = data.shipments.find((s) => s.orderId === order.id);

  return (
    <StoreFrame template={template} basePath={`/themes/${template.id}`}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="space-y-2">
          <p className="text-sm font-medium text-primary">Order tracking</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {formatDisplayDate(order.createdAt)} · {order.items.reduce((s, i) => s + i.quantity, 0)} items ·{" "}
            <span className="font-semibold tabular-nums text-foreground">{formatPrice(order.totalMinor, order.currency)}</span>
          </p>
        </header>

        <section aria-labelledby="status" className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 id="status" className="mb-6 font-semibold">Status</h2>
          <OrderTimeline steps={orderTimelineSteps(order.status, order.events)} />
          {shipment && (
            <div className="mt-8 rounded-2xl border border-border/80 bg-background/40 p-4 text-sm">
              <p className="text-muted-foreground">
                Courier: <span className="font-medium text-foreground">{shipment.courier}</span>
              </p>
              <p className="mt-1 text-muted-foreground">
                Tracking code: <span className="font-mono font-medium text-foreground">{shipment.trackingCode}</span>
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="items" className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 id="items" className="mb-4 font-semibold">Items</h2>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4 py-3 text-sm">
                <span className="min-w-0">
                  {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(item.unitMinor * item.quantity, order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery to</dt><dd className="max-w-[60%] text-right">{order.address}, {order.city}</dd></div>
            <div className="flex justify-between font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(order.totalMinor, order.currency)}</dd></div>
          </dl>
        </section>
      </div>
    </StoreFrame>
  );
}
