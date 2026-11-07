import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { userRepository } from "../../users/backend/db/mongodb/users.repository.impl.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema
} from "../shared/auth.schemas.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { requireAuth } from "./auth.middleware.js";

export function createAuthRouter(userRepo = userRepository): Router {
  const router = Router();
  const service = new AuthService(userRepo);
  const controller = new AuthController(service);

  router.post("/register", validate({ body: registerSchema }), controller.register);
  router.post("/login", validate({ body: loginSchema }), controller.login);
  router.post("/refresh", validate({ body: refreshTokenSchema }), controller.refresh);
  router.post("/logout", controller.logout);
  router.get("/me", requireAuth, controller.me);

  return router;
}

export const authRouter = createAuthRouter();

