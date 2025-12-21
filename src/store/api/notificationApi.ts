import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/constants';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers: any) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export interface Notification {
  id: string;
  type: 'message' | 'like' | 'comment' | 'follow' | 'mention' | 'system';
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
  senderId?: string;
  sender?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  messageEnabled: boolean;
  messagePushEnabled: boolean;
  messageEmailEnabled: boolean;
  likeEnabled: boolean;
  likePushEnabled: boolean;
  likeEmailEnabled: boolean;
  commentEnabled: boolean;
  commentPushEnabled: boolean;
  commentEmailEnabled: boolean;
  followEnabled: boolean;
  followPushEnabled: boolean;
  followEmailEnabled: boolean;
  mentionEnabled: boolean;
  mentionPushEnabled: boolean;
  mentionEmailEnabled: boolean;
  systemEnabled: boolean;
  systemPushEnabled: boolean;
  systemEmailEnabled: boolean;
  globalPushEnabled: boolean;
  globalEmailEnabled: boolean;
  doNotDisturb: boolean;
  doNotDisturbStart?: string;
  doNotDisturbEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery,
  tagTypes: ['Notifications', 'NotificationPreferences', 'UnreadCount'],
  endpoints: (builder) => ({
    // Lấy danh sách thông báo
    getNotifications: builder.query<
      NotificationResponse,
      { type?: string; isRead?: boolean; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/api/v1/notifications',
        params,
      }),
      providesTags: ['Notifications'],
    }),

    // Lấy số thông báo chưa đọc
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/api/v1/notifications/unread-count',
      providesTags: ['UnreadCount'],
    }),

    // Đánh dấu thông báo đã đọc
    markNotificationAsRead: builder.mutation<Notification, string>({
      query: (notificationId) => ({
        url: `/api/v1/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    // Đánh dấu tất cả thông báo đã đọc
    markAllNotificationsAsRead: builder.mutation<{ success: boolean }, { type?: string }>({
      query: (body) => ({
        url: '/api/v1/notifications/mark-all-read',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    // Xóa thông báo
    deleteNotification: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/api/v1/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),

    // Lấy preferences
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => '/api/v1/notification-preferences',
      providesTags: ['NotificationPreferences'],
    }),

    // Cập nhật preferences
    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      query: (preferences) => ({
        url: '/api/v1/notification-preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationApi;
