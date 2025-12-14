import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_CONFIG } from '../config/googleAuth';

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
  // Sử dụng bundle identifier từ app.json làm redirect URI
  const redirectUri = Platform.select({
    ios: 'com.scrolla.fe:/',
    android: 'com.scrolla.fe:/',
    default: 'https://auth.expo.io/@ninhhainam12/scrolla-fe',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    // Không cần webClientId khi dùng iOS/Android Client ID
    redirectUri: redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken;

      if (!accessToken) {
        const errorMsg = "Không lấy được Google Access Token";
        Alert.alert("Lỗi", errorMsg);
        onError?.(errorMsg);
        return;
      }
  
      fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`)
        .then(response => response.json())
        .then(async (userInfo: GoogleUser) => {
          await AsyncStorage.setItem('google_user', JSON.stringify(userInfo));
          await AsyncStorage.setItem('access_token', accessToken);

          Alert.alert("Thành công", `Xin chào: ${userInfo.name}`);
          onSuccess?.(userInfo);
        })
        .catch((err) => {
          const errorMsg = "Lỗi khi lấy thông tin người dùng";
          Alert.alert("Google API Error", errorMsg);
          onError?.(errorMsg);
        });
    } else if (response?.type === "error") {
      const errorMsg = response.error?.message || "Đăng nhập Google thất bại";
      Alert.alert("Lỗi đăng nhập", errorMsg);
      onError?.(errorMsg);
    }
  }, [response]);

  return {
    promptAsync,
    isLoading: !request,
  };
};
