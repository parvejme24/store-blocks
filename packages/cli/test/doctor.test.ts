import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { runDoctor } from "../src/doctor.js";

describe("StoreBlocks CLI Doctor", () => {
  it("detects system Node.js and npm in runtime environment", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "sb-doc-"));
    try {
      const { results } = await runDoctor(tmpDir);
      const nodeCheck = results.find((r) => r.title === "Node.js Runtime");
      assert.ok(nodeCheck, "Node check must be present");
      assert.equal(nodeCheck.status, "pass");

      const npmCheck = results.find((r) => r.title === "npm Package Manager");
      assert.ok(npmCheck, "npm check must be present");
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it("fails authentication check when JWT secrets are missing or too short", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "sb-doc-"));
    try {
      await fs.writeFile(path.join(tmpDir, ".env"), "JWT_ACCESS_SECRET=short\nJWT_REFRESH_SECRET=short\n");
      const { results } = await runDoctor(tmpDir);
      const authCheck = results.find((r) => r.title === "Authentication Secrets");
      assert.ok(authCheck, "Auth secrets check must be present");
      assert.equal(authCheck.status, "fail");
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it("passes authentication check when JWT secrets are strong", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "sb-doc-"));
    try {
      await fs.writeFile(
        path.join(tmpDir, ".env"),
        "JWT_ACCESS_SECRET=very_long_super_secret_access_key_12345\nJWT_REFRESH_SECRET=very_long_super_secret_refresh_key_12345\nMONGODB_URI=mongodb://localhost:27017/sb\n"
      );
      const { results } = await runDoctor(tmpDir);
      const authCheck = results.find((r) => r.title === "Authentication Secrets");
      assert.ok(authCheck);
      assert.equal(authCheck.status, "pass");
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it("validates store.config.json and parses active modules", async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "sb-doc-"));
    try {
      const config = {
        name: "Test Shop",
        database: "mongodb",
        storage: "local",
        payments: ["cod"],
        layout: "fashion",
        theme: "minimal",
        modules: ["products", "orders", "auth"]
      };
      await fs.writeJson(path.join(tmpDir, "store.config.json"), config);
      const { results } = await runDoctor(tmpDir);
      const configCheck = results.find((r) => r.title.startsWith("Store Configuration"));
      assert.ok(configCheck);
      assert.equal(configCheck.status, "pass");
      assert.ok(configCheck.message.includes("Test Shop"));
      assert.ok(configCheck.message.includes("3 active"));
    } finally {
      await fs.remove(tmpDir);
    }
  });
});
