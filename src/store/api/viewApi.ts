import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/constants';

interface ViewRecordResponse {
  success: boolean;
  data: {
    viewsCount: number;
  };
}

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const viewApi = createApi({
  reducerPath: 'viewApi',
  baseQuery,
  endpoints: (builder) => ({
    recordView: builder.mutation<ViewRecordResponse, string>({
      query: (videoId) => ({
        url: `/views/${videoId}/record`,
        method: 'POST',
      }),
    }),
    getVideoViewsCount: builder.query<ViewRecordResponse, string>({
      query: (videoId) => ({
        url: `/views/${videoId}/count`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useRecordViewMutation, useGetVideoViewsCountQuery } = viewApi;
