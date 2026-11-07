/**
 * Storefront settings. The CLI writes these when it generates a project.
 *
 * HOME_MODE:
 *   "landing" - the root page is the StoreBlocks product page (this demo site).
 *   "store"   - the root page is the shop home for the chosen store type.
 * The shop home is always available at /shop.
 */
export const HOME_MODE: "landing" | "store" = "landing";

/** Template id for the shop home, e.g. "grocery". See src/templates/registry.ts. */
export const ACTIVE_TEMPLATE_ID = "default";

/** Store name used in page titles, Open Graph tags and the sitemap. The CLI sets this to the project name. */
export const STORE_NAME = "StoreBlocks";
