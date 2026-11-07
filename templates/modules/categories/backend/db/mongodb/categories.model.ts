import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  image?: { key: string; provider: "cloudinary" | "s3" | "local"; alt?: string } | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: "" },
    parentId: { type: String, default: null, index: true },
    image: {
      type: {
        key: { type: String, required: true },
        provider: { type: String, enum: ["cloudinary", "s3", "local"], required: true },
        alt: { type: String }
      },
      default: null
    },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  {
    timestamps: true
  }
);

export const CategoryModel =
  mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);

