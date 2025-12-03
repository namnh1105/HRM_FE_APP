// API Types
export interface User {
  id: string;
  username: string;
  givenName: string;
  familyName: string;
  avatarUrl: string | null;
}

export interface VideoStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface Video {
  id: string;
  user: User;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  hashtags: string[];
  duration: number;
  stats: VideoStats;
  createdAt: string;
}

export interface VideoListData {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  videos: Video[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}