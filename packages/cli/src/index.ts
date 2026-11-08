import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import path from "node:path";
import fs from "fs-extra";
import { fileURLToPath } from "node:url";
import { runInteractivePrompts } from "./prompts.js";
import { resolvePlan } from "./resolver.js";
import { generateProject } from "./generator.js";
import { isLayout, LAYOUTS, type Layout, UserChoices } from "./types.js";

/** Validates --layout. Exits with a clear message for unknown store types. */
function parseLayoutFlag(value: unknown): Layout {
  if (value === undefined) return "fashion";
  if (isLayout(value)) return value;
  console.error(pc.red(`Unknown store type "${String(value)}". Choose one of: ${LAYOUTS.join(", ")}`));
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTemplatesDir(): string {
  // Check development monorepo location
  const devTemplates = path.resolve(__dirname, "../../../templates");
  if (fs.existsSync(devTemplates)) {
    return devTemplates;
  }
  // Check published package location
  const packageTemplates = path.resolve(__dirname, "../templates");
  if (fs.existsSync(packageTemplates)) {
    return packageTemplates;
  }
  throw new Error("Could not locate StoreBlocks templates directory.");
}

async function scaffoldAction(projectNameArg: string | undefined, options: any) {
  let choices: UserChoices;

  if (options.yes) {
    const name = projectNameArg || "my-shop";
    choices = {
      projectName: name,
      targetDir: path.resolve(process.cwd(), name),
      features: options.features ? options.features.split(",") : ["products", "categories", "orders", "users", "auth", "settings"],
      database: (options.db as any) || "mongodb",
      storage: (options.storage as any) || "local",
      payments: options.payments ? options.payments.split(",") : ["cod"],
      layout: parseLayoutFlag(options.layout),
      theme: (options.theme as any) || "minimal",
      packageManager: "npm"
    };
  } else if (
    options.db &&
    options.storage &&
    options.payments &&
    options.layout &&
    options.theme
  ) {
    parseLayoutFlag(options.layout); // fails fast on an unknown store type
    const name = projectNameArg || "my-shop";
    choices = {
      projectName: name,
      targetDir: path.resolve(process.cwd(), name),
      features: options.features ? options.features.split(",") : ["products", "categories", "orders", "users", "auth", "settings"],
      database: options.db,
      storage: options.storage,
      payments: options.payments.split(","),
      layout: parseLayoutFlag(options.layout),
      theme: options.theme,
      packageManager: "npm"
    };
  } else {
    choices = await runInteractivePrompts(projectNameArg);
  }

  const s = p.spinner();
  s.start(pc.cyan(`Resolving modules and generating ${pc.bold(choices.projectName)}...`));

  try {
    const templatesDir = getTemplatesDir();
    const plan = resolvePlan(choices, templatesDir);
    await generateProject(plan, templatesDir);

    s.stop(pc.green(`✨ Successfully scaffolded ${pc.bold(choices.projectName)}!`));

    p.note(
      `${pc.cyan(`cd ${choices.projectName}`)}\n` +
      `${pc.cyan(`cp .env.example .env`)}      ${pc.dim("# configure database connection")}\n` +
      `${pc.cyan(`docker compose up -d`)}     ${pc.dim("# optional: start local database container")}\n` +
      `${pc.cyan(`npm install`)}\n` +
      `${pc.cyan(`npx create-storeblocks doctor`)}  ${pc.dim("# verify environment and connections")}\n` +
      `${pc.cyan(`npm run dev`)}               ${pc.dim("# starts backend API on port 4000 & storefront on 3000")}`,
      "Next steps:"
    );

    p.outro(pc.magenta("🚀 Happy building with StoreBlocks!"));
  } catch (err: any) {
    s.stop(pc.red("Generation failed."));
    p.cancel(err.message);
    process.exit(1);
  }
}

async function main() {
  const program = new Command()
    .name("create-storeblocks")
    .description("Scaffold a production-ready, full-stack e-commerce store in minutes")
    .argument("[project-name]", "Project name and target directory")
    .option("--db <database>", "Database: mongodb or postgresql")
    .option("--storage <storage>", "Media storage: cloudinary, s3, or local")
    .option("--payments <methods>", "Comma-separated payment methods (cod,sslcommerz,stripe)")
    .option("--layout <layout>", "Store type: fashion, electronics, grocery, cosmetics, medicine, organic, general, landing")
    .option("--theme <theme>", "Design theme: minimal, bold, elegant")
    .option("--features <features>", "Comma-separated optional features")
    .option("-y, --yes", "Skip interactive prompts and use defaults/flags")
    .action(async (projectNameArg, options) => {
      await scaffoldAction(projectNameArg, options);
    });

  program
    .command("doctor")
    .description("Run pre-flight diagnostics on your StoreBlocks environment and configuration")
    .option("-d, --dir <directory>", "Target project directory to diagnose", process.cwd())
    .action(async (cmdOptions) => {
      const { runDoctor } = await import("./doctor.js");
      const { success } = await runDoctor(cmdOptions.dir);
      if (!success) {
        process.exit(1);
      }
      process.exit(0);
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
