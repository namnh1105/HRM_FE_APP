import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../types/api';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onLoadMore?: () => void;
  customHeight?: number;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, onLoadMore, customHeight }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.stats.likes);
  const videoRef = useRef<ExpoVideo>(null);

  const videoHeight = customHeight || screenHeight;

  useEffect(() => {
    if (onLoadMore) {
      onLoadMore();
    }
  }, []);

  useEffect(() => {
    if (isActive && videoRef.current) {
      playVideo();
    } else if (!isActive && videoRef.current) {
      pauseVideo();
    }
  }, [isActive]);

  const playVideo = async () => {
    try {
      if (videoRef.current) {
        setIsLoading(true);
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded) {
          await videoRef.current.playAsync();
          setIsPlaying(true);
          setShowThumbnail(false);
        }
      }
    } catch (error) {
      console.error('Error playing video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseVideo = async () => {
    try {
      if (videoRef.current) {
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded) {
          await videoRef.current.pauseAsync();
          setIsPlaying(false);
        }
      }
    } catch (error) {
      // Silently handle pause errors when component is unmounting
    }
  };

  const togglePlayback = async () => {
    if (!videoRef.current) return;

    try {
      setIsLoading(true);
      
      if (isPlaying) {
        await pauseVideo();
      } else {
        await playVideo();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { height: videoHeight }]}>
      {/* Video Player */}
      <TouchableOpacity 
        style={[styles.videoContainer, { height: videoHeight }]} 
        activeOpacity={1}
        onPress={togglePlayback}
      >
        <ExpoVideo
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={[styles.video, { height: videoHeight }]}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive}
          isLooping
          isMuted={false}
          onLoad={() => setShowThumbnail(false)}
          onError={(error) => {
            console.error('Video error:', error);
            setShowThumbnail(true);
          }}
        />
        
        {/* Thumbnail overlay */}
        {showThumbnail && (
          <Image 
            source={{ uri: video.thumbnailUrl }} 
            style={[styles.thumbnail, { height: videoHeight }]}
            resizeMode="cover"
          />
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        
        {/* Play/Pause button */}
        {!isPlaying && !isLoading && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={60} color="rgba(255,255,255,0.9)" />
          </View>
        )}
      </TouchableOpacity>

      {/* User info and caption - Bottom left */}
      <View style={styles.bottomLeftContent}>
        <View style={styles.contentContainer}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              {video.user.avatarUrl ? (
                <Image source={{ uri: video.user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.username}>@{video.user.username}</Text>
          </View>
          
          {video.caption && video.caption.trim() !== '' && (
            <Text style={styles.caption} numberOfLines={3}>
              {video.caption}
            </Text>
          )}
          
          {video.hashtags && video.hashtags.length > 0 && (
            <Text style={styles.hashtags}>
              {video.hashtags.map(tag => `#${tag}`).join(' ')}
            </Text>
          )}
          
          {video.duration && !isNaN(video.duration) && (
            <Text style={styles.duration}>
              {formatDuration(video.duration)}
            </Text>
          )}
        </View>
      </View>

      {/* Right side - Action buttons */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={36} 
            color={isLiked ? "#ff3040" : "#fff"} 
          />
          <Text style={styles.actionText}>{formatNumber(likeCount)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={34} color="#fff" />
          <Text style={styles.actionText}>{formatNumber(video.stats.comments)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={34} color="#fff" />
          <Text style={styles.actionText}>{formatNumber(video.stats.shares)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={34} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
  video: {
    width: screenWidth,
    height: screenHeight,
  },
  thumbnail: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLeftContent: {
    position: 'absolute',
    bottom: 30, // Đưa xuống sát đáy hơn
    left: 0,
    right: 80, // Space for right actions
    maxHeight: 250,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8, // Giảm padding vertical
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  defaultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hashtags: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  duration: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 50, // Điều chỉnh để phù hợp với bottomLeftContent
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 28,
    padding: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VideoCard;