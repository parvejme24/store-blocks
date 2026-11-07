import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCodes } from "../../../shared/src/index.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(ErrorCodes.NOT_FOUND, `Route not found: ${req.method} ${req.originalUrl}`, 404));
}

