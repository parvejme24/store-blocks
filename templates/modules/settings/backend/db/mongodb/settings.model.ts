import mongoose, { Schema, Document } from "mongoose";

export interface ISettingsDocument extends Document {
  storeName: string;
  storeDescription: string;
  logo?: { key: string; provider: "cloudinary" | "s3" | "local"; alt?: string } | null;
  favicon?: { key: string; provider: "cloudinary" | "s3" | "local"; alt?: string } | null;
  email: string;
  phone: string;
  address: string;
  currency: string;
  socialLinks: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const StoredFileSchema = new Schema(
  {
    key: { type: String, required: true },
    provider: { type: String, enum: ["cloudinary", "s3", "local"], required: true },
    alt: { type: String }
  },
  { _id: false }
);

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    storeName: { type: String, default: "StoreBlocks Store" },
    storeDescription: { type: String, default: "Your modular e-commerce store" },
    logo: { type: StoredFileSchema, default: null },
    favicon: { type: StoredFileSchema, default: null },
    email: { type: String, default: "store@example.com" },
    phone: { type: String, default: "+8801700000000" },
    address: { type: String, default: "Dhaka, Bangladesh" },
    currency: { type: String, default: "BDT" },
    socialLinks: { type: Map, of: String, default: {} }
  },
  { timestamps: true }
);

export const SettingsModel =
  mongoose.models.Settings || mongoose.model<ISettingsDocument>("Settings", SettingsSchema);

