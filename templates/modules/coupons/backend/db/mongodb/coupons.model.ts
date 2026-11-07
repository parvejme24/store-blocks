import mongoose, { Schema, Document } from "mongoose";
import { DiscountType } from "../../shared/coupons.schemas.js";

export interface ICouponDocument extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderMinor: number;
  maxDiscountMinor?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  expiresAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    minOrderMinor: { type: Number, default: 0 },
    maxDiscountMinor: { type: Number, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const CouponModel =
  mongoose.models.Coupon || mongoose.model<ICouponDocument>("Coupon", CouponSchema);

