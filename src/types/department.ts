// Department types (matching backend DepartmentResponse DTO)

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  manager_id: string | null;
  manager_name: string | null;
  parent_department_id: string | null;
  parent_department_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
