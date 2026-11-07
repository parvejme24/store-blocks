import { settingsRouter } from "./settings.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/settings";
export const router = settingsRouter;

const settingsModule: BackendModule = {
  basePath,
  router
};

export default settingsModule;

