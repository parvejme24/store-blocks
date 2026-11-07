"use client";

import { useState } from "react";
import { AlertTriangle, Bell, Mail, Plus, Save, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { fromMinor, newId, settingsSchema, toMinor, useEntityForm, zoneSchema } from "../demo/schemas";
import type { DemoDataset, DemoSettings, DemoUpdate, DemoZone, MediaImage } from "../demo/dataset";
import { BUTTON, ConfirmDialog, EmptyState, Field, INPUT, Panel, RowActions, Sheet, SheetFooter, Table, Td, TEXTAREA, Tr } from "../ui/primitives";
import { ImageUploader } from "../ui/media";

/* ============================ Shipping ============================ */

function ZoneForm({ existing, currency, onSave, onCancel }: { existing?: DemoZone; currency: string; onSave: (zone: DemoZone) => void; onCancel: () => void }) {
  const form = useEntityForm(
    {
      name: existing?.name ?? "",
      flatRate: existing ? fromMinor(existing.flatRateMinor) : "",
      freeOver: existing ? fromMinor(existing.freeOverMinor) : ""
    },
    zoneSchema
  );
  const { values, errors, set } = form;
  const submit = form.submit((v) =>
    onSave({
      id: existing?.id ?? newId("zone"),
      name: v.name.trim(),
      flatRateMinor: toMinor(v.flatRate),
      freeOverMinor: toMinor(v.freeOver),
      currency: existing?.currency ?? currency
    })
  );

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col">
      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
        <Field label="Zone name" error={errors.name} className="sm:col-span-2">
          <input value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="Inside city" className={INPUT} aria-invalid={!!errors.name} />
        </Field>
        <Field label={`Flat rate (${currency})`} error={errors.flatRate} hint="Charged below the threshold">
          <input inputMode="decimal" value={values.flatRate} onChange={(e) => set("flatRate", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.flatRate} />
        </Field>
        <Field label={`Free shipping over (${currency})`} error={errors.freeOver} hint="0 to disable">
          <input inputMode="decimal" value={values.freeOver} onChange={(e) => set("freeOver", e.target.value)} className={`${INPUT} tabular-nums`} aria-invalid={!!errors.freeOver} />
        </Field>
      </div>
      <SheetFooter>
        <button type="button" onClick={onCancel} className={BUTTON.secondary}>Cancel</button>
        <button type="submit" className={BUTTON.primary}>{existing ? "Save zone" : "Create zone"}</button>
      </SheetFooter>
    </form>
  );
}

function ShippingPanel({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [sheet, setSheet] = useState<{ mode: "new" } | { mode: "edit"; id: string } | null>(null);
  const [pending, setPending] = useState<DemoZone | null>(null);
  const editing = sheet?.mode === "edit" ? data.zones.find((z) => z.id === sheet.id) : undefined;

  function save(zone: DemoZone) {
    update((d) => ({ ...d, zones: d.zones.some((z) => z.id === zone.id) ? d.zones.map((z) => (z.id === zone.id ? zone : z)) : [...d.zones, zone] }));
    setSheet(null);
  }

  return (
    <Panel
      title="Delivery zones"
      description="Checkout picks a zone from this list and charges its rate. Free shipping applies above the threshold."
      action={
        <button type="button" onClick={() => setSheet({ mode: "new" })} className={BUTTON.primary}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New zone
        </button>
      }
    >
      {data.zones.length === 0 ? (
        <EmptyState icon={Truck} title="No delivery zones yet" body="Add zones such as Inside city and Outside city so checkout can calculate shipping." />
      ) : (
        <Table head={["Zone", "Flat rate", "Free over", ""]}>
          {data.zones.map((z) => (
            <Tr key={z.id}>
              <Td className="font-medium">{z.name}</Td>
              <Td className="tabular-nums">{formatPrice(z.flatRateMinor, z.currency)}</Td>
              <Td className="tabular-nums">{z.freeOverMinor > 0 ? formatPrice(z.freeOverMinor, z.currency) : "Never"}</Td>
              <Td className="w-20">
                <RowActions name={z.name} onEdit={() => setSheet({ mode: "edit", id: z.id })} onDelete={() => setPending(z)} />
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Sheet open={sheet !== null && (sheet.mode === "new" || !!editing)} title={editing ? `Edit ${editing.name}` : "New delivery zone"} onClose={() => setSheet(null)} width="max-w-lg">
        {sheet !== null && <ZoneForm key={sheet.mode === "edit" ? sheet.id : "new"} existing={editing} currency={data.settings.currency} onSave={save} onCancel={() => setSheet(null)} />}
      </Sheet>

      <ConfirmDialog
        open={pending !== null}
        title={`Delete ${pending?.name ?? "zone"}?`}
        body="Customers can no longer choose this zone at checkout."
        confirmLabel="Delete zone"
        blockedReason={data.zones.length <= 1 ? "Keep at least one delivery zone so checkout can calculate shipping." : undefined}
        onConfirm={() => {
          if (pending) update((d) => ({ ...d, zones: d.zones.filter((z) => z.id !== pending.id) }));
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </Panel>
  );
}

/* ============================ Notifications ============================ */

function NotificationsPanel() {
  const [sent, setSent] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Customer emails" description="Order confirmations and shipping updates.">
        <ul className="space-y-3 text-sm">
          {["Order confirmation", "Shipment dispatched", "Delivered", "Password reset"].map((name) => (
            <li key={name} className="flex items-center justify-between gap-3 rounded-xl border border-border/80 p-3">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" aria-hidden="true" />{name}</span>
              <span className="text-xs text-muted-foreground">Enabled</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Test your email" description="Checks the SMTP connection from the API.">
        <p className="text-sm text-muted-foreground">
          This dashboard runs on demo data, so nothing is sent. Connect SMTP in the API environment file to send real email.
        </p>
        <button type="button" onClick={() => setSent(true)} className={BUTTON.primary}>
          <Bell className="h-4 w-4" aria-hidden="true" />
          Send test email
        </button>
        {sent && (
          <p role="status" className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Demo mode: connect SMTP to send a real email.
          </p>
        )}
      </Panel>
    </div>
  );
}

/* ============================ Settings ============================ */

type SettingsValues = Omit<DemoSettings, "currency" | "logo">;

function SettingsForm({ data, update }: { data: DemoDataset; update: DemoUpdate }) {
  const [logo, setLogo] = useState<MediaImage | null>(data.settings.logo);
  const [saved, setSaved] = useState(false);
  const { settings } = data;
  const form = useEntityForm<SettingsValues>(
    {
      storeName: settings.storeName,
      legalName: settings.legalName,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      city: settings.city,
      taxNumber: settings.taxNumber,
      defaultMetaTitle: settings.defaultMetaTitle,
      defaultMetaDescription: settings.defaultMetaDescription,
      facebook: settings.facebook,
      instagram: settings.instagram
    },
    settingsSchema
  );
  const { values, errors, set } = form;

  const submit = form.submit((v) => {
    update((d) => ({
      ...d,
      storeName: v.storeName.trim(),
      settings: { ...d.settings, ...v, storeName: v.storeName.trim(), logo }
    }));
    setSaved(true);
  });

  return (
    <form
      onSubmit={(e) => {
        setSaved(false);
        submit(e);
      }}
      noValidate
      className="space-y-6"
    >
      <Panel title="Business details" description="Appears on receipts, invoices and the storefront footer.">
        <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
          <ImageUploader label="Store logo" value={logo} onChange={(image) => { setLogo(image); setSaved(false); }} aspect="aspect-square" hint="Square, 512 px" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Store name" error={errors.storeName}>
              <input value={values.storeName} onChange={(e) => set("storeName", e.target.value)} className={INPUT} aria-invalid={!!errors.storeName} />
            </Field>
            <Field label="Legal name" error={errors.legalName}>
              <input value={values.legalName} onChange={(e) => set("legalName", e.target.value)} className={INPUT} aria-invalid={!!errors.legalName} />
            </Field>
            <Field label="Contact email" error={errors.email}>
              <input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} className={INPUT} aria-invalid={!!errors.email} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input inputMode="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className={INPUT} aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Business address" error={errors.address} className="sm:col-span-2">
              <input value={values.address} onChange={(e) => set("address", e.target.value)} className={INPUT} aria-invalid={!!errors.address} />
            </Field>
            <Field label="City" error={errors.city}>
              <input value={values.city} onChange={(e) => set("city", e.target.value)} className={INPUT} aria-invalid={!!errors.city} />
            </Field>
            <Field label="Tax / VAT number" error={errors.taxNumber}>
              <input value={values.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} className={`${INPUT} font-mono`} aria-invalid={!!errors.taxNumber} />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Default search listing" description="Used on pages that do not have their own SEO fields.">
        <Field label="Default meta title" error={errors.defaultMetaTitle} hint={`${values.defaultMetaTitle.length}/70`}>
          <input value={values.defaultMetaTitle} onChange={(e) => set("defaultMetaTitle", e.target.value)} className={INPUT} aria-invalid={!!errors.defaultMetaTitle} />
        </Field>
        <Field label="Default meta description" error={errors.defaultMetaDescription} hint={`${values.defaultMetaDescription.length}/160`}>
          <textarea value={values.defaultMetaDescription} onChange={(e) => set("defaultMetaDescription", e.target.value)} rows={3} className={TEXTAREA} aria-invalid={!!errors.defaultMetaDescription} />
        </Field>
      </Panel>

      <Panel title="Social profiles" description="Linked in the storefront footer.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook" error={errors.facebook}>
            <input value={values.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="https://facebook.com/…" className={INPUT} aria-invalid={!!errors.facebook} />
          </Field>
          <Field label="Instagram" error={errors.instagram}>
            <input value={values.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="https://instagram.com/…" className={INPUT} aria-invalid={!!errors.instagram} />
          </Field>
        </div>
      </Panel>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-border/80 bg-card/90 p-4 shadow-lg backdrop-blur">
        {saved && <p role="status" className="mr-auto text-sm text-emerald-600 dark:text-emerald-400">Saved in this demo session.</p>}
        <button type="submit" className={BUTTON.primary}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save settings
        </button>
      </div>
    </form>
  );
}

export function OperationsPanel({ feature, data, update }: { feature: "shipping" | "notifications" | "settings"; data: DemoDataset; update: DemoUpdate }) {
  if (feature === "shipping") return <ShippingPanel data={data} update={update} />;
  if (feature === "notifications") return <NotificationsPanel />;
  return <SettingsForm data={data} update={update} />;
}

