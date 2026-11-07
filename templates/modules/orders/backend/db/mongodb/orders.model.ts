import mongoose, { Schema, Document } from "mongoose";
import { OrderStatus, PaymentStatus } from "../../shared/orders.schemas.js";

export interface IOrderDocument extends Document {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  customer: {
    userId?: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  items: Array<{
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    priceMinor: number;
    quantity: number;
    subtotalMinor: number;
  }>;
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    priceMinor: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotalMinor: { type: Number, required: true }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
      index: true
    },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
    customer: {
      userId: { type: String, index: true },
      name: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: true }
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      country: { type: String, required: true }
    },
    items: { type: [OrderItemSchema], required: true },
    subtotalMinor: { type: Number, required: true },
    shippingMinor: { type: Number, required: true, default: 0 },
    discountMinor: { type: Number, required: true, default: 0 },
    totalMinor: { type: Number, required: true },
    currency: { type: String, required: true, default: "BDT" },
    notes: { type: String }
  },
  { timestamps: true }
);

export const OrderModel =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);

