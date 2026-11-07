import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import { Layout, UserChoices } from "./types.js";

export async function runInteractivePrompts(defaultName?: string): Promise<UserChoices> {
  p.intro(pc.bgCyan(pc.black(" StoreBlocks — E-Commerce Project Scaffolder ")));

  const projectName = await p.text({
    message: "What is your project named?",
    placeholder: "my-shop",
    defaultValue: defaultName || "my-shop",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Project name cannot be empty.";
      if (!/^[a-z0-9-_]+$/i.test(value.trim())) {
        return "Project name can only contain letters, numbers, hyphens, and underscores.";
      }
    }
  });

  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const database = await p.select({
    message: "Which database do you want to use?",
    options: [
      { value: "mongodb", label: "MongoDB", hint: "Mongoose ODM (Atlas or local replica set)" },
      { value: "postgresql", label: "PostgreSQL", hint: "Drizzle ORM + typed migrations" }
    ]
  });

  if (p.isCancel(database)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const features = await p.multiselect({
    message: "Select additional features to install:",
    options: [
      { value: "cart", label: "Cart", hint: "Guest cart tokens & user synchronization" },
      { value: "coupons", label: "Discount Coupons", hint: "Percentage & fixed promo codes" },
      { value: "reviews", label: "Product Reviews", hint: "Customer ratings & admin approval" },
      { value: "brands", label: "Brands & Manufacturers", hint: "Brand directory & filtering" },
      { value: "wishlist", label: "Wishlist", hint: "Customer saved items & toggle" },
      { value: "shipping", label: "Custom Shipping Rates", hint: "Configurable delivery zones & rules" }
    ],
    required: false
  });

  if (p.isCancel(features)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const storage = await p.select({
    message: "Which media storage provider do you want to use?",
    options: [
      { value: "cloudinary", label: "Cloudinary", hint: "Hosted images with on-the-fly transformations" },
      { value: "s3", label: "AWS S3 / S3-compatible", hint: "AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces" },
      { value: "local", label: "Local disk", hint: "Development and single-server deployments" }
    ]
  });

  if (p.isCancel(storage)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const payments = await p.multiselect({
    message: "Which payment gateways do you want to enable?",
    options: [
      { value: "cod", label: "Cash on Delivery", hint: "Pay upon physical delivery" },
      { value: "sslcommerz", label: "SSLCommerz", hint: "Cards, bKash, Nagad, Rocket (Bangladesh)" },
      { value: "stripe", label: "Stripe", hint: "Global Cards, Apple Pay, Google Pay" }
    ],
    required: true
  });

  if (p.isCancel(payments)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const layout = await p.select({
    message: "Select a storefront layout for your product type:",
    options: [
      { value: "fashion", label: "Fashion & Apparel", hint: "Image galleries, size/color variant swatches" },
      { value: "electronics", label: "Electronics & Gadgets", hint: "Tech specs, comparison tables" },
      { value: "grocery", label: "Grocery & Daily Essentials", hint: "Delivery slots, aisle shortcuts, fresh grid" },
      { value: "cosmetics", label: "Beauty & Skincare", hint: "Concern-based shopping, bestsellers, routines" },
      { value: "medicine", label: "Medicine & Pharmacy", hint: "Health-need categories, search, prescription band" },
      { value: "organic", label: "Organic & Natural Food", hint: "Farm-origin hero, pantry categories, story band" },
      { value: "general", label: "General Store", hint: "Bold hero and clean product grid for any catalogue" },
      { value: "landing", label: "Single-Product Landing", hint: "High-conversion sales funnel" }
    ]
  });

  if (p.isCancel(layout)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const theme = await p.select({
    message: "Select a design theme:",
    options: [
      { value: "minimal", label: "Minimal", hint: "Clean typography, neutral monochrome accents" },
      { value: "bold", label: "Bold", hint: "Vibrant accents, high contrast typography" },
      { value: "elegant", label: "Elegant", hint: "Warm tones, serif headings, subtle borders" }
    ]
  });

  if (p.isCancel(theme)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const targetDir = path.resolve(process.cwd(), projectName as string);

  return {
    projectName: projectName as string,
    targetDir,
    features: [
      "products",
      "categories",
      "orders",
      "users",
      "auth",
      "settings",
      ...((features as string[]) || [])
    ],
    database: database as "mongodb" | "postgresql",
    storage: storage as "cloudinary" | "s3" | "local",
    payments: payments as string[],
    layout: layout as Layout,
    theme: theme as any,
    packageManager: "npm"
  };
}

