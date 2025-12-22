import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../context/AuthContext';

export const useRequireAuth = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuthContext();

  const requireAuth = (action: () => void, actionName?: string): boolean => {
    if (!isAuthenticated) {
      Alert.alert(
        'Cần đăng nhập',
        `Bạn cần đăng nhập để ${actionName || 'thực hiện hành động này'}`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng nhập',
            onPress: () => {
              navigation.navigate('Login' as never);
            },
          },
        ]
      );
      return false;
    }
    action();
    return true;
  };

  return { requireAuth, isAuthenticated };
};
