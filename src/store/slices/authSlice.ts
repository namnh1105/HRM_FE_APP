import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Updates } from 'expo-updates';

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
      
      // Lưu vào AsyncStorage
      AsyncStorage.setItem('authToken', action.payload.accessToken);
      AsyncStorage.setItem('userInfo', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Xóa khỏi AsyncStorage
      AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']).then(() => {
        // Reload app sau khi xóa xong
        Updates.reloadAsync();
      });
    },
    restoreAuth: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserInfo }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
  },
});

export const { setCredentials, logout, restoreAuth } = authSlice.actions;

export default authSlice.reducer;
