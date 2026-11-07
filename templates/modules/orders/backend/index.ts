import { ordersRouter } from "./orders.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/orders";
export const router = ordersRouter;

const ordersModule: BackendModule = {
  basePath,
  router
};

export default ordersModule;

