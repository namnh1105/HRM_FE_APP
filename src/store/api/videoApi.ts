import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, VideoListData } from '../../types/api';
import { API_BASE_URL } from '../../utils/constants';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers: any, { endpoint }) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // Don't set Content-Type for FormData (createVideo endpoint), let it be set automatically
    if (endpoint !== 'createVideo') {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

export const videoApi = createApi({
  reducerPath: 'videoApi',
  baseQuery,
  tagTypes: ['Videos'],
  endpoints: (builder) => ({
    getVideos: builder.query<ApiResponse<VideoListData>, { page?: number; size?: number }>({
      query: ({ page = 1, size = 10 }) => ({
        url: `/videos?page=${page}&size=${size}`,
        method: 'GET',
      }),
      providesTags: ['Videos'],
    }),
    createVideo: builder.mutation<ApiResponse<any>, FormData>({
      query: (formData) => ({
        url: '/videos',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Videos'],
    }),
    searchVideos: builder.query<
      ApiResponse<VideoListData>,
      { keyword: string; sortBy?: string; page?: number; limit?: number }
    >({
      query: ({ keyword, sortBy = 'relevance', page = 1, limit = 10 }) => ({
        url: `/videos/search?keyword=${encodeURIComponent(keyword)}&sortBy=${sortBy}&page=${page}&limit=${limit}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetVideosQuery, useCreateVideoMutation, useSearchVideosQuery } = videoApi;
