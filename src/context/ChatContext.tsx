import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '../types/api';

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentOpenRoomId: string | null;
  setCurrentOpenRoomId: (roomId: string | null) => void;
  sendMessage: (data: { content: string; recipientId: string; roomId?: string }) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  joinAllUserRooms: (roomIds: string[]) => void;
  markMessageAsRead: (messageId: string, roomId: string) => void;
  markRoomAsRead: (roomId: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  onNewMessage: (callback: (message: any) => void) => void;
  onMessageRead: (callback: (data: any) => void) => void;
  onUserTyping: (callback: (data: any) => void) => void;
  onUserOnline: (callback: (data: any) => void) => void;
  onUserOffline: (callback: (data: any) => void) => void;
  disconnectSocket: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SOCKET_URL = 'https://scrolla.bitoj.io.vn'; // Update with your backend URL

// Global reference to disconnect function for use in logout
let globalDisconnectSocket: (() => void) | null = null;

export const getGlobalDisconnectSocket = () => globalDisconnectSocket;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentOpenRoomId, setCurrentOpenRoomId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        
        if (!token || !userInfoStr) {
          console.log('[ChatContext] No auth token or user info found - skipping socket connection');
          return;
        }

        const userInfo = JSON.parse(userInfoStr);
        const userId = userInfo.id;
        
        if (!userId) {
          console.log('[ChatContext] No userId found - skipping socket connection');
          return;
        }

        console.log('[ChatContext] Initializing socket with userId:', userId);

        const newSocket = io(`${SOCKET_URL}/chat`, {
          transports: ['websocket'],
          query: { userId },
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
          console.log('[ChatContext] Socket connected:', newSocket.id);
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('[ChatContext] Socket disconnected');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
          console.error('[ChatContext] Socket connection error:', error.message);
          setIsConnected(false);
        });

        newSocket.on('error', (error) => {
          console.error('[ChatContext] Socket error:', error);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        return () => {
          console.log('[ChatContext] Cleaning up socket connection');
          newSocket.close();
        };
      } catch (error) {
        console.error('[ChatContext] Error initializing socket:', error);
        setIsConnected(false);
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
      console.log('[ChatContext] Joining room:', roomId);
      socketRef.current.emit('join_room', { roomId });
    } else {
      console.log('[ChatContext] Cannot join room - socket not connected');
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_room', { roomId });
    }
  };

  const joinAllUserRooms = (roomIds: string[]) => {
    if (socketRef.current && isConnected) {
      console.log('[ChatContext] Joining all user rooms:', roomIds);
      roomIds.forEach(roomId => {
        socketRef.current?.emit('join_room', { roomId });
      });
    } else {
      console.log('[ChatContext] Cannot join rooms - socket not connected');
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
      // Remove any existing listener first to avoid duplicates
      socketRef.current.off('new_message', callback);
      socketRef.current.on('new_message', callback);
      console.log('[ChatContext] Registered new_message listener');
      
      // Return cleanup function
      return () => {
        if (socketRef.current) {
          socketRef.current.off('new_message', callback);
          console.log('[ChatContext] Cleaned up new_message listener');
        }
      };
    }
  };

  const onMessageRead = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('message_read', callback);
      socketRef.current.on('message_read', callback);
    }
  };

  const onUserTyping = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('user_typing', callback);
      socketRef.current.on('user_typing', callback);
    }
  };

  const onUserOnline = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('user_online', callback);
      socketRef.current.on('user_online', callback);
    }
  };

  const onUserOffline = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off('user_offline', callback);
      socketRef.current.on('user_offline', callback);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      console.log('[ChatContext] Manually disconnecting socket');
      socketRef.current.close();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Set global reference
  useEffect(() => {
    globalDisconnectSocket = disconnectSocket;
    return () => {
      globalDisconnectSocket = null;
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        currentOpenRoomId,
        setCurrentOpenRoomId,
        sendMessage,
        joinRoom,
        leaveRoom,
        joinAllUserRooms,
        markMessageAsRead,
        markRoomAsRead,
        startTyping,
        stopTyping,
        onNewMessage,
        onMessageRead,
        onUserTyping,
        onUserOnline,
        onUserOffline,
        disconnectSocket,
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

// Alias for backward compatibility
export const useChatSocket = useChat;
