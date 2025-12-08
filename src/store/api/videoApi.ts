import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, VideoListData } from '../../types/api';
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
  }),
});

export const { useGetVideosQuery } = videoApi;
