import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LeaveRequest, LeaveStatus, LeaveType } from '../../types/hrm';

// --- Mock Data ---
const mockRequests: LeaveRequest[] = [
  {
    id: '1',
    type: 'annual_leave',
    startDate: '2026-02-15',
    endDate: '2026-02-16',
    reason: 'Nghỉ phép năm – việc gia đình',
    status: 'pending',
    createdAt: '2026-02-08T10:00:00Z',
  },
  {
    id: '2',
    type: 'sick_leave',
    startDate: '2026-01-20',
    endDate: '2026-01-20',
    reason: 'Không khỏe, cần nghỉ ngơi',
    status: 'approved',
    createdAt: '2026-01-19T08:30:00Z',
    approvedBy: 'Nguyễn Văn A',
  },
  {
    id: '3',
    type: 'business_trip',
    startDate: '2026-01-10',
    endDate: '2026-01-12',
    reason: 'Công tác tại chi nhánh Đà Nẵng',
    status: 'approved',
    createdAt: '2026-01-08T09:00:00Z',
    approvedBy: 'Nguyễn Văn A',
  },
  {
    id: '4',
    type: 'overtime',
    startDate: '2026-01-05',
    endDate: '2026-01-05',
    reason: 'Hoàn thành dự án gấp',
    status: 'rejected',
    createdAt: '2026-01-04T14:00:00Z',
    rejectedReason: 'Không đủ ngân sách OT tháng này',
  },
];

// --- State ---
export interface LeaveState {
  requests: LeaveRequest[];
  filterStatus: LeaveStatus | 'all';
  isLoading: boolean;
}

const initialState: LeaveState = {
  requests: mockRequests,
  filterStatus: 'all',
  isLoading: false,
};

// --- Slice ---
const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    addRequest: (
      state,
      action: PayloadAction<Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>>,
    ) => {
      const newRequest: LeaveRequest = {
        ...action.payload,
        id: String(Date.now()),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      state.requests.unshift(newRequest);
    },
    setFilterStatus: (state, action: PayloadAction<LeaveStatus | 'all'>) => {
      state.filterStatus = action.payload;
    },
    updateRequestStatus: (
      state,
      action: PayloadAction<{ id: string; status: LeaveStatus }>,
    ) => {
      const request = state.requests.find((r) => r.id === action.payload.id);
      if (request) {
        request.status = action.payload.status;
      }
    },
  },
});

export const { addRequest, setFilterStatus, updateRequestStatus } = leaveSlice.actions;
export default leaveSlice.reducer;
