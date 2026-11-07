import { ClientSession, FilterQuery } from "mongoose";
import { Paginated, TxContext } from "../../../../../shared-base/src/index.js";
import {
  Coupon,
  CreateCouponInput,
  UpdateCouponInput,
  CouponQuery
} from "../../../shared/coupons.schemas.js";
import { CouponRepository } from "../../coupons.repository.js";
import { CouponModel, ICouponDocument } from "./coupons.model.js";

function toCoupon(doc: ICouponDocument): Coupon {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: (doc._id || obj._id).toString(),
    code: obj.code,
    discountType: obj.discountType,
    discountValue: obj.discountValue,
    minOrderMinor: obj.minOrderMinor,
    maxDiscountMinor: obj.maxDiscountMinor ?? null,
    usageLimit: obj.usageLimit ?? null,
    usedCount: obj.usedCount || 0,
    expiresAt: obj.expiresAt ?? null,
    isActive: obj.isActive,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

export class MongoCouponRepository implements CouponRepository {
  async findMany(query: CouponQuery): Promise<Paginated<Coupon>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<ICouponDocument> = {};
    if (query.q) {
      filter.code = { $regex: query.q, $options: "i" };
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const [docs, total] = await Promise.all([
      CouponModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      CouponModel.countDocuments(filter)
    ]);

    const items = docs.map((d: any) => toCoupon(d));
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      page,
      limit,
      total,
      totalPages
    };
  }

  async findById(id: string, tx?: TxContext): Promise<Coupon | null> {
    const session = tx as ClientSession | undefined;
    const doc = await CouponModel.findById(id).session(session || null);
    if (!doc) return null;
    return toCoupon(doc);
  }

  async findByCode(code: string, tx?: TxContext): Promise<Coupon | null> {
    const session = tx as ClientSession | undefined;
    const doc = await CouponModel.findOne({ code: code.toUpperCase() }).session(session || null);
    if (!doc) return null;
    return toCoupon(doc);
  }

  async create(input: CreateCouponInput, tx?: TxContext): Promise<Coupon> {
    const session = tx as ClientSession | undefined;
    const [doc] = await CouponModel.create(
      [
        {
          code: input.code.toUpperCase(),
          discountType: input.discountType,
          discountValue: input.discountValue,
          minOrderMinor: input.minOrderMinor || 0,
          maxDiscountMinor: input.maxDiscountMinor,
          usageLimit: input.usageLimit,
          expiresAt: input.expiresAt,
          isActive: input.isActive ?? true
        }
      ],
      { session: session || undefined }
    );
    return toCoupon(doc!);
  }

  async update(id: string, input: UpdateCouponInput, tx?: TxContext): Promise<Coupon | null> {
    const session = tx as ClientSession | undefined;
    const updateData: Record<string, any> = { ...input };
    if (input.code) updateData.code = input.code.toUpperCase();

    const doc = await CouponModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, session: session || null }
    );
    if (!doc) return null;
    return toCoupon(doc);
  }

  async incrementUsage(id: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const res = await CouponModel.updateOne(
      { _id: id },
      { $inc: { usedCount: 1 } },
      { session: session || null }
    );
    return res.modifiedCount > 0;
  }

  async delete(id: string, tx?: TxContext): Promise<boolean> {
    const session = tx as ClientSession | undefined;
    const res = await CouponModel.findByIdAndDelete(id, { session: session || null });
    return Boolean(res);
  }
}

export const couponRepository = new MongoCouponRepository();

