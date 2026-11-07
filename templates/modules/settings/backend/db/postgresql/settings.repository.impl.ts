import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TxContext } from "../../../../../shared-base/src/index.js";
import { Settings, UpdateSettingsInput } from "../../../shared/settings.schemas.js";
import { SettingsRepository } from "../../settings.repository.js";
import { settings, SettingsRow } from "./settings.schema.js";

function rowToSettings(row: SettingsRow): Settings {
  return {
    id: row.id,
    storeName: row.storeName,
    storeDescription: row.storeDescription,
    logo: (row.logo || null) as any,
    favicon: (row.favicon || null) as any,
    email: row.email,
    phone: row.phone,
    address: row.address,
    currency: row.currency,
    socialLinks: (row.socialLinks || {}) as any,
    updatedAt: row.updatedAt
  };
}

export class PostgresSettingsRepository implements SettingsRepository {
  constructor(private readonly getDb: () => NodePgDatabase) {}

  private resolveClient(tx?: TxContext): NodePgDatabase {
    return (tx as NodePgDatabase) || this.getDb();
  }

  async get(tx?: TxContext): Promise<Settings> {
    const client = this.resolveClient(tx);
    const rows = await client.select().from(settings).where(eq(settings.id, "default")).limit(1);
    let row = rows[0];

    if (!row) {
      const inserted = await client
        .insert(settings)
        .values({ id: "default" })
        .returning();
      row = inserted[0];
    }

    return rowToSettings(row!);
  }

  async update(input: UpdateSettingsInput, tx?: TxContext): Promise<Settings> {
    const client = this.resolveClient(tx);
    const updateValues: Record<string, any> = {
      updatedAt: new Date()
    };
    if (input.storeName !== undefined) updateValues.storeName = input.storeName;
    if (input.storeDescription !== undefined) updateValues.storeDescription = input.storeDescription;
    if (input.logo !== undefined) updateValues.logo = input.logo;
    if (input.favicon !== undefined) updateValues.favicon = input.favicon;
    if (input.email !== undefined) updateValues.email = input.email;
    if (input.phone !== undefined) updateValues.phone = input.phone;
    if (input.address !== undefined) updateValues.address = input.address;
    if (input.currency !== undefined) updateValues.currency = input.currency;
    if (input.socialLinks !== undefined) updateValues.socialLinks = input.socialLinks;

    const rows = await client
      .insert(settings)
      .values({ id: "default", ...updateValues })
      .onConflictDoUpdate({
        target: settings.id,
        set: updateValues
      })
      .returning();

    return rowToSettings(rows[0]!);
  }
}

