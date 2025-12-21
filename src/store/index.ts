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
