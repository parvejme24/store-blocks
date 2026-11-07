import { reviewsRouter } from "./reviews.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/reviews";
export const router = reviewsRouter;

const reviewsModule: BackendModule = {
  basePath,
  router
};

export default reviewsModule;

