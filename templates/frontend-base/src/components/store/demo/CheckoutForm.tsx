"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, Tag } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { DemoCoupon, DemoZone } from "@/admin/demo/dataset";
import { evaluateCoupon, type CartLine } from "@/lib/coupons";
import { todayIso } from "@/lib/dates";
import { useDemoCart, useStoreBasePath } from "../StoreProviders";
import { shippingFor } from "./CartView";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on delivery", description: "Pay the courier when your order arrives." },
  { value: "sslcommerz", label: "SSLCommerz", description: "Cards, mobile banking and internet banking." },
  { value: "stripe", label: "Card (Stripe)", description: "International cards." }
] as const;

const FIELD =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Same rules the API will enforce. Keep them in step with shared/ schemas. */
const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  phone: z.string().trim().regex(/^\+?[0-9][0-9 -]{8,14}$/, "Enter a valid phone number."),
  email: z.string().trim().email("Enter a valid email address."),
  address: z.string().trim().min(5, "Enter your delivery address."),
  zoneId: z.string().min(1, "Choose a delivery zone."),
  payment: z.enum(["cod", "sslcommerz", "stripe"])
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

type Placed = { orderNumber: string; total: number; payment: string };

/**
 * Checkout for a theme site. Demo only: no order is created on a server and no
 * payment is taken. Totals here are display values; the API recalculates them.
 */
export function CheckoutForm({ zones, coupons, currency }: { zones: DemoZone[]; coupons: DemoCoupon[]; currency: string }) {
  const basePath = useStoreBasePath();
  const cart = useDemoCart();
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState<DemoCoupon | null>(null);
  // The day the code was applied. Read in an event handler, never during render.
  const [appliedOn, setAppliedOn] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: "", phone: "", email: "", address: "", zoneId: zones[0]?.id ?? "", payment: "cod" }
  });
  const selectedZoneId = watch("zoneId");

  if (!cart.ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-muted" aria-busy="true" />;
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">Thank you, your order is placed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Order <span className="font-mono font-semibold text-foreground">{placed.orderNumber}</span> for{" "}
          <span className="font-semibold tabular-nums text-foreground">{formatPrice(placed.total, currency)}</span>.
          {placed.payment === "cod" ? " Pay the courier on delivery." : " Demo only: no payment was taken."}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Demo mode: this order is not saved anywhere.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`${basePath}/products`} className="btn-brand">Continue shopping</Link>
          <Link href={`${basePath}/admin/orders`} className="btn-ghost">View in admin</Link>
        </div>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-border px-6 py-16 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">Add products before checking out.</p>
        <Link href={`${basePath}/products`} className="btn-brand mt-6">Browse products</Link>
      </div>
    );
  }

  const zoneValue = (zoneId: string) => zones.find((z) => z.id === zoneId);
  const baseShipping = shippingFor(zoneValue(selectedZoneId), cart.subtotalMinor);
  const cartLines: CartLine[] = cart.lines.map((line) => ({
    productId: line.product.id,
    name: line.product.name,
    categoryName: line.product.category ?? "",
    unitMinor: line.product.priceMinor,
    quantity: line.quantity
  }));
  // The same engine the admin preview uses. The API must repeat this check when it saves the order.
  const evaluation = applied ? evaluateCoupon(applied, cartLines, baseShipping, appliedOn, currency) : null;
  const freeShipping = evaluation?.valid === true && evaluation.freeShipping;
  const discount = evaluation?.valid && !evaluation.freeShipping ? evaluation.discountMinor : 0;
  const shipping = freeShipping ? 0 : baseShipping;
  const total = cart.subtotalMinor - discount + shipping;

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return setCouponError("Enter a coupon code.");
    const match = coupons.find((c) => c.code === code);
    if (!match) return setCouponError("This coupon is not valid.");
    const today = todayIso();
    const result = evaluateCoupon(match, cartLines, baseShipping, today, currency);
    if (!result.valid) return setCouponError(result.reason);
    setApplied(match);
    setAppliedOn(today);
    setCouponError(null);
  }

  function onSubmit(values: CheckoutValues) {
    const orderNumber = `DEMO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setPlaced({ orderNumber, total, payment: values.payment });
    cart.clear();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        <section aria-labelledby="contact" className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="contact" className="font-semibold">Contact and delivery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.fullName?.message} className="sm:col-span-2">
              <input {...register("fullName")} autoComplete="name" className={FIELD} aria-invalid={!!errors.fullName} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <input {...register("phone")} inputMode="tel" autoComplete="tel" placeholder="+880 1XXX-XXXXXX" className={FIELD} aria-invalid={!!errors.phone} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} type="email" autoComplete="email" className={FIELD} aria-invalid={!!errors.email} />
            </Field>
            <Field label="Delivery address" error={errors.address?.message} className="sm:col-span-2">
              <textarea {...register("address")} rows={3} autoComplete="street-address" className={`${FIELD} h-auto py-2.5`} aria-invalid={!!errors.address} />
            </Field>
            <Field label="Delivery zone" error={errors.zoneId?.message}>
              <select {...register("zoneId")} className={FIELD}>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section aria-labelledby="payment" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 id="payment" className="font-semibold">Payment</h2>
          <div className="grid gap-3">
            {PAYMENT_METHODS.map((method) => (
              <label key={method.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" value={method.value} {...register("payment")} className="mt-1 accent-[hsl(var(--primary))]" />
                <span>
                  <span className="block text-sm font-medium">{method.label}</span>
                  <span className="block text-xs text-muted-foreground">{method.description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <button type="submit" disabled={isSubmitting} className="btn-brand w-full justify-center sm:w-auto disabled:opacity-60">
          Place order
        </button>
      </form>

      <aside aria-label="Order summary" className="h-fit space-y-5 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="space-y-3 text-sm">
          {cart.lines.map(({ product, quantity }) => (
            <li key={product.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted-foreground">
                {product.name} <span className="text-foreground">× {quantity}</span>
              </span>
              <span className="shrink-0 tabular-nums">{formatPrice(product.priceMinor * quantity, product.currency)}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <label htmlFor="coupon" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Tag className="h-3.5 w-3.5" aria-hidden="true" />
            Coupon code
          </label>
          <div className="flex gap-2">
            <input
              id="coupon"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className={`${FIELD} h-10 font-mono uppercase`}
              placeholder="Try WELCOME50"
            />
            <button type="button" onClick={applyCoupon} className="btn-ghost h-10 shrink-0 px-4">Apply</button>
          </div>
          {couponError && <p role="alert" className="text-xs text-destructive">{couponError}</p>}
          {applied && evaluation?.valid && (
            <p role="status" className="text-xs text-emerald-500">
              {applied.code} applied: {evaluation.summary}.
            </p>
          )}
          {applied && evaluation && !evaluation.valid && (
            <p role="alert" className="text-xs text-amber-600 dark:text-amber-400">{applied.code}: {evaluation.reason}</p>
          )}
        </div>

        <dl className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(cart.subtotalMinor, currency)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-500">
              <dt>Discount</dt>
              <dd className="tabular-nums">-{formatPrice(discount, currency)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping, currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(total, currency)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  className = "",
  children
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span role="alert" className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}
