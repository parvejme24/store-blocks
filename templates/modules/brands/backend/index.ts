import { brandsRouter } from "./brands.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/brands";
export const router = brandsRouter;

const brandsModule: BackendModule = {
  basePath,
  router
};

export default brandsModule;

