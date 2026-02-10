import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { ApiResponse } from '../../types/common';
import type {
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
} from '../../types/attendance';

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery,
  tagTypes: ['AttendanceToday', 'AttendanceHistory'],
  endpoints: (builder) => ({
    /** GET /attendances/me/today */
    getAttendanceToday: builder.query<ApiResponse<AttendanceRecord | null>, void>({
      query: () => '/attendances/me/today',
      providesTags: ['AttendanceToday'],
    }),

    /** GET /attendances/me/history?start_date=...&end_date=... */
    getAttendanceHistory: builder.query<
      ApiResponse<AttendanceRecord[]>,
      { start_date: string; end_date: string }
    >({
      query: ({ start_date, end_date }) =>
        `/attendances/me/history?start_date=${start_date}&end_date=${end_date}`,
      providesTags: ['AttendanceHistory'],
    }),

    /** POST /attendances/check-in */
    checkIn: builder.mutation<ApiResponse<AttendanceRecord>, CheckInRequest | void>({
      query: (body) => ({
        url: '/attendances/check-in',
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory'],
    }),

    /** POST /attendances/check-out */
    checkOut: builder.mutation<ApiResponse<AttendanceRecord>, CheckOutRequest | void>({
      query: (body) => ({
        url: '/attendances/check-out',
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory'],
    }),
  }),
});

export const {
  useGetAttendanceTodayQuery,
  useGetAttendanceHistoryQuery,
  useCheckInMutation,
  useCheckOutMutation,
} = attendanceApi;
