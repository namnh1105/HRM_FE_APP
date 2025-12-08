import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, ChatRoom, ChatMessage, SendMessageDto, CreateRoomDto } from '../../types/api';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://scrolla.bitoj.io.vn/api/v1',
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
    getUserRooms: builder.query<ApiResponse<ChatRoom[]>, void>({
      query: () => ({
        url: '/chat/rooms',
        method: 'GET',
      }),
      providesTags: ['ChatRooms'],
    }),
    
    createRoom: builder.mutation<ApiResponse<ChatRoom>, CreateRoomDto>({
      query: (createRoomDto) => ({
        url: '/chat/rooms',
        method: 'POST',
        body: createRoomDto,
      }),
      invalidatesTags: ['ChatRooms'],
    }),
    
    getRoomById: builder.query<ApiResponse<ChatRoom>, string>({
      query: (roomId) => ({
        url: `/chat/rooms/${roomId}`,
        method: 'GET',
      }),
      providesTags: (result, error, roomId) => [{ type: 'ChatRooms', id: roomId }],
    }),
    
    getMessages: builder.query<ApiResponse<ChatMessage[]>, { roomId: string; limit?: number; offset?: number }>({
      query: ({ roomId, limit = 50, offset = 0 }) => ({
        url: `/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`,
        method: 'GET',
      }),
      providesTags: (result, error, { roomId }) => [{ type: 'Messages', id: roomId }],
    }),
    
    sendMessage: builder.mutation<ApiResponse<ChatMessage>, SendMessageDto>({
      query: (sendMessageDto) => ({
        url: '/chat/messages',
        method: 'POST',
        body: sendMessageDto,
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: 'Messages', id: roomId },
        'ChatRooms',
      ],
    }),
  }),
});

export const {
  useGetUserRoomsQuery,
  useCreateRoomMutation,
  useGetRoomByIdQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
