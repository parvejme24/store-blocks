import { baseApi } from "@/store/baseApi";

export interface OrderDetail {
  id: string;
  orderNumber: string;
  userId?: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  totalMinor: number;
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  currency: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    priceMinor: number;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<{ data: OrderDetail; paymentUrl?: string }, Partial<OrderDetail>>({
      query: (body) => ({
        url: "/api/orders",
        method: "POST",
        body
      }),
      invalidatesTags: ["Order", "Cart"]
    }),
    getMyOrders: builder.query<{ data: OrderDetail[] }, void>({
      query: () => "/api/orders",
      providesTags: ["Order"]
    }),
    getOrderById: builder.query<{ data: OrderDetail }, string>({
      query: (id) => `/api/orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Order", id }]
    })
  }),
  overrideExisting: false
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery
} = ordersApi;

