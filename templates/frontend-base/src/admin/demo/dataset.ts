import type { StoreTemplate } from "@/templates/types";
import { getProductDetail } from "@/templates/demo/details";
import { addDaysIso } from "@/lib/dates";
import { buildOrderEvents, type OrderEvent, type OrderStatus } from "@/lib/order-timeline";
import type { CouponRule } from "@/lib/coupons";

/**
 * Demo data for the admin dashboard, built from a store theme's sample products.
 * Deterministic (no random values or clock reads), so the server and the browser
 * render exactly the same content. Plain data only, so it can cross from the
 * server layout to the client shell.
 *
 * Demo dates are anchored to DEMO_TODAY. The orders page filters to the real
 * current day by default; if you open the demo on another day, use "All dates".
 */

export const DEMO_TODAY = "2026-11-07";

export type { OrderStatus, OrderEvent } from "@/lib/order-timeline";

export type ProductStatus = "active" | "draft" | "archived";
export type VisibilityStatus = "active" | "hidden";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod = "cod" | "sslcommerz" | "stripe";
export type UserRole = "customer" | "manager" | "staff";
export type ShipmentStatus = "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "returned";

/** An uploaded image. `url` is a data URL in the demo (kept in this session only). */
export type MediaImage = { id: string; url: string; alt: string };

/** Search-engine fields shared by products, categories and brands. */
export type Seo = { metaTitle: string; metaDescription: string; keywords: string[]; noindex: boolean };

export type DemoCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: MediaImage | null;
  seo: Seo;
  status: VisibilityStatus;
  sortOrder: number;
};

export type DemoBrand = {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logo: MediaImage | null;
  seo: Seo;
  status: VisibilityStatus;
};

export type DemoProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  categoryId: string | null;
  brandId: string | null;
  shortDescription: string;
  description: string;
  highlights: string[];
  priceMinor: number;
  compareAtMinor: number | null;
  costMinor: number;
  /** Tax rate in percent, e.g. 15. */
  taxRate: number;
  currency: string;
  stock: number;
  reorderLevel: number;
  weightGrams: number;
  tags: string[];
  images: MediaImage[];
  status: ProductStatus;
  featured: boolean;
  seo: Seo;
  createdAt: string;
};

export type DemoOrderItem = {
  productId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitMinor: number;
};

export type DemoOrder = {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  items: DemoOrderItem[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  taxMinor: number;
  /** subtotal - discount + shipping + tax. */
  totalMinor: number;
  couponCode: string | null;
  status: OrderStatus;
  /** Status history, one event per step reached. Drives the timeline. */
  events: OrderEvent[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes: string;
  currency: string;
  createdAt: string;
};

export type DemoCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  /** Default delivery address. Orders can use other addresses. */
  address: string;
  role: UserRole;
  active: boolean;
  currency: string;
  joined: string;
};

/** A coupon is a rule the shared engine in lib/coupons evaluates. */
export type DemoCoupon = CouponRule;

export type DemoReview = { id: string; productId: string; author: string; rating: number; comment: string; approved: boolean; createdAt: string };
export type DemoZone = { id: string; name: string; flatRateMinor: number; freeOverMinor: number; currency: string };

export type ShipmentEvent = { status: ShipmentStatus; at: string; note: string };

export type DemoShipment = {
  id: string;
  orderId: string;
  orderNumber: string;
  courier: string;
  trackingCode: string;
  recipient: string;
  phone: string;
  destination: string;
  itemsSummary: string;
  weightGrams: number;
  /** Cash to collect on delivery. 0 when the order is prepaid. */
  codAmountMinor: number;
  status: ShipmentStatus;
  events: ShipmentEvent[];
  createdAt: string;
};

export type DemoSettings = {
  storeName: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  currency: string;
  taxNumber: string;
  logo: MediaImage | null;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  facebook: string;
  instagram: string;
};

export type DemoDataset = {
  themeId: string;
  storeName: string;
  products: DemoProduct[];
  categories: DemoCategory[];
  brands: DemoBrand[];
  orders: DemoOrder[];
  customers: DemoCustomer[];
  coupons: DemoCoupon[];
  reviews: DemoReview[];
  zones: DemoZone[];
  shipments: DemoShipment[];
  settings: DemoSettings;
};

/** Applies a change to the dashboard's demo data. */
export type DemoUpdate = (change: (current: DemoDataset) => DemoDataset) => void;

/** Bangladeshi courier companies the store can hand parcels to. Integrations need each courier's API credentials. */
export const COURIERS = ["Pathao", "RedX", "Steadfast", "Paperfly", "Sundarban Courier"] as const;
export const SHIPPING_FLAT_MINOR = 6000;

const CUSTOMER_NAMES = ["Ayesha Rahman", "Karim Hossain", "Nusrat Jahan", "Tanvir Ahmed", "Sadia Islam", "Rafiq Uddin", "Mim Akter", "Sohel Rana"];
const CUSTOMER_CITIES = ["Dhaka", "Dhaka", "Chattogram", "Sylhet", "Dhaka", "Rajshahi", "Khulna", "Dhaka"];
const ADDRESSES = [
  "House 12, Road 5, Dhanmondi",
  "Flat 4B, Block C, Uttara",
  "Agrabad Commercial Area",
  "Zindabazar, Sylhet",
  "Block A, Mirpur 10",
  "Shaheb Bazar, Rajshahi",
  "KDA Avenue, Khulna",
  "Gulshan 2, Circle 1"
];
/** Days before DEMO_TODAY for seeded orders across the last six months */
const ORDER_AGE_DAYS = [
  // Current month (Month 0: ~0-20 days ago) - includes fresh orders for today
  0, 0, 0, 1, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 18, 20,
  // 1 month ago (Month -1: ~25-55 days ago)
  26, 29, 32, 35, 38, 42, 46, 50, 54,
  // 2 months ago (Month -2: ~58-85 days ago)
  58, 62, 67, 71, 76, 80, 84,
  // 3 months ago (Month -3: ~88-115 days ago)
  88, 92, 98, 103, 108, 114,
  // 4 months ago (Month -4: ~118-145 days ago)
  118, 124, 130, 136, 142,
  // 5 months ago (Month -5: ~148-175 days ago)
  148, 154, 160, 166, 172
];
const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "delivered", "cancelled"];
const REVIEW_COMMENTS = ["Great quality, arrived quickly.", "Exactly as described.", "Would buy again.", "Good value for the price.", "Packaging could be better."];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function emptySeo(): Seo {
  return { metaTitle: "", metaDescription: "", keywords: [], noindex: false };
}

function shipmentEventsFor(status: OrderStatus, courier: string, createdAt: string): ShipmentEvent[] {
  const events: ShipmentEvent[] = [{ status: "picked_up", at: createdAt, note: `Picked up by ${courier}` }];
  if (status === "shipped" || status === "delivered") {
    events.push({ status: "in_transit", at: addDaysIso(createdAt, 1), note: "In transit between hubs" });
  }
  if (status === "delivered") {
    events.push({ status: "out_for_delivery", at: addDaysIso(createdAt, 2), note: "Out for delivery" });
    events.push({ status: "delivered", at: addDaysIso(createdAt, 2), note: "Delivered and paid" });
  }
  return events;
}

export function buildDemoDataset(template: StoreTemplate): DemoDataset {
  const currency = template.samples[0]?.currency ?? "BDT";
  const storeName = template.name;
  const prefix = template.id.slice(0, 3).toUpperCase();
  const taxRate = template.id === "grocery" || template.id === "organic" ? 5 : 15;

  // Categories and brands come from the theme's sample products.
  const categoryNames = Array.from(new Set(template.samples.map((p) => p.category ?? "Uncategorised")));
  const categories: DemoCategory[] = categoryNames.map((name, i) => {
    const slug = slugify(name);
    return {
      id: `cat-${slug}`,
      name,
      slug,
      description: `${name} from ${storeName}. Browse the full range and find your next favourite.`,
      image: null,
      seo: { metaTitle: `${name} | ${storeName}`, metaDescription: `Shop ${name.toLowerCase()} at ${storeName}. Fresh stock and fast delivery.`, keywords: [slug], noindex: false },
      status: "active",
      sortOrder: i + 1
    };
  });

  const brandNames = Array.from(new Set(template.samples.map((p) => getProductDetail(template.id, p.id).brand)));
  const brands: DemoBrand[] = brandNames.map((name) => {
    const slug = slugify(name);
    return {
      id: `brand-${slug}`,
      name,
      slug,
      description: `${name} products available at ${storeName}.`,
      website: `https://www.${slug.replace(/-/g, "")}.example`,
      logo: null,
      seo: { metaTitle: `${name} products | ${storeName}`, metaDescription: `Discover ${name} products at ${storeName}.`, keywords: [slug], noindex: false },
      status: "active"
    };
  });

  const products: DemoProduct[] = template.samples.map((p, i) => {
    const detail = getProductDetail(template.id, p.id);
    const category = categories.find((c) => c.name === (p.category ?? "Uncategorised"));
    const brand = brands.find((b) => b.name === detail.brand);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: `${prefix}-${String(i + 1).padStart(4, "0")}`,
      barcode: `8901${String(1000000 + i * 7919).padStart(9, "0")}`,
      categoryId: category?.id ?? null,
      brandId: brand?.id ?? null,
      shortDescription: detail.description,
      description: detail.description,
      highlights: detail.highlights,
      priceMinor: p.priceMinor,
      compareAtMinor: i % 3 === 0 ? Math.round(p.priceMinor * 1.2) : null,
      costMinor: Math.round(p.priceMinor * 0.6),
      taxRate,
      currency: p.currency,
      stock: p.stock ?? 0,
      reorderLevel: 5,
      weightGrams: 200 + i * 150,
      tags: [slugify(p.category ?? "general"), brand ? brand.slug : "store"],
      images: [],
      status: i === 5 ? "draft" : "active",
      featured: i % 2 === 0,
      seo: {
        metaTitle: `${p.name} | ${storeName}`.slice(0, 70),
        metaDescription: detail.description.slice(0, 155),
        keywords: [slugify(p.category ?? "general"), slugify(detail.brand)],
        noindex: false
      },
      createdAt: addDaysIso(DEMO_TODAY, -(60 - i * 7))
    };
  });

  const customers: DemoCustomer[] = CUSTOMER_NAMES.map((name, i) => ({
    id: `c${i + 1}`,
    name,
    email: `${slugify(name).replace(/-/g, ".")}@example.com`,
    phone: `+880 1700-00000${i + 1}`,
    city: CUSTOMER_CITIES[i],
    address: ADDRESSES[i],
    role: i === 0 ? "manager" : i === 1 ? "staff" : "customer",
    active: i !== 5,
    currency,
    joined: addDaysIso(DEMO_TODAY, -(300 - i * 25))
  }));

  const orders: DemoOrder[] = ORDER_AGE_DAYS.map((age, i): DemoOrder => {
    const customerIndex = i % customers.length;
    const customer = customers[customerIndex];
    const lines = [products[i % products.length], ...(i % 4 === 0 ? [products[(i + 2) % products.length]] : [])];
    const items: DemoOrderItem[] = lines.map((product, n) => ({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      category: categories.find((c) => c.id === product.categoryId)?.name ?? "Uncategorised",
      quantity: n === 0 ? (i % 3) + 1 : 1,
      unitMinor: product.priceMinor
    }));
    const subtotalMinor = items.reduce((sum, item) => sum + item.unitMinor * item.quantity, 0);
    const couponCode = i % 5 === 0 && subtotalMinor > 5000 ? "WELCOME50" : null;
    const discountMinor = couponCode ? 5000 : 0;
    const taxMinor = Math.round(lines.reduce((sum, product, n) => sum + product.priceMinor * items[n].quantity * (product.taxRate / 100), 0));
    const status =
      age <= 14
        ? ORDER_STATUSES[i % ORDER_STATUSES.length]
        : i % 8 === 0
        ? "cancelled"
        : "delivered";
    const paymentMethod: PaymentMethod = i % 3 === 0 ? "sslcommerz" : i % 7 === 0 ? "stripe" : "cod";
    const paymentStatus: PaymentStatus =
      status === "cancelled" ? "unpaid" : paymentMethod !== "cod" || status === "delivered" ? "paid" : "unpaid";
    const createdAt = addDaysIso(DEMO_TODAY, -age);
    return {
      id: `o${i + 1}`,
      orderNumber: `#${1040 + i}`,
      customerId: customer.id,
      customer: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: ADDRESSES[customerIndex],
      city: customer.city,
      items,
      subtotalMinor,
      discountMinor,
      shippingMinor: SHIPPING_FLAT_MINOR,
      taxMinor,
      totalMinor: subtotalMinor - discountMinor + SHIPPING_FLAT_MINOR + taxMinor,
      couponCode,
      status,
      events: buildOrderEvents(status, createdAt),
      paymentMethod,
      paymentStatus,
      notes: i % 6 === 2 ? "Call before delivery." : "",
      currency,
      createdAt
    };
  });

  const categoryForCoupon = categoryNames[0] ?? "";
  const coupons: DemoCoupon[] = [
    {
      id: "cp1",
      code: `${template.id.slice(0, 6).toUpperCase()}10`,
      description: "10% off your first order",
      kind: "percent",
      value: 10,
      minOrderMinor: 0,
      buyQty: 1,
      getQty: 1,
      scope: { type: "all" },
      usageLimit: 100,
      usedCount: 12,
      expiresAt: "2026-12-31",
      active: true
    },
    {
      id: "cp2",
      code: "WELCOME50",
      description: "50 off orders above 500",
      kind: "fixed",
      value: 5000,
      minOrderMinor: 50000,
      buyQty: 1,
      getQty: 1,
      scope: { type: "all" },
      usageLimit: null,
      usedCount: 38,
      expiresAt: null,
      active: true
    },
    {
      id: "cp3",
      code: "BUY2GET1",
      description: "Buy 2, get 1 free",
      kind: "buy_x_get_y",
      value: 100,
      minOrderMinor: 0,
      buyQty: 2,
      getQty: 1,
      scope: { type: "all" },
      usageLimit: 200,
      usedCount: 21,
      expiresAt: null,
      active: true
    },
    {
      id: "cp4",
      code: "PAIRDEAL",
      description: "Buy 2 from this range, get the third at 50% off",
      kind: "buy_x_get_y",
      value: 50,
      minOrderMinor: 0,
      buyQty: 2,
      getQty: 1,
      scope: { type: "category", categoryName: categoryForCoupon },
      usageLimit: null,
      usedCount: 7,
      expiresAt: null,
      active: true
    },
    {
      id: "cp5",
      code: "FREESHIP",
      description: "Free delivery on orders over 1500",
      kind: "free_shipping",
      value: 0,
      minOrderMinor: 150000,
      buyQty: 1,
      getQty: 1,
      scope: { type: "all" },
      usageLimit: null,
      usedCount: 15,
      expiresAt: null,
      active: true
    },
    {
      id: "cp6",
      code: "SUMMER25",
      description: "Summer clearance",
      kind: "percent",
      value: 25,
      minOrderMinor: 0,
      buyQty: 1,
      getQty: 1,
      scope: { type: "all" },
      usageLimit: 50,
      usedCount: 4,
      expiresAt: "2026-06-30",
      active: false
    }
  ];

  const reviews: DemoReview[] = products.slice(0, 5).map((p, i) => ({
    id: `r${i + 1}`,
    productId: p.id,
    author: CUSTOMER_NAMES[i],
    rating: 5 - (i % 3),
    comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
    approved: i % 2 === 0,
    createdAt: addDaysIso(DEMO_TODAY, -(10 + i))
  }));

  const zones: DemoZone[] = [
    { id: "z1", name: "Inside city", flatRateMinor: SHIPPING_FLAT_MINOR, freeOverMinor: 150000, currency },
    { id: "z2", name: "Outside city", flatRateMinor: 12000, freeOverMinor: 250000, currency }
  ];

  // One shipment per order that has left the warehouse.
  const shipments: DemoShipment[] = orders
    .filter((o) => o.status === "shipped" || o.status === "delivered")
    .map((o, i): DemoShipment => {
      const courier = COURIERS[i % COURIERS.length];
      const weightGrams = o.items.reduce((sum, item) => sum + (products.find((p) => p.id === item.productId)?.weightGrams ?? 0) * item.quantity, 0);
      const status: ShipmentStatus = o.status === "delivered" ? "delivered" : "in_transit";
      return {
        id: `s${i + 1}`,
        orderId: o.id,
        orderNumber: o.orderNumber,
        courier,
        trackingCode: `${courier.slice(0, 2).toUpperCase()}-${70100 + i * 37}`,
        recipient: o.customer,
        phone: o.phone,
        destination: `${o.address}, ${o.city}`,
        itemsSummary: o.items.map((item) => `${item.quantity}× ${item.name}`).join(", "),
        weightGrams,
        codAmountMinor: o.paymentMethod === "cod" && o.paymentStatus !== "paid" ? o.totalMinor : 0,
        status,
        events: shipmentEventsFor(o.status, courier, o.createdAt),
        createdAt: o.createdAt
      };
    });

  return {
    themeId: template.id,
    storeName,
    products,
    categories,
    brands,
    orders,
    customers,
    coupons,
    reviews,
    zones,
    shipments,
    settings: {
      storeName,
      legalName: `${storeName} Ltd.`,
      email: "hello@example.com",
      phone: "+880 1700-000000",
      address: "House 8, Road 12, Banani",
      city: "Dhaka",
      currency,
      taxNumber: "BIN-000000000-0000",
      logo: null,
      defaultMetaTitle: `${storeName} | Shop online`,
      defaultMetaDescription: `Shop ${storeName.toLowerCase()} online with fast delivery and easy returns.`,
      facebook: "",
      instagram: ""
    }
  };
}
