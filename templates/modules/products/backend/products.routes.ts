import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { idParamSchema, slugParamSchema } from "../../../shared-base/src/index.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema
} from "../shared/products.schemas.js";
import { ProductController } from "./products.controller.js";
import { ProductService } from "./products.service.js";
import { productRepository } from "./db/mongodb/products.repository.impl.js";

export function createProductsRouter(
  repo = productRepository
): Router {
  const router = Router();
  const service = new ProductService(repo);
  const controller = new ProductController(service);

  router.get(
    "/",
    validate({ query: productQuerySchema }),
    controller.list
  );

  router.get(
    "/slug/:slug",
    validate({ params: slugParamSchema }),
    controller.getBySlug
  );

  router.get(
    "/:id",
    validate({ params: idParamSchema }),
    controller.getById
  );

  router.post(
    "/",
    validate({ body: createProductSchema }),
    controller.create
  );

  router.patch(
    "/:id",
    validate({ params: idParamSchema, body: updateProductSchema }),
    controller.update
  );

  router.delete(
    "/:id",
    validate({ params: idParamSchema }),
    controller.delete
  );

  return router;
}

export const productsRouter = createProductsRouter();

