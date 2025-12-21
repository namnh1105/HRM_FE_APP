import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useGetUserByIdQuery, useGetUserVideosQuery } from '../store/api/userApi';
import { useFollowUserMutation, useUnfollowUserMutation } from '../store/api/followApi';
import { Video } from '../types/api';
import VideoCard from '../components/VideoCard';
import { COLORS, SPACING } from '../utils/constants';

const { width } = Dimensions.get('window');
const itemWidth = width / 3;

type UserProfileRouteProp = RouteProp<{ params: { userId: string } }, 'params'>;

const UserProfile = () => {
  const navigation = useNavigation();
  const route = useRoute<UserProfileRouteProp>();
  const userId = route.params?.userId;

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);
  const videoModalRef = useRef<FlatList>(null);

  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useGetUserByIdQuery(userId);
  const { data: videosData, isLoading: videosLoading } = useGetUserVideosQuery({ userId, page: 1, size: 50 });

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const userInfo = userData?.success ? userData.data : null;
  const userVideos = videosData?.success ? videosData.data.videos : [];

  const handleFollowToggle = async () => {
    if (!userInfo) return;

    try {
      if (userInfo.isFollowing) {
        await unfollowUser(userId).unwrap();
      } else {
        await followUser(userId).unwrap();
      }
      refetchUser();
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
    }
  };

  const openVideoModal = (video: Video, index: number) => {
    setSelectedVideo(video);
    setSelectedVideoIndex(index);
    setCurrentModalIndex(index);
    setIsVideoModalVisible(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsVideoModalVisible(false);
  };

  const renderVideoItem = ({ item, index }: { item: Video; index: number }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => openVideoModal(item, index)}
    >
      {item.thumbnailUrl ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderThumbnail}>
          <Text style={styles.placeholderText}>Video {index + 1}</Text>
        </View>
      )}
      <View style={styles.videoStats}>
        <Text style={styles.videoViews}>{item.stats.views}</Text>
      </View>
    </TouchableOpacity>
  );

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy người dùng</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButtonTop}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              {userInfo.avatarUrl ? (
                <Image
                  source={{ uri: userInfo.avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userInfo.givenName?.[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>

            <Text style={styles.userName}>
              {userInfo.givenName} {userInfo.familyName}
            </Text>
            <Text style={styles.userUsername}>@{userInfo.username}</Text>

            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => navigation.navigate('FollowList' as never, {
                  userId: userInfo.id,
                  initialTab: 'following',
                  username: userInfo.username,
                } as never)}
              >
                <Text style={styles.statNumber}>
                  {userInfo.followingCount || 0}
                </Text>
                <Text style={styles.statLabel}>Đang follow</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => navigation.navigate('FollowList' as never, {
                  userId: userInfo.id,
                  initialTab: 'followers',
                  username: userInfo.username,
                } as never)}
              >
                <Text style={styles.statNumber}>
                  {userInfo.followersCount || 0}
                </Text>
                <Text style={styles.statLabel}>Follower</Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userVideos.length}</Text>
                <Text style={styles.statLabel}>Video</Text>
              </View>
            </View>

            {/* Follow Button */}
            <TouchableOpacity
              style={[
                styles.followButton,
                userInfo.isFollowing && styles.followingButton,
              ]}
              onPress={handleFollowToggle}
            >
              <Text
                style={[
                  styles.followButtonText,
                  userInfo.isFollowing && styles.followingButtonText,
                ]}
              >
                {userInfo.isFollowing ? 'Đang follow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.videosSection}>
          <View style={styles.tabsContainer}>
            <View style={[styles.tab, styles.activeTab]}>
              <Ionicons name="grid-outline" size={24} color={COLORS.PRIMARY} />
            </View>
          </View>

          {videosLoading ? (
            <View style={styles.videosLoading}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Đang tải video...</Text>
            </View>
          ) : userVideos.length > 0 ? (
            <FlatList
              data={userVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.videosGrid}
              columnWrapperStyle={styles.videoRow}
            />
          ) : (
            <View style={styles.emptyVideos}>
              <Text style={styles.emptyText}>Chưa có video nào</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isVideoModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideoModal}
      >
        <View style={styles.videoPlayerContainer}>
          <FlatList
            ref={videoModalRef}
            data={userVideos}
            renderItem={({ item, index }) => (
              <VideoCard
                video={item}
                isActive={index === currentModalIndex}
              />
            )}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={Dimensions.get('window').height}
            snapToAlignment="start"
            decelerationRate="fast"
            initialScrollIndex={selectedVideoIndex}
            getItemLayout={(data, index) => ({
              length: Dimensions.get('window').height,
              offset: Dimensions.get('window').height * index,
              index,
            })}
            onViewableItemsChanged={({ viewableItems }) => {
              if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentModalIndex(viewableItems[0].index);
              }
            }}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
            }}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeVideoModal}
          >
            <View style={styles.closeButtonBackground}>
              <Text style={styles.closeButtonText}>✕</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.SM,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.TEXT,
    marginBottom: SPACING.MD,
  },
  backButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.LG,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonTop: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: SPACING.XL + 40,
    paddingHorizontal: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    color: COLORS.BACKGROUND,
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.XS,
  },
  userUsername: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  followButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.XL,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  followButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: COLORS.PRIMARY,
  },
  videosSection: {
    paddingTop: SPACING.LG,
    paddingBottom: SPACING.LG,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: SPACING.MD,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.PRIMARY,
  },
  videosLoading: {
    alignItems: 'center',
    paddingVertical: SPACING.LG,
  },
  videosGrid: {
    paddingBottom: SPACING.LG,
  },
  videoRow: {
    justifyContent: 'flex-start',
  },
  videoItem: {
    width: itemWidth,
    aspectRatio: 9/16,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.TEXT_SECONDARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.BACKGROUND,
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoStats: {
    position: 'absolute',
    bottom: SPACING.XS,
    right: SPACING.XS,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoViews: {
    color: COLORS.BACKGROUND,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyVideos: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  closeButtonBackground: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserProfile;
