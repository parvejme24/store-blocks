import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";

export async function createApp(): Promise<Express> {
  const app = express();

  // Security & standard middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [env.FRONTEND_URL],
      credentials: true
    })
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Basic rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests from this IP, please try again later",
        details: null
      }
    }
  });
  app.use("/api", limiter);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Dynamic Module Loader
  // Read modules list from store.config.json if available
  const configPath = path.resolve(process.cwd(), "store.config.json");
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      const modules: string[] = config.modules || [];

      for (const moduleName of modules) {
        try {
          const modPath = `./modules/${moduleName}/index.js`;
          const mod = await import(modPath);
          if (mod.router && mod.basePath) {
            app.use(mod.basePath, mod.router);
            logger.info(`Mounted module '${moduleName}' at ${mod.basePath}`);
          }
        } catch (err: any) {
          logger.warn(`Failed to dynamically load module '${moduleName}': ${err.message}`);
        }
      }
    } catch (err: any) {
      logger.error(`Error reading store.config.json: ${err.message}`);
    }
  }

  // Fallbacks
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

