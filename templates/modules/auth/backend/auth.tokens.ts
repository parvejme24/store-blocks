import jwt from "jsonwebtoken";
import { env } from "../../../backend-base/src/config/env.js";
import { AuthTokens, AuthUser } from "../shared/auth.schemas.js";

export interface TokenPayload {
  sub: string;
  role: "customer" | "admin";
  email: string;
}

export function generateTokens(user: AuthUser): AuthTokens {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.role,
    email: user.email
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m"
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

