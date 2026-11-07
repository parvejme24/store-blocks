import { useCallback, useState, type FormEvent } from "react";
import { z } from "zod";

/**
 * Validation for every admin form. Inputs are strings (as typed); `toMinor` and
 * `toInt` turn them into stored values. The API will apply the same rules via the
 * shared/ schemas, so keep the two in step.
 */

export const PRODUCT_STATUS_OPTIONS = [
  { value: "active", label: "Active", description: "Visible on the storefront." },
  { value: "draft", label: "Draft", description: "Saved, not visible to shoppers." },
  { value: "archived", label: "Archived", description: "Hidden, kept for order history." }
] as const;

export const VISIBILITY_OPTIONS = [
  { value: "active", label: "Visible", description: "Shown on the storefront." },
  { value: "hidden", label: "Hidden", description: "Not shown to shoppers." }
] as const;

export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" }
] as const;

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: "Cash on delivery",
  sslcommerz: "SSLCommerz",
  stripe: "Card (Stripe)"
};

export const ROLE_OPTIONS = [
  { value: "customer", label: "Customer", description: "Shops and tracks orders." },
  { value: "manager", label: "Manager", description: "Runs catalogue, orders and promotions." },
  { value: "staff", label: "Staff", description: "Support and order handling." }
] as const;


/* ---------- Conversions ---------- */

/** "1250.50" -> 125050 minor units. Empty input is 0. */
export function toMinor(value: string): number {
  const amount = Number(value.trim() || 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

/** 125050 minor units -> "1250.50" for an input field. */
export function fromMinor(minor: number | null): string {
  return minor === null ? "" : (minor / 100).toFixed(2);
}

export function toInt(value: string): number {
  const n = Number(value.trim() || 0);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export function parseKeywords(value: string): string[] {
  return Array.from(new Set(value.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean)));
}

export function formatKeywords(keywords: string[]): string {
  return keywords.join(", ");
}

export function parseLines(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

/** Unique id for a record created in this session. Only called from event handlers. */
export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------- Shared rules ---------- */

const isNumber = (value: string) => value.trim() !== "" && Number.isFinite(Number(value));
const isWholeNumber = (value: string) => value.trim() === "" || (isNumber(value) && Number.isInteger(Number(value)));

const optionalMoney = (label: string) =>
  z.string().refine((v) => v.trim() === "" || (isNumber(v) && Number(v) >= 0), `${label} must be 0 or more.`);

const seoFields = {
  metaTitle: z.string().max(70, "Keep the meta title to 70 characters or fewer."),
  metaDescription: z.string().max(160, "Keep the meta description to 160 characters or fewer."),
  keywords: z.string(),
  noindex: z.boolean()
};

const slugRule = z
  .string()
  .trim()
  .min(2, "Enter a URL slug.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens.");

/* ---------- Schemas ---------- */

export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a product name.").max(120),
    slug: slugRule,
    sku: z.string().trim().min(2, "Enter a SKU.").max(40),
    barcode: z.string().trim().regex(/^(\d{8}|\d{12,14})?$/, "Barcode must be 8, 12, 13 or 14 digits."),
    categoryId: z.string().min(1, "Choose a category."),
    brandId: z.string(),
    shortDescription: z.string().max(180, "Keep the short description to 180 characters."),
    description: z.string().max(5000),
    highlights: z.string(),
    price: z.string().refine((v) => isNumber(v) && Number(v) > 0, "Enter a selling price above zero."),
    compareAt: optionalMoney("Compare-at price"),
    cost: optionalMoney("Cost price"),
    taxRate: z.string().refine((v) => isNumber(v) && Number(v) >= 0 && Number(v) <= 30, "Tax rate must be between 0 and 30."),
    stock: z.string().refine((v) => isWholeNumber(v) && toInt(v) >= 0, "Stock must be a whole number, 0 or more."),
    reorderLevel: z.string().refine((v) => isWholeNumber(v) && toInt(v) >= 0, "Reorder level must be a whole number, 0 or more."),
    weightGrams: z.string().refine((v) => isWholeNumber(v) && toInt(v) >= 0, "Weight must be a whole number of grams."),
    tags: z.string(),
    status: z.enum(["active", "draft", "archived"]),
    featured: z.boolean(),
    ...seoFields
  })
  .superRefine((v, ctx) => {
    if (v.compareAt.trim() !== "" && isNumber(v.price) && isNumber(v.compareAt) && Number(v.compareAt) <= Number(v.price)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["compareAt"], message: "Compare-at price must be above the selling price." });
    }
  });

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name.").max(60),
  slug: slugRule,
  description: z.string().max(500),
  status: z.enum(["active", "hidden"]),
  sortOrder: z.string().refine((v) => isWholeNumber(v) && toInt(v) >= 0, "Sort order must be a whole number."),
  ...seoFields
});

export const brandSchema = z.object({
  name: z.string().trim().min(2, "Enter a brand name.").max(60),
  slug: slugRule,
  description: z.string().max(500),
  website: z.string().refine((v) => v.trim() === "" || /^https?:\/\/[^\s]+\.[^\s]+$/.test(v.trim()), "Enter a full web address starting with https://."),
  status: z.enum(["active", "hidden"]),
  ...seoFields
});

export const orderSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  paymentStatus: z.enum(["unpaid", "paid", "refunded"]),
  phone: z.string().trim().regex(/^\+?[0-9][0-9 -]{7,15}$/, "Enter a valid phone number."),
  address: z.string().trim().min(5, "Enter a delivery address."),
  city: z.string().trim().min(2, "Enter a city."),
  notes: z.string().max(500)
});

export const couponSchema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,20}$/, "Use 3 to 20 letters, numbers, hyphens or underscores."),
    description: z.string().max(120),
    kind: z.enum(["percent", "fixed", "free_shipping", "buy_x_get_y"]),
    value: z.string(),
    minOrder: optionalMoney("Minimum order"),
    buyQty: z.string(),
    getQty: z.string(),
    scopeType: z.enum(["all", "category", "product"]),
    scopeCategoryId: z.string(),
    scopeProductId: z.string(),
    usageLimit: z.string().refine((v) => v.trim() === "" || (isWholeNumber(v) && toInt(v) > 0), "Usage limit must be a whole number above zero."),
    expiresAt: z.string().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date."),
    active: z.boolean()
  })
  .superRefine((v, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    if (v.kind === "percent" && (!isNumber(v.value) || Number(v.value) <= 0 || Number(v.value) > 100)) issue("value", "Enter a percentage between 1 and 100.");
    if (v.kind === "fixed" && (!isNumber(v.value) || Number(v.value) <= 0)) issue("value", "Enter an amount above zero.");
    if (v.kind === "buy_x_get_y") {
      if (!isWholeNumber(v.buyQty) || toInt(v.buyQty) < 1) issue("buyQty", "Buy quantity must be 1 or more.");
      if (!isWholeNumber(v.getQty) || toInt(v.getQty) < 1) issue("getQty", "Get quantity must be 1 or more.");
      if (!isNumber(v.value) || Number(v.value) <= 0 || Number(v.value) > 100) issue("value", "Discount on the free items: 1 to 100%. Use 100 for free.");
    }
    if (v.scopeType === "category" && !v.scopeCategoryId) issue("scopeCategoryId", "Choose a category.");
    if (v.scopeType === "product" && !v.scopeProductId) issue("scopeProductId", "Choose a product.");
  });

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter a name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().regex(/^\+?[0-9][0-9 -]{7,15}$/, "Enter a valid phone number."),
  city: z.string().trim().min(2, "Enter a city."),
  address: z.string().trim().min(5, "Enter a delivery address."),
  role: z.enum(["customer", "manager", "staff"]),
  active: z.boolean()
});

export const zoneSchema = z.object({
  name: z.string().trim().min(2, "Enter a zone name."),
  flatRate: optionalMoney("Flat rate"),
  freeOver: optionalMoney("Free-shipping threshold")
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Enter the store name."),
  legalName: z.string().trim().min(2, "Enter the legal name."),
  email: z.string().trim().email("Enter a valid contact email."),
  phone: z.string().trim().regex(/^\+?[0-9][0-9 -]{7,15}$/, "Enter a valid phone number."),
  address: z.string().trim().min(5, "Enter the business address."),
  city: z.string().trim().min(2, "Enter a city."),
  taxNumber: z.string().trim().max(40),
  defaultMetaTitle: z.string().max(70, "Keep the default title to 70 characters or fewer."),
  defaultMetaDescription: z.string().max(160, "Keep the default description to 160 characters or fewer."),
  facebook: z.string().refine((v) => v.trim() === "" || /^https?:\/\//.test(v.trim()), "Start with https://."),
  instagram: z.string().refine((v) => v.trim() === "" || /^https?:\/\//.test(v.trim()), "Start with https://.")
});

/* ---------- Form hook ---------- */

export type FormErrors<V> = Partial<Record<keyof V, string>>;

/**
 * Holds one form's values and validates them with a Zod schema on submit.
 * Errors are shown next to the field that caused them.
 */
export function useEntityForm<V extends object>(initial: V, schema: z.ZodTypeAny) {
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<FormErrors<V>>({});

  const set = useCallback(<K extends keyof V>(key: K, value: V[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  }, []);

  const patch = useCallback((change: Partial<V>) => {
    setValues((current) => ({ ...current, ...change }));
  }, []);

  /** Sets one error by hand, for checks the schema cannot make (such as a duplicate slug). */
  const fail = useCallback((key: keyof V, message: string) => {
    setErrors((current) => ({ ...current, [key]: message }));
  }, []);

  function submit(onValid: (valid: V) => void) {
    return (event: FormEvent) => {
      event.preventDefault();
      const result = schema.safeParse(values);
      if (!result.success) {
        const next: FormErrors<V> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof V | undefined;
          if (key !== undefined && next[key] === undefined) next[key] = issue.message;
        }
        setErrors(next);
        return;
      }
      setErrors({});
      onValid(values);
    };
  }

  return { values, errors, set, patch, fail, submit };
}
