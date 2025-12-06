import { ApiResponse, VideoListData, ChatRoom, ChatMessage, SendMessageDto, CreateRoomDto, GetMessagesDto } from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://scrolla.bitoj.io.vn/api/v1';

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token || '';
  } catch (error) {
    console.error('Error getting auth token:', error);
    return '';
  }
};

export const videoService = {
  async getVideos(page: number = 1, size: number = 10): Promise<ApiResponse<VideoListData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/videos?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<VideoListData> = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },
};

export const chatService = {
  async getUserRooms(): Promise<ApiResponse<ChatRoom[]>> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ChatRoom[]> = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user rooms:', error);
      throw error;
    }
  },

  async createRoom(createRoomDto: CreateRoomDto): Promise<ApiResponse<ChatRoom>> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(createRoomDto),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ChatRoom> = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async getRoomById(roomId: string): Promise<ApiResponse<ChatRoom>> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ChatRoom> = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  async getMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ChatMessage[]> = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async sendMessage(sendMessageDto: SendMessageDto): Promise<ApiResponse<ChatMessage>> {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sendMessageDto),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ChatMessage> = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};
