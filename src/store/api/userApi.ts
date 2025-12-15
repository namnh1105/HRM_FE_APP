import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, User, VideoListData } from '../../types/api';
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

export interface UserProfileData {
  user: User;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User', 'UserVideos'],
  endpoints: (builder) => ({
    getUserById: builder.query<ApiResponse<UserProfileData>, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    
    getUserVideos: builder.query<ApiResponse<VideoListData>, { userId: string; page?: number; size?: number }>({
      query: ({ userId, page = 1, size = 10 }) => ({
        url: `/videos/user/${userId}?page=${page}&size=${size}`,
        method: 'GET',
      }),
      providesTags: (result, error, { userId }) => [{ type: 'UserVideos', id: userId }],
    }),
  }),
});

export const {
  useGetUserByIdQuery,
  useGetUserVideosQuery,
} = userApi;
