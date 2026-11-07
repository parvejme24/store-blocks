import { shippingRouter } from "./shipping.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/shipping";
export const router = shippingRouter;

const shippingModule: BackendModule = {
  basePath,
  router
};

export default shippingModule;

