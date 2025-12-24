import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { User } from '../types/api';
import { useGetUserVideosQuery, useGetUserProfileQuery, UserProfileResponse } from '../store/api/authApi';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store';

export const useUserProfile = () => {
  const dispatch = useDispatch();
  const reduxAuth = useSelector((state: RootState) => state.auth);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Sync with Redux auth state
  useEffect(() => {
    console.log('[useUserProfile] Redux auth changed:', {
      isAuthenticated: reduxAuth.isAuthenticated,
      hasUser: !!reduxAuth.user,
      username: reduxAuth.user?.username,
    });
    
    setIsAuthenticated(reduxAuth.isAuthenticated);
    
    if (reduxAuth.isAuthenticated && reduxAuth.user) {
      // Convert Redux user to User format
      const user: User = {
        id: reduxAuth.user.id,
        username: reduxAuth.user.username,
        givenName: reduxAuth.user.givenName,
        familyName: reduxAuth.user.familyName,
        avatarUrl: '', // Will be updated from API
        bio: '',
        followersCount: 0,
        followingCount: 0,
        likesCount: 0,
        videoCount: 0,
      };
      setUserInfo(user);
    } else {
      setUserInfo(null);
    }
  }, [reduxAuth.isAuthenticated, reduxAuth.user]);

  // Gọi API để lấy profile đầy đủ
  const {
    data: userProfileData,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  }) as { data: UserProfileResponse | undefined; isLoading: boolean; refetch: () => void };

  const {
    data: userVideosData,
    isLoading: videosLoading,
    refetch: refetchVideos,
  } = useGetUserVideosQuery(
    { page: 1, size: 20 },
    { skip: !isAuthenticated }
  ) as any;

  // Cập nhật userInfo khi có dữ liệu mới từ API (để có đầy đủ thông tin như avatar, stats)
  useEffect(() => {
    if (userProfileData?.success && userProfileData.data) {
      console.log('[useUserProfile] Updating with API data:', userProfileData.data);
      setUserInfo(userProfileData.data);
    }
  }, [userProfileData]);

  // Load user info from AsyncStorage on initial mount (fallback)
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        console.log('[useUserProfile] Loading initial user info...');
        const token = await AsyncStorage.getItem('authToken');
        const userInfoString = await AsyncStorage.getItem('userInfo');

        console.log('[useUserProfile] AsyncStorage check:', {
          hasToken: !!token,
          hasUserInfo: !!userInfoString,
        });

        if (token && userInfoString) {
          const userData = JSON.parse(userInfoString);
          console.log('[useUserProfile] Loaded user from AsyncStorage:', userData.username);
          // Only set if Redux hasn't set it yet
          if (!userInfo) {
            setUserInfo(userData);
          }
        }
      } catch (error) {
        console.error('[useUserProfile] Error loading user info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(logout());
      setUserInfo(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshUserInfo = useCallback(async () => {
    console.log('[useUserProfile] Refreshing user info...');
    // Only refetch if query is active (user is authenticated)
    if (isAuthenticated) {
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
