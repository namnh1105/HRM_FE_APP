// Attendance types (matching backend AttendanceResponse / DTOs)

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EARLY_LEAVE'
  | 'HALF_DAY'
  | 'ON_LEAVE'
  | 'HOLIDAY'
  | 'WEEKEND';

/** Frontend-only status for today's check-in flow */
export type CheckInFlowStatus = 'not_checked' | 'checked_in' | 'checked_out';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  work_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_ip: string | null;
  check_out_ip: string | null;
  check_in_location: string | null;
  check_out_location: string | null;
  status: AttendanceStatus;
  working_hours: number;
  overtime_hours: number;
  late_minutes: number;
  early_leave_minutes: number;
  note: string | null;
  work_shift_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface CheckInRequest {
  note?: string;
  check_in_location?: string;
}

export interface CheckOutRequest {
  note?: string;
  check_out_location?: string;
}
