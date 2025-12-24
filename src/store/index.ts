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
    console.log('[Store] Initializing auth from AsyncStorage...');
    const authToken = await AsyncStorage.getItem('authToken');
    const userInfo = await AsyncStorage.getItem('userInfo');
    
    console.log('[Store] Auth data check:', {
      hasToken: !!authToken,
      hasUserInfo: !!userInfo,
    });
    
    if (authToken && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        store.dispatch(restoreAuth({ accessToken: authToken, user }));
        console.log('[Store] Auth restored from AsyncStorage for user:', user.username);
      } catch (parseError) {
        console.error('[Store] Error parsing user info:', parseError);
        // Clear invalid data
        await AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']);
      }
    } else {
      console.log('[Store] No auth data found - user is not authenticated');
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

// Perform complete logout without reload (let navigation handle it)
export const performCompleteLogout = async (disconnectSocket?: () => void) => {
  try {
    console.log('[Store] Starting complete logout...');
    
    // 1. Disconnect socket if available
    if (disconnectSocket) {
      console.log('[Store] Disconnecting socket...');
      disconnectSocket();
    }
    
    // 2. Clear AsyncStorage first and wait for completion
    console.log('[Store] Clearing AsyncStorage...');
    await AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']);
    
    // Verify AsyncStorage is cleared
    const verifyToken = await AsyncStorage.getItem('authToken');
    const verifyUser = await AsyncStorage.getItem('userInfo');
    console.log('[Store] AsyncStorage cleared. Verification:', { 
      tokenCleared: verifyToken === null, 
      userCleared: verifyUser === null 
    });
    
    // 3. Reset all RTK Query cache
    resetAllApiStates();
    
    console.log('[Store] Logout completed successfully. App state is now cleared.');
    
    // Note: We don't reload the app anymore, navigation will handle showing Login screen
  } catch (error) {
    console.error('[Store] Error during complete logout:', error);
    // Fallback: still reset states even if there's an error
    resetAllApiStates();
  }
};
