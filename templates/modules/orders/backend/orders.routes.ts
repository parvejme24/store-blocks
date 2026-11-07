import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { idParamSchema } from "../../../shared-base/src/index.js";
import { productRepository } from "../../products/backend/db/mongodb/products.repository.impl.js";
import { unitOfWork } from "../../../backend-base/src/db/mongodb/unit-of-work.js";
import {
  checkoutInputSchema,
  updateOrderStatusSchema,
  orderQuerySchema
} from "../shared/orders.schemas.js";
import { OrderController } from "./orders.controller.js";
import { OrderService } from "./orders.service.js";
import { orderRepository } from "./db/mongodb/orders.repository.impl.js";

export function createOrdersRouter(
  orderRepo = orderRepository,
  prodRepo = productRepository,
  uow = unitOfWork
): Router {
  const router = Router();
  const service = new OrderService(orderRepo, prodRepo, uow);
  const controller = new OrderController(service);

  router.get(
    "/",
    validate({ query: orderQuerySchema }),
    controller.list
  );

  router.get(
    "/:id",
    validate({ params: idParamSchema }),
    controller.getById
  );

  router.post(
    "/checkout",
    validate({ body: checkoutInputSchema }),
    controller.checkout
  );

  router.patch(
    "/:id/status",
    validate({ params: idParamSchema, body: updateOrderStatusSchema }),
    controller.updateStatus
  );

  return router;
}

export const ordersRouter = createOrdersRouter();

