import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, UserVideosResponse } from '../../types/api';

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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      givenName: string;
      familyName: string;
      followersCount: number;
      followingCount: number;
      isFollowing: boolean;
    };
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth', 'UserVideos'],
  endpoints: (builder: any) => ({
    login: builder.mutation({
      query: (credentials: LoginRequest) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    getUserVideos: builder.query({
      query: (params: { page?: number; size?: number } = {}) => ({
        url: `/videos/me?page=${params.page || 1}&size=${params.size || 10}`,
        method: 'GET',
      }),
      providesTags: ['UserVideos'],
    }),
  }),
});

export const { useLoginMutation, useGetUserVideosQuery } = authApi;
