// Degree types (matching backend DTOs)
export type DegreeLevel = 'HIGH_SCHOOL' | 'BACHELOR' | 'MASTER' | 'PHD' | 'DIPLOMA' | 'CERTIFICATE' | 'OTHER';

export interface Degree {
  id: string;
  employee_id: string;
  employee_name: string;
  degree_name: string;
  degree_level: DegreeLevel | null;
  institution: string;
  major: string;
  graduation_date: string | null;
  grade: string;
  attachment_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export const DEGREE_LEVEL_LABELS: Record<DegreeLevel, string> = {
  HIGH_SCHOOL: 'Trung học phổ thông',
  BACHELOR: 'Cử nhân',
  MASTER: 'Thạc sĩ',
  PHD: 'Tiến sĩ',
  DIPLOMA: 'Cao đẳng',
  CERTIFICATE: 'Chứng chỉ',
  OTHER: 'Khác',
};