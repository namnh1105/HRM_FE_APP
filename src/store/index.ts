import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from './api/authApi';
import { videoApi } from './api/videoApi';
import { chatApi } from './api/chatApi';
import { followApi } from './api/followApi';
import { saveApi } from './api/saveApi';
import { shareApi } from './api/shareApi';
import { userApi } from './api/userApi';
import { viewApi } from './api/viewApi';
import { notificationApi } from './api/notificationApi';
import { likeApi } from './api/likeApi';
import { commentApi } from './api/commentApi';
import authReducer, { restoreAuth } from './slices/authSlice';
import * as Updates from 'expo-updates';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [videoApi.reducerPath]: videoApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [followApi.reducerPath]: followApi.reducer,
    [saveApi.reducerPath]: saveApi.reducer,
    [shareApi.reducerPath]: shareApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [viewApi.reducerPath]: viewApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [likeApi.reducerPath]: likeApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(videoApi.middleware)
      .concat(chatApi.middleware)
      .concat(followApi.middleware)
      .concat(saveApi.middleware)
      .concat(shareApi.middleware)
      .concat(userApi.middleware)
      .concat(viewApi.middleware)
      .concat(notificationApi.middleware)
      .concat(likeApi.middleware)
      .concat(commentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Initialize auth state from AsyncStorage
export const initializeAuth = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    const userInfo = await AsyncStorage.getItem('userInfo');
    
    if (authToken && userInfo) {
      const user = JSON.parse(userInfo);
      store.dispatch(restoreAuth({ accessToken: authToken, user }));
      console.log('[Store] Auth restored from AsyncStorage');
    }
  } catch (error) {
    console.error('[Store] Error restoring auth:', error);
  }
};

// Reset all RTK Query cache
export const resetAllApiStates = () => {
  store.dispatch(authApi.util.resetApiState());
  store.dispatch(videoApi.util.resetApiState());
  store.dispatch(chatApi.util.resetApiState());
  store.dispatch(followApi.util.resetApiState());
  store.dispatch(saveApi.util.resetApiState());
  store.dispatch(shareApi.util.resetApiState());
  store.dispatch(userApi.util.resetApiState());
  store.dispatch(viewApi.util.resetApiState());
  store.dispatch(notificationApi.util.resetApiState());
  store.dispatch(likeApi.util.resetApiState());
  store.dispatch(commentApi.util.resetApiState());
  console.log('[Store] All RTK Query states have been reset');
};

// Perform complete logout with app reload
export const performCompleteLogout = async (disconnectSocket?: () => void) => {
  try {
    console.log('[Store] Starting complete logout...');
    
    // 1. Disconnect socket if available
    if (disconnectSocket) {
      console.log('[Store] Disconnecting socket...');
      disconnectSocket();
    }
    
    // 2. Clear AsyncStorage
    await AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']);
    console.log('[Store] AsyncStorage cleared');
    
    // 3. Reset all RTK Query cache
    resetAllApiStates();
    
    // 4. Reload app
    console.log('[Store] Reloading app...');
    if (Updates.reloadAsync) {
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error('[Store] Error during complete logout:', error);
    // Fallback: still reset states even if reload fails
    resetAllApiStates();
  }
};
