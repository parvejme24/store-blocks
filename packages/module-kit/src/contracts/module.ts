export interface SeedContext {
  db: unknown;
  logger: {
    info: (msg: string, ...args: unknown[]) => void;
    warn: (msg: string, ...args: unknown[]) => void;
    error: (msg: string, ...args: unknown[]) => void;
  };
}

export interface BackendModule {
  basePath: string;
  router: unknown; // Express Router
  seed?: (ctx: SeedContext) => Promise<void>;
}

