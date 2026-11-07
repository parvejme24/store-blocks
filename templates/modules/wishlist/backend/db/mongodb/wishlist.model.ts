import mongoose, { Schema, Document } from "mongoose";

export interface IWishlistDocument extends Document {
  userId: string;
  productIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlistDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    productIds: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const WishlistModel =
  mongoose.models.Wishlist || mongoose.model<IWishlistDocument>("Wishlist", WishlistSchema);

