import { createApi } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseQuery } from './baseQuery';
import { LoginRequest, RegisterRequest, GoogleAuthRequest } from '../../types/auth';
import { setCredentials } from '../slices/authSlice';

// Re-export all auth types for backward compatibility
export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, GoogleAuthRequest, GoogleAuthResponse, UserProfileResponse } from '../../types/auth';

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
            // Lưu đầy đủ thông tin user
            await AsyncStorage.setItem('authToken', data.data.accessToken);
            await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
            await AsyncStorage.setItem('userInfo', JSON.stringify(data.data.user));
            
            // Lưu accessToken và user info vào Redux store
            dispatch(setCredentials({
              accessToken: data.data.accessToken,
              user: data.data.user,
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
    googleAuth: builder.mutation({
      query: (credentials: GoogleAuthRequest) => ({
        url: '/auth/google',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg: any, { dispatch, queryFulfilled }: any) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            await AsyncStorage.setItem('authToken', data.data.accessToken);
            await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
            await AsyncStorage.setItem('userInfo', JSON.stringify(data.data.user));
            
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
          console.error('Google auth failed:', error);
        }
      },
      invalidatesTags: ['Auth'],
    }),
    getUserVideos: builder.query({
      query: (params: { page?: number; size?: number } = {}) => ({
        url: `/videos/me?page=${params.page || 1}&size=${params.size || 10}`,
        method: 'GET',
      }),
      providesTags: ['UserVideos'],
    }),
    getUserProfile: builder.query({
      query: () => ({
        url: '/auth/profile',
        method: 'GET',
      }),
      async onQueryStarted(arg: any, { queryFulfilled }: any) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            await AsyncStorage.setItem('userInfo', JSON.stringify(data.data));
          }
        } catch (error) {
          console.error('Get user profile failed:', error);
        }
      },
      providesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGoogleAuthMutation, useGetUserVideosQuery, useGetUserProfileQuery } = authApi;
