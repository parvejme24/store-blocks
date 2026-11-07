import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { idParamSchema } from "../../../shared-base/src/index.js";
import { productRepository } from "../../products/backend/db/mongodb/products.repository.impl.js";
import {
  createReviewSchema,
  approveReviewSchema,
  reviewQuerySchema
} from "../shared/reviews.schemas.js";
import { ReviewController } from "./reviews.controller.js";
import { ReviewService } from "./reviews.service.js";
import { reviewRepository } from "./db/mongodb/reviews.repository.impl.js";

export function createReviewsRouter(
  revRepo = reviewRepository,
  prodRepo = productRepository
): Router {
  const router = Router();
  const service = new ReviewService(revRepo, prodRepo);
  const controller = new ReviewController(service);

  router.get("/", validate({ query: reviewQuerySchema }), controller.list);
  router.get("/:id", validate({ params: idParamSchema }), controller.getById);
  router.post("/", validate({ body: createReviewSchema }), controller.create);
  router.patch("/:id/approve", validate({ params: idParamSchema, body: approveReviewSchema }), controller.approve);
  router.delete("/:id", validate({ params: idParamSchema }), controller.delete);

  return router;
}

export const reviewsRouter = createReviewsRouter();

