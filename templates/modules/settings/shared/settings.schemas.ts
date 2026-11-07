import { z } from "zod";
import { storedFileSchema } from "../../../shared-base/src/index.js";

export const settingsSchema = z.object({
  id: z.string().default("default"),
  storeName: z.string().min(1, "Store name is required").default("StoreBlocks Store"),
  storeDescription: z.string().default("Your modular e-commerce store"),
  logo: storedFileSchema.nullable().optional(),
  favicon: storedFileSchema.nullable().optional(),
  email: z.string().email().default("store@example.com"),
  phone: z.string().default("+8801700000000"),
  address: z.string().default("Dhaka, Bangladesh"),
  currency: z.string().length(3).default("BDT"),
  socialLinks: z.record(z.string()).default({}),
  updatedAt: z.coerce.date()
});

export type Settings = z.infer<typeof settingsSchema>;

export const updateSettingsSchema = settingsSchema.partial().omit({ id: true });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

