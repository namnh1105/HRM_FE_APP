// Auth types (matching backend DTOs)

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      name: string | null;
      roles: string[];
      permissions: string[];
      givenName: string;
      familyName: string;
      avatarUrl: string | null;
      isActive: boolean;
      createdAt: string | null;
      updatedAt: string;
      createdBy: string;
      updatedBy: string | null;
      isDeleted: boolean;
      deletedAt: string | null;
      deletedBy: string | null;
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
      givenName: string;
      familyName: string;
    };
  };
}



export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    username: string;
    givenName: string;
    familyName: string;
    avatarUrl: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
  };
}
