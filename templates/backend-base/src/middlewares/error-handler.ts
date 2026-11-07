import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCodes } from "../../../shared/src/index.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, `[AppError] ${err.code}: ${err.message}`);
    } else {
      logger.warn({ err }, `[AppError] ${err.code}: ${err.message}`);
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null
      }
    });
    return;
  }

  // Unhandled / Internal Server Error
  logger.error({ err }, "[UnhandledError] An unexpected error occurred");

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
      details: null
    }
  });
}

