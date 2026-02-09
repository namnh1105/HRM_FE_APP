import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { HrmNotification } from '../../types/hrm';

// --- Mock Data ---
const mockNotifications: HrmNotification[] = [
  {
    id: '1',
    type: 'attendance',
    title: 'Nhắc nhở chấm công',
    message: 'Bạn chưa chấm công hôm nay. Vui lòng chấm công trước 9:00.',
    isRead: false,
    createdAt: '2026-02-09T07:30:00Z',
  },
  {
    id: '2',
    type: 'leave',
    title: 'Đơn nghỉ phép đã được duyệt',
    message: 'Đơn nghỉ phép ngày 20/01/2026 đã được quản lý duyệt.',
    isRead: false,
    createdAt: '2026-02-08T15:00:00Z',
  },
  {
    id: '3',
    type: 'salary',
    title: 'Phiếu lương tháng 01/2026',
    message: 'Phiếu lương tháng 01/2026 đã sẵn sàng. Vui lòng kiểm tra chi tiết.',
    isRead: true,
    createdAt: '2026-02-05T10:00:00Z',
  },
  {
    id: '4',
    type: 'hr',
    title: 'Thông báo từ HR',
    message: 'Công ty tổ chức teambuilding vào ngày 20/02/2026. Vui lòng đăng ký tham gia.',
    isRead: true,
    createdAt: '2026-02-03T09:00:00Z',
  },
  {
    id: '5',
    type: 'general',
    title: 'Cập nhật chính sách',
    message: 'Chính sách nghỉ phép năm 2026 đã được cập nhật. Xem chi tiết trong mục Hồ sơ.',
    isRead: true,
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: '6',
    type: 'leave',
    title: 'Đơn làm thêm giờ bị từ chối',
    message: 'Đơn OT ngày 05/01/2026 đã bị từ chối. Lý do: Không đủ ngân sách.',
    isRead: true,
    createdAt: '2026-01-06T11:00:00Z',
  },
];

// --- State ---
export interface NotificationState {
  notifications: HrmNotification[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.isRead).length,
};

// --- Slice ---
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
    addNotification: (state, action: PayloadAction<Omit<HrmNotification, 'id'>>) => {
      const newNotification: HrmNotification = {
        ...action.payload,
        id: String(Date.now()),
      };
      state.notifications.unshift(newNotification);
      if (!newNotification.isRead) {
        state.unreadCount += 1;
      }
    },
  },
});

export const { markAsRead, markAllAsRead, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
