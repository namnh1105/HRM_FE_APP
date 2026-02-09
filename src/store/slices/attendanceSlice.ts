import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AttendanceRecord, AttendanceStatus } from '../../types/hrm';

// --- Mock Data ---
const today = new Date().toISOString().split('T')[0];

const mockHistory: AttendanceRecord[] = [
  {
    id: '1',
    date: today,
    checkInTime: null,
    checkOutTime: null,
    status: 'not_checked',
    workHours: null,
  },
  {
    id: '2',
    date: '2026-02-08',
    checkInTime: '08:02',
    checkOutTime: '17:15',
    status: 'checked_out',
    workHours: 9.2,
    location: 'Văn phòng chính',
  },
  {
    id: '3',
    date: '2026-02-07',
    checkInTime: '07:55',
    checkOutTime: '17:30',
    status: 'checked_out',
    workHours: 9.6,
    location: 'Văn phòng chính',
  },
  {
    id: '4',
    date: '2026-02-06',
    checkInTime: '08:10',
    checkOutTime: '17:05',
    status: 'checked_out',
    workHours: 8.9,
    location: 'Văn phòng chính',
  },
  {
    id: '5',
    date: '2026-02-05',
    checkInTime: '08:00',
    checkOutTime: '17:00',
    status: 'checked_out',
    workHours: 9.0,
    location: 'Văn phòng chính',
  },
];

// --- State ---
export interface AttendanceState {
  todayRecord: AttendanceRecord;
  history: AttendanceRecord[];
  isLoading: boolean;
}

const initialState: AttendanceState = {
  todayRecord: mockHistory[0],
  history: mockHistory,
  isLoading: false,
};

// --- Slice ---
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    checkIn: (state) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      state.todayRecord.checkInTime = timeStr;
      state.todayRecord.status = 'checked_in';
      // Update in history too
      const todayIdx = state.history.findIndex((r) => r.date === state.todayRecord.date);
      if (todayIdx >= 0) {
        state.history[todayIdx] = { ...state.todayRecord };
      }
    },
    checkOut: (state) => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      state.todayRecord.checkOutTime = timeStr;
      state.todayRecord.status = 'checked_out';
      // Calculate work hours
      if (state.todayRecord.checkInTime) {
        const [inH, inM] = state.todayRecord.checkInTime.split(':').map(Number);
        const [outH, outM] = timeStr.split(':').map(Number);
        state.todayRecord.workHours =
          Math.round(((outH * 60 + outM - (inH * 60 + inM)) / 60) * 10) / 10;
      }
      const todayIdx = state.history.findIndex((r) => r.date === state.todayRecord.date);
      if (todayIdx >= 0) {
        state.history[todayIdx] = { ...state.todayRecord };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { checkIn, checkOut, setLoading } = attendanceSlice.actions;
export default attendanceSlice.reducer;
