import { z } from "zod";

const envVarRegex = /^[A-Z][A-Z0-9_]*$/;
const moduleNameRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const variantDbSchema = z.object({
  path: z.string().min(1),
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
  env: z.array(z.string().regex(envVarRegex, "Env variable must be UPPER_SNAKE_CASE")).optional()
});

export const manifestSchema = z.object({
  $schema: z.string().optional(),
  name: z
    .string()
    .min(1)
    .regex(moduleNameRegex, "Module name must be kebab-case (e.g. 'products', 'social-boost')"),
  label: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["core", "feature", "payment", "storage"]),
  dependsOn: z.array(z.string()).optional().default([]),
  uses: z.array(z.string()).optional().default([]),
  env: z
    .array(z.string().regex(envVarRegex, "Env variable must be UPPER_SNAKE_CASE"))
    .optional()
    .default([]),
  optionalEnv: z
    .array(z.string().regex(envVarRegex, "Optional env variable must be UPPER_SNAKE_CASE"))
    .optional()
    .default([]),
  dependencies: z.record(z.string()).optional().default({}),
  devDependencies: z.record(z.string()).optional().default({}),
  variants: z
    .object({
      db: z
        .object({
          mongodb: variantDbSchema,
          postgresql: variantDbSchema
        })
        .optional()
    })
    .optional(),
  backend: z
    .object({
      basePath: z.string().startsWith("/").optional()
    })
    .optional(),
  frontend: z
    .object({
      apiSlice: z.string().optional(),
      adminMenu: z
        .object({
          label: z.string(),
          icon: z.string(),
          href: z.string()
        })
        .optional(),
      storefrontComponents: z.array(z.string()).optional(),
      imageHosts: z.array(z.string()).optional()
    })
    .optional(),
  since: z.string().regex(/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/, "Must be a valid semver version (e.g. '0.1.0')")
});

export type ModuleManifest = z.infer<typeof manifestSchema>;

