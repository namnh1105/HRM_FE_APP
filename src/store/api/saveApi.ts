import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '../../types/api';
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

export interface SavedVideosResponse {
  videos: any[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CheckSaveResponse {
  isSaved: boolean;
}

export const saveApi = createApi({
  reducerPath: 'saveApi',
  baseQuery,
  tagTypes: ['SavedVideos'],
  endpoints: (builder) => ({
    toggleSave: builder.mutation<ApiResponse<void>, string>({
      query: (videoId) => ({
        url: `/saves/${videoId}/toggle`,
        method: 'POST',
      }),
      invalidatesTags: ['SavedVideos'],
    }),
    
    checkSave: builder.query<ApiResponse<CheckSaveResponse>, string>({
      query: (videoId) => ({
        url: `/saves/${videoId}/check`,
        method: 'GET',
      }),
    }),
    
    getSavedVideos: builder.query<ApiResponse<SavedVideosResponse>, { page?: number; size?: number }>({
      query: ({ page = 1, size = 10 }) => ({
        url: `/saves/user/saved-videos?page=${page}&size=${size}`,
        method: 'GET',
      }),
      providesTags: ['SavedVideos'],
    }),
  }),
});

export const {
  useToggleSaveMutation,
  useCheckSaveQuery,
  useGetSavedVideosQuery,
} = saveApi;
