import { Paginated, TxContext } from "../../../shared-base/src/index.js";
import {
  Coupon,
  CreateCouponInput,
  UpdateCouponInput,
  CouponQuery
} from "../shared/coupons.schemas.js";

export interface CouponRepository {
  findMany(query: CouponQuery): Promise<Paginated<Coupon>>;
  findById(id: string, tx?: TxContext): Promise<Coupon | null>;
  findByCode(code: string, tx?: TxContext): Promise<Coupon | null>;
  create(input: CreateCouponInput, tx?: TxContext): Promise<Coupon>;
  update(id: string, input: UpdateCouponInput, tx?: TxContext): Promise<Coupon | null>;
  incrementUsage(id: string, tx?: TxContext): Promise<boolean>;
  delete(id: string, tx?: TxContext): Promise<boolean>;
}

