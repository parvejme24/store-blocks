import { couponsRouter } from "./coupons.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/coupons";
export const router = couponsRouter;

const couponsModule: BackendModule = {
  basePath,
  router
};

export default couponsModule;

