import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  notificationApi, 
  Notification as NotificationData 
} from '../store/api/notificationApi';
import { useGetUserRoomsQuery } from '../store/api/chatApi';
import { useDispatch } from 'react-redux';
import { useChat } from './ChatContext';
import { ChatMessage } from '../types/api';

interface NotificationContextType {
  expoPushToken: string | null;
  notifications: NotificationData[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (type?: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

// Cấu hình notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface Props {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<Props> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { socket, isConnected, currentOpenRoomId, joinAllUserRooms } = useChat();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  
  // Get all user rooms to join
  const { data: roomsData } = useGetUserRoomsQuery(undefined, {
    skip: !isAuthenticated,
  });
  
  // Debug logging
  useEffect(() => {
    console.log('[NotificationContext] Auth state changed:', {
      isAuthenticated,
      username: user?.username,
    });
  }, [isAuthenticated, user]);
  
  // Join all user rooms when connected
  useEffect(() => {
    if (isAuthenticated && isConnected && roomsData && roomsData.length > 0) {
      const roomIds = roomsData.map(room => room.id);
      console.log('[NotificationContext] Joining all user rooms:', roomIds);
      joinAllUserRooms(roomIds);
    }
  }, [isAuthenticated, isConnected, roomsData, joinAllUserRooms]);
  
  // RTK Query hooks
  const { data: notificationsData, refetch: refetchNotifications } = 
    notificationApi.useGetNotificationsQuery(
      { page: 1, limit: 50 },
      { skip: !isAuthenticated, pollingInterval: 30000 } // Poll every 30s
    );
  
  const { data: unreadCountData, refetch: refetchUnreadCount } = 
    notificationApi.useGetUnreadCountQuery(
      undefined,
      { skip: !isAuthenticated, pollingInterval: 15000 } // Poll every 15s
    );

  const [markAsReadMutation] = notificationApi.useMarkNotificationAsReadMutation();
  const [markAllAsReadMutation] = notificationApi.useMarkAllNotificationsAsReadMutation();
  const [deleteNotificationMutation] = notificationApi.useDeleteNotificationMutation();

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  // Request permissions và lấy push token
  useEffect(() => {
    if (!isAuthenticated) return;

    const setupNotifications = async () => {
      try {
        // Request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          console.log('Notification permission not granted');
          return;
        }

        // Get push token (chỉ hoạt động trên device thật)
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          try {
            const token = await Notifications.getExpoPushTokenAsync({
              projectId: 'caead81b-fa83-4399-add5-751b9c8aeff0', // từ app.json
            });
            console.log('Expo Push Token:', token.data);
            setExpoPushToken(token.data);
            
            // TODO: Gửi token lên backend để lưu
            // await sendPushTokenToBackend(token.data);
          } catch (error) {
            console.log('Error getting push token:', error);
          }
        }

        // Configure Android channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#6B4CE6',
            sound: 'default',
          });
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, [isAuthenticated]);

  // Listen for notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    const setupListeners = () => {
      try {
        // Khi nhận notification trong foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(
          (notification) => {
            if (!mounted) return;
            console.log('Notification received:', notification);
            // Refresh notifications từ backend
            refetchNotifications();
            refetchUnreadCount();
          }
        );

        // Khi user tap vào notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            if (!mounted) return;
            console.log('Notification tapped:', response);
            const data = response.notification.request.content.data;
            
            // Handle navigation based on notification data
            if (data?.actionUrl) {
              // TODO: Navigate to the URL
              console.log('Navigate to:', data.actionUrl);
            }
            
            // Mark as read
            if (data?.notificationId && typeof data.notificationId === 'string') {
              markAsReadMutation(data.notificationId);
            }
          }
        );
      } catch (error) {
        console.error('[NotificationContext] Error setting up listeners:', error);
      }
    };

    setupListeners();

    return () => {
      mounted = false;
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch (error) {
        console.error('[NotificationContext] Error removing listeners:', error);
      }
    };
  }, [isAuthenticated, refetchNotifications, refetchUnreadCount, markAsReadMutation]);

  // Sync với WebSocket notifications từ backend
  useEffect(() => {
    if (!isAuthenticated || !socket || !isConnected) return;

    console.log('[NotificationContext] Setting up WebSocket listener');

    // Listen to notifications from backend via WebSocket
    const handleNotification = async (notification: NotificationData) => {
      console.log('[NotificationContext] Received notification from WebSocket:', notification);
      
      // Show local push notification
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.message,
            data: {
              ...notification.data,
              notificationId: notification.id,
              actionUrl: notification.actionUrl,
            },
          },
          trigger: null, // Show immediately
        });
      } catch (error) {
        console.error('[NotificationContext] Error showing notification:', error);
      }
      
      // Refresh data from backend
      refetchNotifications();
      refetchUnreadCount();
    };

    // Listen to new chat messages (realtime for ALL rooms)
    const handleNewMessage = async (message: ChatMessage) => {
      console.log('[NotificationContext] Received new message:', {
        messageId: message.id,
        roomId: message.roomId,
        currentOpenRoomId,
        shouldShowNotification: message.roomId !== currentOpenRoomId,
      });
      
      // Chỉ hiển thị notification nếu tin nhắn KHÔNG từ room đang mở
      if (message.roomId !== currentOpenRoomId) {
        const senderName = message.sender?.givenName || message.sender?.username || 'Someone';
        
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Tin nhắn mới từ ${senderName}`,
              body: message.content,
              data: {
                type: 'chat',
                roomId: message.roomId,
                messageId: message.id,
                senderId: message.senderId,
              },
            },
            trigger: null, // Show immediately
          });
        } catch (error) {
          console.error('[NotificationContext] Error showing message notification:', error);
        }
      }
    };

    socket.on('notification', handleNotification);
    socket.on('new_message', handleNewMessage);

    // Listen for mark all as read event
    socket.on('notifications_marked_read', () => {
      console.log('[NotificationContext] Notifications marked as read');
      refetchNotifications();
      refetchUnreadCount();
    });

    return () => {
      socket.off('notification', handleNotification);
      socket.off('new_message', handleNewMessage);
      socket.off('notifications_marked_read');
      console.log('[NotificationContext] Cleaned up WebSocket listeners');
    };
  }, [isAuthenticated, socket, isConnected, currentOpenRoomId, refetchNotifications, refetchUnreadCount]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation(notificationId).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async (type?: string) => {
    try {
      await markAllAsReadMutation({ type }).unwrap();
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

  const refreshNotifications = () => {
    refetchNotifications();
    refetchUnreadCount();
  };

  const value: NotificationContextType = {
    expoPushToken,
    notifications: notificationsData?.notifications || [],
    unreadCount: unreadCountData?.count || 0,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
