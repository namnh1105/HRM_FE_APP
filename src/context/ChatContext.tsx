import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '../types/api';

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: { content: string; recipientId: string; roomId?: string }) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  markMessageAsRead: (messageId: string, roomId: string) => void;
  markRoomAsRead: (roomId: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  onNewMessage: (callback: (message: any) => void) => void;
  onMessageRead: (callback: (data: any) => void) => void;
  onUserTyping: (callback: (data: any) => void) => void;
  onUserOnline: (callback: (data: any) => void) => void;
  onUserOffline: (callback: (data: any) => void) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SOCKET_URL = 'https://scrolla.bitoj.io.vn'; // Update with your backend URL

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        
        if (!token || !userInfoStr) {
          console.log('No auth token or user info found');
          return;
        }

        const userInfo = JSON.parse(userInfoStr);
        const userId = userInfo.id;

        const newSocket = io(`${SOCKET_URL}/chat`, {
          transports: ['websocket'],
          query: { userId },
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
          console.log('Socket connected:', newSocket.id);
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });

        newSocket.on('error', (error) => {
          console.error('Socket error:', error);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initSocket();
  }, []);

  const sendMessage = (data: { content: string; recipientId: string; roomId?: string }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', data);
    }
  };

  const joinRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_room', { roomId });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_room', { roomId });
    }
  };

  const markMessageAsRead = (messageId: string, roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message_read', { messageId, roomId });
    }
  };

  const markRoomAsRead = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('room_read', { roomId });
    }
  };

  const startTyping = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_start', { roomId });
    }
  };

  const stopTyping = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_stop', { roomId });
    }
  };

  const onNewMessage = (callback: (message: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new_message', callback);
    }
  };

  const onMessageRead = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message_read', callback);
    }
  };

  const onUserTyping = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user_typing', callback);
    }
  };

  const onUserOnline = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user_online', callback);
    }
  };

  const onUserOffline = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user_offline', callback);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        sendMessage,
        joinRoom,
        leaveRoom,
        markMessageAsRead,
        markRoomAsRead,
        startTyping,
        stopTyping,
        onNewMessage,
        onMessageRead,
        onUserTyping,
        onUserOnline,
        onUserOffline,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
