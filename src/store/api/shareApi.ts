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

export interface ShareVideoResponse {
  message: string;
  shareCount: number;
}

export const shareApi = createApi({
  reducerPath: 'shareApi',
  baseQuery,
  tagTypes: ['Shares'],
  endpoints: (builder) => ({
    shareVideo: builder.mutation<ApiResponse<ShareVideoResponse>, string>({
      query: (videoId) => ({
        url: `/shares/${videoId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Shares'],
    }),
  }),
});

export const {
  useShareVideoMutation,
} = shareApi;
