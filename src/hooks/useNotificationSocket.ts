import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../store/hooks';
import { notificationApi } from '../store/api/notificationApi';
import { Notification } from '../store/api/notificationApi';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useNotificationSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(`${API_URL}/chat`, {
      query: { userId: user.id },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to notification socket');
      setIsConnected(true);
    });

    newSocket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      // Invalidate queries to refetch notifications
      notificationApi.util.invalidateTags(['Notifications', 'UnreadCount']);
    });

    newSocket.on('notifications_marked_read', () => {
      console.log('All notifications marked as read');
      notificationApi.util.invalidateTags(['Notifications', 'UnreadCount']);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification socket');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return { socket, isConnected };
};
