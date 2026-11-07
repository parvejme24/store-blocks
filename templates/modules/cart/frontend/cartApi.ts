import { baseApi } from "@/store/baseApi";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  priceMinor: number;
  quantity: number;
  image?: string;
  selectedVariants?: Record<string, string>;
}

export interface CartState {
  id: string;
  userId?: string;
  guestId?: string;
  items: CartItem[];
  subtotalMinor: number;
  currency: string;
}

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<{ data: CartState }, void>({
      query: () => "/api/cart",
      providesTags: ["Cart"]
    }),
    addToCart: builder.mutation<{ data: CartState }, { productId: string; quantity: number; selectedVariants?: Record<string, string> }>({
      query: (body) => ({
        url: "/api/cart/items",
        method: "POST",
        body
      }),
      invalidatesTags: ["Cart"]
    }),
    updateCartItem: builder.mutation<{ data: CartState }, { itemId: string; quantity: number }>({
      query: ({ itemId, quantity }) => ({
        url: `/api/cart/items/${itemId}`,
        method: "PATCH",
        body: { quantity }
      }),
      invalidatesTags: ["Cart"]
    }),
    removeCartItem: builder.mutation<{ data: CartState }, string>({
      query: (itemId) => ({
        url: `/api/cart/items/${itemId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Cart"]
    }),
    clearCart: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/api/cart",
        method: "DELETE"
      }),
      invalidatesTags: ["Cart"]
    })
  }),
  overrideExisting: false
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation
} = cartApi;

