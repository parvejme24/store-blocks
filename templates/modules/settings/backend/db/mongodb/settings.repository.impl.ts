import { ClientSession } from "mongoose";
import { TxContext } from "../../../../../shared-base/src/index.js";
import { Settings, UpdateSettingsInput } from "../../../shared/settings.schemas.js";
import { SettingsRepository } from "../../settings.repository.js";
import { SettingsModel, ISettingsDocument } from "./settings.model.js";

function toSettings(doc: ISettingsDocument): Settings {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    storeName: obj.storeName,
    storeDescription: obj.storeDescription,
    logo: obj.logo
      ? {
          key: obj.logo.key,
          provider: obj.logo.provider,
          alt: obj.logo.alt
        }
      : null,
    favicon: obj.favicon
      ? {
          key: obj.favicon.key,
          provider: obj.favicon.provider,
          alt: obj.favicon.alt
        }
      : null,
    email: obj.email,
    phone: obj.phone,
    address: obj.address,
    currency: obj.currency,
    socialLinks: obj.socialLinks ? Object.fromEntries(obj.socialLinks) : {},
    updatedAt: obj.updatedAt
  };
}

export class MongoSettingsRepository implements SettingsRepository {
  async get(tx?: TxContext): Promise<Settings> {
    const session = tx as ClientSession | undefined;
    let doc = await SettingsModel.findOne().session(session || null);
    if (!doc) {
      const [newDoc] = await SettingsModel.create([{}], { session: session || undefined });
      doc = newDoc;
    }
    return toSettings(doc!);
  }

  async update(input: UpdateSettingsInput, tx?: TxContext): Promise<Settings> {
    const session = tx as ClientSession | undefined;
    let doc = await SettingsModel.findOneAndUpdate(
      {},
      { $set: input },
      { new: true, upsert: true, session: session || null }
    );
    return toSettings(doc!);
  }
}

export const settingsRepository = new MongoSettingsRepository();

