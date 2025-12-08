import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { Video } from '../types/api';
import { useGetVideosQuery } from '../store/api/videoApi';

export const useVideoData = () => {
  const [page, setPage] = useState(1);
  const [allVideos, setAllVideos] = useState<Video[]>([]);

  const { 
    data, 
    isLoading, 
    isFetching,
    error,
    refetch,
  } = useGetVideosQuery({ page, size: 10 });

  // Update videos when data changes
  useEffect(() => {
    if (data?.success && data.data) {
      if (page === 1) {
        setAllVideos(data.data.videos);
      } else {
        setAllVideos(prev => [...prev, ...data.data.videos]);
      }
    }
  }, [data, page]);

  const videos = data?.success ? (page === 1 ? data.data.videos : allVideos) : allVideos;
  const loading = isLoading && page === 1;
  const loadingMore = isFetching && page > 1;
  const hasMore = data?.data ? page < data.data.totalPages : true;

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, hasMore]);

  const fetchVideos = useCallback(() => {
    setPage(1);
    setAllVideos([]);
    refetch();
  }, [refetch]);

  if (error) {
    Alert.alert(
      'Lỗi',
      'Không thể tải video. Vui lòng thử lại.',
      [{ text: 'OK', onPress: fetchVideos }]
    );
  }

  return {
    videos,
    loading,
    loadingMore,
    hasMore,
    fetchVideos,
    handleLoadMore,
  };
};
