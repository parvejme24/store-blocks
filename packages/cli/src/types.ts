/** Store types. Each maps to a storefront template id in the generated frontend. */
export const LAYOUTS = ["fashion", "electronics", "grocery", "cosmetics", "medicine", "organic", "general", "landing"] as const;
export type Layout = (typeof LAYOUTS)[number];

export function isLayout(value: unknown): value is Layout {
  return typeof value === "string" && (LAYOUTS as readonly string[]).includes(value);
}

export interface UserChoices {
  projectName: string;
  targetDir: string;
  features: string[];
  database: "mongodb" | "postgresql";
  storage: "cloudinary" | "s3" | "local";
  payments: Array<"cod" | "sslcommerz" | "stripe" | string>;
  layout: Layout;
  theme: "minimal" | "bold" | "elegant";
  packageManager: "npm";
}

export interface StoreConfig {
  name: string;
  database: "mongodb" | "postgresql";
  storage: "cloudinary" | "s3" | "local";
  payments: string[];
  layout: string;
  theme: string;
  modules: string[];
  createdAt: string;
}

export interface GenerationPlan {
  choices: UserChoices;
  allModules: string[];
  envVars: string[];
  optionalEnvVars: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  imageHosts: string[];
}

