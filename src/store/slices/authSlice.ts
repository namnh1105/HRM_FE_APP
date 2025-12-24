import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export default authSlice.reducer;
