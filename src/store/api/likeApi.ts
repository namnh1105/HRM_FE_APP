import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/constants';

interface LikeToggleResponse {
  isLiked: boolean;
  likesCount: number;
}

interface LikeCheckResponse {
  isLiked: boolean;
}

export const likeApi = createApi({
  reducerPath: 'likeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['VideoLikes'],
  endpoints: (builder) => ({
    toggleLike: builder.mutation<{ success: boolean; data: LikeToggleResponse; message: string }, string>({
      query: (videoId) => ({
        url: `/likes/${videoId}/toggle`,
        method: 'POST',
      }),
      invalidatesTags: ['VideoLikes'],
    }),
    checkIfUserLikedVideo: builder.query<{ success: boolean; data: LikeCheckResponse; message: string }, string>({
      query: (videoId) => ({
        url: `/likes/${videoId}/check`,
        method: 'GET',
      }),
      providesTags: ['VideoLikes'],
    }),
  }),
});

export const { useToggleLikeMutation, useCheckIfUserLikedVideoQuery } = likeApi;
