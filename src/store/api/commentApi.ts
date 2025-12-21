import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/constants';

export interface CommentUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  givenName: string;
  familyName: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentId: string | null;
  user: CommentUser;
  parent?: CommentUser;
  replies?: Comment[];
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  videoId: string;
  content: string;
  parentId?: string;
}

export const commentApi = createApi({
  reducerPath: 'commentApi',
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
  tagTypes: ['Comments', 'CommentReplies'],
  endpoints: (builder) => ({
    getVideoComments: builder.query<Comment[], { videoId: string; page?: number; limit?: number }>({
      query: ({ videoId, page = 1, limit = 20 }) => ({
        url: `/comments/video/${videoId}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : (response.data || []);
      },
      providesTags: (result, error, { videoId }) => [{ type: 'Comments', id: videoId }],
    }),
    getCommentReplies: builder.query<Comment[], { commentId: string; page?: number; limit?: number }>({
      query: ({ commentId, page = 1, limit = 20 }) => ({
        url: `/comments/${commentId}/replies?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        return Array.isArray(response) ? response : (response.data || []);
      },
      providesTags: (result, error, { commentId }) => [{ type: 'CommentReplies', id: commentId }],
    }),
    createComment: builder.mutation<Comment, CreateCommentDto>({
      query: (body) => ({
        url: '/comments',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        return response.data || response;
      },
      invalidatesTags: (result, error, { videoId, parentId }) => {
        const tags: any[] = [{ type: 'Comments', id: videoId }];
        if (parentId) {
          tags.push({ type: 'CommentReplies', id: parentId });
        }
        return tags;
      },
    }),
    deleteComment: builder.mutation<{ message: string }, string>({
      query: (commentId) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments'],
    }),
    toggleCommentLike: builder.mutation<{ isLiked: boolean; likesCount: number }, string>({
      query: (commentId) => ({
        url: `/comments/${commentId}/like`,
        method: 'POST',
      }),
      transformResponse: (response: any) => {
        return response.data || response;
      },
      invalidatesTags: ['Comments', 'CommentReplies'],
    }),
    getVideoCommentsCount: builder.query<number, string>({
      query: (videoId) => ({
        url: `/comments/video/${videoId}/count`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        return response.data?.count || response.count || 0;
      },
      providesTags: (result, error, videoId) => [{ type: 'Comments', id: `${videoId}-count` }],
    }),
  }),
});

export const {
  useGetVideoCommentsQuery,
  useGetCommentRepliesQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
  useGetVideoCommentsCountQuery,
} = commentApi;
