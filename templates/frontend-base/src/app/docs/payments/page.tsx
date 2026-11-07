import Link from "next/link";
import { CreditCard, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function PaymentsDocPage() {
  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Introduction
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Payments & Checkout Lifecycle
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Pluggable payment gateways behind a single uniform <code>PaymentAdapter</code> contract, supporting both local Bangladeshi and global payment processors.
        </p>
      </div>

      {/* Checkout Pipeline */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Checkout Transaction Pipeline</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-lg border bg-card p-4">
            <strong className="text-foreground">1. Server-Side Price Verification</strong>: Client totals are never trusted. All item prices, quantities, shipping rates, and discounts are recomputed on the backend.
          </div>
          <div className="rounded-lg border bg-card p-4">
            <strong className="text-foreground">2. Atomic Stock Decrement</strong>: Product stocks are decremented atomically inside <code>UnitOfWork</code>. If an item is out of stock, the transaction immediately aborts.
          </div>
          <div className="rounded-lg border bg-card p-4">
            <strong className="text-foreground">3. Gateway Initiation</strong>: The active gateway returns either a redirect URL (Stripe / SSLCommerz) or a pending confirmation (Cash on Delivery).
          </div>
          <div className="rounded-lg border bg-card p-4">
            <strong className="text-foreground">4. Idempotent Webhook Verification</strong>: Cryptographic signatures are verified before an order is marked <code>paid</code> and moved to <code>confirmed</code>. The same transaction ID never triggers duplicate status changes.
          </div>
        </div>
      </section>

      {/* Gateway Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div id="cod" className="rounded-lg border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-base">Cash on Delivery</h3>
          <p className="text-xs text-muted-foreground">
            Zero third-party redirect. The order is recorded in <code>pending</code> status, waiting for manual confirmation by store admins.
          </p>
        </div>

        <div id="sslcommerz" className="rounded-lg border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-base">SSLCommerz</h3>
          <p className="text-xs text-muted-foreground">
            Leading gateway in Bangladesh. Supports Visa/Mastercard, bKash, Nagad, Rocket, and Internet Banking with sandbox testing mode and IPN verification.
          </p>
        </div>

        <div id="stripe" className="rounded-lg border bg-card p-5 space-y-2">
          <h3 className="font-semibold text-base">Stripe</h3>
          <p className="text-xs text-muted-foreground">
            Global payment processing with hosted Stripe Checkout Sessions, Apple Pay, Google Pay, and webhook signature verification.
          </p>
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="border-t pt-8 flex items-center justify-between">
        <Link
          href="/docs/storage"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Storage Guide
        </Link>
        <Link
          href="/docs/modules"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Module Directory <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

