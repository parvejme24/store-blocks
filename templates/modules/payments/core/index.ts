import { paymentsRouter } from "./payments.routes.js";
import { BackendModule } from "../../../../packages/module-kit/src/index.js";

export const basePath = "/api/payments";
export const router = paymentsRouter;
export * from "./payments.registry.js";

const paymentsCoreModule: BackendModule = {
  basePath,
  router
};

export default paymentsCoreModule;

