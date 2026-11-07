import { AppError, ErrorCodes, Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  Coupon,
  CreateCouponInput,
  UpdateCouponInput,
  CouponQuery,
  ApplyCouponInput
} from "../shared/coupons.schemas.js";
import { CouponRepository } from "./coupons.repository.js";

export class CouponService {
  constructor(private readonly repo: CouponRepository) {}

  async getCoupons(query: CouponQuery): Promise<Paginated<Coupon>> {
    return this.repo.findMany(query);
  }

  async getCouponById(id: string, tx?: TxContext): Promise<Coupon> {
    const coupon = await this.repo.findById(id, tx);
    if (!coupon) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Coupon not found with id: ${id}`, 404);
    }
    return coupon;
  }

  async createCoupon(input: CreateCouponInput, tx?: TxContext): Promise<Coupon> {
    const existing = await this.repo.findByCode(input.code, tx);
    if (existing) {
      throw new AppError(ErrorCodes.CONFLICT, `Coupon '${input.code}' already exists`, 409);
    }
    return this.repo.create(input, tx);
  }

  async updateCoupon(id: string, input: UpdateCouponInput, tx?: TxContext): Promise<Coupon> {
    await this.getCouponById(id, tx);
    if (input.code) {
      const existing = await this.repo.findByCode(input.code, tx);
      if (existing && existing.id !== id) {
        throw new AppError(ErrorCodes.CONFLICT, `Coupon '${input.code}' already exists`, 409);
      }
    }
    const updated = await this.repo.update(id, input, tx);
    return updated!;
  }

  async deleteCoupon(id: string, tx?: TxContext): Promise<void> {
    await this.getCouponById(id, tx);
    await this.repo.delete(id, tx);
  }

  async applyCoupon(
    input: ApplyCouponInput,
    tx?: TxContext
  ): Promise<{ coupon: Coupon; discountMinor: number }> {
    const coupon = await this.repo.findByCode(input.code, tx);
    if (!coupon || !coupon.isActive) {
      throw new AppError("COUPON_NOT_FOUND", "Invalid or expired coupon code", 404);
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new AppError("COUPON_EXPIRED", "This coupon has expired", 422);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError("COUPON_LIMIT_REACHED", "This coupon has reached its maximum usage limit", 422);
    }

    if (input.subtotalMinor < coupon.minOrderMinor) {
      const minAmount = (coupon.minOrderMinor / 100).toFixed(2);
      throw new AppError(
        "COUPON_MIN_ORDER_NOT_MET",
        `Minimum order subtotal of ${minAmount} required to use this coupon`,
        422
      );
    }

    let discountMinor = 0;
    if (coupon.discountType === "fixed") {
      discountMinor = coupon.discountValue;
    } else if (coupon.discountType === "percentage") {
      discountMinor = Math.round((input.subtotalMinor * coupon.discountValue) / 100);
    }

    if (coupon.maxDiscountMinor && discountMinor > coupon.maxDiscountMinor) {
      discountMinor = coupon.maxDiscountMinor;
    }

    // Do not discount more than the order subtotal
    discountMinor = Math.min(discountMinor, input.subtotalMinor);

    return { coupon, discountMinor };
  }
}

