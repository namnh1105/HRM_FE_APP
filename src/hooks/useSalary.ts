import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useGetMyPayrollsQuery } from '../store/api/payrollApi';
import type { SalaryDetail } from '../types/payroll';

const formatVND = (amount: number) => amount.toLocaleString('vi-VN') + ' ₫';

export const useSalary = () => {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError } = useGetMyPayrollsQuery();
  const salaryHistory: SalaryDetail[] = data?.data ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selected: SalaryDetail | undefined = salaryHistory[selectedIndex];

  const monthLabel = (s: SalaryDetail) =>
    `Tháng ${String(s.month).padStart(2, '0')}/${s.year}`;

  const goBack = () => navigation.goBack();

  return {
    salaryHistory,
    isLoading,
    isError,
    selectedIndex,
    setSelectedIndex,
    selected,
    monthLabel,
    formatVND,
    goBack,
  };
};

export { formatVND };
