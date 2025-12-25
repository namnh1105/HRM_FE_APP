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
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../types/api';
import VideoCard from '../components/VideoCard';
import { useVideoVisibility } from '../hooks';

const { height: screenHeight } = Dimensions.get('window');

interface RouteParams {
  videos: Video[];
  initialIndex: number;
  searchKeyword: string;
  sortBy: 'relevance' | 'recent' | 'popular';
}

const SearchVideoViewer: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { videos, initialIndex, searchKeyword, sortBy } = route.params as RouteParams;
  
  const flatListRef = useRef<FlatList>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialIndex);

  const {
    currentIndex,
    viewabilityConfig,
    onViewableItemsChanged,
  } = useVideoVisibility();

  useEffect(() => {
    // Scroll to initial video
    if (flatListRef.current && initialIndex >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: initialIndex, 
          animated: false 
        });
      }, 100);
    }
  }, []);

  const renderVideo = ({ item, index }: { item: Video; index: number }) => (
    <VideoCard 
      video={item} 
      isActive={index === currentIndex} 
      customHeight={screenHeight}
    />
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
      
      {/* Back Button and Info */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {searchKeyword}
          </Text>
          <Text style={styles.headerSubtitle}>
            {videos.length} video
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item, index) => `search-${item.id}-${index}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: screenHeight,
          offset: screenHeight * index,
          index,
        })}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / screenHeight);
          setCurrentVideoIndex(index);
        }}
        contentContainerStyle={styles.flatListContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
      />

      {/* Video Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentVideoIndex + 1} / {videos.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  flatListContent: {
    flexGrow: 1,
  },
  counterContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default SearchVideoViewer;
