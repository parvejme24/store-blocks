import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { idParamSchema } from "../../../shared-base/src/index.js";
import {
  createShippingZoneSchema,
  updateShippingZoneSchema,
  calculateShippingSchema
} from "../shared/shipping.schemas.js";
import { ShippingController } from "./shipping.controller.js";
import { ShippingService } from "./shipping.service.js";
import { shippingRepository } from "./db/mongodb/shipping.repository.impl.js";

export function createShippingRouter(repo = shippingRepository): Router {
  const router = Router();
  const service = new ShippingService(repo);
  const controller = new ShippingController(service);

  router.get("/zones", controller.listZones);
  router.post("/calculate", validate({ body: calculateShippingSchema }), controller.calculate);
  router.post("/zones", validate({ body: createShippingZoneSchema }), controller.createZone);
  router.patch("/zones/:id", validate({ params: idParamSchema, body: updateShippingZoneSchema }), controller.updateZone);
  router.delete("/zones/:id", validate({ params: idParamSchema }), controller.deleteZone);

  return router;
}

export const shippingRouter = createShippingRouter();

