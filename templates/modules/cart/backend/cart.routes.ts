import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { productRepository } from "../../products/backend/db/mongodb/products.repository.impl.js";
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema
} from "../shared/cart.schemas.js";
import { CartController } from "./cart.controller.js";
import { CartService } from "./cart.service.js";
import { cartRepository } from "./db/mongodb/cart.repository.impl.js";

export function createCartRouter(
  cartRepo = cartRepository,
  prodRepo = productRepository
): Router {
  const router = Router();
  const service = new CartService(cartRepo, prodRepo);
  const controller = new CartController(service);

  router.get("/", controller.get);
  router.post("/items", validate({ body: addToCartSchema }), controller.addItem);
  router.patch("/items", validate({ body: updateCartItemSchema }), controller.updateItem);
  router.delete("/", controller.clear);
  router.post("/merge", validate({ body: mergeCartSchema }), controller.merge);

  return router;
}

export const cartRouter = createCartRouter();

