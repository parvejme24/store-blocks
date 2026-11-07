import Link from "next/link";
import { ShoppingBag } from "lucide-react";

type SiteFooterProps = {
  shopHref: string;
  homeHref: string;
  adminHref: string;
};

/** Storefront footer. Uses template tokens, so it re-colours with each store type. */
export function SiteFooter({ shopHref, homeHref, adminHref }: SiteFooterProps) {
  const columns = [
    {
      title: "Store",
      links: [
        { label: "All products", href: shopHref },
        { label: "Home", href: homeHref }
      ]
    },
    {
      title: "Developers",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Architecture", href: "/docs/architecture" },
        { label: "Modules", href: "/docs/modules" },
        { label: "Deployment", href: "/docs/deployment" }
      ]
    },
    {
      title: "Admin",
      links: [
        { label: "Dashboard", href: adminHref },
        { label: "Products", href: `${adminHref}/products` },
        { label: "Orders", href: `${adminHref}/orders` }
      ]
    }
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link href={homeHref} className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>StoreBlocks</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A modular e-commerce foundation. Pick the blocks you need, add your keys, and launch.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} StoreBlocks Store. All rights reserved.</p>
          <p>Built with StoreBlocks</p>
        </div>
      </div>
    </footer>
  );
}
