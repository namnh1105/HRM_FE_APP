import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { useGetUserRoomsQuery, useGetOrCreatePrivateRoomMutation } from '../store/api/chatApi';
import { useGetFollowingQuery } from '../store/api/followApi';
import { ChatRoom, User } from '../types/api';
import { RootState } from '../store';
import { useChat } from '../context/ChatContext';

export const useMessages = () => {
  // Lấy auth state và userId từ Redux store
  const { user: userFromStore, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [userId, setUserId] = useState<string | null>(userFromStore?.id || null);
  
  // Safely get chat context - don't throw error if not available
  let chatContext;
  try {
    chatContext = useChat();
  } catch (error) {
    console.warn('[useMessages] ChatContext not available:', error);
    chatContext = { socket: null, isConnected: false };
  }
  const { socket } = chatContext;
  
  // Debug logging
  useEffect(() => {
    console.log('[useMessages] Auth state:', {
      isAuthenticated,
      userId: userFromStore?.id,
      username: userFromStore?.username,
    });
  }, [isAuthenticated, userFromStore]);
  
  // Load user ID from storage nếu chưa có trong Redux
  useEffect(() => {
    if (userFromStore?.id) {
      setUserId(userFromStore.id);
    } else {
      const loadUserId = async () => {
        try {
          const userInfoStr = await AsyncStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            setUserId(userInfo.id);
          }
        } catch (error) {
          console.error('Error loading user ID:', error);
        }
      };
      loadUserId();
    }
  }, [userFromStore]);

  // RTK Query hooks - skip if not authenticated
  const { 
    data: roomsData, 
    isLoading: roomsLoading, 
    error: roomsError,
    refetch: refetchRooms,
  } = useGetUserRoomsQuery(undefined, {
    skip: !isAuthenticated || !userId,
  });
  
  const { 
    data: followingData, 
    isLoading: followingLoading,
    error: followingError,
  } = useGetFollowingQuery(userId || '', {
    skip: !isAuthenticated || !userId,
  });
  
  const [getOrCreatePrivateRoom] = useGetOrCreatePrivateRoomMutation();

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket || !isAuthenticated) {
      console.log('[useMessages] Socket listener not ready:', { socket: !!socket, isAuthenticated });
      return;
    }

    const handleNewMessage = (message: any) => {
      console.log('[useMessages] New message received:', {
        roomId: message.roomId,
        content: message.content.substring(0, 20),
      });
      
      // Only refetch if query is active (not skipped)
      if (isAuthenticated && userId) {
        console.log('[useMessages] Calling refetchRooms...');
        refetchRooms();
      }
    };

    console.log('[useMessages] Setting up new_message listener');
    socket.on('new_message', handleNewMessage);

    return () => {
      console.log('[useMessages] Cleaning up new_message listener');
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, isAuthenticated, userId, refetchRooms]);

  const extractUsersFromRooms = (rooms: ChatRoom[]): User[] => {
    const uniqueUsers = new Map<string, User>();
    rooms.forEach(room => {
      room.users?.forEach(user => {
        // Filter out current user
        if (!uniqueUsers.has(user.id) && user.id !== userId) {
          uniqueUsers.set(user.id, user);
        }
      });
    });
    return Array.from(uniqueUsers.values());
  };

  const rooms = roomsData || [];
  // Filter out current user from following list
  const allFollowing = followingData?.data?.following || extractUsersFromRooms(rooms);
  const following = allFollowing.filter(user => user.id !== userId);
  const loading = roomsLoading || followingLoading;
  
  // Better error handling - only show error if authenticated
  let errorMessage = null;
  if (isAuthenticated && userId) {
    if (roomsError) {
      console.error('[useMessages] Rooms error:', roomsError);
      errorMessage = 'Không thể tải danh sách tin nhắn';
    } else if (followingError) {
      console.error('[useMessages] Following error:', followingError);
      // Don't show error for following list failure, it's not critical
    }
  }

  const createOrOpenChatWithUser = async (user: User): Promise<ChatRoom | null> => {
    try {
      console.log('Creating chat with user:', {
        userId: user.id,
        username: user.username,
        userObject: user,
      });
      
      // Find existing room with this user
      const existingRoom = rooms.find(room => 
        room.type === 'private' && 
        room.users?.some(p => p.id === user.id)
      );
      
      if (existingRoom) {
        console.log('Found existing room:', existingRoom.id);
        return existingRoom;
      }
      
      // Create new private room using the new endpoint
      console.log('Calling getOrCreatePrivateRoom with otherUserId:', user.id);
      const room = await getOrCreatePrivateRoom(user.id).unwrap();
      console.log('Room created successfully:', room.id);
      return room;
    } catch (error) {
      console.error('Error creating/opening chat:', error);
      return null;
    }
  };

  const refreshRooms = () => {
    // Only refetch if query is active (not skipped)
    if (isAuthenticated && userId) {
      refetchRooms();
    }
  };

  return {
    rooms,
    following,
    loading,
    error: errorMessage,
    createOrOpenChatWithUser,
    refreshRooms,
  };
};
