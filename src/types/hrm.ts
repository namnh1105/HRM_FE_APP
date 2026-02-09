// ===== HRM Type Definitions =====

// --- Attendance ---
export type AttendanceStatus = 'not_checked' | 'checked_in' | 'checked_out';

export interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  workHours: number | null;
  location?: string;
  note?: string;
}

// --- Leave / Request ---
export type LeaveType =
  | 'annual_leave'
  | 'sick_leave'
  | 'business_trip'
  | 'overtime'
  | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  approvedBy?: string;
  rejectedReason?: string;
}

// --- Notification ---
export type NotificationType =
  | 'attendance'
  | 'leave'
  | 'salary'
  | 'general'
  | 'hr';

export interface HrmNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// --- Salary ---
export interface SalaryDetail {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  allowance: number;
  overtime: number;
  bonus: number;
  deduction: number;
  insurance: number;
  tax: number;
  netSalary: number;
  paidDate?: string;
}

// --- Work Schedule ---
export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface ScheduleDay {
  date: string;
  shift?: WorkShift;
  isHoliday: boolean;
  holidayName?: string;
  isWeekend: boolean;
}

// --- Employee Profile ---
export interface EmployeeProfile {
  department: string;
  position: string;
  joinDate: string;
  contractType: string;
  employeeId: string;
  manager?: string;
  phone?: string;
}

// --- Leave type label map ---
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual_leave: 'Nghỉ phép',
  sick_leave: 'Nghỉ ốm',
  business_trip: 'Công tác',
  overtime: 'Làm thêm giờ',
  other: 'Khác',
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};
