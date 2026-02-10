// Leave Request types (matching backend LeaveRequestResponse / DTOs)

export type LeaveType =
  | 'ANNUAL_LEAVE'
  | 'SICK_LEAVE'
  | 'MATERNITY_LEAVE'
  | 'PATERNITY_LEAVE'
  | 'WEDDING_LEAVE'
  | 'BEREAVEMENT_LEAVE'
  | 'UNPAID_LEAVE'
  | 'COMPENSATORY_LEAVE'
  | 'OTHER';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  approver_id: string | null;
  approver_name: string | null;
  approved_at: string | null;
  approver_comment: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveRequestPayload {
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  attachment_url?: string;
}

export interface ReviewLeaveRequestPayload {
  approved: boolean;
  comment?: string;
}

// --- Vietnamese label maps ---
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL_LEAVE: 'Nghỉ phép năm',
  SICK_LEAVE: 'Nghỉ ốm',
  MATERNITY_LEAVE: 'Nghỉ thai sản',
  PATERNITY_LEAVE: 'Nghỉ cha',
  WEDDING_LEAVE: 'Nghỉ cưới',
  BEREAVEMENT_LEAVE: 'Nghỉ tang',
  UNPAID_LEAVE: 'Nghỉ không lương',
  COMPENSATORY_LEAVE: 'Nghỉ bù',
  OTHER: 'Khác',
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
};

export const LEAVE_STATUS_COLORS: Record<LeaveStatus, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#10B981',
  REJECTED: '#EF4444',
  CANCELLED: '#94A3B8',
};
