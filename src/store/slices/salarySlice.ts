import { createSlice } from '@reduxjs/toolkit';
import type { SalaryDetail } from '../../types/hrm';

// --- Mock Data (VND) ---
const mockSalary: SalaryDetail[] = [
  {
    id: '1',
    month: 1,
    year: 2026,
    baseSalary: 15000000,
    allowance: 2000000,
    overtime: 1500000,
    bonus: 0,
    deduction: 200000,
    insurance: 1575000,
    tax: 485000,
    netSalary: 16240000,
    paidDate: '2026-02-05',
  },
  {
    id: '2',
    month: 12,
    year: 2025,
    baseSalary: 15000000,
    allowance: 2000000,
    overtime: 800000,
    bonus: 5000000,
    deduction: 100000,
    insurance: 1575000,
    tax: 650000,
    netSalary: 20475000,
    paidDate: '2026-01-05',
  },
  {
    id: '3',
    month: 11,
    year: 2025,
    baseSalary: 15000000,
    allowance: 2000000,
    overtime: 1200000,
    bonus: 0,
    deduction: 150000,
    insurance: 1575000,
    tax: 460000,
    netSalary: 16015000,
    paidDate: '2025-12-05',
  },
  {
    id: '4',
    month: 10,
    year: 2025,
    baseSalary: 15000000,
    allowance: 2000000,
    overtime: 0,
    bonus: 0,
    deduction: 0,
    insurance: 1575000,
    tax: 400000,
    netSalary: 15025000,
    paidDate: '2025-11-05',
  },
];

// --- State ---
export interface SalaryState {
  salaryHistory: SalaryDetail[];
  isLoading: boolean;
}

const initialState: SalaryState = {
  salaryHistory: mockSalary,
  isLoading: false,
};

// --- Slice ---
const salarySlice = createSlice({
  name: 'salary',
  initialState,
  reducers: {},
});

export default salarySlice.reducer;
