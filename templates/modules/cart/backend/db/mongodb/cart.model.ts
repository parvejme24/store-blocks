import mongoose, { Schema, Document } from "mongoose";

export interface ICartDocument extends Document {
  userId?: string;
  guestToken?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    priceMinor: number;
    quantity: number;
    subtotalMinor: number;
    image?: string;
  }>;
  subtotalMinor: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    priceMinor: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotalMinor: { type: Number, required: true },
    image: { type: String }
  },
  { _id: false }
);

const CartSchema = new Schema<ICartDocument>(
  {
    userId: { type: String, sparse: true, index: true },
    guestToken: { type: String, sparse: true, index: true },
    items: { type: [CartItemSchema], default: [] },
    subtotalMinor: { type: Number, default: 0 },
    currency: { type: String, default: "BDT" }
  },
  { timestamps: true }
);

export const CartModel =
  mongoose.models.Cart || mongoose.model<ICartDocument>("Cart", CartSchema);

