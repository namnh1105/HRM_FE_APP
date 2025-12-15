import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { useGetSavedVideosQuery } from '../store/api/saveApi';
import { Video } from '../types/api';
import VideoCard from '../components/VideoCard';
import { COLORS, SPACING } from '../utils/constants';

const { width } = Dimensions.get('window');
const itemWidth = width / 3;

const SavedVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);

  const {
    data: savedVideosData,
    isLoading,
    refetch,
  } = useGetSavedVideosQuery({ page: 1, size: 50 });

  const savedVideos = savedVideosData?.success ? savedVideosData.data.videos : [];

  const openVideoModal = (video: Video, index: number) => {
    setSelectedVideo(video);
    setSelectedVideoIndex(index);
    setCurrentModalIndex(index);
    setIsVideoModalVisible(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsVideoModalVisible(false);
    refetch(); // Refresh list in case save status changed
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Video đã lưu</Text>
      </View>

      {savedVideos.length > 0 ? (
        <FlatList
          data={savedVideos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.videosGrid}
          columnWrapperStyle={styles.videoRow}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có video nào được lưu</Text>
          <Text style={styles.emptySubText}>
            Nhấn vào biểu tượng đánh dấu để lưu video yêu thích
          </Text>
        </View>
      )}

      <Modal
        visible={isVideoModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideoModal}
      >
        <View style={styles.videoPlayerContainer}>
          <FlatList
            data={savedVideos}
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
  header: {
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
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

export default SavedVideos;
