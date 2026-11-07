import { ClientSession, FilterQuery } from "mongoose";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Brand,
  CreateBrandInput,
  UpdateBrandInput,
  BrandQuery
} from "../../../shared/brands.schemas.js";
import { BrandRepository } from "../../brands.repository.js";
import { BrandModel, IBrandDocument } from "./brands.model.js";

function toBrand(doc: IBrandDocument): Brand {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    name: obj.name,
    slug: obj.slug,
    description: obj.description || "",
    logo: obj.logo
      ? {
          key: obj.logo.key,
          provider: obj.logo.provider,
          alt: obj.logo.alt
        }
      : null,
    website: obj.website || null,
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

export class MongoBrandRepository implements BrandRepository {
  async findMany(query: BrandQuery): Promise<Paginated<Brand>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IBrandDocument> = {};
    if (query.q) {
      filter.name = { $regex: query.q, $options: "i" };
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [docs, total] = await Promise.all([
      BrandModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      BrandModel.countDocuments(filter)
    ]);

    const items = docs.map((d: any) => toBrand(d));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Brand | null> {
    const session = tx as ClientSession | undefined;
    const doc = await BrandModel.findById(id).session(session || null);
    if (!doc) return null;
    return toBrand(doc);
  }

  async findBySlug(slug: string, tx?: TxContext): Promise<Brand | null> {
    const session = tx as ClientSession | undefined;
    const doc = await BrandModel.findOne({ slug }).session(session || null);
    if (!doc) return null;
    return toBrand(doc);
  }

  async create(input: CreateBrandInput, tx?: TxContext): Promise<Brand> {
    const session = tx as ClientSession | undefined;
    const [doc] = await BrandModel.create([input], { session: session || undefined });
    return toBrand(doc!);
  }

  async update(id: string, input: UpdateBrandInput, tx?: TxContext): Promise<Brand | null> {
    const session = tx as ClientSession | undefined;
    const doc = await BrandModel.findByIdAndUpdate(
      id,
      { $set: input },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toBrand(doc);
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const res = await BrandModel.findByIdAndDelete(id, { session: session || null });
    return Boolean(res);
  }
}

export const brandRepository = new MongoBrandRepository();

