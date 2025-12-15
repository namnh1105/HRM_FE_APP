import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { GOOGLE_CONFIG } from '../config/googleAuth';
import { useGoogleAuthMutation } from '../store/api/authApi';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

interface UseGoogleAuthProps {
  onSuccess?: (user: GoogleUser) => void;
  onError?: (error: string) => void;
}

export const useGoogleAuth = ({ onSuccess, onError }: UseGoogleAuthProps = {}) => {
  const [googleAuth, { isLoading: isAuthenticating }] = useGoogleAuthMutation();
  const isProcessing = useRef(false);
  const processedResponseRef = useRef<string | null>(null);
  
  // Sử dụng bundle identifier từ app.json làm redirect URI
  const redirectUri = Platform.select({
    ios: 'com.scrolla.fe:/',
    android: 'com.scrolla.fe:/',
    default: 'https://auth.expo.io/@ninhhainam12/scrolla-fe',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    redirectUri: redirectUri,
  });

  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (!response) {
        return;
      }

      // Tạo unique key cho response để tránh xử lý lại
      const responseKey = response.type === "success" 
        ? `${response.type}-${response.authentication?.idToken?.substring(0, 20)}` 
        : `${response.type}-${Date.now()}`;

      // Đã xử lý response này rồi thì bỏ qua
      if (processedResponseRef.current === responseKey) {
        return;
      }

      // Chỉ xử lý nếu chưa đang process và có response success
      if (response.type === "success" && !isProcessing.current) {
        isProcessing.current = true;
        processedResponseRef.current = responseKey;
        
        const idToken = response.authentication?.idToken;

        if (!idToken) {
          const errorMsg = "Không lấy được Google ID Token";
          Alert.alert("Lỗi", errorMsg);
          onError?.(errorMsg);
          isProcessing.current = false;
          return;
        }

        try {
          // Gọi API backend qua RTK Query
          const result = await googleAuth({ idToken }).unwrap();

          if (result.success && result.data) {
            Alert.alert("Thành công", `Xin chào: ${result.data.user.givenName || result.data.user.username}`);
            onSuccess?.(result.data.user);
          }
        } catch (error: any) {
          const errorMsg = error.data?.message || error.message || "Lỗi khi xác thực với server";
          Alert.alert("Lỗi", errorMsg);
          onError?.(errorMsg);
        } finally {
          isProcessing.current = false;
        }
      } else if (response.type === "error" && !isProcessing.current) {
        isProcessing.current = true;
        processedResponseRef.current = responseKey;
        const errorMsg = response.error?.message || "Đăng nhập Google thất bại";
        Alert.alert("Lỗi đăng nhập", errorMsg);
        onError?.(errorMsg);
        isProcessing.current = false;
      }
    };

    handleGoogleAuth();
  }, [response]);

  return {
    promptAsync,
    isLoading: !request,
  };
};