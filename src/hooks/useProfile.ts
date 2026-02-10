import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useGetMyProfileQuery } from '../store/api/employeeApi';

interface MenuItem {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  badge?: string;
}

export const useProfile = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { data: profileData, isLoading, error, refetch } = useGetMyProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const profile = profileData?.data;

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'calendar',
      label: 'Lịch làm việc',
      color: '#F59E0B',
      onPress: () => navigation.navigate('WorkSchedule'),
    },
    {
      icon: 'wallet',
      label: 'Lương & phúc lợi',
      color: '#10B981',
      onPress: () => navigation.navigate('Salary'),
    },
    {
      icon: 'time',
      label: 'Lịch sử chấm công',
      color: '#3B82F6',
      onPress: () => navigation.navigate('AttendanceHistory'),
    },
    {
      icon: 'document-text',
      label: 'Hợp đồng lao động',
      color: '#8B5CF6',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
    {
      icon: 'lock-closed',
      label: 'Đổi mật khẩu',
      color: '#64748B',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
  ];

  const displayName = profile?.full_name
    || user?.name
    || (user?.givenName ? `${user?.givenName || ''} ${user?.familyName || ''}`.trim() : null)
    || user?.username
    || 'Nhân viên';

  const navigateToLogin = () => navigation.navigate('Login');
  const navigateToSignUp = () => navigation.navigate('SignUp');

  return {
    isAuthenticated,
    user,
    profile,
    isLoading,
    error,
    refetch,
    displayName,
    menuItems,
    handleLogout,
    navigateToLogin,
    navigateToSignUp,
  };
};
