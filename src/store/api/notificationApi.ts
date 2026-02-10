import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { ApiResponse } from '../../types/common';
import type { HrmNotification } from '../../types/notification';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery,
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    /** GET /notifications/me */
    getMyNotifications: builder.query<ApiResponse<HrmNotification[]>, void>({
      query: () => '/notifications/me',
      providesTags: ['Notification'],
    }),

    /** PATCH /notifications/:id/read */
    markAsRead: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      // Optimistic update: mark read immediately
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationApi.util.updateQueryData('getMyNotifications', undefined, (draft) => {
            const notif = draft.data?.find((n) => n.id === id);
            if (notif) notif.isRead = true;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),

    /** PATCH /notifications/read-all */
    markAllAsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      // Optimistic update
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          notificationApi.util.updateQueryData('getMyNotifications', undefined, (draft) => {
            draft.data?.forEach((n) => {
              n.isRead = true;
            });
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
