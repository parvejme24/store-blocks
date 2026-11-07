import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TxContext } from "../../../../../shared-base/src/index.js";
import {
  ShippingZone,
  CreateShippingZoneInput,
  UpdateShippingZoneInput
} from "../../../shared/shipping.schemas.js";
import { ShippingRepository } from "../../shipping.repository.js";
import { shippingZones, ShippingZoneRow } from "./shipping.schema.js";

function rowToShippingZone(row: ShippingZoneRow): ShippingZone {
  return {
    id: row.id,
    name: row.name,
    rateMinor: row.rateMinor,
    freeShippingThresholdMinor: row.freeShippingThresholdMinor ?? null,
    estimatedDays: row.estimatedDays,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export class PostgresShippingRepository implements ShippingRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async findMany(tx?: TxContext): Promise<ShippingZone[]> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(shippingZones).where(eq(shippingZones.isActive, true));
    return rows.map(rowToShippingZone);
  }

  async findById(id: string, tx?: TxContext): Promise<ShippingZone | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(shippingZones).where(eq(shippingZones.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToShippingZone(row);
  }

  async findByName(name: string, tx?: TxContext): Promise<ShippingZone | null> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(shippingZones).where(eq(shippingZones.name, name)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return rowToShippingZone(row);
  }

  async create(input: CreateShippingZoneInput, tx?: TxContext): Promise<ShippingZone> {
    const client = this.resolveClient(tx);
    const rows = await client
      .insert(shippingZones)
      .values({
        name: input.name,
        rateMinor: input.rateMinor,
        freeShippingThresholdMinor: input.freeShippingThresholdMinor,
        estimatedDays: input.estimatedDays,
        isActive: input.isActive
      })
      .returning();

    return rowToShippingZone(rows[0]!);
  }

  async update(id: string, input: UpdateShippingZoneInput, tx?: TxContext): Promise<ShippingZone | null> {
    const client = this.resolveClient(tx);
    const updateValues: Record<string, any> = {
      updatedAt: new Date()
    };
    if (input.name !== undefined) updateValues.name = input.name;
    if (input.rateMinor !== undefined) updateValues.rateMinor = input.rateMinor;
    if (input.freeShippingThresholdMinor !== undefined) updateValues.freeShippingThresholdMinor = input.freeShippingThresholdMinor;
    if (input.estimatedDays !== undefined) updateValues.estimatedDays = input.estimatedDays;
    if (input.isActive !== undefined) updateValues.isActive = input.isActive;

    const rows = await client
      .update(shippingZones)
      .set(updateValues)
      .where(eq(shippingZones.id, id))
      .returning();

    const row = rows[0];
    if (!row) return null;
    return rowToShippingZone(row);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const client = this.resolveClient(tx);
    const rows = await client.delete(shippingZones).where(eq(shippingZones.id, id)).returning({ id: shippingZones.id });
    return rows.length > 0;
  }
}

