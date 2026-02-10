// Payroll / Salary types (matching backend PayrollResponse / DTOs)

export type PayrollStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export interface SalaryDetail {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  month: number;
  year: number;
  base_salary: number;
  salary_coefficient: number;
  working_days: number;
  actual_working_days: number;
  overtime_hours: number;
  overtime_pay: number;
  allowance: number;
  bonus: number;
  social_insurance: number;
  health_insurance: number;
  unemployment_insurance: number;
  personal_income_tax: number;
  total_deductions: number;
  total_income: number;
  net_salary: number;
  status: PayrollStatus;
  note: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

// --- Vietnamese label maps ---
export const PAYROLL_STATUS_LABELS: Record<PayrollStatus, string> = {
  DRAFT: 'Nháp',
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  CANCELLED: 'Đã hủy',
};
