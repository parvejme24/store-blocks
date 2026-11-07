import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export async function connectDatabase(): Promise<void> {
  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required to connect to MongoDB");
  }

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connection established");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });

  await mongoose.connect(uri, {
    autoIndex: env.NODE_ENV !== "production"
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB connection closed");
}

