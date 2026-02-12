// Auth types (matching backend DTOs)

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: {
      id: string;
      email: string;
      name: string | null;
      roles: string[];
      permissions: string[];
      given_name: string;
      family_name: string;
      avatar_url: string | null;
      is_active: boolean;
      created_at: string | null;
      updated_at: string;
      created_by: string;
      updated_by: string | null;
      is_deleted: boolean;
      deleted_at: string | null;
      deleted_by: string | null;
    };
  };
  timestamp: string;
}

export interface RegisterRequest {
  email: string;
  givenName: string;
  familyName: string;
  password: string;
  avatarUrl?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      username: string;
      given_name: string;
      family_name: string;
    };
  };
}



export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    given_name: string;
    family_name: string;
    avatar_url: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
  };
}
