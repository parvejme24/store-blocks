export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details ?? null;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",

  // Resource common
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",

  // Auth specific
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",

  // Products
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  PRODUCT_CONFLICT: "PRODUCT_CONFLICT",
  OUT_OF_STOCK: "OUT_OF_STOCK",

  // Orders & Cart
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  CART_EMPTY: "CART_EMPTY",
  INVALID_ORDER_STATUS: "INVALID_ORDER_STATUS",

  // Payments
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_VERIFICATION_FAILED: "PAYMENT_VERIFICATION_FAILED",
  PAYMENT_METHOD_NOT_SUPPORTED: "PAYMENT_METHOD_NOT_SUPPORTED",

  // Storage
  STORAGE_ERROR: "STORAGE_ERROR",
  UPLOAD_NOT_ALLOWED: "UPLOAD_NOT_ALLOWED"
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes] | string;

