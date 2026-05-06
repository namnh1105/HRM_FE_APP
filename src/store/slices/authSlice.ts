import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserInfo } from '../../types/auth';

export interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  roles: string[];
  permissions: string[];
  storeId: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  roles: [],
  permissions: [],
  storeId: null,
};

/**
 * Map raw backend user → UserInfo.
 */
export const mapToUserInfo = (raw: any): UserInfo => ({
  id: raw.id,
  email: raw.email,
  avatarUrl: raw.avatarUrl || undefined,
  roles: raw.roles || [],
  permissions: raw.permissions || [],
  employee: raw.employee || null,
  isActive: raw.isActive,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
  createdBy: raw.createdBy,
  updatedBy: raw.updatedBy,
  isDeleted: raw.isDeleted,
  deletedAt: raw.deletedAt,
  deletedBy: raw.deletedBy,
  storeId: raw.storeId || raw.employee?.storeId,
});

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
      state.roles = action.payload.user.roles || [];
      state.permissions = action.payload.user.permissions || [];
      state.storeId = action.payload.user.storeId || action.payload.user.employee?.storeId || null;
      
      console.log('[authSlice] setCredentials - isAuthenticated:', true);
      console.log('[authSlice] User:', action.payload.user.email);
      console.log('[authSlice] Roles:', state.roles);
      console.log('[authSlice] Permissions:', state.permissions);
    },
    setAccessTokenInStore: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.roles = [];
      state.permissions = [];
      state.storeId = null;
    },
    restoreAuth: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserInfo }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.roles = action.payload.user.roles || [];
      state.permissions = action.payload.user.permissions || [];
      state.storeId = action.payload.user.storeId || action.payload.user.employee?.storeId || null;
      
      console.log('[authSlice] restoreAuth - isAuthenticated:', true);
      console.log('[authSlice] Restored user:', action.payload.user.email);
      console.log('[authSlice] Restored roles:', state.roles);
      console.log('[authSlice] Restored permissions:', state.permissions);
    },
  },
});

export const { setCredentials, setAccessTokenInStore, logout, restoreAuth } = authSlice.actions;

export default authSlice.reducer;

import type { RootState } from '../index';

export const selectRoles = (state: RootState) => state.auth.roles;
export const selectPermissions = (state: RootState) => state.auth.permissions;
export const selectHasRole = (role: string) => (state: RootState) =>
  state.auth.roles.includes(role);
export const selectHasPermission = (permission: string) => (state: RootState) =>
  state.auth.permissions.includes(permission);
export const selectHasAnyRole = (roles: string[]) => (state: RootState) =>
  roles.some((role) => state.auth.roles.includes(role));
export const selectHasAllPermissions = (permissions: string[]) => (state: RootState) =>
  permissions.every((perm) => state.auth.permissions.includes(perm));
