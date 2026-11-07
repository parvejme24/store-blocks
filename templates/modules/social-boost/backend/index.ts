import { socialRouter } from "./social.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/social";
export const router = socialRouter;

const socialBoostModule: BackendModule = {
  basePath,
  router
};

export default socialBoostModule;

