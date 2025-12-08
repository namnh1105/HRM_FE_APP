import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { useGetUserRoomsQuery, useCreateRoomMutation } from '../store/api/chatApi';
import { useGetFollowingQuery } from '../store/api/followApi';
import { ChatRoom, User } from '../types/api';
import { RootState } from '../store';

export const useMessages = () => {
  // Lấy userId từ Redux store
  const userFromStore = useSelector((state: RootState) => state.auth.user);
  const [userId, setUserId] = useState<string | null>(userFromStore?.id || null);
  
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

  // RTK Query hooks
  const { 
    data: roomsData, 
    isLoading: roomsLoading, 
    error: roomsError,
    refetch: refetchRooms,
  } = useGetUserRoomsQuery();
  
  const { 
    data: followingData, 
    isLoading: followingLoading,
    error: followingError,
  } = useGetFollowingQuery(userId || '', {
    skip: !userId,
  });
  
  const [createRoom] = useCreateRoomMutation();

  const extractUsersFromRooms = (rooms: ChatRoom[]): User[] => {
    const uniqueUsers = new Map<string, User>();
    rooms.forEach(room => {
      room.participants.forEach(user => {
        if (!uniqueUsers.has(user.id)) {
          uniqueUsers.set(user.id, user);
        }
      });
    });
    return Array.from(uniqueUsers.values());
  };

  const rooms = roomsData?.data || [];
  const following = followingData?.data?.following || extractUsersFromRooms(rooms);
  const loading = roomsLoading || followingLoading;
  const error = roomsError || followingError;

  const createOrOpenChatWithUser = async (user: User): Promise<ChatRoom | null> => {
    try {
      // Find existing room with this user
      const existingRoom = rooms.find(room => 
        room.type === 'private' && 
        room.participants.some(p => p.id === user.id)
      );
      
      if (existingRoom) {
        return existingRoom;
      }
      
      // Create new room
      const response = await createRoom({
        userIds: [user.id],
      }).unwrap();
      
      if (response.success) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating/opening chat:', error);
      return null;
    }
  };

  const refreshRooms = () => {
    refetchRooms();
  };

  return {
    rooms,
    following,
    loading,
    error: error ? 'Failed to load data' : null,
    createOrOpenChatWithUser,
    refreshRooms,
  };
};
