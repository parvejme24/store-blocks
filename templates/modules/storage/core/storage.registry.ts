import { StorageAdapter } from "../../../../packages/module-kit/src/index.js";

let activeAdapter: StorageAdapter | null = null;

export function registerStorageAdapter(adapter: StorageAdapter): void {
  activeAdapter = adapter;
}

export function getStorageAdapter(): StorageAdapter {
  if (!activeAdapter) {
    throw new Error(
      "No StorageAdapter has been registered. Please configure a storage provider in store.config.json"
    );
  }
  return activeAdapter;
}

