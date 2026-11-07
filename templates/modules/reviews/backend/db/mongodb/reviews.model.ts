import mongoose, { Schema, Document } from "mongoose";

export interface IReviewDocument extends Document {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const ReviewModel =
  mongoose.models.Review || mongoose.model<IReviewDocument>("Review", ReviewSchema);

