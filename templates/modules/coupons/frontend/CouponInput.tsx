"use client";

import React, { useState } from "react";
import { Tag, Check, ArrowRight } from "lucide-react";
import { useValidateCouponMutation } from "./couponsApi";

export interface CouponInputProps {
  orderAmountMinor: number;
  onApply: (discountMinor: number, code: string) => void;
}

export function CouponInput({ orderAmountMinor, onApply }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const [validateCoupon, { isLoading }] = useValidateCouponMutation();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!code) return;

    try {
      const res = await validateCoupon({ code, orderAmountMinor }).unwrap();
      if (res.data?.valid) {
        setAppliedCode(code);
        onApply(res.data.discountMinor, code);
      } else {
        setErrorMsg(res.data?.message || "Invalid coupon code");
      }
    } catch (err: any) {
      setErrorMsg(err.data?.error?.message || "Coupon code not applicable");
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="PROMO CODE"
            disabled={!!appliedCode || isLoading}
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-xs font-mono uppercase tracking-wider outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={!code || !!appliedCode || isLoading}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
        >
          {appliedCode ? <Check className="h-4 w-4" /> : "Apply"}
        </button>
      </form>

      {appliedCode && (
        <p className="text-xs text-emerald-600 font-medium">
          ✓ Coupon <strong>{appliedCode}</strong> applied successfully!
        </p>
      )}

      {errorMsg && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}

