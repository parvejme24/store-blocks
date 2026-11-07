import path from "node:path";
import fs from "fs-extra";
import { UserChoices, GenerationPlan } from "./types.js";

export function resolvePlan(
  choices: UserChoices,
  templatesDir: string
): GenerationPlan {
  const modulesDir = path.join(templatesDir, "modules");

  // Read all manifests in templates/modules
  const manifests = new Map<string, any>();

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const manifestPath = path.join(full, "module.json");
        if (fs.existsSync(manifestPath)) {
          const json = fs.readJsonSync(manifestPath);
          manifests.set(json.name, { manifest: json, dir: full });
        }
        scan(full);
      }
    }
  }

  scan(modulesDir);

  // 1. Initial set of modules
  const selectedModules = new Set<string>();

  // Always include core modules
  for (const [name, { manifest }] of manifests.entries()) {
    if (manifest.type === "core") {
      selectedModules.add(name);
    }
  }

  // Include user requested features
  for (const f of choices.features) {
    selectedModules.add(f);
  }

  // Storage selection
  const storageAdapterName = `storage-${choices.storage}`;
  selectedModules.add(storageAdapterName);

  // Payment selection
  for (const p of choices.payments) {
    const paymentAdapterName = `payment-${p}`;
    selectedModules.add(paymentAdapterName);
  }

  // 2. Recursive dependency resolution (dependsOn)
  let changed = true;
  while (changed) {
    changed = false;
    for (const modName of Array.from(selectedModules)) {
      const mod = manifests.get(modName);
      if (mod?.manifest.dependsOn) {
        for (const dep of mod.manifest.dependsOn) {
          if (!selectedModules.has(dep)) {
            selectedModules.add(dep);
            changed = true;
          }
        }
      }
    }
  }

  // 3. Collect dependencies, env, devDependencies
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  const envVars = new Set<string>();
  const optionalEnvVars = new Set<string>();
  const imageHosts = new Set<string>();

  // Add db specific env
  if (choices.database === "mongodb") {
    envVars.add("MONGODB_URI");
  } else {
    envVars.add("DATABASE_URL");
    devDependencies["drizzle-kit"] = "~0.30";
    dependencies["drizzle-orm"] = "~0.36";
    dependencies["pg"] = "^8";
    devDependencies["@types/pg"] = "^8";
  }

  for (const modName of selectedModules) {
    const mod = manifests.get(modName);
    if (!mod) continue;

    const manifest = mod.manifest;

    // Top-level dependencies
    if (manifest.dependencies) {
      Object.assign(dependencies, manifest.dependencies);
    }
    if (manifest.devDependencies) {
      Object.assign(devDependencies, manifest.devDependencies);
    }
    if (manifest.env) {
      for (const e of manifest.env) envVars.add(e);
    }
    if (manifest.optionalEnv) {
      for (const e of manifest.optionalEnv) optionalEnvVars.add(e);
    }
    if (manifest.frontend?.imageHosts) {
      for (const host of manifest.frontend.imageHosts) imageHosts.add(host);
    }

    // Database variant dependencies and env
    if (manifest.variants?.db) {
      const dbVariant = manifest.variants.db[choices.database];
      if (dbVariant) {
        if (dbVariant.dependencies) {
          Object.assign(dependencies, dbVariant.dependencies);
        }
        if (dbVariant.devDependencies) {
          Object.assign(devDependencies, dbVariant.devDependencies);
        }
        if (dbVariant.env) {
          for (const e of dbVariant.env) envVars.add(e);
        }
      }
    }
  }

  return {
    choices,
    allModules: Array.from(selectedModules),
    envVars: Array.from(envVars),
    optionalEnvVars: Array.from(optionalEnvVars),
    dependencies,
    devDependencies,
    imageHosts: Array.from(imageHosts)
  };
}

