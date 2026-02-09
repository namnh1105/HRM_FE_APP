import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import authReducer, { restoreAuth } from './slices/authSlice';
import attendanceReducer from './slices/attendanceSlice';
import leaveReducer from './slices/leaveSlice';
import notificationReducer from './slices/notificationSlice';
import salaryReducer from './slices/salarySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
    notification: notificationReducer,
    salary: salaryReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(userApi.middleware),
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
  store.dispatch(userApi.util.resetApiState());
  console.log('[Store] All RTK Query states have been reset');
};

// Perform complete logout without reload (let navigation handle it)
export const performCompleteLogout = async () => {
  try {
    console.log('[Store] Starting complete logout...');
    
    // 1. Clear AsyncStorage first and wait for completion
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
