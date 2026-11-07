import { categoriesRouter } from "./categories.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/categories";
export const router = categoriesRouter;

const categoriesModule: BackendModule = {
  basePath,
  router
};

export default categoriesModule;

