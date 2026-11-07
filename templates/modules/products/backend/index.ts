import { productsRouter } from "./products.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/products";
export const router = productsRouter;

const productsModule: BackendModule = {
  basePath,
  router
};

export default productsModule;

