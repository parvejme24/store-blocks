import {
  BookOpen,
  Database,
  LayoutDashboard,
  Wrench,
  type LucideIcon
} from "lucide-react";

/**
 * Single source of truth for the documentation sidebar, mobile drawer,
 * breadcrumbs and previous / next pagination.
 *
 * Every `hash` must match an element id on the page at `href`.
 */

export type DocAnchor = {
  title: string;
  hash: string;
};

export type DocPage = {
  title: string;
  href: string;
  anchors?: DocAnchor[];
};

export type DocGroup = {
  label: string;
  icon: LucideIcon;
  pages: DocPage[];
};

export const DOC_GROUPS: DocGroup[] = [
  {
    label: "Get started",
    icon: BookOpen,
    pages: [
      {
        title: "Overview",
        href: "/docs",
        anchors: [
          { title: "Quick start", hash: "quickstart" },
          { title: "Project configurator", hash: "configurator" }
        ]
      },
      {
        title: "Roadmap",
        href: "/docs/planning",
        anchors: [
          { title: "Guiding principles", hash: "principles" },
          { title: "Phase progression", hash: "progression" }
        ]
      }
    ]
  },
  {
    label: "Build",
    icon: Wrench,
    pages: [
      {
        title: "CLI scaffolder",
        href: "/docs/cli",
        anchors: [
          { title: "Flags", hash: "flags" },
          { title: "Generation pipeline", hash: "pipeline" }
        ]
      },
      {
        title: "Developer tools",
        href: "/docs/tools",
        anchors: [
          { title: "Manifest validator", hash: "manifest-validator" },
          { title: "Migrations & Studio", hash: "db-migrations" },
          { title: "Seed scripts", hash: "seeding" },
          { title: "Contract tests", hash: "contract-tests" },
          { title: "Doctor", hash: "doctor" }
        ]
      },
      {
        title: "Architecture",
        href: "/docs/architecture",
        anchors: [
          { title: "Layering rules", hash: "layering" },
          { title: "Dynamic module loader", hash: "dynamic-loader" },
          { title: "UnitOfWork & contracts", hash: "contracts" }
        ]
      },
      { title: "Modules catalog", href: "/docs/modules" }
    ]
  },
  {
    label: "Platform",
    icon: Database,
    pages: [
      {
        title: "Databases",
        href: "/docs/databases",
        anchors: [
          { title: "MongoDB (Mongoose)", hash: "mongodb" },
          { title: "PostgreSQL (Drizzle)", hash: "postgresql" },
          { title: "Repository parity", hash: "parity" }
        ]
      },
      {
        title: "Media storage",
        href: "/docs/storage",
        anchors: [
          { title: "Cloudinary", hash: "cloudinary" },
          { title: "S3, R2 & MinIO", hash: "s3" },
          { title: "Local disk", hash: "local" }
        ]
      },
      {
        title: "Payments",
        href: "/docs/payments",
        anchors: [
          { title: "Cash on delivery", hash: "cod" },
          { title: "SSLCommerz", hash: "sslcommerz" },
          { title: "Stripe", hash: "stripe" }
        ]
      },
      {
        title: "Themes & layouts",
        href: "/docs/themes-layouts",
        anchors: [
          { title: "Visual themes", hash: "themes" },
          { title: "Product layouts", hash: "layouts" },
          { title: "Fashion", hash: "fashion" },
          { title: "Electronics", hash: "electronics" },
          { title: "Grocery", hash: "grocery" },
          { title: "Landing page", hash: "landing" }
        ]
      }
    ]
  },
  {
    label: "Operate",
    icon: LayoutDashboard,
    pages: [
      {
        title: "Admin dashboard",
        href: "/docs/admin-guide",
        anchors: [
          { title: "Products", hash: "products" },
          { title: "Categories", hash: "categories" },
          { title: "Orders", hash: "orders" },
          { title: "Reviews", hash: "reviews" },
          { title: "Coupons", hash: "coupons" },
          { title: "Settings", hash: "settings" }
        ]
      },
      {
        title: "Deployment",
        href: "/docs/deployment",
        anchors: [
          { title: "Cloud databases", hash: "databases" },
          { title: "Storage CORS", hash: "cors" },
          { title: "Launch checklist", hash: "checklist" }
        ]
      }
    ]
  }
];

/** Every documentation page in reading order, used for previous / next links. */
export const DOC_PAGES: DocPage[] = DOC_GROUPS.flatMap((group) => group.pages);

/** Filters groups by a lowercase query, matching page titles and anchor titles. */
export function filterDocGroups(query: string): DocGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return DOC_GROUPS;

  return DOC_GROUPS.map((group) => ({
    ...group,
    pages: group.pages.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        (page.anchors ?? []).some((anchor) => anchor.title.toLowerCase().includes(q))
    )
  })).filter((group) => group.pages.length > 0);
}
