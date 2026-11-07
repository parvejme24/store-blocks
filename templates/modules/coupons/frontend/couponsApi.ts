import { baseApi } from "@/store/baseApi";

export interface CouponValidation {
  valid: boolean;
  code: string;
  type: "percentage" | "fixed";
  amount: number;
  discountMinor: number;
  message?: string;
}

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation<{ data: CouponValidation }, { code: string; orderAmountMinor: number }>({
      query: (body) => ({
        url: "/api/coupons/validate",
        method: "POST",
        body
      })
    })
  }),
  overrideExisting: false
});

export const { useValidateCouponMutation } = couponsApi;

