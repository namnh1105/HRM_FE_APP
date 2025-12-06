import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Video } from '../types/api';
import VideoCard from '../components/VideoCard';
import { useVideoData, useVideoVisibility } from '../hooks';

const { height: screenHeight } = Dimensions.get('window');

const Home: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);

  const {
    videos,
    loading,
    loadingMore,
    handleLoadMore,
  } = useVideoData();

  const {
    currentIndex,
    viewabilityConfig,
    onViewableItemsChanged,
  } = useVideoVisibility();

  const renderVideo = ({ item, index }: { item: Video; index: number }) => (
    <VideoCard 
      video={item} 
      isActive={index === currentIndex} 
      onLoadMore={index === videos.length - 2 ? handleLoadMore : undefined}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Chưa có video nào</Text>
      <Text style={styles.emptySubText}>Hãy thử làm mới trang</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Đang tải video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmpty}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        contentContainerStyle={styles.flatListContent}
        style={styles.flatList}
      />
      
      {loadingMore && (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color="#fff" />
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

