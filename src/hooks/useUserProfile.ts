import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/api';
import { useGetUserVideosQuery } from '../store/api/authApi';

export const useUserProfile = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    data: userVideosData,
    isLoading: videosLoading,
    refetch: refetchVideos,
  } = useGetUserVideosQuery(
    { page: 1, size: 20 },
    { skip: !isAuthenticated }
  );

  const loadUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');

      if (token && userInfoString) {
        const userData = JSON.parse(userInfoString);
        setUserInfo(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']);
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  return {
    userInfo,
    isAuthenticated,
    loading,
    userVideos: userVideosData?.success ? userVideosData.data.videos : [],
    videosLoading,
    refetchVideos,
    handleLogout,
    refreshUserInfo: loadUserInfo,
  };
};
