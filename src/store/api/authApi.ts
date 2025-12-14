import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, UserVideosResponse } from '../../types/api';
import { API_BASE_URL } from '../../utils/constants';
import { setCredentials } from '../slices/authSlice';

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

export interface RegisterRequest {
  username: string;
  givenName: string;
  familyName: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      givenName: string;
      familyName: string;
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
      async onQueryStarted(arg: any, { dispatch, queryFulfilled }: any) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            // Lưu accessToken và user info vào Redux store và AsyncStorage
            dispatch(setCredentials({
              accessToken: data.data.accessToken,
              user: {
                id: data.data.user.id,
                username: data.data.user.username,
                givenName: data.data.user.givenName,
                familyName: data.data.user.familyName,
              },
            }));
          }
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation({
      query: (credentials: RegisterRequest) => ({
        url: '/auth/register',
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

export const { useLoginMutation, useRegisterMutation, useGetUserVideosQuery } = authApi;
