import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { idParamSchema } from "../../../shared-base/src/index.js";
import {
  updateUserProfileSchema,
  adminUpdateUserSchema,
  userQuerySchema
} from "../shared/users.schemas.js";
import { UserController } from "./users.controller.js";
import { UserService } from "./users.service.js";
import { userRepository } from "./db/mongodb/users.repository.impl.js";

export function createUsersRouter(
  repo = userRepository
): Router {
  const router = Router();
  const service = new UserService(repo);
  const controller = new UserController(service);

  // Profile endpoints (require auth)
  router.get("/profile", controller.getProfile);
  router.patch(
    "/profile",
    validate({ body: updateUserProfileSchema }),
    controller.updateProfile
  );

  // Admin endpoints
  router.get(
    "/",
    validate({ query: userQuerySchema }),
    controller.list
  );

  router.get(
    "/:id",
    validate({ params: idParamSchema }),
    controller.getById
  );

  router.patch(
    "/:id",
    validate({ params: idParamSchema, body: adminUpdateUserSchema }),
    controller.adminUpdate
  );

  router.delete(
    "/:id",
    validate({ params: idParamSchema }),
    controller.delete
  );

  return router;
}

export const usersRouter = createUsersRouter();

