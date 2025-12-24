import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Video } from '../types/api';
import { useGetVideosQuery, useGetFollowingVideosQuery } from '../store/api/videoApi';

export type FeedType = 'forYou' | 'following';

// Cache data for each feed type
const feedCache: Record<FeedType, { videos: Video[]; page: number; timestamp: number }> = {
  forYou: { videos: [], page: 1, timestamp: 0 },
  following: { videos: [], page: 1, timestamp: 0 },
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useVideoData = (feedType: FeedType = 'forYou') => {
  const [page, setPage] = useState(feedCache[feedType].page);
  const [allVideos, setAllVideos] = useState<Video[]>(feedCache[feedType].videos);
  const previousFeedType = useRef<FeedType>(feedType);

  // Choose which query to use based on feedType
  const forYouQuery = useGetVideosQuery({ page, size: 10 }, { skip: feedType !== 'forYou' });
  const followingQuery = useGetFollowingVideosQuery({ page, size: 10 }, { skip: feedType !== 'following' });
  
  const { data, isLoading, isFetching, error, refetch } = 
    feedType === 'following' ? followingQuery : forYouQuery;

  // Handle feed type change
  useEffect(() => {
    if (feedType !== previousFeedType.current) {
      const cache = feedCache[feedType];
      const now = Date.now();
      
      // Check if cache is still valid
      if (cache.videos.length > 0 && (now - cache.timestamp) < CACHE_DURATION) {
        // Use cached data
        setAllVideos(cache.videos);
        setPage(cache.page);
      } else {
        // Reset and fetch new data
        setPage(1);
        setAllVideos([]);
      }
      
      previousFeedType.current = feedType;
    }
  }, [feedType]);

  // Update videos when data changes
  useEffect(() => {
    if (data?.success && data.data) {
      if (page === 1) {
        const newVideos = data.data.videos;
        setAllVideos(newVideos);
        
        // Update cache
        feedCache[feedType] = {
          videos: newVideos,
          page: 1,
          timestamp: Date.now(),
        };
      } else {
        setAllVideos(prev => {
          // Prevent duplicates by checking IDs
          const existingIds = new Set(prev.map(v => v.id));
          const newVideos = data.data.videos.filter(v => !existingIds.has(v.id));
          const updatedVideos = [...prev, ...newVideos];
          
          // Update cache
          feedCache[feedType] = {
            videos: updatedVideos,
            page: page,
            timestamp: Date.now(),
          };
          
          return updatedVideos;
        });
      }
    }
  }, [data, page, feedType]);

  const videos = allVideos;
  const loading = isLoading && page === 1 && allVideos.length === 0;
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
    // Clear cache for current feed type
    feedCache[feedType] = { videos: [], page: 1, timestamp: 0 };
    refetch();
  }, [refetch, feedType]);

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
