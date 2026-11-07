import { baseApi } from "@/store/baseApi";

export interface ShippingZoneRate {
  id: string;
  name: string;
  zone: "inside_dhaka" | "outside_dhaka" | "nationwide" | "international";
  rateMinor: number;
  freeThresholdMinor?: number;
  currency: string;
  estimatedDays: string;
}

export const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShippingRates: builder.query<{ data: ShippingZoneRate[] }, void>({
      query: () => "/api/shipping/rates"
    })
  }),
  overrideExisting: false
});

export const { useGetShippingRatesQuery } = shippingApi;

