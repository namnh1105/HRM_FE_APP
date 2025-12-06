import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Video } from '../types/api';
import { videoService } from '../services/api';

export const useVideoData = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchVideos = useCallback(async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await videoService.getVideos(pageNum, 10);

      if (response.success && response.data) {
        if (pageNum === 1) {
          setVideos(response.data.videos);
        } else {
          setVideos(prev => [...prev, ...response.data.videos]);
        }

        setHasMore(pageNum < response.data.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải video. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchVideos(page + 1);
    }
  }, [loadingMore, hasMore, page, fetchVideos]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    loading,
    loadingMore,
    hasMore,
    fetchVideos,
    handleLoadMore,
  };
};
