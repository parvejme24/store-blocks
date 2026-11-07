import { localAdapter } from "./local.adapter.js";
import { registerStorageAdapter } from "../core/storage.registry.js";

// Register this adapter as the active storage provider
registerStorageAdapter(localAdapter);

export * from "./local.adapter.js";

