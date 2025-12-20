import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} from '../store/api/notificationApi';
import { Notification } from '../store/api/notificationApi';

export const useNotifications = () => {
  const { accessToken } = useAppSelector((state) => state.auth);
  
  // Queries
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery(
    { page: 1, limit: 50 },
    { skip: !accessToken, pollingInterval: 30000 } // Poll every 30s
  );

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
  } = useGetUnreadCountQuery(undefined, {
    skip: !accessToken,
    pollingInterval: 30000,
  });

  // Mutations
  const [markAsReadMutation] = useMarkNotificationAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotificationMutation] = useDeleteNotificationMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadCountData?.count || 0;
  const loading = notificationsLoading;

  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation(notificationId).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (type?: string) => {
    try {
      await markAllAsReadMutation(type).unwrap();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation(notificationId).unwrap();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const refreshNotifications = async () => {
    await Promise.all([refetchNotifications(), refetchUnreadCount()]);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
};
