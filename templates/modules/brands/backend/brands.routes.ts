import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { idParamSchema, slugParamSchema } from "../../../shared-base/src/index.js";
import {
  createBrandSchema,
  updateBrandSchema,
  brandQuerySchema
} from "../shared/brands.schemas.js";
import { BrandController } from "./brands.controller.js";
import { BrandService } from "./brands.service.js";
import { brandRepository } from "./db/mongodb/brands.repository.impl.js";

export function createBrandsRouter(repo = brandRepository): Router {
  const router = Router();
  const service = new BrandService(repo);
  const controller = new BrandController(service);

  router.get("/", validate({ query: brandQuerySchema }), controller.list);
  router.get("/slug/:slug", validate({ params: slugParamSchema }), controller.getBySlug);
  router.get("/:id", validate({ params: idParamSchema }), controller.getById);
  router.post("/", validate({ body: createBrandSchema }), controller.create);
  router.patch("/:id", validate({ params: idParamSchema, body: updateBrandSchema }), controller.update);
  router.delete("/:id", validate({ params: idParamSchema }), controller.delete);

  return router;
}

export const brandsRouter = createBrandsRouter();

