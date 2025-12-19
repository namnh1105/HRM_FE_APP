import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUserProfile } from '../hooks';
import { Video } from '../types/api';
import VideoCard from '../components/VideoCard';
import { COLORS, SPACING } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetSavedVideosQuery } from '../store/api/saveApi';
import { getDraftVideos, deleteDraftVideo } from '../utils/draftVideoStorage';
import { DraftVideo } from '../types/api';

const { width } = Dimensions.get('window');
const itemWidth = width / 3;

const Profile = () => {
  const navigation = useNavigation();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'saved' | 'drafts'>('videos');
  const [draftVideos, setDraftVideos] = useState<DraftVideo[]>([]);
  const [isDraftsLoading, setIsDraftsLoading] = useState(false);
  const videoModalRef = useRef<FlatList>(null);

  const {
    userInfo,
    isAuthenticated,
    loading,
    userVideos,
    videosLoading,
    handleLogout,
    refreshUserInfo,
  } = useUserProfile();

  const {
    data: savedVideosData,
    isLoading: savedVideosLoading,
    refetch: refetchSavedVideos,
  } = useGetSavedVideosQuery({ page: 1, size: 50 }, {
    skip: !isAuthenticated,
  });

  const savedVideos = savedVideosData?.success ? savedVideosData.data.videos : [];

  useFocusEffect(
    React.useCallback(() => {
      refreshUserInfo();
      if (activeTab === 'saved') {
        refetchSavedVideos();
      } else if (activeTab === 'drafts') {
        loadDraftVideos();
      }
    }, [refreshUserInfo, activeTab, refetchSavedVideos])
  );

  const loadDraftVideos = async () => {
    setIsDraftsLoading(true);
    try {
      const drafts = await getDraftVideos();
      setDraftVideos(drafts);
    } catch (error) {
      console.error('Error loading draft videos:', error);
    } finally {
      setIsDraftsLoading(false);
    }
  };

  const openVideoModal = (video: Video, index: number) => {
    setSelectedVideo(video);
    setSelectedVideoIndex(index);
    setCurrentModalIndex(index);
    setIsVideoModalVisible(true);
  };

  const getCurrentVideos = () => {
    return activeTab === 'videos' ? userVideos : savedVideos;
  };

  const handleDeleteDraft = async (draftId: string) => {
    Alert.alert(
      'Xóa video nháp',
      'Bạn có chắc chắn muốn xóa video này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDraftVideo(draftId);
              await loadDraftVideos();
            } catch (error) {
              console.error('Error deleting draft:', error);
              Alert.alert('Lỗi', 'Không thể xóa video nháp');
            }
          },
        },
      ]
    );
  };

  const handleUploadDraft = (draft: DraftVideo) => {
    navigation.navigate('UploadDraft' as never, { draft } as never);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsVideoModalVisible(false);
  };

  const onLogoutPress = () => {
    setShowMenu(false);
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await handleLogout();
            // Don't navigate - just let the component re-render with !isAuthenticated
            // This will show the login button without navigation issues
          },
        },
      ]
    );
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
        <Ionicons name="play" size={12} color="#fff" style={{ marginRight: 4 }} />
        <Text style={styles.videoViews}>{item.stats.views}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderDraftItem = ({ item, index }: { item: DraftVideo; index: number }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => handleUploadDraft(item)}
      onLongPress={() => handleDeleteDraft(item.id)}
    >
      {item.thumbnailUri ? (
        <Image
          source={{ uri: item.thumbnailUri }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderThumbnail}>
          <Text style={styles.placeholderText}>Nháp {index + 1}</Text>
        </View>
      )}
      <View style={styles.draftBadge}>
        <Ionicons name="folder-outline" size={12} color="#fff" style={{ marginRight: 4 }} />
        <Text style={styles.draftBadgeText}>Nháp</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>?</Text>
          </View>
          <Text style={styles.title}>Chưa đăng nhập</Text>
          <Text style={styles.description}>
            Bạn cần đăng nhập để sử dụng tính năng này
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dropdown Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setShowMenu(true)}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#333" />
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={onLogoutPress}
            >
              <Ionicons name="log-out-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              {userInfo?.avatarUrl ? (
                <Image
                  source={{ uri: userInfo.avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userInfo?.givenName?.[0]?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>

            <Text style={styles.userName}>
              {userInfo?.givenName} {userInfo?.familyName}
            </Text>
            <Text style={styles.userUsername}>@{userInfo?.username}</Text>

            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => navigation.navigate('FollowList' as never, {
                  userId: userInfo?.id,
                  initialTab: 'following',
                  username: userInfo?.username,
                } as never)}
              >
                <Text style={styles.statNumber}>
                  {userInfo?.followingCount || 0}
                </Text>
                <Text style={styles.statLabel}>Đang follow</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={() => navigation.navigate('FollowList' as never, {
                  userId: userInfo?.id,
                  initialTab: 'followers',
                  username: userInfo?.username,
                } as never)}
              >
                <Text style={styles.statNumber}>
                  {userInfo?.followersCount || 0}
                </Text>
                <Text style={styles.statLabel}>Follower</Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userVideos.length}</Text>
                <Text style={styles.statLabel}>Video</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.videosSection}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'videos' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('videos')}
            >
              <Ionicons
                name="grid-outline"
                size={24}
                color={activeTab === 'videos' ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'saved' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('saved')}
            >
              <Ionicons
                name="bookmark-outline"
                size={24}
                color={activeTab === 'saved' ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'drafts' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('drafts')}
            >
              <Ionicons
                name="folder-outline"
                size={24}
                color={activeTab === 'drafts' ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {(activeTab === 'videos' ? videosLoading : activeTab === 'saved' ? savedVideosLoading : isDraftsLoading) ? (
            <View style={styles.videosLoading}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Đang tải video...</Text>
            </View>
          ) : activeTab === 'drafts' ? (
            draftVideos.length > 0 ? (
              <FlatList
                data={draftVideos}
                renderItem={renderDraftItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.videosGrid}
                columnWrapperStyle={styles.videoRow}
              />
            ) : (
              <View style={styles.emptyVideos}>
                <Text style={styles.emptyText}>Chưa có video nháp nào</Text>
                <Text style={styles.emptySubText}>
                  Video nháp sẽ được lưu trong thiết bị của bạn
                </Text>
              </View>
            )
          ) : getCurrentVideos().length > 0 ? (
            <FlatList
              data={getCurrentVideos()}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.videosGrid}
              columnWrapperStyle={styles.videoRow}
            />
          ) : (
            <View style={styles.emptyVideos}>
              <Text style={styles.emptyText}>
                {activeTab === 'videos' ? 'Chưa có video nào' : 'Chưa lưu video nào'}
              </Text>
              <Text style={styles.emptySubText}>
                {activeTab === 'videos'
                  ? 'Hãy tải lên video đầu tiên của bạn'
                  : 'Nhấn vào biểu tượng đánh dấu để lưu video yêu thích'}
              </Text>
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
            data={getCurrentVideos()}
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

          {/* Close Button Overlay */}
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: SPACING.LG,
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
  menuButton: {
    position: 'absolute',
    top: 50,
    right: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 95,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.MD,
    paddingHorizontal: SPACING.LG,
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
  draftBadge: {
    position: 'absolute',
    top: SPACING.XS,
    right: SPACING.XS,
    backgroundColor: 'rgba(254, 44, 85, 0.9)',
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftBadgeText: {
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
    marginBottom: SPACING.XS,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.SM,
  },
  description: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 150,
  },
  loginButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 16,
    fontWeight: 'bold',
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

export default Profile;
