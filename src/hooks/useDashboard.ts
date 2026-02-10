import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useGetAttendanceTodayQuery } from '../store/api/attendanceApi';
import { useGetMyLeaveRequestsQuery } from '../store/api/leaveApi';
import { useGetMyPayrollsQuery } from '../store/api/payrollApi';
import { useGetMyNotificationsQuery } from '../store/api/notificationApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useDashboard = () => {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: notificationRes } = useGetMyNotificationsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const allNotifications = notificationRes?.data ?? [];
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const notifications = allNotifications.slice(0, 5);

  const { data: attendanceRes, isLoading: isAttendanceLoading } =
    useGetAttendanceTodayQuery(undefined, { skip: !isAuthenticated });
  const { data: leaveRes, isLoading: isLeaveLoading } =
    useGetMyLeaveRequestsQuery(undefined, { skip: !isAuthenticated });
  const { data: payrollRes, isLoading: isPayrollLoading } =
    useGetMyPayrollsQuery(undefined, { skip: !isAuthenticated });

  const todayRecord = attendanceRes?.data ?? null;

  const derivedStatus = todayRecord
    ? todayRecord.check_out_time
      ? 'checked_out'
      : todayRecord.check_in_time
        ? 'checked_in'
        : 'not_checked'
    : 'not_checked';

  const getStatusLabel = () => {
    switch (derivedStatus) {
      case 'checked_in':
        return 'Đang làm việc';
      case 'checked_out':
        return 'Đã tan ca';
      default:
        return 'Chưa chấm công';
    }
  };

  const getStatusColor = () => {
    switch (derivedStatus) {
      case 'checked_in':
        return '#10B981';
      case 'checked_out':
        return '#6B7280';
      default:
        return '#F59E0B';
    }
  };

  

  const recentNotifications = notifications.filter((n) => !n.isRead).slice(0, 3);

  const quickActions = [
    {
      icon: 'finger-print' as const,
      label: 'Chấm công',
      color: '#3B82F6',
      bg: '#EFF6FF',
      onPress: () => navigation.navigate('Attendance'),
    },
    {
      icon: 'document-text' as const,
      label: 'Xin nghỉ',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      onPress: () => navigation.navigate('CreateLeaveRequest'),
    },
    {
      icon: 'wallet' as const,
      label: 'Xem lương',
      color: '#10B981',
      bg: '#ECFDF5',
      onPress: () => navigation.navigate('Salary'),
    },
    {
      icon: 'calendar' as const,
      label: 'Lịch làm việc',
      color: '#F59E0B',
      bg: '#FFFBEB',
      onPress: () => navigation.navigate('WorkSchedule'),
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'time';
      case 'leave':
        return 'document-text';
      case 'salary':
        return 'wallet';
      case 'hr':
        return 'people';
      default:
        return 'notifications';
    }
  };

  const navigateToLogin = () => navigation.navigate('Login');
  const navigateToNotifications = () => navigation.navigate('Notifications');

  return {
    user,
    isAuthenticated,
    todayRecord,
    isAttendanceLoading,
    unreadCount,
    recentNotifications,
    quickActions,
    getStatusLabel,
    getStatusColor,
    getNotificationIcon,
    navigateToLogin,
    navigateToNotifications,
  };
};
