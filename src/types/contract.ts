// Contract types (matching backend DTOs)
export type ContractType = 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'INTERN' | 'FREELANCE';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING';

export interface Contract {
  id: string;
  contract_code: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  contract_type: ContractType;
  start_date: string;
  end_date: string | null;
  signing_date: string | null;
  base_salary: number;
  salary_coefficient: number;
  status: ContractStatus;
  note: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  TEMPORARY: 'Tạm thời',
  INTERN: 'Thực tập',
  FREELANCE: 'Tự do',
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Hết hạn',
  TERMINATED: 'Đã chấm dứt',
  PENDING: 'Chờ duyệt',
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  DRAFT: '#94A3B8',
  ACTIVE: '#10B981',
  EXPIRED: '#EF4444',
  TERMINATED: '#F59E0B',
  PENDING: '#8B5CF6',
};