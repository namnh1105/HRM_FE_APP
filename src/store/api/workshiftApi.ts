import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { ApiResponse } from '../../types/common';
import type { WorkShift } from '../../types/workshift';

export const workshiftApi = createApi({
  reducerPath: 'workshiftApi',
  baseQuery,
  tagTypes: ['WorkShift'],
  endpoints: (builder) => ({
    /** GET /work-shifts/enabled */
    getActiveWorkShifts: builder.query<ApiResponse<WorkShift[]>, void>({
      query: () => '/work-shifts/enabled',
      providesTags: ['WorkShift'],
    }),

    /** GET /work-shifts */
    getAllWorkShifts: builder.query<ApiResponse<WorkShift[]>, void>({
      query: () => '/work-shifts',
      providesTags: ['WorkShift'],
    }),

    /** GET /work-shifts/:id */
    getWorkShiftById: builder.query<ApiResponse<WorkShift>, string>({
      query: (id) => `/work-shifts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'WorkShift', id }],
    }),
  }),
});

export const {
  useGetActiveWorkShiftsQuery,
  useGetAllWorkShiftsQuery,
  useGetWorkShiftByIdQuery,
} = workshiftApi;
