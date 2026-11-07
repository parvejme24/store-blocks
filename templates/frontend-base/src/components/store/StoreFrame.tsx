import type { StoreTemplate } from "@/templates/types";
import { templateStyle } from "@/templates/tokens";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { StoreProviders } from "./StoreProviders";

/**
 * Shell for every storefront page. Applies the template's colour tokens to the
 * whole subtree, including the shared header and footer.
 *
 * `basePath` is "" for the main store and "/themes/<id>" for a theme's own site,
 * so every shop link stays inside that site. Theme sites also get the demo cart,
 * product, checkout and sign-in pages.
 */
export function StoreFrame({
  template,
  basePath = "",
  children
}: {
  template: StoreTemplate;
  basePath?: string;
  children: React.ReactNode;
}) {
  const isThemeSite = basePath !== "";
  const links = {
    shopHref: `${basePath}/products`,
    homeHref: basePath || "/",
    adminHref: `${basePath}/admin`,
    cartHref: isThemeSite ? `${basePath}/cart` : undefined,
    loginHref: isThemeSite ? `${basePath}/login` : undefined
  };

  return (
    <div
      style={templateStyle(template)}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <StoreProviders basePath={basePath} themeId={template.id}>
        <SiteHeader {...links} />
        <main className="flex-1">{children}</main>
        <SiteFooter {...links} />
      </StoreProviders>
    </div>
  );
}
