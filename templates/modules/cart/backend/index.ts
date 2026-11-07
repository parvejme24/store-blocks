import { cartRouter } from "./cart.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/cart";
export const router = cartRouter;

const cartModule: BackendModule = {
  basePath,
  router
};

export default cartModule;

