import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearchVideosQuery } from '../store/api/videoApi';
import { Video } from '../types/api';
import { useNavigation, useRoute } from '@react-navigation/native';
import LoadingIndicator from '../components/LoadingIndicator';
import { useSpeechToText } from '../hooks';

const { width: screenWidth } = Dimensions.get('window');

const Search: React.FC = () => {
  const route = useRoute();
  const { keyword } = (route.params as { keyword?: string }) || {};
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular'>('relevance');
  const [page, setPage] = useState(1);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Speech to Text hook
  const {
    isListening,
    recognizedText,
    startListening,
    stopListening,
    clearText,
    isAvailable,
  } = useSpeechToText();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle keyword from navigation params
  useEffect(() => {
    if (keyword) {
      setSearchKeyword(keyword);
      setActiveSearch(keyword);
      setPage(1);
    }
  }, [keyword]);

  // Update search keyword when voice recognition completes
  useEffect(() => {
    if (recognizedText && !isListening) {
      setSearchKeyword(recognizedText);
      // Auto search after voice recognition
      if (recognizedText.trim()) {
        setActiveSearch(recognizedText.trim());
        setPage(1);
      }
    }
  }, [recognizedText, isListening]);

  const { data, isLoading, isFetching } = useSearchVideosQuery(
    { keyword: activeSearch, sortBy, page, limit: 20 },
    { skip: !activeSearch }
  );

  const videos = data?.data?.videos || [];
  const totalPages = data?.data?.totalPages || 0;

  const handleSearch = useCallback(() => {
    if (searchKeyword.trim()) {
      setActiveSearch(searchKeyword.trim());
      setPage(1);
    }
  }, [searchKeyword]);

  const handleClear = useCallback(() => {
    setSearchKeyword('');
    setActiveSearch('');
    setPage(1);
    clearText();
  }, [clearText]);

  const handleVoiceSearch = useCallback(async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleSortChange = useCallback((newSort: 'relevance' | 'recent' | 'popular') => {
    setSortBy(newSort);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, page, totalPages]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const truncateText = (text: string | null, maxLength: number): string => {
    if (!text) return 'Không có mô tả';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderVideoItem = ({ item }: { item: Video }) => {
    return (
      <View style={styles.videoItem}>
        <TouchableOpacity activeOpacity={0.8}>
          <Image 
            source={{ uri: item.thumbnailUrl || item.videoUrl }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.videoOverlay}>
            <Text style={styles.caption} numberOfLines={2}>
              {truncateText(item.caption, 60)}
            </Text>
            <View style={styles.videoFooter}>
              <View style={styles.userSection}>
                {item.user.avatarUrl ? (
                  <Image 
                    source={{ uri: item.user.avatarUrl }} 
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>
                      {item.user.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.username} numberOfLines={1}>
                  {item.user.username}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={14} color="#fff" />
                <Text style={styles.statText}>{formatNumber(item.stats.likes)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={isListening ? "Đang nghe..." : "Tìm kiếm video..."}
            placeholderTextColor={isListening ? "#8B5CF6" : "#999"}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!isListening}
          />
          {searchKeyword.length > 0 && !isListening && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
          {isAvailable && (
            <TouchableOpacity 
              onPress={handleVoiceSearch} 
              style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isListening ? "mic" : "mic-outline"} 
                size={22} 
                color={isListening ? "#8B5CF6" : "#666"} 
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, !searchKeyword.trim() && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={!searchKeyword.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {activeSearch && (
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'relevance' && styles.sortButtonActive]}
            onPress={() => handleSortChange('relevance')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortText, sortBy === 'relevance' && styles.sortTextActive]}>
              Liên quan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
            onPress={() => handleSortChange('recent')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortText, sortBy === 'recent' && styles.sortTextActive]}>
              Mới nhất
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
            onPress={() => handleSortChange('popular')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortText, sortBy === 'popular' && styles.sortTextActive]}>
              Phổ biến
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderEmpty = () => {
    if (!activeSearch) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={80} color="#333" />
          <Text style={styles.emptyText}>Tìm kiếm video</Text>
          <Text style={styles.emptySubText}>Nhập từ khóa để tìm kiếm video</Text>
        </View>
      );
    }

    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="sad-outline" size={80} color="#333" />
        <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
        <Text style={styles.emptySubText}>Thử tìm kiếm với từ khóa khác</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetching || !activeSearch) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingIndicator size="small" color="#8B5CF6" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {renderHeader()}

      {isLoading && activeSearch ? (
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
    marginRight: 4,
  },
  voiceButton: {
    padding: 4,
    marginLeft: 4,
  },
  voiceButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  searchButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sortContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  sortButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  sortText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  sortTextActive: {
    color: '#fff',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  row: {
    justifyContent: 'space-between',
  },
  videoItem: {
    width: (screenWidth - 6) / 2,
    height: (screenWidth - 6) / 2 * 1.4,
    margin: 1,
    position: 'relative',
    backgroundColor: '#1a1a1a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    paddingBottom: 6,
    justifyContent: 'flex-end',
  },
  caption: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: '500',
  },
  videoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  username: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default Search;
