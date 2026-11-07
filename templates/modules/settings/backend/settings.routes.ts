import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { updateSettingsSchema } from "../shared/settings.schemas.js";
import { SettingsController } from "./settings.controller.js";
import { SettingsService } from "./settings.service.js";
import { settingsRepository } from "./db/mongodb/settings.repository.impl.js";

export function createSettingsRouter(
  repo = settingsRepository
): Router {
  const router = Router();
  const service = new SettingsService(repo);
  const controller = new SettingsController(service);

  router.get("/", controller.get);
  router.patch(
    "/",
    validate({ body: updateSettingsSchema }),
    controller.update
  );

  return router;
}

export const settingsRouter = createSettingsRouter();

