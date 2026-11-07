import { AppError, ErrorCodes, TxContext } from "../../../shared-base/src/index.js";
import {
  ShippingZone,
  CreateShippingZoneInput,
  UpdateShippingZoneInput,
  CalculateShippingInput
} from "../shared/shipping.schemas.js";
import { ShippingRepository } from "./shipping.repository.js";

export class ShippingService {
  constructor(private readonly repo: ShippingRepository) {}

  async getZones(tx?: TxContext): Promise<ShippingZone[]> {
    const zones = await this.repo.findMany(tx);
    if (zones.length === 0) {
      // Initialize standard Bangladeshi default rates
      const insideDhaka = await this.repo.create(
        {
          name: "Inside Dhaka",
          rateMinor: 6000, // ৳60.00
          freeShippingThresholdMinor: 200000, // Free above ৳2,000.00
          estimatedDays: "1-2 business days",
          isActive: true
        },
        tx
      );
      const outsideDhaka = await this.repo.create(
        {
          name: "Outside Dhaka",
          rateMinor: 12000, // ৳120.00
          freeShippingThresholdMinor: 350000, // Free above ৳3,500.00
          estimatedDays: "3-5 business days",
          isActive: true
        },
        tx
      );
      return [insideDhaka, outsideDhaka];
    }
    return zones;
  }

  async getZoneById(id: string, tx?: TxContext): Promise<ShippingZone> {
    const zone = await this.repo.findById(id, tx);
    if (!zone) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Shipping zone not found with id: ${id}`, 404);
    }
    return zone;
  }

  async createZone(input: CreateShippingZoneInput, tx?: TxContext): Promise<ShippingZone> {
    return this.repo.create(input, tx);
  }

  async updateZone(id: string, input: UpdateShippingZoneInput, tx?: TxContext): Promise<ShippingZone> {
    await this.getZoneById(id, tx);
    const updated = await this.repo.update(id, input, tx);
    return updated!;
  }

  async deleteZone(id: string, tx?: TxContext): Promise<void> {
    await this.getZoneById(id, tx);
    await this.repo.delete(id, tx);
  }

  async calculateRate(input: CalculateShippingInput, tx?: TxContext): Promise<{ zone: ShippingZone; rateMinor: number }> {
    const zones = await this.getZones(tx);
    const isDhaka = input.city.toLowerCase().includes("dhaka");
    const targetZone =
      zones.find((z) => (isDhaka ? z.name.toLowerCase().includes("inside") : z.name.toLowerCase().includes("outside"))) ||
      zones[0];

    if (!targetZone) {
      return {
        zone: {
          id: "standard",
          name: "Standard Delivery",
          rateMinor: 8000,
          estimatedDays: "2-3 business days",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        rateMinor: 8000
      };
    }

    let rateMinor = targetZone.rateMinor;
    if (
      targetZone.freeShippingThresholdMinor &&
      input.subtotalMinor >= targetZone.freeShippingThresholdMinor
    ) {
      rateMinor = 0; // Free delivery threshold met!
    }

    return { zone: targetZone, rateMinor };
  }
}

