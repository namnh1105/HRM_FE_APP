import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Video } from '../types/api';
import VideoCard from '../components/VideoCard';
import { useVideoData, useVideoVisibility, FeedType } from '../hooks';
import LoadingIndicator from '../components/LoadingIndicator';

const { height: screenHeight } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 80; // Approximate height of bottom tab bar
const adjustedHeight = screenHeight - TAB_BAR_HEIGHT;

const Home: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const isFocused = useIsFocused();
  const [feedType, setFeedType] = useState<FeedType>('forYou');

  const {
    videos,
    loading,
    loadingMore,
    handleLoadMore,
  } = useVideoData(feedType);

  const {
    currentIndex,
    viewabilityConfig,
    onViewableItemsChanged,
  } = useVideoVisibility();

  // Scroll to top when switching tabs
  const handleTabChange = (newFeedType: FeedType) => {
    setFeedType(newFeedType);
    // Small delay to ensure state is updated
    setTimeout(() => {
      try {
        if (flatListRef.current && videos.length > 0) {
          flatListRef.current.scrollToIndex({ index: 0, animated: false });
        }
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        }
      }
    }, 100);
  };

  const renderVideo = ({ item, index }: { item: Video; index: number }) => (
    <VideoCard 
      video={item} 
      isActive={index === currentIndex && isFocused} 
      onLoadMore={index === videos.length - 2 ? handleLoadMore : undefined}
      customHeight={adjustedHeight}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {feedType === 'following' ? 'Chưa có video từ người bạn follow' : 'Chưa có video nào'}
      </Text>
      <Text style={styles.emptySubText}>
        {feedType === 'following' 
          ? 'Hãy follow người khác để xem video của họ' 
          : 'Hãy thử làm mới trang'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <LoadingIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Đang tải video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, feedType === 'forYou' && styles.activeTab]}
          onPress={() => handleTabChange('forYou')}
        >
          <Text style={[styles.tabText, feedType === 'forYou' && styles.activeTabText]}>
            Đề xuất
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, feedType === 'following' && styles.activeTab]}
          onPress={() => handleTabChange('following')}
        >
          <Text style={[styles.tabText, feedType === 'following' && styles.activeTabText]}>
            Đã follow
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => `${feedType}-${item.id}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={adjustedHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        getItemLayout={(data, index) => ({
          length: adjustedHeight,
          offset: adjustedHeight * index,
          index,
        })}
        contentContainerStyle={styles.flatListContent}
        style={styles.flatList}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
      />
      
      {loadingMore && (
        <View style={styles.loadMoreContainer}>
          <LoadingIndicator size="small" color="#fff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 20,
    gap: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 12,
    fontWeight: '500',
  },
  loadMoreContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    height: screenHeight,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#ccc',
  },
});

export default Home;

