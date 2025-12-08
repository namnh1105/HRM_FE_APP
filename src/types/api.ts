// API Types
export interface User {
  id: string;
  username: string;
  givenName: string;
  familyName: string;
  avatarUrl: string | null;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
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

// Chat Types
export interface ChatRoom {
  id: string;
  name: string | null;
  type: 'private' | 'group';
  participants: User[];
  lastMessage: ChatMessage | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: User;
  room: ChatRoom;
  content: string;
  type: 'text' | 'image' | 'video' | 'file';
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageDto {
  roomId: string;
  content: string;
  type?: 'text' | 'image' | 'video' | 'file';
}

export interface CreateRoomDto {
  userIds: string[];
  name?: string;
}

export interface GetMessagesDto {
  limit?: string;
  offset?: string;
}

export interface UserVideosResponse {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  videos: Video[];
}

export interface FollowingListData {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  following: User[];
}

export interface FollowersListData {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  followers: User[];
}
