import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoginMutation, LoginResponse } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';

export const useAuthLogin = (navigation: any) => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const validateInputs = (): boolean => {
    if (!username) {
      Alert.alert('Lỗi', 'Tài khoản không được bỏ trống');
      return false;
    }
    if (!password) {
      Alert.alert('Lỗi', 'Mật khẩu không được bỏ trống');
      return false;
    }
    return true;
  };

  const saveAuthData = async (accessToken: string, userInfo?: any) => {
    await AsyncStorage.setItem('authToken', accessToken);
    if (userInfo) {
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateInputs()) return;

    try {
      const response = await login({ username, password });

      if ('data' in response && response.data) {
        const result = response.data as LoginResponse;

        if (result.success && result.data.accessToken) {
          // Save to AsyncStorage first
          await saveAuthData(result.data.accessToken, result.data.user);
          
          // Update Redux state - this triggers RootNavigator
          dispatch(setCredentials({
            accessToken: result.data.accessToken,
            user: result.data.user,
          }));
          
          console.log('[useAuthLogin] Login successful, credentials saved');
          
          // Wait a bit for state to propagate
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Navigate back to main app
          Alert.alert('Đăng nhập thành công', 'Chào mừng bạn đã quay trở lại!', [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }
            },
          ]);
        } else {
          Alert.alert('Đăng nhập thất bại', result.message || 'Có lỗi xảy ra trong quá trình đăng nhập');
        }
      } else if ('error' in response) {
        throw new Error('Login failed');
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Không thể kết nối đến server';
      Alert.alert('Đăng nhập thất bại', errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateBack = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }],
    });
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    isLoading,
    handleLogin,
    togglePasswordVisibility,
    navigateBack,
    navigateToSignUp,
  };
};
