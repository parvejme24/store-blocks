import { baseApi } from "@/store/baseApi";

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<{ data: { productIds: string[] } }, void>({
      query: () => "/api/wishlist",
      providesTags: ["Wishlist"]
    }),
    toggleWishlist: builder.mutation<{ data: { productIds: string[] } }, string>({
      query: (productId) => ({
        url: `/api/wishlist/toggle/${productId}`,
        method: "POST"
      }),
      invalidatesTags: ["Wishlist"]
    })
  }),
  overrideExisting: false
});

export const {
  useGetWishlistQuery,
  useToggleWishlistMutation
} = wishlistApi;

