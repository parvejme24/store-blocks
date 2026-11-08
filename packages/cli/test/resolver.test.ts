import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolvePlan } from "../src/resolver.js";
import { UserChoices } from "../src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, "../../../templates");

describe("StoreBlocks CLI Resolver", () => {
  it("resolves basic plan with MongoDB and COD", () => {
    const choices: UserChoices = {
      projectName: "my-mongo-shop",
      targetDir: "/tmp/my-mongo-shop",
      features: ["products", "categories", "orders", "users", "auth", "settings"],
      database: "mongodb",
      storage: "local",
      payments: ["cod"],
      layout: "fashion",
      theme: "minimal",
      packageManager: "npm"
    };

    const plan = resolvePlan(choices, templatesDir);

    assert.equal(plan.choices.projectName, "my-mongo-shop");
    assert.ok(plan.allModules.includes("auth"));
    assert.ok(plan.allModules.includes("users"));
    assert.ok(plan.allModules.includes("products"));
    assert.ok(plan.allModules.includes("categories"));
    assert.ok(plan.allModules.includes("orders"));
    assert.ok(plan.allModules.includes("settings"));
    assert.ok(plan.allModules.includes("storage-local"));
    assert.ok(plan.allModules.includes("payment-cod"));

    assert.ok(plan.envVars.includes("MONGODB_URI"));
    assert.ok(!plan.envVars.includes("DATABASE_URL"));
  });

  it("resolves plan with PostgreSQL, Stripe, and SSLCommerz", () => {
    const choices: UserChoices = {
      projectName: "my-pg-shop",
      targetDir: "/tmp/my-pg-shop",
      features: ["products", "categories", "orders", "users", "auth", "settings"],
      database: "postgresql",
      storage: "s3",
      payments: ["stripe", "sslcommerz"],
      layout: "electronics",
      theme: "bold",
      packageManager: "npm"
    };

    const plan = resolvePlan(choices, templatesDir);

    assert.ok(plan.allModules.includes("payment-stripe"));
    assert.ok(plan.allModules.includes("payment-sslcommerz"));
    assert.ok(plan.allModules.includes("storage-s3"));

    assert.ok(plan.envVars.includes("DATABASE_URL"));
    assert.ok(!plan.envVars.includes("MONGODB_URI"));

    // PostgreSQL dependencies should be added
    assert.ok(plan.dependencies["drizzle-orm"]);
    assert.ok(plan.dependencies["pg"]);
    assert.ok(plan.devDependencies["drizzle-kit"]);
  });

  it("recursively resolves module dependencies (e.g. notifications -> orders -> products, and reviews -> auth -> users)", () => {
    const choices: UserChoices = {
      projectName: "dependency-shop",
      targetDir: "/tmp/dep-shop",
      // Only request 'notifications' and 'reviews', dependency resolution should pull in 'orders', 'products', 'auth', and 'users'
      features: ["notifications", "reviews"],
      database: "mongodb",
      storage: "local",
      payments: ["cod"],
      layout: "general",
      theme: "minimal",
      packageManager: "npm"
    };

    const plan = resolvePlan(choices, templatesDir);

    assert.ok(plan.allModules.includes("notifications"));
    assert.ok(plan.allModules.includes("orders"), "orders should be auto-resolved as a dependency of notifications");
    assert.ok(plan.allModules.includes("products"), "products should be auto-resolved as a dependency of orders/reviews");
    assert.ok(plan.allModules.includes("reviews"));
    assert.ok(plan.allModules.includes("auth"), "auth should be auto-resolved as a dependency of reviews");
    assert.ok(plan.allModules.includes("users"), "users should be auto-resolved as a dependency of auth");
  });
});
