import { baseApi } from "@/store/baseApi";

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export const brandsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<{ data: BrandItem[] }, void>({
      query: () => "/api/brands",
      providesTags: ["Brand"]
    }),
    getBrandBySlug: builder.query<{ data: BrandItem }, string>({
      query: (slug) => `/api/brands/slug/${slug}`
    })
  }),
  overrideExisting: false
});

export const { useGetBrandsQuery, useGetBrandBySlugQuery } = brandsApi;

