import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceTemplates = path.resolve(__dirname, "../../../templates");
const destTemplates = path.resolve(__dirname, "../templates");

console.log("Syncing templates into packages/cli/templates for npm publishing...");

await fs.remove(destTemplates);
await fs.copy(sourceTemplates, destTemplates, {
  filter: (src) => {
    const basename = path.basename(src);
    if (basename === "node_modules" || basename === ".next" || basename === "dist" || basename === ".turbo") {
      return false;
    }
    return true;
  }
});

console.log("Templates synced successfully.");
