"use client";

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Truck, Star, Phone, MapPin, User, ChevronDown } from "lucide-react";

export interface LandingProduct {
  id: string;
  name: string;
  headline?: string;
  priceMinor: number;
  originalPriceMinor?: number;
  currency: string;
  images: { key: string; alt?: string }[];
  features?: string[];
  testimonials?: { name: string; comment: string; rating: number }[];
  faqs?: { question: string; answer: string }[];
}

export function LandingLayout({ product }: { product?: LandingProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const p = product || {
    id: "landing-featured",
    name: "Ultra Ergonomic Lumbar Support Chair",
    headline: "Transform your posture and eliminate back fatigue during 10+ hour workdays.",
    priceMinor: 1450000,
    originalPriceMinor: 1800000,
    currency: "BDT",
    images: [{ key: "/placeholder.png", alt: "Lumbar Chair" }],
    features: [
      "Dynamic 3D lumbar pressure-release system",
      "Breathable high-tensile mesh made in Germany",
      "Heavy-duty class 4 pneumatic cylinder tested to 150kg",
      "7-year full replacement frame guarantee"
    ],
    testimonials: [
      { name: "Tanvir Ahmed", comment: "Solves chronic back stiffness within 3 days. Best office investment.", rating: 5 },
      { name: "Sadia Rahman", comment: "Delivery was swift in Dhanmondi. COD made it 100% risk free.", rating: 5 }
    ],
    faqs: [
      { question: "How does Cash on Delivery work?", answer: "Our courier delivers to your address anywhere in Bangladesh. You inspect the parcel and pay cash directly to the delivery person." },
      { question: "What is the delivery timeline?", answer: "Inside Dhaka: 24 to 48 hours. Outside Dhaka: 48 to 72 hours via Sundarban or Steadfast Courier." },
      { question: "Is there a warranty included?", answer: "Yes, every unit comes with a stamped warranty card and full replacement coverage." }
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;
    setOrderPlaced(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-6">
      {/* Sales Funnel Hero */}
      <section className="text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 px-4 py-1 text-xs font-bold uppercase tracking-wider">
          🔥 Limited Time Offer — Cash On Delivery Available
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          {p.name}
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {p.headline}
        </p>

        {/* Pricing badge */}
        <div className="flex items-center justify-center gap-3 text-2xl font-black">
          <span className="text-red-600 dark:text-red-400">
            {(p.priceMinor / 100).toLocaleString()} {p.currency}
          </span>
          {p.originalPriceMinor && (
            <span className="text-muted-foreground line-through text-lg font-normal">
              {(p.originalPriceMinor / 100).toLocaleString()} {p.currency}
            </span>
          )}
          <span className="rounded bg-red-600 text-white text-xs font-bold px-2 py-0.5">
            Save 20%
          </span>
        </div>
      </section>

      {/* Feature Bullet Points */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border bg-card p-6 md:p-8">
        {p.features?.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium leading-relaxed">{f}</span>
          </div>
        ))}
      </section>

      {/* Testimonials */}
      {p.testimonials && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center tracking-tight">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p.testimonials.map((t, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 space-y-2">
                <div className="flex gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, r) => (
                    <Star key={r} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 italic">"{t.comment}"</p>
                <p className="text-xs font-bold text-muted-foreground">— {t.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Inline Direct COD Order Form */}
      <section id="order-form" className="rounded-3xl border-2 border-primary bg-primary/5 p-6 md:p-10 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Order Now with Cash on Delivery</h2>
          <p className="text-sm text-muted-foreground">Fill in your shipping details below. No advance card payment required.</p>
        </div>

        {orderPlaced ? (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 p-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">Order Confirmed!</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Thank you {name}. Our customer support representative will call you at {phone} to verify delivery details.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Full Name
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Tanvir Hossain"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" /> Mobile Number
              </label>
              <input
                required
                type="tel"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Full Delivery Address
              </label>
              <textarea
                required
                rows={3}
                placeholder="House, Road, Area, Thana, District"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm font-semibold">Quantity:</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded border px-2.5 py-1 text-sm font-bold"
                >
                  -
                </button>
                <span className="font-bold px-2">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded border px-2.5 py-1 text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-background border p-4 flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Total (Pay on Delivery):</span>
              <span className="text-lg font-black text-primary">
                {((p.priceMinor * quantity) / 100).toLocaleString()} {p.currency}
              </span>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition"
            >
              Confirm Cash On Delivery Order
            </button>
          </form>
        )}
      </section>

      {/* FAQ Accordion */}
      {p.faqs && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-center tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {p.faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-semibold text-sm flex justify-between items-center"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t pt-2">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

