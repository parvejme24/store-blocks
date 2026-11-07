import {
  Bell,
  FolderTree,
  LayoutDashboard,
  Package,
  PackageCheck,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  Ticket,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  type LucideIcon
} from "lucide-react";

export type FeatureId =
  | "overview"
  | "revenue"
  | "products"
  | "inventory"
  | "categories"
  | "brands"
  | "orders"
  | "couriers"
  | "customers"
  | "coupons"
  | "reviews"
  | "shipping"
  | "notifications"
  | "settings";

export type Column = {
  key: string;
  label: string;
  format?: "money" | "date" | "status";
};

export type AdminFeature = {
  id: FeatureId;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  /** Backend list endpoint (from the module's backend.basePath). Undefined for overview. */
  endpoint?: string;
  columns: Column[];
  emptyTitle: string;
  emptyBody: string;
};

/**
 * Admin dashboard features. Each one maps to a backend module in templates/modules
 * (its adminMenu entry and API routes). The same list serves every store theme.
 */
export const ADMIN_FEATURES: AdminFeature[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Sales, orders and store activity at a glance.",
    columns: [],
    emptyTitle: "No activity yet",
    emptyBody: "Revenue, orders and customers appear here after your first sale."
  },
  {
    id: "revenue",
    label: "Revenue",
    href: "/admin/revenue",
    icon: TrendingUp,
    description: "Gross and net revenue, average order value and sales by category.",
    columns: [],
    emptyTitle: "No revenue yet",
    emptyBody: "Revenue appears here after your first paid order."
  },
  {
    id: "products",
    label: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Catalogue, variants, stock and images. Backed by /api/products.",
    endpoint: "/api/products",
    columns: [
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "priceMinor", label: "Price", format: "money" },
      { key: "stock", label: "Stock" }
    ],
    emptyTitle: "No products yet",
    emptyBody: "Add your first product. It appears on the storefront as soon as it is published."
  },
  {
    id: "inventory",
    label: "Inventory",
    href: "/admin/inventory",
    icon: Warehouse,
    description: "Stock on hand, reorder alerts and manual stock adjustments.",
    endpoint: "/api/products",
    columns: [
      { key: "name", label: "Product" },
      { key: "stock", label: "On hand" }
    ],
    emptyTitle: "No stock to track",
    emptyBody: "Add products to start tracking inventory."
  },
  {
    id: "categories",
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    description: "Nested categories, slugs and navigation. Backed by /api/categories.",
    endpoint: "/api/categories",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" }
    ],
    emptyTitle: "No categories yet",
    emptyBody: "Create categories to help customers find products."
  },
  {
    id: "brands",
    label: "Brands",
    href: "/admin/brands",
    icon: Tag,
    description: "Brand directory, logos and brand pages. Backed by /api/brands.",
    endpoint: "/api/brands",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" }
    ],
    emptyTitle: "No brands yet",
    emptyBody: "Add brands to create brand pages and brand filters."
  },
  {
    id: "orders",
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "Order lifecycle from payment to delivery. Backed by /api/orders.",
    endpoint: "/api/orders",
    columns: [
      { key: "orderNumber", label: "Order" },
      { key: "status", label: "Status", format: "status" },
      { key: "totalMinor", label: "Total", format: "money" },
      { key: "createdAt", label: "Placed", format: "date" }
    ],
    emptyTitle: "No orders yet",
    emptyBody: "Orders appear here once customers check out."
  },
  {
    id: "couriers",
    label: "Couriers",
    href: "/admin/couriers",
    icon: PackageCheck,
    description: "Hand paid orders to a courier, print the tracking code and follow delivery status.",
    columns: [],
    emptyTitle: "No shipments yet",
    emptyBody: "Create a shipment from an order to hand it to a courier."
  },
  {
    id: "customers",
    label: "Users",
    href: "/admin/customers",
    icon: Users,
    description: "User accounts, roles and access. Backed by /api/users.",
    endpoint: "/api/users",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "createdAt", label: "Joined", format: "date" }
    ],
    emptyTitle: "No users yet",
    emptyBody: "Users appear here after they create an account or place an order."
  },
  {
    id: "coupons",
    label: "Coupons",
    href: "/admin/coupons",
    icon: Ticket,
    description: "Create percentage and fixed discounts, and turn them on or off. Backed by /api/coupons.",
    endpoint: "/api/coupons",
    columns: [
      { key: "code", label: "Code" },
      { key: "type", label: "Type" },
      { key: "value", label: "Value" },
      { key: "usedCount", label: "Used" }
    ],
    emptyTitle: "No coupons yet",
    emptyBody: "Create a coupon to run a promotion."
  },
  {
    id: "reviews",
    label: "Reviews",
    href: "/admin/reviews",
    icon: Star,
    description: "Approve reviews before they go live. Backed by /api/reviews.",
    endpoint: "/api/reviews",
    columns: [
      { key: "rating", label: "Rating" },
      { key: "comment", label: "Comment" },
      { key: "approved", label: "Approved" }
    ],
    emptyTitle: "Nothing to moderate",
    emptyBody: "New reviews wait here for approval."
  },
  {
    id: "shipping",
    label: "Shipping",
    href: "/admin/shipping",
    icon: Truck,
    description: "Delivery zones and rates, including free-shipping thresholds. Backed by /api/shipping/zones.",
    endpoint: "/api/shipping/zones",
    columns: [
      { key: "name", label: "Zone" },
      { key: "flatRateMinor", label: "Flat rate", format: "money" },
      { key: "freeOverMinor", label: "Free over", format: "money" }
    ],
    emptyTitle: "No delivery zones yet",
    emptyBody: "Add zones such as Inside Dhaka and Outside Dhaka to calculate shipping at checkout."
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    description: "Email notifications for order confirmations and shipping updates. Backed by /api/notifications.",
    columns: [],
    emptyTitle: "Email is not set up",
    emptyBody: "Add your SMTP settings to .env, then send a test email from this page."
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Store name, logo, contact details, social links and currency. Backed by /api/settings.",
    endpoint: "/api/settings",
    columns: [],
    emptyTitle: "Settings not saved yet",
    emptyBody: "Fill in your store details so receipts and the storefront show the right information."
  }
];

export type RoleId = "owner" | "manager" | "staff";

export const ADMIN_ROLES: { id: RoleId; label: string; description: string; features: FeatureId[] }[] = [
  {
    id: "owner",
    label: "Owner",
    description: "Full access, including settings.",
    features: ["overview", "revenue", "products", "inventory", "categories", "brands", "orders", "couriers", "customers", "coupons", "reviews", "shipping", "notifications", "settings"]
  },
  {
    id: "manager",
    label: "Manager",
    description: "Runs the catalogue, stock, orders and promotions.",
    features: ["overview", "revenue", "products", "inventory", "categories", "brands", "orders", "couriers", "customers", "coupons", "reviews", "shipping"]
  },
  {
    id: "staff",
    label: "Staff",
    description: "Customer support, order handling and courier dispatch.",
    features: ["overview", "orders", "couriers", "customers", "reviews"]
  }
];

export function canAccess(role: RoleId, feature: FeatureId): boolean {
  return ADMIN_ROLES.find((r) => r.id === role)?.features.includes(feature) ?? false;
}

export function getFeature(id: string): AdminFeature | undefined {
  return ADMIN_FEATURES.find((feature) => feature.id === id);
}

/** Sidebar sections. Every feature id appears in exactly one group. */
export const FEATURE_GROUPS: { label: string; ids: FeatureId[] }[] = [
  { label: "Overview", ids: ["overview", "revenue"] },
  { label: "Catalogue", ids: ["products", "inventory", "categories", "brands", "reviews"] },
  { label: "Sales", ids: ["orders", "couriers", "coupons"] },
  { label: "People", ids: ["customers"] },
  { label: "Store", ids: ["shipping", "notifications", "settings"] }
];
