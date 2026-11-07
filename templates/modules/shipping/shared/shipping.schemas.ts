import { z } from "zod";
import { moneyMinorSchema } from "../../../shared-base/src/index.js";

export const shippingZoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Zone name is required"),
  rateMinor: moneyMinorSchema,
  freeShippingThresholdMinor: moneyMinorSchema.nullable().optional(),
  estimatedDays: z.string().default("2-3 business days"),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export type ShippingZone = z.infer<typeof shippingZoneSchema>;

export const createShippingZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  rateMinor: moneyMinorSchema,
  freeShippingThresholdMinor: moneyMinorSchema.nullable().optional(),
  estimatedDays: z.string().default("2-3 business days"),
  isActive: z.boolean().default(true)
});

export type CreateShippingZoneInput = z.infer<typeof createShippingZoneSchema>;

export const updateShippingZoneSchema = createShippingZoneSchema.partial();
export type UpdateShippingZoneInput = z.infer<typeof updateShippingZoneSchema>;

export const calculateShippingSchema = z.object({
  city: z.string().min(1, "City is required"),
  subtotalMinor: moneyMinorSchema
});

export type CalculateShippingInput = z.infer<typeof calculateShippingSchema>;

