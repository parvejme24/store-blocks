import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { manifestSchema } from "./manifest.schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find templates/modules directory relative to repo root
const repoRoot = path.resolve(__dirname, "../../..");
const modulesDir = path.join(repoRoot, "templates/modules");

export function findModuleJsonFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const manifestPath = path.join(fullPath, "module.json");
      if (fs.existsSync(manifestPath)) {
        results.push(manifestPath);
      }
      // Also look into subdirectories (e.g. storage/cloudinary, payments/stripe)
      const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const sub of subEntries) {
        if (sub.isDirectory()) {
          const subManifest = path.join(fullPath, sub.name, "module.json");
          if (fs.existsSync(subManifest)) {
            results.push(subManifest);
          }
        }
      }
    }
  }
  return [...new Set(results)];
}

export function validateAllManifests(): boolean {
  console.log(`\n🔍 Validating module manifests in ${modulesDir}...`);

  if (!fs.existsSync(modulesDir)) {
    console.warn(`⚠️  Modules directory not found: ${modulesDir}`);
    return true;
  }

  const manifestFiles = findModuleJsonFiles(modulesDir);
  if (manifestFiles.length === 0) {
    console.log("ℹ️  No module.json files found yet.");
    return true;
  }

  const allModules = new Map<string, { manifestPath: string; dir: string; manifest: any }>();
  let hasErrors = false;

  for (const manifestPath of manifestFiles) {
    const dir = path.dirname(manifestPath);
    const dirName = path.basename(dir);

    try {
      const content = fs.readFileSync(manifestPath, "utf-8");
      const json = JSON.parse(content);
      const parsed = manifestSchema.safeParse(json);

      if (!parsed.success) {
        console.error(`❌ Validation failed for ${manifestPath}:`);
        for (const err of parsed.error.issues) {
          console.error(`   - [${err.path.join(".")}] ${err.message}`);
        }
        hasErrors = true;
        continue;
      }

      const manifest = parsed.data;

      // Check name matches directory name or namespaced adapter name
      const validNames = [dirName, `storage-${dirName}`, `payment-${dirName}`];
      if (!validNames.includes(manifest.name)) {
        console.error(
          `❌ Module name mismatch in ${manifestPath}: name is '${manifest.name}' but folder is '${dirName}'`
        );
        hasErrors = true;
      }

      // If variants.db exists, verify paths exist
      if (manifest.variants?.db) {
        const { mongodb, postgresql } = manifest.variants.db;
        const mongoPath = path.join(dir, mongodb.path);
        const pgPath = path.join(dir, postgresql.path);

        if (!fs.existsSync(mongoPath)) {
          console.error(`❌ MongoDB variant path does not exist: ${mongoPath}`);
          hasErrors = true;
        }
        if (!fs.existsSync(pgPath)) {
          console.error(`❌ PostgreSQL variant path does not exist: ${pgPath}`);
          hasErrors = true;
        }
      }

      allModules.set(manifest.name, { manifestPath, dir, manifest });
    } catch (e: any) {
      console.error(`❌ Error parsing ${manifestPath}: ${e.message}`);
      hasErrors = true;
    }
  }

  // Cross-module checks: dependsOn validation
  for (const [name, { manifest }] of allModules.entries()) {
    if (manifest.dependsOn && Array.isArray(manifest.dependsOn)) {
      for (const dep of manifest.dependsOn) {
        if (!allModules.has(dep)) {
          console.error(`❌ Module '${name}' depends on '${dep}', but '${dep}' does not exist.`);
          hasErrors = true;
        }
      }
    }
  }

  if (hasErrors) {
    console.error("\n❌ Manifest validation failed with errors.\n");
    return false;
  }

  console.log(`\n✅ Successfully validated ${allModules.size} module manifests.\n`);
  return true;
}

// Run if called directly
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun) {
  const success = validateAllManifests();
  process.exit(success ? 0 : 1);
}

