import { HOME_MODE, STORE_NAME } from "@/config/storefront";

/** Public site address, used for canonical URLs, the sitemap and Open Graph. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Name shown in titles. The StoreBlocks product site uses its own name; generated stores use their store name. */
export const SITE_NAME = HOME_MODE === "landing" ? "StoreBlocks" : STORE_NAME;

export const SITE_TAGLINE =
  HOME_MODE === "landing"
    ? "Build a modular e-commerce store in minutes"
    : "Shop online with fast delivery and secure checkout";

export const SITE_DESCRIPTION =
  HOME_MODE === "landing"
    ? "StoreBlocks is an open-source CLI that scaffolds a full-stack e-commerce store with an API, a storefront and an admin dashboard. Choose grocery, fashion, cosmetics, medicine or electronics, pick your database, storage and payments, and run it in minutes."
    : `${STORE_NAME} is an online store. Browse products, check out securely and track your orders.`;

export const SITE_KEYWORDS =
  HOME_MODE === "landing"
    ? ["e-commerce starter", "Next.js ecommerce template", "online store generator", "MongoDB PostgreSQL ecommerce", "create-storeblocks", "headless commerce", "open source ecommerce"]
    : [STORE_NAME, "online shop", "buy online"];
