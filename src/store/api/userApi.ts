import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { ApiResponse, User, VideoListData } from '../../types/api';
import { UserProfileData } from '../../types/user';

// Re-export for backward compatibility
export type { UserProfileData } from '../../types/user';

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
