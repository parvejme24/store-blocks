import mongoose, { Schema, Document } from "mongoose";

export interface IBrandDocument extends Document {
  name: string;
  slug: string;
  description: string;
  logo?: { key: string; provider: "cloudinary" | "s3" | "local"; alt?: string } | null;
  website?: string | null;
  isActive: boolean;
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

const BrandSchema = new Schema<IBrandDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: "" },
    logo: { type: StoredFileSchema, default: null },
    website: { type: String, default: null },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const BrandModel =
  mongoose.models.Brand || mongoose.model<IBrandDocument>("Brand", BrandSchema);

