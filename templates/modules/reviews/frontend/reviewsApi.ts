import { baseApi } from "@/store/baseApi";

export interface ReviewItem {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<{ data: ReviewItem[]; averageRating: number; total: number }, string>({
      query: (productId) => `/api/reviews/product/${productId}`,
      providesTags: (_res, _err, id) => [{ type: "Review", id }]
    }),
    createReview: builder.mutation<{ data: ReviewItem }, { productId: string; rating: number; comment: string; userName: string }>({
      query: (body) => ({
        url: "/api/reviews",
        method: "POST",
        body
      }),
      invalidatesTags: ["Review"]
    })
  }),
  overrideExisting: false
});

export const {
  useGetProductReviewsQuery,
  useCreateReviewMutation
} = reviewsApi;

