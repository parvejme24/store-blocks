import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { STORE_TEMPLATES } from "@/templates/registry";

const STATIC_PAGES = ["", "/shop", "/products", "/docs", "/docs/architecture", "/docs/cli", "/docs/modules", "/docs/deployment"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    ...STATIC_PAGES.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: now, priority: path === "" ? 1 : 0.7 })),
    ...STORE_TEMPLATES.map((template) => ({ url: `${SITE_URL}/themes/${template.id}`, lastModified: now, priority: 0.5 }))
  ];
  return pages;
}
