import { Router } from "express";
import { validate } from "../../../backend-base/src/middlewares/validate.js";
import { requireAuth } from "../../auth/backend/auth.middleware.js";
import { productRepository } from "../../products/backend/db/mongodb/products.repository.impl.js";
import { toggleWishlistSchema } from "../shared/wishlist.schemas.js";
import { WishlistController } from "./wishlist.controller.js";
import { WishlistService } from "./wishlist.service.js";
import { wishlistRepository } from "./db/mongodb/wishlist.repository.impl.js";

export function createWishlistRouter(
  wishRepo = wishlistRepository,
  prodRepo = productRepository
): Router {
  const router = Router();
  const service = new WishlistService(wishRepo, prodRepo);
  const controller = new WishlistController(service);

  router.use(requireAuth);

  router.get("/", controller.get);
  router.post("/toggle", validate({ body: toggleWishlistSchema }), controller.toggle);
  router.delete("/", controller.clear);

  return router;
}

export const wishlistRouter = createWishlistRouter();

