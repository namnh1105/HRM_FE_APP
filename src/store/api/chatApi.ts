import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, ChatRoom, ChatMessage, SendMessageDto, CreateRoomDto, SearchUsersDto, User } from '../../types/api';
import { API_BASE_URL } from '../../utils/constants';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers: any) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery,
  tagTypes: ['ChatRooms', 'Messages'],
  endpoints: (builder) => ({
    getUserRooms: builder.query<ChatRoom[], void>({
      query: () => '/chat/rooms',
      transformResponse: (response: any) => {
        // Backend trả về array trực tiếp
        return Array.isArray(response) ? response : [];
      },
      providesTags: ['ChatRooms'],
    }),
    
    createRoom: builder.mutation<ChatRoom, CreateRoomDto>({
      query: (createRoomDto) => ({
        url: '/chat/rooms',
        method: 'POST',
        body: createRoomDto,
      }),
      invalidatesTags: ['ChatRooms'],
    }),
    
    getOrCreatePrivateRoom: builder.mutation<ChatRoom, string>({
      query: (otherUserId) => {
        console.log('[ChatAPI] getOrCreatePrivateRoom called with:', {
          otherUserId,
          type: typeof otherUserId,
          isValid: otherUserId && otherUserId.length > 0,
        });
        return {
          url: '/chat/rooms/private',
          method: 'POST',
          body: { otherUserId },
        };
      },
      invalidatesTags: ['ChatRooms'],
    }),
    
    getRoomById: builder.query<ChatRoom, string>({
      query: (roomId) => `/chat/rooms/${roomId}`,
      providesTags: (result, error, roomId) => [{ type: 'ChatRooms', id: roomId }],
    }),
    
    getMessages: builder.query<ChatMessage[], { roomId: string; limit?: number; offset?: number }>({
      query: ({ roomId, limit = 50, offset = 0 }) => 
        `/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`,
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : [];
      },
      providesTags: (result, error, { roomId }) => [{ type: 'Messages', id: roomId }],
    }),
    
    sendMessage: builder.mutation<ChatMessage, SendMessageDto>({
      query: (sendMessageDto) => ({
        url: '/chat/messages',
        method: 'POST',
        body: sendMessageDto,
      }),
      invalidatesTags: (result, error, { roomId }) => [
        roomId ? { type: 'Messages', id: roomId } : 'Messages',
        'ChatRooms',
      ],
    }),
    
    markRoomAsRead: builder.mutation<{ success: boolean }, string>({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, roomId) => [{ type: 'ChatRooms', id: roomId }],
    }),
    
    searchUsers: builder.query<User[], SearchUsersDto>({
      query: ({ query, limit = '20' }) => `/chat/users/search?query=${query}&limit=${limit}`,
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : [];
      },
    }),
    
    getUnreadCount: builder.query<number, void>({
      query: () => '/chat/unread-count',
      transformResponse: (response: any) => response?.unreadCount || 0,
    }),
  }),
});

export const {
  useGetUserRoomsQuery,
  useCreateRoomMutation,
  useGetOrCreatePrivateRoomMutation,
  useGetRoomByIdQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkRoomAsReadMutation,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useGetUnreadCountQuery,
} = chatApi;
