import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCodes } from "../../../shared-base/src/index.js";
import { AuthService } from "./auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { response, tokens } = await this.service.register(req.body);
      res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);
      res.status(201).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { response, tokens } = await this.service.login(req.body);
      res.cookie("refreshToken", tokens.refreshToken, COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw new AppError(ErrorCodes.UNAUTHENTICATED, "Refresh token required", 401);
      }
      const { accessToken } = await this.service.refresh(token);
      res.status(200).json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        data: { message: "Logged out successfully" }
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const user = await this.service.getMe(userId);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };
}

