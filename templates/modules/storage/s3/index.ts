import { s3Adapter } from "./s3.adapter.js";
import { registerStorageAdapter } from "../core/storage.registry.js";

// Register this adapter as the active storage provider
registerStorageAdapter(s3Adapter);

export * from "./s3.adapter.js";

