"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ClipboardList,
  Sliders,
  Star,
  Tag,
  Users,
  CloudUpload,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function AdminGuidePage() {
  const sections = [
    {
      id: "products",
      title: "Product & Variant Catalog Management",
      icon: ShoppingBag,
      description: "Create, edit, organize, and track stock for single items and complex multi-variant goods.",
      workflow: [
        "Navigate to /admin/products and click 'Add New Product'",
        "Enter product title, SEO slug, and full description (Markdown supported)",
        "Specify base pricing in Integer Minor Units (e.g. ৳2,500.00 is stored as 250000 minor units to prevent float precision rounding errors)",
        "Configure Multi-Variant options (e.g. Size: S, M, L, XL; Color: Black, Burgundy, Slate)",
        "Attach media items via the Drag-and-Drop Direct Storage Uploader. Files are signed and transferred directly to your chosen cloud provider (Cloudinary or S3/R2)",
        "Set initial inventory quantity. Out-of-stock badges trigger automatically when stock hits zero"
      ]
    },
    {
      id: "categories",
      title: "Nested Category Hierarchy & Slugs",
      icon: FolderTree,
      description: "Organize products into hierarchical parent/child collections for intuitive storefront navigation.",
      workflow: [
        "Navigate to /admin/categories",
        "Define root departments (e.g. 'Men', 'Women', 'Electronics', 'Living')",
        "Create sub-categories by setting the parentCategoryId reference",
        "Upload category banner assets and set localized display order",
        "Categories automatically generate clean storefront URL routes (e.g. /categories/mens-footwear)"
      ]
    },
    {
      id: "orders",
      title: "Order Fulfillment & Status Lifecycle",
      icon: ClipboardList,
      description: "Manage incoming customer orders through a structured, multi-stage state machine.",
      workflow: [
        "New orders enter with status 'pending' and payment status 'pending' (for Cash on Delivery) or 'paid' (for SSLCommerz/Stripe)",
        "Store administrator reviews customer delivery details and phone number",
        "Click 'Confirm Order' to advance status to 'confirmed'. Stock decrement is locked",
        "Click 'Mark as Processing' once packaging commences in warehouse",
        "Enter courier tracking ID (e.g. Steadfast, Pathao, Sundarban, DHL) and advance status to 'shipped'. Automated customer notification triggers",
        "Once courier confirms collection of payment and package handover, status moves to 'delivered'"
      ]
    },
    {
      id: "reviews",
      title: "Review Moderation Queue & Badges",
      icon: Star,
      description: "Maintain high catalog integrity by moderating user submissions before they appear publicly.",
      workflow: [
        "Customer submissions arrive in /admin/reviews in 'pending approval' status",
        "System automatically cross-references customer email and order history to assign the 'Verified Purchase' badge",
        "Admin inspects review text for spam or inappropriate language",
        "Approve review to publish it immediately to the product page and recalculate the aggregate rating score"
      ]
    },
    {
      id: "coupons",
      title: "Promotional Coupons & Discount Rules",
      icon: Tag,
      description: "Create targeted marketing campaigns with fixed or percentage deductions and strict usage thresholds.",
      workflow: [
        "Click 'Create Coupon' in /admin/coupons",
        "Define unique coupon code (e.g. 'EID2026', 'WELCOME10')",
        "Select Discount Type: 'percentage' (e.g. 15% off) or 'fixed' (e.g. ৳500 off)",
        "Set Minimum Cart Amount (e.g. requires cart subtotal of at least ৳2,000)",
        "Set Expiry Date and Total Redemptions Limit (e.g. first 200 customers only)",
        "Cart drawer validates code rules in real-time via POST /api/coupons/validate"
      ]
    },
    {
      id: "settings",
      title: "Store Settings & Runtime Theme Customization",
      icon: Sliders,
      description: "Configure your global brand identity, contact information, default currency, and active visual theme without re-deploying.",
      workflow: [
        "Navigate to /admin/settings",
        "Update Store Name, Tagline, Support Phone, and Official Email",
        "Upload Store Logo and Favicon",
        "Set Default Currency (BDT, USD, EUR, GBP)",
        "Switch active theme at runtime between 'Minimal', 'Bold', and 'Elegant'. CSS variables update immediately across all storefront pages",
        "Save changes. All settings persist in the database and are served with 60-second caching"
      ]
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border bg-secondary/60 px-3 py-1 text-xs font-semibold text-primary mb-3">
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Operational Administration Guide</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Admin Dashboard User Guide
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
          Step-by-step walkthrough of the StoreBlocks Admin Panel (/admin). Learn how to manage products, direct cloud uploads, fulfillment workflows, and store settings.
        </p>
      </div>

      {/* Admin Access Notice */}
      <div className="rounded-xl border bg-card p-6 shadow-xs flex items-start gap-4">
        <ShieldAlert className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-foreground text-sm">Administrator Role Requirement</h4>
          <p className="text-muted-foreground leading-relaxed">
            All routes under <code className="font-mono text-foreground font-semibold">/admin/*</code> require an authenticated session with <code className="font-mono text-foreground font-semibold">role: "admin"</code>. Initial administrator credentials can be seeded at startup using <code className="font-mono text-foreground font-semibold">npm run seed:admin</code> or configured via your environment variables.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.id}
              id={section.id}
              className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs space-y-6 scroll-mt-20"
            >
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{section.title}</h2>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Operational Workflow & Best Practices
                </h4>
                <ol className="space-y-2.5 text-xs">
                  {section.workflow.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-foreground/90 leading-relaxed">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-foreground">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

