import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import type { ApiResponse } from '../../types/common';
import type { Department } from '../../types/department';

export const departmentApi = createApi({
  reducerPath: 'departmentApi',
  baseQuery,
  tagTypes: ['Department'],
  endpoints: (builder) => ({
    /** GET /departments */
    getDepartments: builder.query<ApiResponse<Department[]>, void>({
      query: () => '/departments',
      providesTags: ['Department'],
    }),

    /** GET /departments/:id */
    getDepartmentById: builder.query<ApiResponse<Department>, string>({
      query: (id) => `/departments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Department', id }],
    }),

    /** GET /departments/:id/employees */
    getDepartmentEmployees: builder.query<ApiResponse<Department>, string>({
      query: (id) => `/departments/${id}/employees`,
      providesTags: (_result, _error, id) => [{ type: 'Department', id }],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useGetDepartmentEmployeesQuery,
} = departmentApi;
