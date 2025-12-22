import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Updates } from 'expo-updates';
import type { AppDispatch } from '../index';

export interface UserInfo {
  id: string;
  username: string;
  givenName: string;
  familyName: string;
}

export interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState, 
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserInfo }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      
      console.log('[authSlice] setCredentials - isAuthenticated:', true);
      console.log('[authSlice] User:', action.payload.user.username);
      
      // Lưu vào AsyncStorage
      AsyncStorage.setItem('authToken', action.payload.accessToken);
      AsyncStorage.setItem('userInfo', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Xóa khỏi AsyncStorage - don't reload to prevent navigation loop
      AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']).catch(error => {
        console.error('Error clearing storage:', error);
      });
    },
    restoreAuth: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserInfo }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      
      console.log('[authSlice] restoreAuth - isAuthenticated:', true);
      console.log('[authSlice] Restored user:', action.payload.user.username);
    },
  },
});

export const { setCredentials, logout, restoreAuth } = authSlice.actions;

// Thunk action để logout và reset tất cả RTK Query state
export const performLogout = () => async (dispatch: AppDispatch) => {
  try {
    console.log('[authSlice] Performing logout...');
    
    // Clear AsyncStorage
    await AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']);
    
    // Import và reset tất cả RTK Query APIs
    // Sử dụng dynamic import để tránh circular dependency
    const { authApi } = await import('../api/authApi');
    const { videoApi } = await import('../api/videoApi');
    const { chatApi } = await import('../api/chatApi');
    const { followApi } = await import('../api/followApi');
    const { saveApi } = await import('../api/saveApi');
    const { shareApi } = await import('../api/shareApi');
    const { userApi } = await import('../api/userApi');
    const { viewApi } = await import('../api/viewApi');
    const { notificationApi } = await import('../api/notificationApi');
    const { likeApi } = await import('../api/likeApi');
    const { commentApi } = await import('../api/commentApi');
    
    // Reset state của từng API
    dispatch(authApi.util.resetApiState());
    dispatch(videoApi.util.resetApiState());
    dispatch(chatApi.util.resetApiState());
    dispatch(followApi.util.resetApiState());
    dispatch(saveApi.util.resetApiState());
    dispatch(shareApi.util.resetApiState());
    dispatch(userApi.util.resetApiState());
    dispatch(viewApi.util.resetApiState());
    dispatch(notificationApi.util.resetApiState());
    dispatch(likeApi.util.resetApiState());
    dispatch(commentApi.util.resetApiState());
    
    // Dispatch logout action
    dispatch(logout());
    
    console.log('[authSlice] Logout completed successfully');
  } catch (error) {
    console.error('[authSlice] Error during logout:', error);
    // Vẫn dispatch logout dù có lỗi
    dispatch(logout());
  }
};

export default authSlice.reducer;
