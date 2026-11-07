import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include"
  }),
  tagTypes: [
    "Product",
    "Category",
    "Order",
    "User",
    "Settings",
    "Auth",
    "Cart",
    "Review",
    "Coupon",
    "Wishlist",
    "Brand"
  ],
  endpoints: () => ({})
});
