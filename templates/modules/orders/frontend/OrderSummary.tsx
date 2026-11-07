"use client";

import React from "react";
import { OrderDetail } from "./ordersApi";

export function OrderSummary({ order }: { order: OrderDetail }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Order Reference</span>
          <h3 className="text-xl font-bold text-foreground">#{order.orderNumber}</h3>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold capitalize">
            {order.status}
          </span>
          <span className="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-semibold capitalize">
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Purchased Items</h4>
        <div className="divide-y text-sm">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2">
              <div>
                <span className="font-medium text-foreground">{item.productName}</span>
                <span className="text-xs text-muted-foreground block">Qty: {item.quantity}</span>
              </div>
              <span className="font-semibold text-foreground">
                {((item.priceMinor * item.quantity) / 100).toLocaleString()} {order.currency}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-secondary/50 p-4 space-y-2 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{(order.subtotalMinor / 100).toLocaleString()} {order.currency}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>{(order.shippingMinor / 100).toLocaleString()} {order.currency}</span>
        </div>
        {order.discountMinor > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Discount Applied</span>
            <span>-{(order.discountMinor / 100).toLocaleString()} {order.currency}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border/40 pt-2 text-sm font-bold text-foreground">
          <span>Total</span>
          <span className="text-primary">{(order.totalMinor / 100).toLocaleString()} {order.currency}</span>
        </div>
      </div>

      <div className="rounded-xl border p-4 text-xs space-y-1">
        <h5 className="font-bold text-foreground">Delivery Destination</h5>
        <p className="text-muted-foreground">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
        <p className="text-muted-foreground">
          {order.shippingAddress.street}, {order.shippingAddress.city}{" "}
          {order.shippingAddress.postalCode ? `- ${order.shippingAddress.postalCode}` : ""}, {order.shippingAddress.country}
        </p>
      </div>
    </div>
  );
}

