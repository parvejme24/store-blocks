import { cloudinaryAdapter } from "./cloudinary.adapter.js";
import { registerStorageAdapter } from "../core/storage.registry.js";

// Register this adapter as the active storage provider
registerStorageAdapter(cloudinaryAdapter);

export * from "./cloudinary.adapter.js";

