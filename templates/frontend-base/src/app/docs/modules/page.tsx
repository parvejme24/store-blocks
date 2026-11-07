"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ArrowLeft,
  ArrowRight,
  Database,
  CloudUpload,
  CreditCard,
  KeyRound,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  Tag,
  Heart,
  Truck,
  Share2,
  Mail,
  Ticket,
  Star
} from "lucide-react";

interface DocModule {
  name: string;
  label: string;
  type: "core" | "feature" | "storage" | "payment";
  description: string;
  icon: LucideIcon;
  dependsOn?: string[];
  uses?: string[];
  basePath?: string;
  env?: string[];
  dbVariants?: boolean;
}

const modulesData: DocModule[] = [
  {
    name: "products",
    label: "Products",
    type: "core",
    description: "Product catalog CRUD, size/color variants, SKU, stock decrements, and text search.",
    icon: Package,
    uses: ["storage"],
    basePath: "/api/products",
    dbVariants: true
  },
  {
    name: "categories",
    label: "Categories",
    type: "core",
    description: "Hierarchical nested categories, parent-child navigation, and category slugs.",
    icon: FolderTree,
    basePath: "/api/categories",
    dbVariants: true
  },
  {
    name: "users",
    label: "Users & Profiles",
    type: "core",
    description: "Customer accounts, address book, role management (customer/admin), and admin user directory.",
    icon: Users,
    basePath: "/api/users",
    dbVariants: true
  },
  {
    name: "auth",
    label: "Authentication",
    type: "core",
    description: "JWT access & httpOnly refresh tokens, bcrypt password hashing, and RBAC middlewares.",
    icon: KeyRound,
    dependsOn: ["users"],
    basePath: "/api/auth",
    dbVariants: false
  },
  {
    name: "orders",
    label: "Orders & Checkout",
    type: "core",
    description: "Complete order lifecycle state machine, atomic stock decrement in UnitOfWork, and admin fulfillment.",
    icon: ShoppingCart,
    dependsOn: ["products"],
    uses: ["payments"],
    basePath: "/api/orders",
    dbVariants: true
  },
  {
    name: "settings",
    label: "Store Settings",
    type: "core",
    description: "Store name, logo, contact information, currency, and social media links.",
    icon: Settings,
    basePath: "/api/settings",
    dbVariants: true
  },
  {
    name: "cart",
    label: "Shopping Cart",
    type: "feature",
    description: "Guest cart tokens with automatic synchronization and item merge on user login.",
    icon: ShoppingCart,
    dependsOn: ["products"],
    basePath: "/api/cart",
    dbVariants: true
  },
  {
    name: "coupons",
    label: "Discount Coupons",
    type: "feature",
    description: "Percentage and fixed promo codes, minimum order requirements, and usage limits.",
    icon: Ticket,
    basePath: "/api/coupons",
    dbVariants: true
  },
  {
    name: "reviews",
    label: "Product Reviews",
    type: "feature",
    description: "Customer star ratings and written reviews, published only after admin approval.",
    icon: Star,
    dependsOn: ["auth", "products"],
    basePath: "/api/reviews",
    dbVariants: true
  },
  {
    name: "brands",
    label: "Brands & Manufacturers",
    type: "feature",
    description: "Brand directory, brand logos, website URLs, and brand-filtered product showcases.",
    icon: Tag,
    dependsOn: ["products"],
    basePath: "/api/brands",
    dbVariants: true
  },
  {
    name: "wishlist",
    label: "Customer Wishlist",
    type: "feature",
    description: "Customer saved favorites list, toggle items, and quick add-to-cart transfer.",
    icon: Heart,
    dependsOn: ["auth", "products"],
    basePath: "/api/wishlist",
    dbVariants: true
  },
  {
    name: "shipping",
    label: "Shipping Rates Engine",
    type: "feature",
    description: "Regional delivery rates (Inside/Outside Dhaka), flat rates, and free shipping thresholds.",
    icon: Truck,
    basePath: "/api/shipping",
    dbVariants: true
  },
  {
    name: "social-boost",
    label: "Social Boost & Feeds",
    type: "feature",
    description: "XML product catalog RSS feed for Google Merchant & Meta, plus pre-built social share links.",
    icon: Share2,
    dependsOn: ["products"],
    basePath: "/api/social",
    dbVariants: false
  },
  {
    name: "notifications",
    label: "Email Notifications",
    type: "feature",
    description: "Transactional SMTP emails with Nodemailer for order confirmations and status changes.",
    icon: Mail,
    dependsOn: ["orders"],
    env: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"],
    basePath: "/api/notifications",
    dbVariants: false
  },
  {
    name: "storage-cloudinary",
    label: "Cloudinary Storage",
    type: "storage",
    description: "Hosted media storage with signed direct uploads and on-the-fly image resizing.",
    icon: CloudUpload,
    env: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
  },
  {
    name: "storage-s3",
    label: "AWS S3 / R2 / MinIO",
    type: "storage",
    description: "Object storage using AWS S3, Cloudflare R2, MinIO, or DigitalOcean Spaces via presigned PUT URLs.",
    icon: CloudUpload,
    env: ["S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"]
  },
  {
    name: "storage-local",
    label: "Local Disk Storage",
    type: "storage",
    description: "Local disk storage for development and single-server VPS setups.",
    icon: CloudUpload
  },
  {
    name: "payment-cod",
    label: "Cash on Delivery",
    type: "payment",
    description: "Allows customers to pay in cash upon physical receipt of order.",
    icon: CreditCard
  },
  {
    name: "payment-sslcommerz",
    label: "SSLCommerz Gateway",
    type: "payment",
    description: "Bangladeshi payment gateway supporting Visa/Mastercard, bKash, Nagad, and Rocket.",
    icon: CreditCard,
    env: ["SSLC_STORE_ID", "SSLC_STORE_PASSWD"]
  },
  {
    name: "payment-stripe",
    label: "Stripe Gateway",
    type: "payment",
    description: "Global credit/debit card processing, Apple Pay, Google Pay, and webhook signature verification.",
    icon: CreditCard,
    env: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
  }
];

export default function ModulesDocPage() {
  const [filter, setFilter] = useState<string>("all");

  const filteredModules =
    filter === "all"
      ? modulesData
      : modulesData.filter((m) => m.type === filter);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Introduction
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Module Directory & Catalog
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          StoreBlocks contains 19 self-contained modules and adapters. Each feature module lives in its own folder and mounts automatically.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {[
          { id: "all", label: "All Modules (19)" },
          { id: "core", label: "Core Modules (6)" },
          { id: "feature", label: "Optional Features (7)" },
          { id: "storage", label: "Storage Adapters (3)" },
          { id: "payment", label: "Payment Gateways (3)" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredModules.map((mod) => (
          <div key={mod.name} className="rounded-lg border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-md bg-secondary p-2 text-primary">
                  <mod.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{mod.label}</h3>
                  <code className="text-xs text-muted-foreground">{mod.name}</code>
                </div>
              </div>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  mod.type === "core"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    : mod.type === "storage"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    : mod.type === "payment"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-secondary text-foreground"
                }`}
              >
                {mod.type}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-normal">
              {mod.description}
            </p>

            <div className="border-t pt-3 space-y-1.5 text-xs">
              {mod.basePath && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Endpoint:</span>
                  <code className="bg-muted px-1 rounded">{mod.basePath}</code>
                </div>
              )}
              {mod.dbVariants && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Databases:</span>
                  <span className="text-foreground font-medium">MongoDB & PostgreSQL</span>
                </div>
              )}
              {mod.dependsOn && mod.dependsOn.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Depends on:</span>
                  <span className="text-foreground">{mod.dependsOn.join(", ")}</span>
                </div>
              )}
              {mod.env && mod.env.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Env vars:</span>
                  <span className="text-foreground">{mod.env.length} required</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="border-t pt-8 flex items-center justify-between">
        <Link
          href="/docs/architecture"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Architecture Guide
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Back to Quick Start <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

