import { authRouter } from "./auth.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/auth";
export const router = authRouter;
export * from "./auth.middleware.js";
export * from "./auth.tokens.js";

const authModule: BackendModule = {
  basePath,
  router
};

export default authModule;

