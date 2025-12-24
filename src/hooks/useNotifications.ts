import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn('useNotifications used outside NotificationProvider, returning default values');
    return {
      unreadCount: 0,
      notifications: [],
      loading: false,
      markAsRead: () => {},
      markAllAsRead: () => {},
      refetch: () => {},
    };
  }
  return context;
};
