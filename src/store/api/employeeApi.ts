import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { ApiResponse } from '../../types/common';
import type { EmployeeProfile } from '../../types/employee';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery,
  tagTypes: ['MyProfile', 'Employee'],
  endpoints: (builder) => ({
    /** GET /employees/me */
    getMyProfile: builder.query<ApiResponse<EmployeeProfile>, void>({
      query: () => '/employees/me',
      providesTags: ['MyProfile'],
    }),

    /** GET /employees/:id */
    getEmployeeById: builder.query<ApiResponse<EmployeeProfile>, string>({
      query: (id) => `/employees/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Employee', id }],
    }),

    /** GET /employees */
    getAllEmployees: builder.query<ApiResponse<EmployeeProfile[]>, void>({
      query: () => '/employees',
      providesTags: ['Employee'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetEmployeeByIdQuery,
  useGetAllEmployeesQuery,
} = employeeApi;
