import { useState } from 'react';
import { Alert } from 'react-native';
import { useRegisterMutation } from '../store/api/authApi';

interface SignUpFormData {
  givenName: string;
  familyName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export const useAuthSignUp = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    givenName: '',
    familyName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [register, { isLoading }] = useRegisterMutation();

  const updateField = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.givenName || !formData.familyName || !formData.username || 
        !formData.password || !formData.confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không trùng khớp');
      return false;
    }

    return true;
  };

  const handleSignUp = async (onSuccess?: () => void) => {
    if (!validateForm()) return;

    try {
      const result = await register({
        username: formData.username,
        givenName: formData.givenName,
        familyName: formData.familyName,
        password: formData.password,
      }).unwrap();

      Alert.alert('Thành công', 'Đăng ký thành công!', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.data?.error || 'Không thể kết nối server';
      Alert.alert('Đăng ký thất bại', errorMessage);
    }
  };

  return {
    formData,
    updateField,
    handleSignUp,
    isLoading,
  };
};
