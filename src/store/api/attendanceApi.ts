import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { ApiResponse } from '../../types/common';
import type {
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
} from '../../types/attendance';

// ── Face recognition response types ──────────────────────────────────
export interface FaceCheckinData {
  employeeId: string;
  employeeName: string;
  checkInTime: string;
  workDate: string;
  workShift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  lateMinutes: number;
  status: string;
  attendanceId: string;
}

export interface FaceCheckoutData {
  employeeId: string;
  employeeName: string;
  checkInTime: string;
  checkOutTime: string;
  workDate: string;
  workShift?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  workingHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  status: string;
  attendanceId: string;
}

export interface FaceAttendanceParams {
  photoUri: string;
  employeeId: string;
  latitude: number;
  longitude: number;
}

export interface FaceRegisterParams {
  videoUri: string;
  employeeId: string;
}

// Response khi enqueue job (PUT /register-face trả về ngay)  
export interface FaceRegisterEnqueueData {
  jobId: string;
  employeeId: string;
  message: string;
}

// Response khi polling job status (GET /register-face/status/{jobId})
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface FaceRegisterJobResult {
  message: string;
  employeeId: string;
  indexUpdated: boolean;
  anglesCaptured: string[];
}

export interface FaceRegisterJobStatusData {
  jobId: string;
  status: JobStatus;
  created_at?: string;
  updated_at?: string;
  result?: FaceRegisterJobResult;
  error?: string;
  progress?: string;
}

export interface FaceStatusData {
  registered: boolean;
  employeeId: string;
}

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery,
  tagTypes: ['AttendanceToday', 'AttendanceHistory', 'FaceStatus'],
  endpoints: (builder) => ({
    getAttendanceToday: builder.query<ApiResponse<AttendanceRecord | null>, void>({
      query: () => '/attendances/me/today',
      providesTags: ['AttendanceToday'],
    }),

    getAttendanceHistory: builder.query<
      ApiResponse<AttendanceRecord[]>,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) =>
        `/attendances/me/history?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ['AttendanceHistory'],
    }),

    checkIn: builder.mutation<ApiResponse<AttendanceRecord>, CheckInRequest | void>({
      query: (body) => ({
        url: '/attendances/check-in',
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory'],
    }),

    checkOut: builder.mutation<ApiResponse<AttendanceRecord>, CheckOutRequest | void>({
      query: (body) => ({
        url: '/attendances/check-out',
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory'],
    }),

    // ── Face recognition mutations ────────────────────────────────────
    faceCheckin: builder.mutation<ApiResponse<FaceCheckinData>, FaceAttendanceParams>({
      query: ({ photoUri, employeeId, latitude, longitude }) => {
        const formData = new FormData();
        formData.append('file', {
          uri: photoUri,
          type: 'image/jpeg',
          name: 'face.jpg',
        } as any);
        formData.append('employee_id', employeeId);
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());
        return {
          url: '/face-api/attendances/check-in',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory'],
    }),

    faceCheckout: builder.mutation<ApiResponse<FaceCheckoutData>, FaceAttendanceParams>({
      query: ({ photoUri, employeeId, latitude, longitude }) => {
        const formData = new FormData();
        formData.append('file', {
          uri: photoUri,
          type: 'image/jpeg',
          name: 'face.jpg',
        } as any);
        formData.append('employee_id', employeeId);
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());
        return {
          url: '/face-api/attendances/check-out',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory'],
    }),

    // ── Face registration ─────────────────────────────────────────────
    getFaceStatus: builder.query<ApiResponse<FaceStatusData>, string>({
      query: (employeeId) => `/face-api/attendances/face-status/${employeeId}`,
      providesTags: ['FaceStatus'],
    }),

    registerFace: builder.mutation<ApiResponse<FaceRegisterEnqueueData>, FaceRegisterParams>({
      query: ({ videoUri, employeeId }) => {
        const formData = new FormData();
        formData.append('video', {
          uri: videoUri,
          type: 'video/mp4',
          name: 'face_register.mp4',
        } as any);
        formData.append('employee_id', employeeId);
        return {
          url: '/face-api/attendances/register-face',
          method: 'PUT',
          body: formData,
        };
      },
    }),

    // ── Job status polling ──────────────────────────────────────────
    getRegisterFaceJobStatus: builder.query<ApiResponse<FaceRegisterJobStatusData>, string>({
      query: (jobId) => `/face-api/attendances/register-face/status/${jobId}`,
    }),
  }),
});

export const {
  useGetAttendanceTodayQuery,
  useGetAttendanceHistoryQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useFaceCheckinMutation,
  useFaceCheckoutMutation,
  useGetFaceStatusQuery,
  useRegisterFaceMutation,
  useLazyGetRegisterFaceJobStatusQuery,
} = attendanceApi;
