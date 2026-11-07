import { formatPrice } from "./format";

/**
 * The coupon engine. The admin preview and the storefront checkout both call
 * `evaluateCoupon`, so a code means the same thing everywhere. The API must run
 * the same rules when it places an order: never trust the client's discount.
 */

export type CouponKind = "percent" | "fixed" | "free_shipping" | "buy_x_get_y";

export type CouponScope =
  | { type: "all" }
  | { type: "category"; categoryName: string }
  | { type: "product"; productId: string };

export type CouponRule = {
  id: string;
  code: string;
  description: string;
  kind: CouponKind;
  /**
   * percent: 1-100 off the eligible subtotal.
   * fixed: minor units off the eligible subtotal.
   * buy_x_get_y: percent off the free units (100 = free, 50 = half price).
   * free_shipping: not used.
   */
  value: number;
  /** Minimum eligible subtotal in minor units. 0 means none. */
  minOrderMinor: number;
  /** buy_x_get_y: items bought per deal. */
  buyQty: number;
  /** buy_x_get_y: items discounted per deal. */
  getQty: number;
  scope: CouponScope;
  usageLimit: number | null;
  usedCount: number;
  /** ISO date (yyyy-MM-dd) or null. The coupon is valid through this day. */
  expiresAt: string | null;
  active: boolean;
};

export type CartLine = {
  productId: string;
  name: string;
  categoryName: string;
  unitMinor: number;
  quantity: number;
};

export type CouponResult =
  | { valid: true; discountMinor: number; freeShipping: boolean; summary: string }
  | { valid: false; reason: string };

export const COUPON_KIND_OPTIONS: { value: CouponKind; label: string; description: string }[] = [
  { value: "percent", label: "Percentage off", description: "Take a percentage off the order or matching items." },
  { value: "fixed", label: "Fixed amount off", description: "Take a set amount off, such as 500 off orders over 5,000." },
  { value: "free_shipping", label: "Free shipping", description: "Waive delivery charges above a spend threshold." },
  { value: "buy_x_get_y", label: "Buy X, get Y", description: "Buy some items and get others free or at a discount." }
];

export const COUPON_KIND_LABEL: Record<CouponKind, string> = {
  percent: "Percentage off",
  fixed: "Fixed amount off",
  free_shipping: "Free shipping",
  buy_x_get_y: "Buy X, get Y"
};

export function matchesScope(scope: CouponScope, line: CartLine): boolean {
  if (scope.type === "all") return true;
  if (scope.type === "category") return line.categoryName === scope.categoryName;
  return line.productId === scope.productId;
}

function scopeText(scope: CouponScope): string {
  if (scope.type === "all") return "any item";
  if (scope.type === "category") return `${scope.categoryName} items`;
  return "the selected product";
}

/** One line for the admin list and the checkout, e.g. "Buy 2 get 1 free on Shirts items". */
export function describeCoupon(rule: CouponRule, currency: string): string {
  const money = (minor: number) => formatPrice(minor, currency);
  const minimum = rule.minOrderMinor > 0 ? ` on orders over ${money(rule.minOrderMinor)}` : "";
  switch (rule.kind) {
    case "percent":
      return `${rule.value}% off ${scopeText(rule.scope)}${minimum}`;
    case "fixed":
      return `${money(rule.value)} off ${scopeText(rule.scope)}${minimum}`;
    case "free_shipping":
      return `Free shipping${minimum || " on every order"}`;
    case "buy_x_get_y": {
      const offer = rule.value === 100 ? "free" : `at ${100 - rule.value}% off`;
      return `Buy ${rule.buyQty} get ${rule.getQty} ${offer} on ${scopeText(rule.scope)}`;
    }
  }
}

/** Checks a coupon against the cart and returns the discount it gives. */
export function evaluateCoupon(
  rule: CouponRule,
  lines: CartLine[],
  shippingMinor: number,
  today: string,
  currency: string
): CouponResult {
  const fail = (reason: string): CouponResult => ({ valid: false, reason });
  const money = (minor: number) => formatPrice(minor, currency);

  if (!rule.active) return fail("This coupon is not active.");
  if (rule.expiresAt && rule.expiresAt < today) return fail("This coupon has expired.");
  if (rule.usageLimit !== null && rule.usedCount >= rule.usageLimit) return fail("This coupon has been fully redeemed.");
  if (lines.length === 0) return fail("Your cart is empty.");

  const subtotal = lines.reduce((sum, line) => sum + line.unitMinor * line.quantity, 0);
  const eligible = lines.filter((line) => matchesScope(rule.scope, line));
  const eligibleSubtotal = eligible.reduce((sum, line) => sum + line.unitMinor * line.quantity, 0);

  if (rule.kind === "free_shipping") {
    if (subtotal < rule.minOrderMinor) return fail(`Spend ${money(rule.minOrderMinor)} to get free shipping.`);
    return { valid: true, discountMinor: shippingMinor, freeShipping: true, summary: "Free shipping" };
  }

  if (eligible.length === 0) return fail("No items in your cart match this coupon.");

  if (rule.kind === "buy_x_get_y") {
    const group = rule.buyQty + rule.getQty;
    // Flatten to single units and sort cheapest first: the cheapest units are the ones discounted.
    const units = eligible.flatMap((line) => Array.from({ length: line.quantity }, () => line.unitMinor)).sort((a, b) => a - b);
    const count = units.length;
    const sets = Math.floor(count / group);
    if (sets < 1) {
      const missing = group - count;
      return fail(`Add ${missing} more matching item${missing === 1 ? "" : "s"} to get ${rule.getQty} ${rule.value === 100 ? "free" : "discounted"}.`);
    }
    const discountedUnits = sets * rule.getQty;
    const discountMinor = Math.round((units.slice(0, discountedUnits).reduce((sum, unit) => sum + unit, 0) * rule.value) / 100);
    const offer = rule.value === 100 ? "free" : `at ${100 - rule.value}% off`;
    return {
      valid: true,
      discountMinor,
      freeShipping: false,
      summary: `${discountedUnits} item${discountedUnits === 1 ? "" : "s"} ${offer}`
    };
  }

  if (eligibleSubtotal < rule.minOrderMinor) {
    return fail(`Spend ${money(rule.minOrderMinor)} on eligible items to use this coupon.`);
  }

  const raw = rule.kind === "percent" ? Math.round((eligibleSubtotal * rule.value) / 100) : rule.value;
  const discountMinor = Math.min(raw, eligibleSubtotal);
  return { valid: true, discountMinor, freeShipping: false, summary: `${money(discountMinor)} off` };
}
