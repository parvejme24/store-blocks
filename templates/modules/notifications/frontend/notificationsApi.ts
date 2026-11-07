import { baseApi } from "@/store/baseApi";

export interface NotificationItem {
  id: string;
  type: "email" | "sms";
  recipient: string;
  subject?: string;
  content: string;
  status: "sent" | "failed" | "queued";
  createdAt: string;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecentNotifications: builder.query<{ data: NotificationItem[] }, void>({
      query: () => "/api/notifications"
    })
  }),
  overrideExisting: false
});

export const { useGetRecentNotificationsQuery } = notificationsApi;

