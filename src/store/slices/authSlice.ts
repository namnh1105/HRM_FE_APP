import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppDispatch } from '../index';

export interface UserInfo {
  id: string;
  username: string;
  name?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  avatarUrl?: string;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  roles: string[];
  permissions: string[];
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  roles: [],
  permissions: [],
};

/**
 * Map raw backend user → UserInfo.
 * Backend now returns camelCase fields directly.
 */
export const mapToUserInfo = (raw: any): UserInfo => ({
  id: raw.id,
  username: raw.username || raw.email,
  name: raw.name,
  email: raw.email,
  givenName: raw.givenName,
  familyName: raw.familyName,
  avatarUrl: raw.avatarUrl || undefined,
  roles: raw.roles || [],
  permissions: raw.permissions || [],
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
      
      console.log('[authSlice] setCredentials - isAuthenticated:', true);
      console.log('[authSlice] User:', action.payload.user.username);
      console.log('[authSlice] Roles:', state.roles);
      console.log('[authSlice] Permissions:', state.permissions);
      // Token persistence is now handled by tokenStorage service (SecureStore)
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
      // Token cleanup is handled by tokenStorage.clearTokens() (SecureStore)
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
      
      console.log('[authSlice] restoreAuth - isAuthenticated:', true);
      console.log('[authSlice] Restored user:', action.payload.user.username);
      console.log('[authSlice] Restored roles:', state.roles);
      console.log('[authSlice] Restored permissions:', state.permissions);
    },
  },
});

export const { setCredentials, setAccessTokenInStore, logout, restoreAuth } = authSlice.actions;

export default authSlice.reducer;

// ─── RBAC Selectors (for future use) ───────────────────────────────────
import type { RootState } from '../index';

/** Select the current user's roles */
export const selectRoles = (state: RootState) => state.auth.roles;

/** Select the current user's permissions */
export const selectPermissions = (state: RootState) => state.auth.permissions;

/** Check if the user has a specific role */
export const selectHasRole = (role: string) => (state: RootState) =>
  state.auth.roles.includes(role);

/** Check if the user has a specific permission */
export const selectHasPermission = (permission: string) => (state: RootState) =>
  state.auth.permissions.includes(permission);

/** Check if the user has any of the given roles */
export const selectHasAnyRole = (roles: string[]) => (state: RootState) =>
  roles.some((role) => state.auth.roles.includes(role));

/** Check if the user has all of the given permissions */
export const selectHasAllPermissions = (permissions: string[]) => (state: RootState) =>
  permissions.every((perm) => state.auth.permissions.includes(perm));
