import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  useGetAttendanceTodayQuery,
  useGetAttendanceHistoryQuery,
  useCheckInMutation,
  useCheckOutMutation,
} from '../store/api/attendanceApi';
import type { CheckInFlowStatus } from '../types/attendance';

export const useAttendance = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  // RTK Query hooks
  const { data: todayData, isLoading: todayLoading, refetch: refetchToday } =
    useGetAttendanceTodayQuery(undefined, { skip: !isAuthenticated });

  // History: last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const today = new Date().toISOString().split('T')[0];
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: historyData, isLoading: historyLoading } = useGetAttendanceHistoryQuery(
    { start_date: startDate, end_date: today },
    { skip: !isAuthenticated },
  );

  const [doCheckIn, { isLoading: checkingIn }] = useCheckInMutation();
  const [doCheckOut, { isLoading: checkingOut }] = useCheckOutMutation();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const todayRecord = todayData?.data;

  // Derive check-in flow status from backend data
  const flowStatus: CheckInFlowStatus = !todayRecord
    ? 'not_checked'
    : todayRecord.check_out_time
      ? 'checked_out'
      : todayRecord.check_in_time
        ? 'checked_in'
        : 'not_checked';

  const isCheckedIn = flowStatus === 'checked_in';
  const isCheckedOut = flowStatus === 'checked_out';
  const canCheckIn = flowStatus === 'not_checked';
  const canCheckOut = isCheckedIn;
  const isProcessing = checkingIn || checkingOut;

  const historyRecords = (historyData?.data || []).slice(0, 5);

  const handleCheckIn = () => {
    Alert.alert('Xác nhận chấm công vào', 'Bạn có muốn chấm công vào ngay bây giờ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Chấm công',
        onPress: async () => {
          try {
            await doCheckIn().unwrap();
            refetchToday();
          } catch (err: any) {
            Alert.alert('Lỗi', err?.data?.message || 'Chấm công vào thất bại');
          }
        },
      },
    ]);
  };

  const handleCheckOut = () => {
    Alert.alert('Xác nhận chấm công ra', 'Bạn có muốn chấm công ra ngay bây giờ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Chấm công',
        style: 'destructive',
        onPress: async () => {
          try {
            await doCheckOut().unwrap();
            refetchToday();
          } catch (err: any) {
            Alert.alert('Lỗi', err?.data?.message || 'Chấm công ra thất bại');
          }
        },
      },
    ]);
  };

  const navigateToLogin = () => navigation.navigate('Login');
  const navigateToHistory = () => navigation.navigate('AttendanceHistory');

  return {
    isAuthenticated,
    timeStr,
    dateStr,
    todayRecord,
    todayLoading,
    historyLoading,
    isProcessing,
    canCheckIn,
    canCheckOut,
    isCheckedOut,
    historyRecords,
    handleCheckIn,
    handleCheckOut,
    navigateToLogin,
    navigateToHistory,
  };
};
