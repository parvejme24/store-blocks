import bcrypt from "bcryptjs";
import { AppError, ErrorCodes } from "../../../shared-base/src/index.js";
import { UserRepository } from "../../users/backend/users.repository.js";
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  AuthTokens
} from "../shared/auth.schemas.js";
import { generateTokens, verifyRefreshToken } from "./auth.tokens.js";

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(input: RegisterInput): Promise<{ response: AuthResponse; tokens: AuthTokens }> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError(
        ErrorCodes.USER_ALREADY_EXISTS,
        "An account with this email already exists",
        409
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await this.userRepo.create(
      {
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
        role: "customer"
      },
      passwordHash
    );

    const tokens = generateTokens(user);

    return {
      tokens,
      response: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        tokens: {
          accessToken: tokens.accessToken
        }
      }
    };
  }

  async login(input: LoginInput): Promise<{ response: AuthResponse; tokens: AuthTokens }> {
    const userWithPassword = await this.userRepo.findWithPasswordByEmail(input.email);
    if (!userWithPassword || !userWithPassword.isActive) {
      throw new AppError(
        ErrorCodes.INVALID_CREDENTIALS,
        "Invalid email or password",
        401
      );
    }

    const isMatch = await bcrypt.compare(input.password, userWithPassword.passwordHash);
    if (!isMatch) {
      throw new AppError(
        ErrorCodes.INVALID_CREDENTIALS,
        "Invalid email or password",
        401
      );
    }

    const user = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      email: userWithPassword.email,
      role: userWithPassword.role
    };

    const tokens = generateTokens(user);

    return {
      tokens,
      response: {
        user,
        tokens: {
          accessToken: tokens.accessToken
        }
      }
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await this.userRepo.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new AppError(ErrorCodes.UNAUTHENTICATED, "User no longer exists or is inactive", 401);
      }

      const tokens = generateTokens(user);
      return { accessToken: tokens.accessToken };
    } catch (error: any) {
      throw new AppError(ErrorCodes.UNAUTHENTICATED, "Invalid or expired refresh token", 401);
    }
  }

  async getMe(userId: string): Promise<AuthResponse["user"]> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError(ErrorCodes.NOT_FOUND, "User not found", 404);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}

