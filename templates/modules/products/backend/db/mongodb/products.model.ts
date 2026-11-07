import mongoose, { Schema, Document } from "mongoose";

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  description: string;
  priceMinor: number;
  compareAtPriceMinor?: number | null;
  currency: string;
  sku: string;
  stock: number;
  images: Array<{ key: string; provider: "cloudinary" | "s3" | "local"; alt?: string }>;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    priceMinor?: number;
    stock: number;
    attributes?: Record<string, string>;
  }>;
  categoryIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    priceMinor: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    attributes: { type: Map, of: String }
  },
  { _id: false }
);

const StoredFileSchema = new Schema(
  {
    key: { type: String, required: true },
    provider: { type: String, enum: ["cloudinary", "s3", "local"], required: true },
    alt: { type: String }
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: "" },
    priceMinor: { type: Number, required: true, min: 0 },
    compareAtPriceMinor: { type: Number, default: null },
    currency: { type: String, required: true, default: "BDT" },
    sku: { type: String, required: true, unique: true, trim: true, index: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: { type: [StoredFileSchema], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    categoryIds: { type: [String], default: [], index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  {
    timestamps: true
  }
);

// Compound text index for search
ProductSchema.index({ name: "text", description: "text" });

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);

