import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { AppError, ErrorCodes } from "../../../shared-base/src/index.js";
import { getStorageAdapter } from "./storage.registry.js";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/avif"
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const signUploadSchema = z.object({
  folder: z.string().min(1).default("products"),
  contentType: z
    .string()
    .refine((type) => ALLOWED_MIME_TYPES.includes(type), {
      message: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
    }),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, `File size exceeds max limit of 10MB`)
});

export function createStorageRouter(): Router {
  const router = Router();

  router.post(
    "/sign",
    validate({ body: signUploadSchema }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const adapter = getStorageAdapter();
        const signed = await adapter.getUploadUrl(req.body);
        res.status(200).json({
          success: true,
          data: signed
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    "/*",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const key = req.params[0];
        if (!key) {
          throw new AppError(ErrorCodes.VALIDATION_ERROR, "Storage key is required", 400);
        }
        const adapter = getStorageAdapter();
        await adapter.delete(key);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

export const storageRouter = createStorageRouter();

