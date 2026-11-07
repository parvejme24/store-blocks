import { storageRouter } from "./storage.routes.js";
import { BackendModule } from "../../../../packages/module-kit/src/index.js";

export const basePath = "/api/storage";
export const router = storageRouter;
export * from "./storage.registry.js";

const storageCoreModule: BackendModule = {
  basePath,
  router
};

export default storageCoreModule;

