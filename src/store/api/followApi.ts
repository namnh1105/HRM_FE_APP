import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, User } from '../../types/api';
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

export const followApi = createApi({
  reducerPath: 'followApi',
  baseQuery,
  tagTypes: ['Following', 'Followers'],
  endpoints: (builder) => ({
    getFollowing: builder.query<ApiResponse<User[]>, string>({
      query: (userId) => ({
        url: `/follows/${userId}/following`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'Following', id: userId }],
    }),
    
    getFollowers: builder.query<ApiResponse<User[]>, string>({
      query: (userId) => ({
        url: `/follows/${userId}/followers`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'Followers', id: userId }],
    }),
    
    followUser: builder.mutation<ApiResponse<void>, string>({
      query: (userId) => ({
        url: `/follows/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Following', id: userId },
        { type: 'Followers', id: userId },
      ],
    }),
    
    unfollowUser: builder.mutation<ApiResponse<void>, string>({
      query: (userId) => ({
        url: `/follows/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Following', id: userId },
        { type: 'Followers', id: userId },
      ],
    }),
  }),
});

export const {
  useGetFollowingQuery,
  useGetFollowersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = followApi;
