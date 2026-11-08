import path from "node:path";
import net from "node:net";
import fs from "fs-extra";
import pc from "picocolors";
import { execa } from "execa";

export interface DiagnosticResult {
  title: string;
  category: "Environment" | "Configuration" | "Database" | "Storage" | "Payments";
  status: "pass" | "warn" | "fail" | "info";
  message: string;
  remediation?: string;
}

/** Probes a TCP host and port with a strict timeout */
function probeTcp(host: string, port: number, timeoutMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isSettled = false;

    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      isSettled = true;
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      if (!isSettled) {
        isSettled = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on("error", () => {
      if (!isSettled) {
        isSettled = true;
        socket.destroy();
        resolve(false);
      }
    });

    try {
      socket.connect(port, host);
    } catch {
      resolve(false);
    }
  });
}

/** Parses key=value pairs from a .env file content */
function parseEnvContent(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIdx = line.indexOf("=");
    if (eqIdx !== -1) {
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  }
  return result;
}

/** Collects environment variables from root or backend .env / process.env */
async function loadEnvironment(projectDir: string): Promise<Record<string, string>> {
  const merged: Record<string, string> = { ...process.env } as Record<string, string>;

  const candidateEnvPaths = [
    path.join(projectDir, ".env"),
    path.join(projectDir, "backend", ".env"),
    path.join(projectDir, ".env.local"),
    path.join(projectDir, "frontend", ".env.local")
  ];

  for (const envPath of candidateEnvPaths) {
    if (await fs.pathExists(envPath)) {
      try {
        const raw = await fs.readFile(envPath, "utf-8");
        const parsed = parseEnvContent(raw);
        Object.assign(merged, parsed);
      } catch {
        // best effort
      }
    }
  }

  return merged;
}

export async function runDoctor(targetDir?: string): Promise<{ success: boolean; results: DiagnosticResult[] }> {
  const projectDir = path.resolve(targetDir || process.cwd());
  const results: DiagnosticResult[] = [];

  console.log(pc.bold(pc.cyan("\n🩺 StoreBlocks Pre-Flight System & Project Doctor")));
  console.log(pc.dim(`Inspecting directory: ${projectDir}\n`));

  // 1. Tooling & Environment
  // Check Node.js
  const nodeVersionStr = process.versions.node;
  const majorNode = parseInt(nodeVersionStr.split(".")[0] || "0", 10);
  if (majorNode >= 18) {
    results.push({
      category: "Environment",
      title: "Node.js Runtime",
      status: "pass",
      message: `Node.js v${nodeVersionStr} detected (minimum required: v18.0.0)`
    });
  } else {
    results.push({
      category: "Environment",
      title: "Node.js Runtime",
      status: "fail",
      message: `Node.js v${nodeVersionStr} detected is older than required v18.0.0`,
      remediation: "Please upgrade Node.js to v18.0.0 or higher (v20+ recommended)."
    });
  }

  // Check npm
  try {
    const { stdout: npmVersion } = await execa("npm", ["--version"]);
    const majorNpm = parseInt(npmVersion.trim().split(".")[0] || "0", 10);
    if (majorNpm >= 9) {
      results.push({
        category: "Environment",
        title: "npm Package Manager",
        status: "pass",
        message: `npm v${npmVersion.trim()} detected (strict workspace support enabled)`
      });
    } else {
      results.push({
        category: "Environment",
        title: "npm Package Manager",
        status: "warn",
        message: `npm v${npmVersion.trim()} detected. Recommended: npm v9 or v10+`,
        remediation: "Run `npm install -g npm@latest` to upgrade."
      });
    }
  } catch {
    results.push({
      category: "Environment",
      title: "npm Package Manager",
      status: "fail",
      message: "npm executable was not found in PATH",
      remediation: "Ensure npm is installed and added to your system PATH."
    });
  }

  // Check Git
  try {
    const { stdout: gitVersion } = await execa("git", ["--version"]);
    results.push({
      category: "Environment",
      title: "Git Version Control",
      status: "pass",
      message: `${gitVersion.trim()} available`
    });
  } catch {
    results.push({
      category: "Environment",
      title: "Git Version Control",
      status: "warn",
      message: "Git is not installed or not in PATH",
      remediation: "Install git to enable automatic repository tracking and versioning."
    });
  }

  // Check Docker
  try {
    const { stdout: dockerVersion } = await execa("docker", ["--version"]);
    results.push({
      category: "Environment",
      title: "Docker Container Engine",
      status: "pass",
      message: `${dockerVersion.trim()} available for database services`
    });
  } catch {
    results.push({
      category: "Environment",
      title: "Docker Container Engine",
      status: "info",
      message: "Docker CLI not detected (optional, recommended for local DB containers)",
      remediation: "Install Docker Desktop or Docker Engine to use `docker compose up -d`."
    });
  }

  // 2. Project Configuration
  let storeConfig: any = null;
  const configPath = path.join(projectDir, "store.config.json");
  const envVars = await loadEnvironment(projectDir);

  if (await fs.pathExists(configPath)) {
    try {
      storeConfig = await fs.readJson(configPath);
      results.push({
        category: "Configuration",
        title: "Store Configuration (store.config.json)",
        status: "pass",
        message: `Store: "${storeConfig.name || "StoreBlocks"}", Store type: ${storeConfig.layout || "general"}, Database: ${storeConfig.database || "mongodb"}, Modules: ${(storeConfig.modules || []).length} active`
      });
    } catch (err: any) {
      results.push({
        category: "Configuration",
        title: "Store Configuration (store.config.json)",
        status: "fail",
        message: `Invalid JSON syntax: ${err.message}`,
        remediation: "Fix the syntax errors in your store.config.json."
      });
    }
  } else {
    // Check if in monorepo or generic folder
    const hasTemplates = await fs.pathExists(path.join(projectDir, "templates"));
    if (hasTemplates) {
      results.push({
        category: "Configuration",
        title: "Monorepo Root Detected",
        status: "info",
        message: "You are running doctor in the StoreBlocks monorepo development root."
      });
    } else {
      results.push({
        category: "Configuration",
        title: "Store Configuration (store.config.json)",
        status: "warn",
        message: "store.config.json not found in current directory.",
        remediation: "Run create-storeblocks to generate a store, or run doctor inside a generated store directory."
      });
    }
  }

  // Check .env file existence
  const rootEnvExists = await fs.pathExists(path.join(projectDir, ".env"));
  const backendEnvExists = await fs.pathExists(path.join(projectDir, "backend", ".env"));
  if (rootEnvExists || backendEnvExists) {
    results.push({
      category: "Configuration",
      title: "Environment Files",
      status: "pass",
      message: `Found environment configuration in ${rootEnvExists ? ".env" : "backend/.env"}`
    });
  } else {
    results.push({
      category: "Configuration",
      title: "Environment Files",
      status: "warn",
      message: "Neither .env nor backend/.env was found.",
      remediation: "Copy .env.example to .env or backend/.env and populate your connection credentials."
    });
  }

  // Check Security / JWT Secrets
  const jwtAccess = envVars.JWT_ACCESS_SECRET;
  const jwtRefresh = envVars.JWT_REFRESH_SECRET;
  if (jwtAccess && jwtAccess.length >= 16 && jwtRefresh && jwtRefresh.length >= 16) {
    results.push({
      category: "Configuration",
      title: "Authentication Secrets",
      status: "pass",
      message: "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET meet length requirements (>= 16 chars)"
    });
  } else {
    results.push({
      category: "Configuration",
      title: "Authentication Secrets",
      status: "fail",
      message: "JWT_ACCESS_SECRET or JWT_REFRESH_SECRET is missing or shorter than 16 characters",
      remediation: "Set strong random strings (at least 16 chars) for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env file."
    });
  }

  // 3. Database Diagnostics
  const dbType = storeConfig?.database || (envVars.DATABASE_URL ? "postgresql" : "mongodb");
  if (dbType === "mongodb") {
    const mongoUri = envVars.MONGODB_URI;
    if (!mongoUri) {
      results.push({
        category: "Database",
        title: "MongoDB Connection URI",
        status: "fail",
        message: "MONGODB_URI is not set in environment",
        remediation: "Set MONGODB_URI in your .env file (e.g. mongodb://localhost:27017/storeblocks)."
      });
    } else {
      results.push({
        category: "Database",
        title: "MongoDB Configuration",
        status: "pass",
        message: "MONGODB_URI is configured"
      });

      // Attempt TCP Probe on host and port
      try {
        let host = "localhost";
        let port = 27017;
        if (mongoUri.includes("@")) {
          const parts = mongoUri.split("@")[1]?.split("/")[0]?.split(":");
          if (parts?.[0]) host = parts[0];
          if (parts?.[1]) port = parseInt(parts[1], 10);
        } else if (mongoUri.includes("://")) {
          const parts = mongoUri.split("://")[1]?.split("/")[0]?.split(":");
          if (parts?.[0]) host = parts[0];
          if (parts?.[1]) port = parseInt(parts[1], 10);
        }

        const isReachable = await probeTcp(host, port);
        if (isReachable) {
          results.push({
            category: "Database",
            title: "MongoDB Port Connectivity",
            status: "pass",
            message: `Successfully connected to MongoDB socket at ${host}:${port}`
          });
        } else {
          results.push({
            category: "Database",
            title: "MongoDB Port Connectivity",
            status: "warn",
            message: `Unable to establish TCP connection to ${host}:${port}`,
            remediation: "Make sure MongoDB is running. If using Docker, run: `docker compose up -d`."
          });
        }
      } catch {
        // Probe error is non-fatal
      }
    }
  } else if (dbType === "postgresql") {
    const pgUrl = envVars.DATABASE_URL;
    if (!pgUrl) {
      results.push({
        category: "Database",
        title: "PostgreSQL Connection URL",
        status: "fail",
        message: "DATABASE_URL is not set in environment",
        remediation: "Set DATABASE_URL in your .env file (e.g. postgresql://storeblocks:storeblocks_password@localhost:5432/storeblocks)."
      });
    } else {
      results.push({
        category: "Database",
        title: "PostgreSQL Configuration",
        status: "pass",
        message: "DATABASE_URL is configured"
      });

      // Attempt TCP Probe on host and port
      try {
        let host = "localhost";
        let port = 5432;
        if (pgUrl.includes("@")) {
          const parts = pgUrl.split("@")[1]?.split("/")[0]?.split(":");
          if (parts?.[0]) host = parts[0];
          if (parts?.[1]) port = parseInt(parts[1], 10);
        } else if (pgUrl.includes("://")) {
          const parts = pgUrl.split("://")[1]?.split("/")[0]?.split(":");
          if (parts?.[0]) host = parts[0];
          if (parts?.[1]) port = parseInt(parts[1], 10);
        }

        const isReachable = await probeTcp(host, port);
        if (isReachable) {
          results.push({
            category: "Database",
            title: "PostgreSQL Port Connectivity",
            status: "pass",
            message: `Successfully connected to PostgreSQL socket at ${host}:${port}`
          });
        } else {
          results.push({
            category: "Database",
            title: "PostgreSQL Port Connectivity",
            status: "warn",
            message: `Unable to establish TCP connection to ${host}:${port}`,
            remediation: "Make sure PostgreSQL is running. If using Docker, run: `docker compose up -d`."
          });
        }
      } catch {
        // Probe error is non-fatal
      }
    }
  }

  // 4. Media Storage Diagnostics
  const storageProvider = storeConfig?.storage || "local";
  if (storageProvider === "cloudinary") {
    const cloudName = envVars.CLOUDINARY_CLOUD_NAME;
    const apiKey = envVars.CLOUDINARY_API_KEY;
    const apiSecret = envVars.CLOUDINARY_API_SECRET;
    if (cloudName && apiKey && apiSecret) {
      results.push({
        category: "Storage",
        title: "Cloudinary Storage Provider",
        status: "pass",
        message: `Cloudinary credentials present for cloud "${cloudName}"`
      });
    } else {
      results.push({
        category: "Storage",
        title: "Cloudinary Storage Provider",
        status: "fail",
        message: "Missing one or more required Cloudinary keys: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
        remediation: "Provide your Cloudinary API keys in .env."
      });
    }
  } else if (storageProvider === "s3") {
    const s3Key = envVars.AWS_ACCESS_KEY_ID;
    const s3Secret = envVars.AWS_SECRET_ACCESS_KEY;
    const s3Region = envVars.AWS_REGION;
    const s3Bucket = envVars.AWS_S3_BUCKET || envVars.S3_BUCKET;
    if (s3Key && s3Secret && s3Bucket) {
      results.push({
        category: "Storage",
        title: "S3 / MinIO Storage Provider",
        status: "pass",
        message: `S3 credentials present for bucket "${s3Bucket}" (region: ${s3Region || "us-east-1"})`
      });
    } else {
      results.push({
        category: "Storage",
        title: "S3 / MinIO Storage Provider",
        status: "fail",
        message: "Missing AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, or AWS_S3_BUCKET",
        remediation: "Provide your AWS or MinIO credentials in .env."
      });
    }
  } else {
    // Local storage
    const uploadsPath = path.join(projectDir, "uploads");
    if (storeConfig) {
      try {
        await fs.ensureDir(uploadsPath);
        results.push({
          category: "Storage",
          title: "Local Disk Media Storage",
          status: "pass",
          message: `Local directory writable at ${uploadsPath}`
        });
      } catch {
        results.push({
          category: "Storage",
          title: "Local Disk Media Storage",
          status: "warn",
          message: `Could not create or write to ${uploadsPath}`,
          remediation: "Ensure the process has write permissions to create the uploads directory."
        });
      }
    } else {
      results.push({
        category: "Storage",
        title: "Local Disk Media Storage",
        status: "info",
        message: "Default local disk storage configured for media assets"
      });
    }
  }

  // 5. Payment Gateway Diagnostics
  const payments: string[] = storeConfig?.payments || ["cod"];
  if (payments.includes("cod")) {
    results.push({
      category: "Payments",
      title: "Cash on Delivery (COD)",
      status: "pass",
      message: "Cash on delivery active (no external API credentials required)"
    });
  }
  if (payments.includes("stripe")) {
    const stripeSecret = envVars.STRIPE_SECRET_KEY;
    if (stripeSecret && stripeSecret.startsWith("sk_")) {
      results.push({
        category: "Payments",
        title: "Stripe Payment Gateway",
        status: "pass",
        message: "Valid Stripe Secret Key detected"
      });
    } else {
      results.push({
        category: "Payments",
        title: "Stripe Payment Gateway",
        status: "warn",
        message: "STRIPE_SECRET_KEY is missing or invalid format (expected prefix 'sk_')",
        remediation: "Add your Stripe secret key to .env (starts with sk_test_ or sk_live_)."
      });
    }
  }
  if (payments.includes("sslcommerz")) {
    const sslStoreId = envVars.SSLCOMMERZ_STORE_ID;
    const sslStorePass = envVars.SSLCOMMERZ_STORE_PASS;
    if (sslStoreId && sslStorePass) {
      results.push({
        category: "Payments",
        title: "SSLCommerz Payment Gateway",
        status: "pass",
        message: `SSLCommerz credentials present for store ID "${sslStoreId}"`
      });
    } else {
      results.push({
        category: "Payments",
        title: "SSLCommerz Payment Gateway",
        status: "warn",
        message: "SSLCOMMERZ_STORE_ID or SSLCOMMERZ_STORE_PASS is missing in environment",
        remediation: "Provide SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASS in your .env file."
      });
    }
  }

  // Render Formatted Output
  const categories: Array<DiagnosticResult["category"]> = [
    "Environment",
    "Configuration",
    "Database",
    "Storage",
    "Payments"
  ];

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const cat of categories) {
    const catResults = results.filter((r) => r.category === cat);
    if (catResults.length === 0) continue;

    console.log(pc.bold(pc.underline(`\n[${cat}]`)));
    for (const item of catResults) {
      let icon = pc.green("✔");
      if (item.status === "warn") {
        icon = pc.yellow("⚠");
        warnCount++;
      } else if (item.status === "fail") {
        icon = pc.red("✖");
        failCount++;
      } else if (item.status === "info") {
        icon = pc.cyan("ℹ");
      } else {
        passCount++;
      }

      console.log(`  ${icon} ${pc.bold(item.title)}: ${item.message}`);
      if (item.remediation && (item.status === "fail" || item.status === "warn")) {
        console.log(`    ${pc.dim("↳ Suggestion:")} ${pc.yellow(item.remediation)}`);
      }
    }
  }

  // Summary box
  console.log(pc.cyan("\n" + "─".repeat(60)));
  const summaryLine = `Diagnostics Complete: ${pc.green(`${passCount} passed`)}, ${pc.yellow(`${warnCount} warnings`)}, ${pc.red(`${failCount} errors`)}`;
  console.log(pc.bold(summaryLine));
  console.log(pc.cyan("─".repeat(60) + "\n"));

  return {
    success: failCount === 0,
    results
  };
}
