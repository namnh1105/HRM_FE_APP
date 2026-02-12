import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreAccessToken, clearTokens } from '../services/tokenStorage';
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import { attendanceApi } from './api/attendanceApi';
import { leaveApi } from './api/leaveApi';
import { payrollApi } from './api/payrollApi';
import { employeeApi } from './api/employeeApi';
import { departmentApi } from './api/departmentApi';
import { workshiftApi } from './api/workshiftApi';
import { notificationApi } from './api/notificationApi';
import { contractApi } from './api/contractApi';
import { degreeApi } from './api/degreeApi';
import authReducer, { restoreAuth, logout } from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [leaveApi.reducerPath]: leaveApi.reducer,
    [payrollApi.reducerPath]: payrollApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [workshiftApi.reducerPath]: workshiftApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [contractApi.reducerPath]: contractApi.reducer,
    [degreeApi.reducerPath]: degreeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(attendanceApi.middleware)
      .concat(leaveApi.middleware)
      .concat(payrollApi.middleware)
      .concat(employeeApi.middleware)
      .concat(departmentApi.middleware)
      .concat(workshiftApi.middleware)
      .concat(notificationApi.middleware)
      .concat(contractApi.middleware)
      .concat(degreeApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Initialize auth state from SecureStore + AsyncStorage
export const initializeAuth = async () => {
  try {
    console.log('[Store] Initializing auth from SecureStore...');
    
    // Restore access token from SecureStore → memory
    const authToken = await restoreAccessToken();
    // User info is non-sensitive, kept in AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');
    
    console.log('[Store] Auth data check:', {
      hasToken: !!authToken,
      hasUserInfo: !!userInfo,
    });
    
    if (authToken && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        store.dispatch(restoreAuth({ accessToken: authToken, user }));
        console.log('[Store] Auth restored from SecureStore for user:', user.username);
      } catch (parseError) {
        console.error('[Store] Error parsing user info:', parseError);
        // Clear invalid data
        await clearTokens();
        await AsyncStorage.removeItem('userInfo');
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
  store.dispatch(attendanceApi.util.resetApiState());
  store.dispatch(leaveApi.util.resetApiState());
  store.dispatch(payrollApi.util.resetApiState());
  store.dispatch(employeeApi.util.resetApiState());
  store.dispatch(departmentApi.util.resetApiState());
  store.dispatch(workshiftApi.util.resetApiState());
  store.dispatch(notificationApi.util.resetApiState());
  store.dispatch(contractApi.util.resetApiState());
  store.dispatch(degreeApi.util.resetApiState());
  console.log('[Store] All RTK Query states have been reset');
};

// Perform complete logout without reload (let navigation handle it)
export const performCompleteLogout = async () => {
  try {
    console.log('[Store] Starting complete logout...');
    
    // 1. Clear tokens from SecureStore (Keychain/Keystore)
    console.log('[Store] Clearing SecureStore tokens...');
    await clearTokens();
    
    // 2. Clear non-sensitive data from AsyncStorage
    console.log('[Store] Clearing AsyncStorage...');
    await AsyncStorage.removeItem('userInfo');
    
    // Verify AsyncStorage is cleared
    const verifyUser = await AsyncStorage.getItem('userInfo');
    console.log('[Store] Storage cleared. Verification:', { 
      userCleared: verifyUser === null 
    });
    
    // 3. Dispatch Redux logout
    store.dispatch(logout());
    
    // 4. Reset all RTK Query cache
    resetAllApiStates();
    
    console.log('[Store] Logout completed successfully. App state is now cleared.');
  } catch (error) {
    console.error('[Store] Error during complete logout:', error);
    // Fallback: still reset states even if there's an error
    store.dispatch(logout());
    resetAllApiStates();
  }
};
