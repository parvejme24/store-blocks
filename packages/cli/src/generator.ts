import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import { GenerationPlan, Layout, StoreConfig } from "./types.js";

/** Maps each store type to the storefront template id in frontend/src/templates. */
const TEMPLATE_FOR_LAYOUT: Record<Layout, string> = {
  fashion: "fashion",
  electronics: "electronics",
  grocery: "grocery",
  cosmetics: "cosmetics",
  medicine: "medicine",
  organic: "organic",
  general: "default",
  landing: "default"
};

export async function generateProject(
  plan: GenerationPlan,
  templatesDir: string
): Promise<void> {
  const { choices, allModules, envVars, optionalEnvVars, dependencies, devDependencies } = plan;
  const targetDir = choices.targetDir;

  // 1. Ensure target directory exists and is empty
  await fs.ensureDir(targetDir);
  const filesInTarget = await fs.readdir(targetDir);
  if (filesInTarget.length > 0) {
    throw new Error(`Target directory '${targetDir}' is not empty. Please choose an empty folder.`);
  }

  // 2. Copy shared base
  const sharedSrc = path.join(templatesDir, "shared-base");
  const sharedDest = path.join(targetDir, "shared");
  if (await fs.pathExists(sharedSrc)) {
    await fs.copy(sharedSrc, sharedDest);
  }

  // 3. Copy backend base
  const backendSrc = path.join(templatesDir, "backend-base");
  const backendDest = path.join(targetDir, "backend");
  await fs.copy(backendSrc, backendDest);

  // Copy frontend base
  const frontendSrc = path.join(templatesDir, "frontend-base");
  const frontendDest = path.join(targetDir, "frontend");
  if (await fs.pathExists(frontendSrc)) {
    await fs.copy(frontendSrc, frontendDest);

    // Copy storefront layouts
    const layoutsSrc = path.join(templatesDir, "layouts");
    const layoutsDest = path.join(frontendDest, "src", "layouts");
    if (await fs.pathExists(layoutsSrc)) {
      await fs.copy(layoutsSrc, layoutsDest);
    }

    // Apply chosen theme tokens
    const themeSrc = path.join(templatesDir, "themes", `${choices.theme}.css`);
    if (await fs.pathExists(themeSrc)) {
      const themeCss = await fs.readFile(themeSrc, "utf-8");
      const globalsCssPath = path.join(frontendDest, "src", "app", "globals.css");
      if (await fs.pathExists(globalsCssPath)) {
        const currentGlobals = await fs.readFile(globalsCssPath, "utf-8");
        await fs.writeFile(globalsCssPath, `${themeCss}\n\n${currentGlobals}`);
      }
    }
  }

  // Configure database variant inside backend/src/db
  const chosenDb = choices.database;
  const dbDir = path.join(backendDest, "src", "db");
  const chosenDbDir = path.join(dbDir, chosenDb);
  const otherDb = chosenDb === "mongodb" ? "postgresql" : "mongodb";
  const otherDbDir = path.join(dbDir, otherDb);

  // Remove the unchosen database base
  if (await fs.pathExists(otherDbDir)) {
    await fs.remove(otherDbDir);
  }

  // Update backend connection.ts and unit-of-work.ts
  await fs.writeFile(
    path.join(dbDir, "connection.ts"),
    `export * from "./${chosenDb}/connection.js";\n`
  );
  await fs.writeFile(
    path.join(dbDir, "unit-of-work.ts"),
    `export * from "./${chosenDb}/unit-of-work.js";\n`
  );

  // 4. Copy selected modules
  const targetModulesDir = path.join(backendDest, "src", "modules");
  await fs.ensureDir(targetModulesDir);

  const modulesTemplatesDir = path.join(templatesDir, "modules");

  // Modules list for store.config.json (modules with routes)
  const routableModules: string[] = [];

  for (const modName of allModules) {
    // Check if it is storage adapter or payment adapter
    if (modName.startsWith("storage-")) {
      const adapterType = modName.replace("storage-", "");
      const adapterSrc = path.join(modulesTemplatesDir, "storage", adapterType);
      const adapterDest = path.join(targetModulesDir, "storage", adapterType);
      if (await fs.pathExists(adapterSrc)) {
        await fs.copy(adapterSrc, adapterDest);
      }
      continue;
    }

    if (modName.startsWith("payment-")) {
      const adapterType = modName.replace("payment-", "");
      const adapterSrc = path.join(modulesTemplatesDir, "payments", adapterType);
      const adapterDest = path.join(targetModulesDir, "payments", adapterType);
      if (await fs.pathExists(adapterSrc)) {
        await fs.copy(adapterSrc, adapterDest);
      }
      continue;
    }

    // Feature / core modules
    const modSrc = path.join(modulesTemplatesDir, modName);
    const modDest = path.join(targetModulesDir, modName);

    if (await fs.pathExists(modSrc)) {
      await fs.copy(modSrc, modDest);

      // Handle variant resolution for this module
      const manifestPath = path.join(modDest, "module.json");
      if (await fs.pathExists(manifestPath)) {
        const manifest = await fs.readJson(manifestPath);

        if (manifest.backend?.basePath) {
          routableModules.push(modName);
        }

        if (manifest.variants?.db) {
          const variantConfig = manifest.variants.db[chosenDb];
          if (variantConfig) {
            const variantPath = path.join(modDest, variantConfig.path);
            const backendDir = path.join(modDest, "backend");

            // Copy variant files up to backend/
            if (await fs.pathExists(variantPath)) {
              await fs.copy(variantPath, backendDir);
            }

            // Remove variant db folder
            const dbVariantDir = path.join(backendDir, "db");
            if (await fs.pathExists(dbVariantDir)) {
              await fs.remove(dbVariantDir);
            }
          }
        }

        // Move frontend module parts to frontend/src/modules/
        const moduleFrontendSrc = path.join(modDest, "frontend");
        if (await fs.pathExists(moduleFrontendSrc)) {
          const targetFrontendModuleDir = path.join(frontendDest, "src", "modules", modName);
          await fs.copy(moduleFrontendSrc, targetFrontendModuleDir);
          await fs.remove(moduleFrontendSrc);
        }
      }
    }
  }

  // Copy storage core & payment core
  const storageCoreSrc = path.join(modulesTemplatesDir, "storage", "core");
  const storageCoreDest = path.join(targetModulesDir, "storage", "core");
  if (await fs.pathExists(storageCoreSrc)) {
    await fs.copy(storageCoreSrc, storageCoreDest);
    routableModules.push("storage/core");
  }

  const paymentsCoreSrc = path.join(modulesTemplatesDir, "payments", "core");
  const paymentsCoreDest = path.join(targetModulesDir, "payments", "core");
  if (await fs.pathExists(paymentsCoreSrc)) {
    await fs.copy(paymentsCoreSrc, paymentsCoreDest);
    routableModules.push("payments/core");
  }

  // 5. Write store.config.json
  const storeConfig: StoreConfig = {
    name: choices.projectName,
    database: choices.database,
    storage: choices.storage,
    payments: choices.payments,
    layout: choices.layout,
    theme: choices.theme,
    modules: routableModules,
    createdAt: new Date().toISOString()
  };

  await fs.writeJson(path.join(targetDir, "store.config.json"), storeConfig, { spaces: 2 });

  // 5b. Tell the storefront which home-page template to render
  const storefrontConfigDir = path.join(targetDir, "frontend", "src", "config");
  if (await fs.pathExists(path.join(targetDir, "frontend", "src"))) {
    await fs.ensureDir(storefrontConfigDir);
    await fs.writeFile(
      path.join(storefrontConfigDir, "storefront.ts"),
      [
        "/**",
        " * Storefront settings. Generated by create-storeblocks from the store type you chose.",
        " * The root page shows the shop home for this store type. The same page is at /shop.",
        " */",
        `export const HOME_MODE: "landing" | "store" = "store";`,
        `export const STORE_NAME = ${JSON.stringify(choices.projectName)};`,
        "",
        "/** Template id for the shop home. See src/templates/registry.ts. */",
        `export const ACTIVE_TEMPLATE_ID = "${TEMPLATE_FOR_LAYOUT[choices.layout]}";`,
        ""
      ].join("\n")
    );
  }

  // 6. Generate .env.example
  let envExampleContent = `# StoreBlocks Environment Variables for ${choices.projectName}\n\n`;
  envExampleContent += `NODE_ENV=development\nPORT=4000\nFRONTEND_URL=http://localhost:3000\n`;
  envExampleContent += `JWT_ACCESS_SECRET=replace_with_super_secret_key_at_least_16_chars\n`;
  envExampleContent += `JWT_REFRESH_SECRET=replace_with_super_refresh_key_at_least_16_chars\n\n`;

  envExampleContent += `# Database Connection (matches docker-compose.yml)\n`;
  if (choices.database === "mongodb") {
    envExampleContent += `MONGODB_URI=mongodb://localhost:27017/storeblocks\n\n`;
  } else {
    envExampleContent += `DATABASE_URL=postgresql://storeblocks:storeblocks_password@localhost:5432/storeblocks\n\n`;
  }

  envExampleContent += `# Required for selected modules\n`;
  for (const v of envVars) {
    if (!["NODE_ENV", "PORT", "FRONTEND_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "MONGODB_URI", "DATABASE_URL"].includes(v)) {
      envExampleContent += `${v}=\n`;
    }
  }

  if (optionalEnvVars.length > 0) {
    envExampleContent += `\n# Optional environment variables\n`;
    for (const v of optionalEnvVars) {
      envExampleContent += `# ${v}=\n`;
    }
  }

  await fs.writeFile(path.join(targetDir, ".env.example"), envExampleContent);

  // 6b. Generate docker-compose.yml for local infrastructure
  const dockerComposeContent = buildDockerCompose(choices.projectName, choices.database, choices.storage);
  await fs.writeFile(path.join(targetDir, "docker-compose.yml"), dockerComposeContent);

  // 6c. Connect the storefront to the API automatically (no secrets: this is a public URL)
  if (await fs.pathExists(path.join(targetDir, "frontend"))) {
    await fs.writeFile(
      path.join(targetDir, "frontend", ".env.local"),
      "# Public API address used by the storefront. Change it when you deploy the backend.\nNEXT_PUBLIC_API_URL=http://localhost:4000\n"
    );
  }

  // 6d. Generate README.md describing this store (variable names only, never values)
  await fs.writeFile(
    path.join(targetDir, "README.md"),
    buildStoreReadme({
      projectName: choices.projectName,
      layout: choices.layout,
      theme: choices.theme,
      database: choices.database,
      storage: choices.storage,
      payments: choices.payments,
      features: choices.features,
      modules: routableModules,
      envVars,
      optionalEnvVars
    })
  );

  // 7. Generate root package.json for npm workspaces
  const rootPackageJson = {
    name: choices.projectName,
    version: "0.1.0",
    private: true,
    workspaces: ["backend", "frontend", "shared"],
    scripts: {
      dev: "npm run dev --workspaces --if-present",
      build: "npm run build --workspaces --if-present",
      "dev:backend": "npm --workspace=backend run dev",
      "dev:frontend": "npm --workspace=frontend run dev",
      "db:up": "docker compose up -d",
      "db:down": "docker compose down",
      "seed:admin": "npm --workspace=backend run seed:admin",
      "seed:demo": "npm --workspace=backend run seed:demo",
      "doctor": "npx create-storeblocks doctor"
    }
  };

  await fs.writeJson(path.join(targetDir, "package.json"), rootPackageJson, { spaces: 2 });

  // 8. Merge dependencies into backend/package.json
  const backendPkgPath = path.join(backendDest, "package.json");
  if (await fs.pathExists(backendPkgPath)) {
    const backendPkg = await fs.readJson(backendPkgPath);
    backendPkg.dependencies = {
      ...backendPkg.dependencies,
      ...dependencies
    };
    backendPkg.devDependencies = {
      ...backendPkg.devDependencies,
      ...devDependencies
    };
    await fs.writeJson(backendPkgPath, backendPkg, { spaces: 2 });
  }

  // 9. Initialize git repository
  try {
    await execa("git", ["init"], { cwd: targetDir });
    await fs.writeFile(
      path.join(targetDir, ".gitignore"),
      `node_modules\n.env\n.env.local\ndist\n*.log\n.DS_Store\n`
    );
    await execa("git", ["add", "."], { cwd: targetDir });
    await execa("git", ["commit", "-m", "chore: initial scaffold from create-storeblocks"], {
      cwd: targetDir
    });
  } catch {
    // Git init is optional/best-effort
  }
}

const LAYOUT_LABELS: Record<Layout, string> = {
  fashion: "Fashion & apparel",
  electronics: "Electronics & gadgets",
  grocery: "Grocery & daily essentials",
  cosmetics: "Beauty & cosmetics",
  medicine: "Medicine & pharmacy",
  organic: "Organic & natural food",
  general: "General store",
  landing: "Single-product landing"
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on delivery",
  sslcommerz: "SSLCommerz",
  stripe: "Stripe"
};

/** Generates a tailored docker-compose.yml file based on chosen database and storage provider */
function buildDockerCompose(projectName: string, database: "mongodb" | "postgresql", storage: string): string {
  const isMongo = database === "mongodb";
  const isS3 = storage === "s3";
  const safeName = path.basename(projectName).toLowerCase().replace(/[^a-z0-9_-]/g, "_") || "storeblocks";

  let lines: string[] = [
    `# StoreBlocks Docker Compose Configuration for ${projectName}`,
    `# Run with: docker compose up -d`,
    `services:`
  ];

  if (isMongo) {
    lines.push(
      `  mongodb:`,
      `    image: mongo:7.0`,
      `    container_name: ${safeName}-mongodb`,
      `    restart: always`,
      `    ports:`,
      `      - "27017:27017"`,
      `    environment:`,
      `      MONGO_INITDB_DATABASE: storeblocks`,
      `    volumes:`,
      `      - mongo_data:/data/db`
    );
  } else {
    lines.push(
      `  postgres:`,
      `    image: postgres:16-alpine`,
      `    container_name: ${safeName}-postgres`,
      `    restart: always`,
      `    ports:`,
      `      - "5432:5432"`,
      `    environment:`,
      `      POSTGRES_USER: storeblocks`,
      `      POSTGRES_PASSWORD: storeblocks_password`,
      `      POSTGRES_DB: storeblocks`,
      `    volumes:`,
      `      - postgres_data:/var/lib/postgresql/data`
    );
  }

  if (isS3) {
    lines.push(
      ``,
      `  minio:`,
      `    image: minio/minio:latest`,
      `    container_name: ${safeName}-minio`,
      `    restart: always`,
      `    command: server /data --console-address ":9001"`,
      `    ports:`,
      `      - "9000:9000"`,
      `      - "9001:9001"`,
      `    environment:`,
      `      MINIO_ROOT_USER: minioadmin`,
      `      MINIO_ROOT_PASSWORD: minioadminpassword`,
      `    volumes:`,
      `      - minio_data:/data`
    );
  }

  lines.push(``, `volumes:`);
  if (isMongo) {
    lines.push(`  mongo_data:`);
  } else {
    lines.push(`  postgres_data:`);
  }
  if (isS3) {
    lines.push(`  minio_data:`);
  }

  return lines.join("\n") + "\n";
}

/** Builds the README for a generated store. Environment variable names are listed; values never are. */
function buildStoreReadme(info: {
  projectName: string;
  layout: Layout;
  theme: string;
  database: string;
  storage: string;
  payments: string[];
  features: string[];
  modules: string[];
  envVars: string[];
  optionalEnvVars: string[];
}): string {
  const list = (items: string[]) => (items.length ? items.map((i) => `- ${i}`).join("\n") : "- None");
  const envRequired = info.envVars.filter((v) => !["NODE_ENV", "PORT", "FRONTEND_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"].includes(v));
  const payments = info.payments.map((p) => PAYMENT_LABELS[p] ?? p);
  const databaseLabel = info.database === "mongodb" ? "MongoDB (Mongoose)" : "PostgreSQL (Drizzle ORM)";

  return `# ${info.projectName}

A modular e-commerce store generated by [create-storeblocks](https://github.com/storeblocks). It contains a backend API and a storefront with an admin dashboard.

## Store setup

| Setting | Choice |
| --- | --- |
| Store type | ${LAYOUT_LABELS[info.layout] ?? info.layout} |
| Design theme | ${info.theme} |
| Database | ${databaseLabel} |
| Media storage | ${info.storage} |
| Payments | ${payments.join(", ") || "None"} |

## Features installed

${list(info.features)}

## Backend modules

${list(info.modules)}

## Folder structure

\`\`\`
${info.projectName}/
├── backend/        API server (Express, ${databaseLabel})
├── frontend/       Storefront and admin dashboard (Next.js)
├── shared/         Types shared by backend and frontend
├── docker-compose.yml Containerized database configuration
├── store.config.json  Store configuration descriptor
├── .env.example    Environment variable template
└── README.md
\`\`\`

## Get started

1. Install dependencies from the project root:

   \`\`\`bash
   npm install
   \`\`\`

2. Create your environment configuration:

   \`\`\`bash
   cp .env.example .env
   cp .env.example backend/.env
   \`\`\`

3. Start your local database with Docker:

   \`\`\`bash
   npm run db:up
   # Or directly: docker compose up -d
   \`\`\`

4. Verify your environment & connections with Doctor:

   \`\`\`bash
   npm run doctor
   \`\`\`

5. Seed initial admin and demo catalog data:

   \`\`\`bash
   npm run seed:admin
   npm run seed:demo
   \`\`\`

6. Run the backend and storefront together:

   \`\`\`bash
   npm run dev
   \`\`\`

   - API: http://localhost:4000
   - Storefront: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin

### Backend only

To run only the API, for example when it is hosted separately:

\`\`\`bash
npm --workspace=backend run dev
\`\`\`

The storefront reads its API address from \`frontend/.env.local\` (\`NEXT_PUBLIC_API_URL\`). Change it when you deploy the backend.

## Environment variables

Set these in \`backend/.env\`. The names below are listed for reference; the values are never written to this file.

### Required

${list(envRequired)}

### Optional

${list(info.optionalEnvVars)}

## Admin roles

The admin dashboard is the same for every store theme. Each role sees only the features it needs:

| Role | Access |
| --- | --- |
| Owner | Everything, including settings |
| Manager | Products, categories, orders, customers, coupons, reviews |
| Staff | Overview, orders, customers, reviews |

Authentication and role enforcement are connected through the auth module. The role switcher in the dashboard is for previewing the layout.

## First run

A new store has no products. Add your first product in the admin dashboard, and it appears on the storefront automatically.

## Documentation

See the StoreBlocks documentation at \`/docs\` in the storefront, or the \`docs/\` folder of the StoreBlocks repository.
`;
}
