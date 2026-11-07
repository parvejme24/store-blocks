"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useDemoCart } from "./StoreProviders";

type SiteHeaderProps = {
  /** Where "Shop" goes: /products, or /themes/<id>/products inside a theme site. */
  shopHref: string;
  /** Where the logo goes: / or /themes/<id>. */
  homeHref: string;
  /** Admin dashboard for this site: /admin or /themes/<id>/admin. */
  adminHref: string;
  /** Cart page. Only set on theme sites. */
  cartHref?: string;
  /** Sign-in page. Only set on theme sites. */
  loginHref?: string;
};

/** Storefront header. Uses template tokens, so it re-colours with each store type. */
export function SiteHeader({ shopHref, homeHref, adminHref, cartHref, loginHref }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const cart = useDemoCart();

  const navLinks = [
    { label: "Shop", href: shopHref },
    ...(loginHref ? [{ label: "Sign in", href: loginHref }] : [{ label: "Account", href: "/account" }]),
    { label: "Docs", href: "/docs" },
    { label: "Admin", href: adminHref }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={homeHref} className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>StoreBlocks</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {cartHref && (
            <Link
              href={cartHref}
              aria-label={`Cart, ${cart.ready ? cart.count : 0} items`}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {cart.ready && cart.count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground tabular-nums">
                  {cart.count}
                </span>
              )}
            </Link>
          )}
          <Link
            href={shopHref}
            className="hidden items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Shop now
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-background px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href={shopHref}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Shop now
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
