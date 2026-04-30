import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useGetMyPayrollsQuery, useGetPayrollsByStoreQuery } from '../store/api/payrollApi';
import { useRole } from './useRole';
import type { SalaryDetail } from '../types/payroll';

const formatVND = (amount: number) => amount.toLocaleString('vi-VN') + ' ₫';

export const useSalary = () => {
  const navigation = useNavigation<any>();
  const { isManager, storeId } = useRole();

  const {
    data: myPayrollsData,
    isLoading: isLoadingMyPayrolls,
    isError: isErrorMyPayrolls,
  } = useGetMyPayrollsQuery(undefined, { skip: isManager });

  const {
    data: storePayrollsData,
    isLoading: isLoadingStorePayrolls,
    isError: isErrorStorePayrolls,
  } = useGetPayrollsByStoreQuery(storeId || '', { skip: !isManager || !storeId });

  const salaryHistory: SalaryDetail[] = isManager
    ? (storePayrollsData?.data ?? [])
    : (myPayrollsData?.data ?? []);

  const isLoading = isManager ? isLoadingStorePayrolls : isLoadingMyPayrolls;
  const isError = isManager ? isErrorStorePayrolls : isErrorMyPayrolls;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selected: SalaryDetail | undefined = salaryHistory[selectedIndex];

  const monthLabel = (s: SalaryDetail) =>
    `Tháng ${String(s.month).padStart(2, '0')}/${s.year}`;

  const goBack = () => navigation.goBack();

  const totalPayroll = isManager
    ? salaryHistory.reduce((acc, curr) => acc + curr.netSalary, 0)
    : 0;

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
    isManager,
    totalPayroll,
  };
};

export { formatVND };
