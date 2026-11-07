import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  phone?: string;
  addresses: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    postalCode?: string;
    country: string;
    phone?: string;
    isDefault: boolean;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, default: "Home" },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, default: "Bangladesh" },
    phone: { type: String },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer", index: true },
    phone: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ name: "text", email: "text" });

export const UserModel =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

