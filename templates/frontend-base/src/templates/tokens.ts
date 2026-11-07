import type { CSSProperties } from "react";
import type { StoreTemplate } from "./types";

/**
 * Turns a template's token map into CSS custom properties for its subtree,
 * e.g. { background: "40 33% 98%" } -> { "--background": "40 33% 98%" }.
 * Tailwind's `hsl(var(--background))` colours then follow the template.
 */
export function templateStyle(template: StoreTemplate): CSSProperties {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(template.tokens)) {
    vars[`--${name}`] = value;
  }
  // React accepts custom properties in style objects, but CSSProperties has no index signature for them.
  return vars as CSSProperties;
}
