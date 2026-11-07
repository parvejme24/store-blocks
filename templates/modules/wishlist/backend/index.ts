import { wishlistRouter } from "./wishlist.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/wishlist";
export const router = wishlistRouter;

const wishlistModule: BackendModule = {
  basePath,
  router
};

export default wishlistModule;

