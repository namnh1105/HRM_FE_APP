import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreateLeaveRequestMutation } from '../store/api/leaveApi';
import type { LeaveType, CreateLeaveRequestPayload } from '../types/leave';

/**
 * Parse date string from DD/MM/YYYY → YYYY-MM-DD (ISO format for backend).
 */
const parseDate = (str: string): string => {
  const parts = str.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return str;
};

export const useCreateLeaveRequest = () => {
  const navigation = useNavigation<any>();
  const [createLeaveRequest, { isLoading }] = useCreateLeaveRequestMutation();

  const [selectedType, setSelectedType] = useState<LeaveType>('ANNUAL_LEAVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const validate = (): boolean => {
    if (!startDate.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày bắt đầu (DD/MM/YYYY)');
      return false;
    }
    if (!reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: CreateLeaveRequestPayload = {
      leave_type: selectedType,
      start_date: parseDate(startDate),
      end_date: endDate.trim() ? parseDate(endDate) : parseDate(startDate),
      reason: reason.trim(),
    };

    try {
      await createLeaveRequest(payload).unwrap();
      Alert.alert('Thành công', 'Đơn đã được gửi, chờ duyệt.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const message =
        err?.data?.message || err?.data?.error || 'Gửi đơn thất bại. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    }
  };

  const goBack = () => navigation.goBack();

  return {
    selectedType,
    setSelectedType,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reason,
    setReason,
    isLoading,
    handleSubmit,
    goBack,
  };
};
