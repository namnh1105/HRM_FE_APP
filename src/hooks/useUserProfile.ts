import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { User } from '../types/api';
import { useGetUserVideosQuery, useGetUserProfileQuery, UserProfileResponse } from '../store/api/authApi';
import { logout } from '../store/slices/authSlice';

export const useUserProfile = () => {
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Gọi API để lấy profile đầy đủ
  const {
    data: userProfileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetUserProfileQuery(undefined, {
    skip: isAuthenticated !== true,
  }) as { data: UserProfileResponse | undefined; isLoading: boolean; refetch: () => void };

  const {
    data: userVideosData,
    isLoading: videosLoading,
    refetch: refetchVideos,
  } = useGetUserVideosQuery(
    { page: 1, size: 20 },
    { skip: isAuthenticated !== true }
  ) as any;

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

  // Cập nhật userInfo khi có dữ liệu mới từ API
  useEffect(() => {
    if (userProfileData?.success && userProfileData.data) {
      setUserInfo(userProfileData.data);
    }
  }, [userProfileData]);

  const handleLogout = async () => {
    try {
      dispatch(logout());
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const refreshUserInfo = useCallback(async () => {
    await loadUserInfo();
    // Only refetch if query is active (user is authenticated)
    if (isAuthenticated === true) {
      refetchProfile();
    }
  }, [isAuthenticated, refetchProfile]);

  return {
    userInfo,
    isAuthenticated,
    loading: loading || profileLoading,
    userVideos: userVideosData?.success ? userVideosData.data.videos : [],
    videosLoading,
    refetchVideos,
    handleLogout,
    refreshUserInfo,
  };
};
