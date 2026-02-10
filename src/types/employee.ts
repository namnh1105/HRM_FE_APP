// Employee types (matching backend EmployeeResponse DTO)

export interface EmployeeProfile {
  id: string;
  employee_code: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  id_card_number: string | null;
  permanent_address: string | null;
  current_address: string | null;
  avatar_url: string | null;
  department_id: string | null;
  department_name: string | null;
  position: string | null;
  join_date: string | null;
  leave_date: string | null;
  employment_status: string;
  bank_account_number: string | null;
  bank_name: string | null;
  tax_code: string | null;
  social_insurance_number: string | null;
  health_insurance_number: string | null;
  base_salary: number;
  created_at: string;
  updated_at: string;
}
