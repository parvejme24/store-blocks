import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { idParamSchema, slugParamSchema } from "../../../shared-base/src/index.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema
} from "../shared/categories.schemas.js";
import { CategoryController } from "./categories.controller.js";
import { CategoryService } from "./categories.service.js";
import { categoryRepository } from "./db/mongodb/categories.repository.impl.js";

export function createCategoriesRouter(
  repo = categoryRepository
): Router {
  const router = Router();
  const service = new CategoryService(repo);
  const controller = new CategoryController(service);

  router.get(
    "/",
    validate({ query: categoryQuerySchema }),
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
    validate({ body: createCategorySchema }),
    controller.create
  );

  router.patch(
    "/:id",
    validate({ params: idParamSchema, body: updateCategorySchema }),
    controller.update
  );

  router.delete(
    "/:id",
    validate({ params: idParamSchema }),
    controller.delete
  );

  return router;
}

export const categoriesRouter = createCategoriesRouter();

