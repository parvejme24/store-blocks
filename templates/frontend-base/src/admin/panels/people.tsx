"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Mail, MapPin, Phone, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { ROLE_OPTIONS, customerSchema, newId, useEntityForm, PAYMENT_METHOD_LABEL } from "../demo/schemas";
import { OrderTimeline } from "@/components/store/OrderTimeline";
import { orderTimelineSteps } from "@/lib/order-timeline";
import { formatDisplayDate } from "@/lib/dates";
import { ORDER_TONE, PAYMENT_TONE } from "./sales";
import type { DemoCustomer, DemoDataset, DemoUpdate, UserRole } from "../demo/dataset";
import { BUTTON, ConfirmDialog, EmptyRow, EmptyState, Field, INPUT, Panel, Pill, RowActions, Sheet, SheetFooter, StatCard, Table, Td, TEXTAREA, Toolbar, Tr, Toggle, type Tone } from "../ui/primitives";
import { formatPrice } from "@/lib/format";


const ROLE_TONE: Record<UserRole, Tone> = { customer: "neutral", manager: "info", staff: "warn" };

type UserValues = { name: string; email: string; phone: string; city: string; address: string; role: UserRole; active: boolean };

function UserForm({
  existing,
  data,
  onSave,
  onCancel
}: {
  existing?: DemoCustomer;
  data: DemoDataset;
  onSave: (user: DemoCustomer) => void;
  onCancel: () => void;
}) {
  const form = useEntityForm<UserValues>(
    {
      name: existing?.name ?? "",
      email: existing?.email ?? "",
      phone: existing?.phone ?? "",
      city: existing?.city ?? "",
      address: existing?.address ?? "",
      role: existing?.role ?? "customer",
      active: existing?.active ?? true
    },
    customerSchema
  );
  const { values, errors, set, fail } = form;
  const submit = form.submit((v) => {
    const email = v.email.trim().toLowerCase();
    if (data.customers.some((c) => c.email === email && c.id !== existing?.id)) return fail("email", "Another user already has this email.");
    onSave({
      id: existing?.id ?? newId("user"),
      name: v.name.trim(),
      email,
      phone: v.phone.trim(),
      city: v.city.trim(),
      address: v.address.trim(),
      role: v.role,
      active: v.active,
      currency: existing?.currency ?? data.settings.currency,
      joined: existing?.joined ?? new Date().toISOString().slice(0, 10)
    });
  });

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="space-y-6 px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name} className="sm:col-span-2">
            <input value={values.name} onChange={(e) => set("name", e.target.value)} className={INPUT} aria-invalid={!!errors.name} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} className={INPUT} aria-invalid={!!errors.email} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input inputMode="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={INPUT} aria-invalid={!!errors.phone} />
          </Field>
          <Field label="City" error={errors.city}>
            <input value={values.city} onChange={(e) => set("city", e.target.value)} className={INPUT} aria-invalid={!!errors.city} />
          </Field>
          <Field label="Delivery address" error={errors.address} className="sm:col-span-2">
            <textarea value={values.address} onChange={(e) => set("address", e.target.value)} rows={2} className={TEXTAREA} aria-invalid={!!errors.address} />
          </Field>
          <Field control>
            <Select<UserRole>
              label="Role"
              value={values.role}
              options={ROLE_OPTIONS.map((r) => ({ value: r.value as UserRole, label: r.label, description: r.description }))}
              onChange={(v) => set("role", v)}
            />
          </Field>
        </div>
        <Toggle
          checked={values.active}
          onChange={(v) => set("active", v)}
          label="Account active"
          description="Suspended users cannot sign in or place orders."
        />
      </div>
      <SheetFooter>
        <button type="button" onClick={onCancel} className={BUTTON.secondary}>Cancel</button>
        <button type="submit" className={BUTTON.primary}>{existing ? "Save user" : "Create user"}</button>
      </SheetFooter>
    </form>
  );
}

export function PeoplePanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [sheet, setSheet] = useState<{ mode: "new" } | { mode: "edit"; id: string } | null>(null);
  const [pending, setPending] = useState<DemoCustomer | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = data.customers.find((c) => c.id === detailId);

  // Order figures are computed from the orders, so they stay right after edits.
  const stats = (id: string) => {
    const mine = data.orders.filter((o) => o.customerId === id);
    return { count: mine.length, spent: mine.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totalMinor, 0) };
  };
  const visible = data.customers.filter(
    (c) =>
      (role === "all" || c.role === role) &&
      (c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()))
  );
  const editing = sheet?.mode === "edit" ? data.customers.find((c) => c.id === sheet.id) : undefined;
  const active = data.customers.filter((c) => c.active).length;

  function save(user: DemoCustomer) {
    update((d) => ({
      ...d,
      customers: d.customers.some((c) => c.id === user.id) ? d.customers.map((c) => (c.id === user.id ? user : c)) : [user, ...d.customers],
      // Keep order records in step with the customer's name and contact details.
      orders: d.orders.map((o) => (o.customerId === user.id ? { ...o, customer: user.name, email: user.email, phone: user.phone, city: user.city } : o))
    }));
    setSheet(null);
  }

  const blocked = pending && stats(pending.id).count > 0 ? "This user has orders. Suspend the account instead, so order history stays intact." : undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
        <StatCard label="Users" value={String(data.customers.length)} icon={Users} />
        <StatCard label="Active" value={String(active)} hint={`${data.customers.length - active} suspended`} />
        <StatCard label="Team" value={String(data.customers.filter((c) => c.role !== "customer").length)} hint="Managers and staff" icon={ShieldCheck} />
        <StatCard label="Repeat buyers" value={String(data.customers.filter((c) => stats(c.id).count > 1).length)} hint="Two or more orders" />
      </div>

      <Panel
        title="Users"
        description="Customers, managers and staff. Roles decide what each person can open in this dashboard."
        action={
          <button type="button" onClick={() => setSheet({ mode: "new" })} className={BUTTON.primary}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            New user
          </button>
        }
      >
        <Toolbar search={query} onSearch={setQuery} placeholder="Search name or email">
          <div className="w-44">
            <Select<string>
              label="Role filter"
              value={role}
              options={[{ value: "all", label: "All roles" }, ...ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))]}
              onChange={setRole}
            />
          </div>
        </Toolbar>

        {data.customers.length === 0 ? (
          <EmptyState icon={Users} title="No users yet" body="Users appear here after they create an account or place an order." />
        ) : (
          <Table head={["User", "Location", "Orders", "Spent", "Role", "Status", ""]}>
            {visible.length === 0 && <EmptyRow colSpan={7}>No users match these filters.</EmptyRow>}
            {visible.map((c) => {
              const s = stats(c.id);
              return (
                <Tr key={c.id}>
                  <Td>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </Td>
                  <Td>
                    <p className="text-sm">{c.city}</p>
                    <p className="text-xs text-muted-foreground">{c.phone}</p>
                  </Td>
                  <Td className="tabular-nums">{s.count}</Td>
                  <Td className="tabular-nums">{formatPrice(s.spent, c.currency)}</Td>
                  <Td>
                    <Pill tone={ROLE_TONE[c.role]}>{c.role}</Pill>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => update((d) => ({ ...d, customers: d.customers.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)) }))}
                      aria-label={`${c.active ? "Suspend" : "Reactivate"} ${c.name}`}
                      className="transition-opacity hover:opacity-80"
                    >
                      <Pill tone={c.active ? "good" : "bad"}>{c.active ? "Active" : "Suspended"}</Pill>
                    </button>
                  </Td>
                  <Td className="w-20">
                    <RowActions name={c.name} onView={() => setDetailId(c.id)} onEdit={() => setSheet({ mode: "edit", id: c.id })} onDelete={() => setPending(c)} />
                  </Td>
                </Tr>
              );
            })}
          </Table>
        )}
      </Panel>

      <Sheet open={sheet !== null && (sheet.mode === "new" || !!editing)} title={editing ? `Edit ${editing.name}` : "New user"} onClose={() => setSheet(null)} width="max-w-xl">
        {sheet !== null && <UserForm key={sheet.mode === "edit" ? sheet.id : "new"} existing={editing} data={data} onSave={save} onCancel={() => setSheet(null)} />}
      </Sheet>

      <Sheet open={!!detail} title={detail ? detail.name : "Customer"} description={detail ? `Customer since ${formatDisplayDate(detail.joined)}` : undefined} onClose={() => setDetailId(null)} width="max-w-2xl">
        {detail && <CustomerDetail customer={detail} data={data} onEdit={() => { setDetailId(null); setSheet({ mode: "edit", id: detail.id }); }} />}
      </Sheet>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete ${pending?.name ?? "user"}?`}
        body="The account is removed. Users with order history cannot be deleted."
        confirmLabel="Delete user"
        blockedReason={blocked}
        onConfirm={() => {
          if (pending) update((d) => ({ ...d, customers: d.customers.filter((c) => c.id !== pending.id) }));
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

/* ============================ Customer detail ============================ */

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Everything the store owner needs about one customer: contact details, every
 * delivery address they have used, lifetime figures, and each order with its timeline.
 */
export function CustomerDetail({ customer, data, onEdit }: { customer: DemoCustomer; data: DemoDataset; onEdit: () => void }) {
  const orders = data.orders.filter((o) => o.customerId === customer.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  const paid = orders.filter((o) => o.status !== "cancelled");
  const spent = paid.reduce((sum, o) => sum + o.totalMinor, 0);
  const addresses = Array.from(
    new Map(
      [{ address: customer.address, city: customer.city, isDefault: true }, ...orders.map((o) => ({ address: o.address, city: o.city, isDefault: false }))].map((a) => [
        `${a.address}|${a.city}`,
        a
      ])
    ).values()
  ).map((a) => ({ ...a, used: orders.filter((o) => o.address === a.address && o.city === a.city).length }));

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6">
      <header className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25">
          {initials(customer.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{customer.name}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Pill tone={ROLE_TONE[customer.role]}>{customer.role}</Pill>
            <Pill tone={customer.active ? "good" : "bad"}>{customer.active ? "Active" : "Suspended"}</Pill>
          </div>
        </div>
        <button type="button" onClick={onEdit} className={BUTTON.secondary}>Edit</button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Contact">
        <a href={`mailto:${customer.email}`} className="flex items-center gap-3 rounded-xl border border-border/80 p-4 text-sm transition-colors hover:bg-accent/40">
          <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 truncate">{customer.email}</span>
        </a>
        <a href={`tel:${customer.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-xl border border-border/80 p-4 text-sm transition-colors hover:bg-accent/40">
          <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="tabular-nums">{customer.phone}</span>
        </a>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Lifetime figures">
        <StatCard label="Orders" value={String(orders.length)} />
        <StatCard label="Lifetime spend" value={formatPrice(spent, customer.currency)} hint="Excludes cancelled" />
        <StatCard label="Average order" value={formatPrice(paid.length ? Math.round(spent / paid.length) : 0, customer.currency)} />
        <StatCard label="Last order" value={orders[0] ? formatDisplayDate(orders[0].createdAt) : "None"} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Shipping details</h3>
        <ul className="space-y-2">
          {addresses.map((a) => (
            <li key={`${a.address}|${a.city}`} className="flex items-start gap-3 rounded-xl border border-border/80 p-4 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.address}</p>
                <p className="text-xs text-muted-foreground">
                  {a.city}
                  {a.used > 0 ? ` · used on ${a.used} ${a.used === 1 ? "order" : "orders"}` : ""}
                </p>
              </div>
              {a.isDefault && <Pill tone="info">Default</Pill>}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Orders</h3>
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((o) => (
              <li key={o.id}>
                <details className="group rounded-xl border border-border/80 open:bg-background/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm marker:hidden">
                    <span className="min-w-0">
                      <span className="block font-semibold">{o.orderNumber}</span>
                      <span className="block text-xs text-muted-foreground">{formatDisplayDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.quantity, 0)} items · {PAYMENT_METHOD_LABEL[o.paymentMethod]}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="tabular-nums font-medium">{formatPrice(o.totalMinor, o.currency)}</span>
                      <Pill tone={ORDER_TONE[o.status]}>{o.status}</Pill>
                      <Pill tone={PAYMENT_TONE[o.paymentStatus]}>{o.paymentStatus}</Pill>
                    </span>
                  </summary>
                  <div className="space-y-4 border-t border-border/70 p-4">
                    <ul className="space-y-1 text-sm">
                      {o.items.map((item) => (
                        <li key={item.productId} className="flex justify-between gap-3">
                          <span className="min-w-0 truncate text-muted-foreground">{item.quantity}× {item.name}</span>
                          <span className="shrink-0 tabular-nums">{formatPrice(item.unitMinor * item.quantity, o.currency)}</span>
                        </li>
                      ))}
                    </ul>
                    <OrderTimeline steps={orderTimelineSteps(o.status, o.events)} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

