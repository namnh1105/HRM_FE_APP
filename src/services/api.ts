import { ApiResponse, VideoListData } from '../types/api';

const API_BASE_URL = 'https://scrolla.bitoj.io.vn/api/v1';

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