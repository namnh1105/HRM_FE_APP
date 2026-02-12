import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  useGetMyNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '../store/api/notificationApi';
import { formatRelativeTime } from '../utils';
import type { NotificationType } from '../types/notification';

export const useNotifications = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data, isLoading, isError, refetch } = useGetMyNotificationsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [doMarkAsRead] = useMarkAsReadMutation();
  const [doMarkAllAsRead] = useMarkAllAsReadMutation();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'attendance':
        return { name: 'time', color: '#3B82F6', bg: '#EFF6FF' };
      case 'leave':
        return { name: 'document-text', color: '#8B5CF6', bg: '#F5F3FF' };
      case 'salary':
        return { name: 'wallet', color: '#10B981', bg: '#ECFDF5' };
      case 'hr':
        return { name: 'people', color: '#F59E0B', bg: '#FFFBEB' };
      default:
        return { name: 'notifications', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const markAsRead = (id: string) => doMarkAsRead(id);
  const markAllAsRead = () => doMarkAllAsRead();
  const navigateToLogin = () => navigation.navigate('Login');

  return {
    isAuthenticated,
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    getIcon,
    formatTime: formatRelativeTime,
    markAsRead,
    markAllAsRead,
    navigateToLogin,
  };
};
