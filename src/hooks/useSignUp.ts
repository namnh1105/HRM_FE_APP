import { useState, useRef, useEffect } from 'react';
import { Alert, Animated } from 'react-native';
import { useAuthContext } from '../context/AuthContext';

export const useSignUp = (navigation: any) => {
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { signInWithGoogle, user } = useAuthContext();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Close modal when authenticated
  useEffect(() => {
    if (user) {
      navigation.goBack();
    }
  }, [user, navigation]);

  const handleSignUp = async () => {
    if (!givenName || !familyName || !username || !password || !confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Vui lòng nhập đầy đủ thông tin',
        type: 'warning',
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Mật khẩu không trùng khớp',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, givenName, familyName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertConfig({
          visible: true,
          title: 'Đăng ký thất bại',
          message: data.message || `Lỗi: ${res.status}`,
          type: 'error',
        });
        return;
      }

      setAlertConfig({
        visible: true,
        title: 'Thành công',
        message: 'Đăng ký thành công! Hãy đăng nhập để tiếp tục.',
        type: 'success',
      });

      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không thể kết nối server',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const showFacebookAlert = () => {
    setAlertConfig({
      visible: true,
      title: 'Thông báo',
      message: 'Tính năng đăng nhập Facebook sẽ sớm được hỗ trợ',
      type: 'info',
    });
  };

  const closeAlert = () => setAlertConfig({ ...alertConfig, visible: false });
  const goBack = () => navigation.goBack();

  return {
    givenName,
    setGivenName,
    familyName,
    setFamilyName,
    username,
    setUsername,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    alertConfig,
    fadeAnim,
    slideAnim,
    signInWithGoogle,
    handleSignUp,
    showFacebookAlert,
    closeAlert,
    goBack,
  };
};
