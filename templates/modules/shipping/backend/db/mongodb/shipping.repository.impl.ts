import { ClientSession } from "mongoose";
import { TxContext } from "../../../../../shared-base/src/index.js";
import {
  ShippingZone,
  CreateShippingZoneInput,
  UpdateShippingZoneInput
} from "../../../shared/shipping.schemas.js";
import { ShippingRepository } from "../../shipping.repository.js";
import { ShippingZoneModel, IShippingZoneDocument } from "./shipping.model.js";

function toShippingZone(doc: IShippingZoneDocument): ShippingZone {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    name: obj.name,
    rateMinor: obj.rateMinor,
    freeShippingThresholdMinor: obj.freeShippingThresholdMinor ?? null,
    estimatedDays: obj.estimatedDays,
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

export class MongoShippingRepository implements ShippingRepository {
  async findMany(tx?: TxContext): Promise<ShippingZone[]> {
    const session = tx as ClientSession | undefined;
    const docs = await ShippingZoneModel.find({ isActive: true }).session(session || null).lean();
    return docs.map((d: any) => toShippingZone(d));
  }

  async findById(id: string, tx?: TxContext): Promise<ShippingZone | null> {
    const session = tx as ClientSession | undefined;
    const doc = await ShippingZoneModel.findById(id).session(session || null);
    if (!doc) return null;
    return toShippingZone(doc);
  }

  async findByName(name: string, tx?: TxContext): Promise<ShippingZone | null> {
    const session = tx as ClientSession | undefined;
    const doc = await ShippingZoneModel.findOne({ name }).session(session || null);
    if (!doc) return null;
    return toShippingZone(doc);
  }

  async create(input: CreateShippingZoneInput, tx?: TxContext): Promise<ShippingZone> {
    const session = tx as ClientSession | undefined;
    const [doc] = await ShippingZoneModel.create([input], { session: session || undefined });
    return toShippingZone(doc!);
  }

  async update(id: string, input: UpdateShippingZoneInput, tx?: TxContext): Promise<ShippingZone | null> {
    const session = tx as ClientSession | undefined;
    const doc = await ShippingZoneModel.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toShippingZone(doc);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const res = await ShippingZoneModel.findByIdAndDelete(id, { session: session || null });
    return Boolean(res);
  }
}

export const shippingRepository = new MongoShippingRepository();

