import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { idParamSchema } from "../../../shared-base/src/index.js";
import {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
  couponQuerySchema
} from "../shared/coupons.schemas.js";
import { CouponController } from "./coupons.controller.js";
import { CouponService } from "./coupons.service.js";
import { couponRepository } from "./db/mongodb/coupons.repository.impl.js";

export function createCouponsRouter(repo = couponRepository): Router {
  const router = Router();
  const service = new CouponService(repo);
  const controller = new CouponController(service);

  router.get("/", validate({ query: couponQuerySchema }), controller.list);
  router.get("/:id", validate({ params: idParamSchema }), controller.getById);
  router.post("/", validate({ body: createCouponSchema }), controller.create);
  router.patch("/:id", validate({ params: idParamSchema, body: updateCouponSchema }), controller.update);
  router.delete("/:id", validate({ params: idParamSchema }), controller.delete);
  router.post("/apply", validate({ body: applyCouponSchema }), controller.apply);

  return router;
}

export const couponsRouter = createCouponsRouter();

