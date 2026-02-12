import { createApi } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseQuery } from './baseQuery';
import { LoginRequest, RegisterRequest } from '../../types/auth';

export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserProfileResponse } from '../../types/auth';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder: any) => ({
    login: builder.mutation({
      query: (credentials: LoginRequest) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
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
    getUserProfile: builder.query({
      query: () => ({
        url: '/users/me',
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

export const { useLoginMutation, useRegisterMutation, useGetUserProfileQuery } = authApi;
