import { baseApi } from "@/store/baseApi";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<{ user: UserSession }, void>({
      query: () => "/api/auth/me",
      providesTags: ["Auth"]
    }),
    login: builder.mutation<{ user: UserSession; accessToken: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials
      }),
      invalidatesTags: ["Auth"]
    }),
    register: builder.mutation<{ user: UserSession; accessToken: string }, { email: string; password: string; name: string }>({
      query: (data) => ({
        url: "/api/auth/register",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Auth"]
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST"
      }),
      invalidatesTags: ["Auth"]
    })
  }),
  overrideExisting: false
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation
} = authApi;

