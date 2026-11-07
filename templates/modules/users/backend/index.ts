import { usersRouter } from "./users.routes.js";
import { BackendModule } from "../../../packages/module-kit/src/index.js";

export const basePath = "/api/users";
export const router = usersRouter;

const usersModule: BackendModule = {
  basePath,
  router
};

export default usersModule;

