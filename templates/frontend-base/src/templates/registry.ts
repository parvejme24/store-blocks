import { cosmeticsTemplate } from "./cosmetics";
import { defaultTemplate } from "./default";
import { electronicsTemplate } from "./electronics";
import { fashionTemplate } from "./fashion";
import { groceryTemplate } from "./grocery";
import { medicineTemplate } from "./medicine";
import { organicTemplate } from "./organic";
import type { StoreTemplate } from "./types";

/**
 * Every storefront template. To add a store type, create src/templates/<id>/index.tsx
 * that exports a StoreTemplate, then add it here. It then appears on the StoreBlocks
 * landing page and can be selected with `create-storeblocks --layout <cliLayout>`.
 */
export const STORE_TEMPLATES: StoreTemplate[] = [
  defaultTemplate,
  fashionTemplate,
  groceryTemplate,
  cosmeticsTemplate,
  medicineTemplate,
  organicTemplate,
  electronicsTemplate
];

export const DEFAULT_TEMPLATE = defaultTemplate;

/** Returns the template with this id, or the default template if the id is unknown. */
export function getTemplate(id: string | undefined): StoreTemplate {
  return STORE_TEMPLATES.find((template) => template.id === id) ?? DEFAULT_TEMPLATE;
}
