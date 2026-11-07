import type { ComponentType } from "react";

/** Semantic colour tokens a template can override. Values are HSL channels, e.g. "265 90% 66%". */
export type TokenName =
  | "background"
  | "foreground"
  | "card"
  | "primary"
  | "primary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "border";

export type TemplateProduct = {
  id: string;
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  category?: string;
  stock?: number;
  rating?: number;
  imageUrl?: string;
  imageAlt?: string;
};

export type TemplateHomeProps = {
  products: TemplateProduct[];
  /** Link target for "shop" buttons. Keeps links inside the theme's own site. */
  shopHref: string;
};

export type StoreTemplate = {
  id: string;
  name: string;
  tagline: string;
  /** Short description shown in the gallery. */
  description: string;
  /** Business category shown on the StoreBlocks landing page, e.g. "Grocery & daily essentials". */
  category: string;
  /** Value for `create-storeblocks --layout`, e.g. "grocery". */
  cliLayout: string;
  /** Optional preview image at public/themes/<id>.webp, 1600 x 1000 px (16:10). Without it, the card shows the category name. */
  thumbnail?: string;
  tokens: Record<TokenName, string>;
  /** Demo products shown when the API returns none, so the template always looks complete. */
  samples: TemplateProduct[];
  /** Home page body, rendered between the shared header and footer. */
  Home: ComponentType<TemplateHomeProps>;
};
