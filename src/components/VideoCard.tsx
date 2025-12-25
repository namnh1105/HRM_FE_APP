import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { Video as VideoType } from '../types/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useFollowUserMutation } from '../store/api/followApi';
import { useToggleSaveMutation, useCheckSaveQuery } from '../store/api/saveApi';
import { useShareVideoMutation } from '../store/api/shareApi';
import { useRecordViewMutation } from '../store/api/viewApi';
import { useToggleLikeMutation, useCheckIfUserLikedVideoQuery } from '../store/api/likeApi';
import { useNavigation } from '@react-navigation/native';
import CommentsModal from './CommentsModal';
import { useRequireAuth } from '../hooks';

interface VideoCardProps {
  video: VideoType;
  isActive: boolean;
  onLoadMore?: () => void;
  customHeight?: number;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, onLoadMore, customHeight }) => {
  const navigation = useNavigation();
  const { requireAuth } = useRequireAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.stats?.likes || 0);
  const [showControls, setShowControls] = useState(false);
  const [isFollowing, setIsFollowing] = useState(video.user?.isFollowing || false);
  const [showFollowButton, setShowFollowButton] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(video.stats?.saves || 0);
  const [shareCount, setShareCount] = useState(video.stats?.shares || 0);
  const [commentCount, setCommentCount] = useState(video.stats?.comments || 0);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);

  console.log(video.user);
  
  // Create video player với expo-video
  const player = useVideoPlayer(video.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  });
  
  const isMounted = useRef(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const followButtonScale = useRef(new Animated.Value(1)).current;
  const followButtonOpacity = useRef(new Animated.Value(1)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  
  const [followUser] = useFollowUserMutation();
  const [toggleSave] = useToggleSaveMutation();
  const [shareVideo] = useShareVideoMutation();
  const [recordView] = useRecordViewMutation();
  const [toggleLike] = useToggleLikeMutation();
  const { data: saveCheckData } = useCheckSaveQuery(video.id);
  const { data: likeCheckData } = useCheckIfUserLikedVideoQuery(video.id);

  // Update save status from API
  useEffect(() => {
    if (saveCheckData?.success && saveCheckData.data) {
      setIsSaved(saveCheckData.data.isSaved);
    }
  }, [saveCheckData]);

  // Update like status from API
  useEffect(() => {
    if (likeCheckData?.success && likeCheckData.data) {
      setIsLiked(likeCheckData.data.isLiked);
    }
  }, [likeCheckData]);

  // Update follow button visibility based on API response
  useEffect(() => {
    // Show button only if user is not following and it's not their own video
    const shouldShow = !video.user.isFollowing;
    setShowFollowButton(shouldShow);
    setIsFollowing(video.user.isFollowing || false);
  }, [video.user.isFollowing]);

  const videoHeight = customHeight || screenHeight;

  useEffect(() => {
    isMounted.current = true;
    if (onLoadMore) {
      onLoadMore();
    }
    return () => {
      isMounted.current = false;
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && player && isMounted.current) {
      player.play();
      setIsPlaying(true);
      setShowThumbnail(false);
      // Track view when video becomes active
      recordView(video.id).catch(err => {
        console.log('Failed to record view:', err);
      });
    } else if (!isActive && player && isMounted.current) {
      player.pause();
      setIsPlaying(false);
    }
  }, [isActive, player]);

  const playVideo = async () => {
    if (!isMounted.current || !player) return;
    
    try {
      setIsLoading(true);
      player.play();
      if (isMounted.current) {
        setIsPlaying(true);
        setShowThumbnail(false);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error playing video:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const pauseVideo = async () => {
    if (!isMounted.current || !player) return;
    
    try {
      player.pause();
      if (isMounted.current) {
        setIsPlaying(false);
        setShowControls(true);
      }
    } catch (error) {
      // Silently handle pause errors when component is unmounting
    }
  };

  const togglePlayback = async () => {
    if (!player) return;

    try {
      setIsLoading(true);
      
      if (isPlaying) {
        await pauseVideo();
      } else {
        await playVideo();
        setShowControls(false);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    requireAuth(async () => {
      try {
        const response = await toggleLike(video.id).unwrap();
        if (response.success && response.data) {
          setIsLiked(response.data.isLiked);
          setLikeCount(response.data.likesCount);
        }
      } catch (error) {
        console.error('Like error:', error);
      }
    }, 'thích video');
  };

  const handleFollow = async () => {
    if (isFollowing) return;

    requireAuth(async () => {
      try {
        // Call API first
        await followUser(video.user.id).unwrap();
        
        // Update state immediately to prevent re-showing
        setIsFollowing(true);
        
        // Animation: + button scales down and fades
        Animated.parallel([
          Animated.timing(followButtonScale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(followButtonOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Show checkmark
          Animated.parallel([
            Animated.spring(checkmarkScale, {
              toValue: 1,
              friction: 4,
              useNativeDriver: true,
            }),
            Animated.timing(checkmarkOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Wait a bit then fade out checkmark
            setTimeout(() => {
              Animated.parallel([
                Animated.timing(checkmarkScale, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(checkmarkOpacity, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                setShowFollowButton(false);
              });
            }, 500);
          });
        });
      } catch (error) {
        console.error('Follow error:', error);
        // Reset animation on error
        followButtonScale.setValue(1);
        followButtonOpacity.setValue(1);
        checkmarkScale.setValue(0);
        checkmarkOpacity.setValue(0);
        setIsFollowing(false);
      }
    }, 'theo dõi người dùng');
  };

  const handleSave = async () => {
    requireAuth(async () => {
      try {
        await toggleSave(video.id).unwrap();
        const newSavedState = !isSaved;
        setIsSaved(newSavedState);
        setSaveCount((prev: number) => newSavedState ? prev + 1 : prev - 1);
      } catch (error) {
        console.error('Save error:', error);
        Alert.alert('Lỗi', 'Không thể lưu video. Vui lòng thử lại.');
      }
    }, 'lưu video');
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this video: ${video.caption || 'Amazing video!'} \n${video.videoUrl}`,
        url: video.videoUrl,
      });

      if (result.action === Share.sharedAction) {
        // Call API to track share
        const response = await shareVideo(video.id).unwrap();
        if (response.success && response.data) {
          setShareCount(response.data.shareCount);
        }
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) {
      return '0';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (seconds === undefined || seconds === null) {
      return '0:00';
    }
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
        <VideoView
          player={player}
          style={[styles.video, { height: videoHeight }]}
          contentFit="cover"
          nativeControls={false}
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
        
        {/* Pause button - only show when video is paused */}
        {!isPlaying && !isLoading && showControls && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={60} color="rgba(255,255,255,0.9)" />
          </View>
        )}
      </TouchableOpacity>

      {/* Caption - Bottom left */}
      <View style={styles.bottomLeftContent}>
        <View style={styles.contentContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('UserProfile', { userId: video.user.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.username}>@{video.user.username}</Text>
          </TouchableOpacity>
          
          {video.caption && video.caption.trim() !== '' && (
            <Text style={styles.caption} numberOfLines={3}>
              {video.caption}
            </Text>
          )}
          
          {video.hashtags && video.hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              {video.hashtags.map((tag: string, index: number) => {
                // Clean up hashtag - remove JSON artifacts and extra characters
                let cleanTag = tag;
                if (typeof tag === 'string') {
                  cleanTag = tag
                    .replace(/[\[\]"]/g, '') // Remove brackets and quotes
                    .replace(/^#/, '') // Remove leading #
                    .trim();
                }
                
                // Skip empty tags
                if (!cleanTag) return null;
                
                return (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => navigation.navigate('Search', { keyword: cleanTag })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.hashtags}>#{cleanTag} </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Right side - Action buttons */}
      <View style={styles.rightActions}>
        {/* Avatar with Follow Button */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            style={styles.userAvatar}
            onPress={() => navigation.navigate('UserProfile', { userId: video.user.id })}
          >
            {video.user.avatarUrl ? (
              <Image source={{ uri: video.user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          {showFollowButton && (
            <TouchableOpacity 
              style={styles.followButton}
              onPress={handleFollow}
              disabled={isFollowing}
            >
              <Animated.View
                style={[
                  styles.followButtonInner,
                  {
                    transform: [{ scale: followButtonScale }],
                    opacity: followButtonOpacity,
                  },
                ]}
              >
                <Ionicons name="add" size={12} color="#fff" />
              </Animated.View>
              <Animated.View
                style={[
                  styles.checkmarkContainer,
                  {
                    transform: [{ scale: checkmarkScale }],
                    opacity: checkmarkOpacity,
                  },
                ]}
              >
                <Ionicons name="checkmark" size={12} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={28} 
            color={isLiked ? "#ff3040" : "#fff"} 
          />
          <Text style={styles.actionText}>{formatNumber(likeCount)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => requireAuth(() => setCommentsModalVisible(true), 'bình luận')}
        >
          <Ionicons name="chatbubble-outline" size={26} color="#fff" />
          <Text style={styles.actionText}>{formatNumber(commentCount)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="paper-plane-outline" size={26} color="#fff" />
          <Text style={styles.actionText}>{formatNumber(shareCount)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={26} 
            color={isSaved ? "#ffd700" : "#fff"} 
          />
          <Text style={styles.actionText}>{formatNumber(saveCount)}</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        videoId={video.id}
        onCommentCountChange={setCommentCount}
      />
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  userAvatar: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  defaultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#ff3040',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButtonInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
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
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  hashtags: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
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
    marginBottom: 20,
    padding: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VideoCard;