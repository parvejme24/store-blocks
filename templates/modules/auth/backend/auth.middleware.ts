import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCodes } from "../../../shared-base/src/index.js";
import { verifyAccessToken } from "./auth.tokens.js";

export interface AuthenticatedUser {
  id: string;
  role: "customer" | "admin";
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    next(new AppError(ErrorCodes.UNAUTHENTICATED, "Authentication required", 401));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email
    };
    next();
  } catch (err: any) {
    next(new AppError(ErrorCodes.UNAUTHENTICATED, "Invalid or expired token", 401));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  requireAuth(req, _res, (err) => {
    if (err) {
      next(err);
      return;
    }

    if (req.user?.role !== "admin") {
      next(new AppError(ErrorCodes.FORBIDDEN, "Admin privileges required", 403));
      return;
    }

    next();
  });
}

