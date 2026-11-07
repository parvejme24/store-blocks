import { z } from "zod";
import { paginationQuerySchema } from "../../../shared-base/src/index.js";

export const addressSchema = z.object({
  id: z.string(),
  label: z.string().default("Home"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().optional(),
  country: z.string().default("Bangladesh"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false)
});

export type Address = z.infer<typeof addressSchema>;

export const userRoleSchema = z.enum(["customer", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: userRoleSchema.default("customer"),
  phone: z.string().optional(),
  addresses: z.array(addressSchema).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

export interface UserWithPassword extends User {
  passwordHash: string;
}

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: userRoleSchema.optional().default("customer"),
  phone: z.string().optional(),
  addresses: z.array(addressSchema).optional().default([]),
  isActive: z.boolean().optional().default(true)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  addresses: z.array(addressSchema).optional()
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export const adminUpdateUserSchema = updateUserProfileSchema.extend({
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional()
});

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

export const userQuerySchema = paginationQuerySchema.extend({
  q: z.string().optional(),
  role: userRoleSchema.optional(),
  isActive: z
    .preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean())
    .optional()
});

export type UserQuery = z.infer<typeof userQuerySchema>;

