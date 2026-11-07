import mongoose, { Schema, Document } from "mongoose";

export interface IShippingZoneDocument extends Document {
  name: string;
  rateMinor: number;
  freeShippingThresholdMinor?: number | null;
  estimatedDays: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingZoneSchema = new Schema<IShippingZoneDocument>(
  {
    name: { type: String, required: true, trim: true },
    rateMinor: { type: Number, required: true, min: 0 },
    freeShippingThresholdMinor: { type: Number, default: null },
    estimatedDays: { type: String, default: "2-3 business days" },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const ShippingZoneModel =
  mongoose.models.ShippingZone ||
  mongoose.model<IShippingZoneDocument>("ShippingZone", ShippingZoneSchema);

