// Auth types (matching backend DTOs)

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      givenName: string;
      familyName: string;
      avatarUrl?: string;
      followersCount: number;
      followingCount: number;
      isFollowing: boolean;
    };
  };
}

export interface RegisterRequest {
  username: string;
  givenName: string;
  familyName: string;
  password: string;
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

export interface GoogleAuthRequest {
  idToken: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      email: string;
      givenName: string;
      familyName: string;
      avatarUrl?: string;
      picture?: string;
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
