import { baseApi } from "@/store/baseApi";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceMinor: number;
  compareAtPriceMinor?: number;
  currency: string;
  sku?: string;
  stock: number;
  isActive: boolean;
  categoryIds?: string[];
  brandId?: string;
  images: { key: string; alt?: string; provider: string }[];
  variants?: {
    name: string;
    options: string[];
  }[];
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<{ data: ProductItem[]; total: number }, { page?: number; limit?: number; search?: string; categoryId?: string } | void>({
      query: (params) => ({
        url: "/api/products",
        params: params || {}
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product", id: "LIST" }
            ]
          : [{ type: "Product", id: "LIST" }]
    }),
    getProductBySlug: builder.query<{ data: ProductItem }, string>({
      query: (slug) => `/api/products/slug/${slug}`,
      providesTags: (_res, _err, slug) => [{ type: "Product", id: slug }]
    }),
    getProductById: builder.query<{ data: ProductItem }, string>({
      query: (id) => `/api/products/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Product", id }]
    })
  }),
  overrideExisting: false
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetProductByIdQuery
} = productsApi;

