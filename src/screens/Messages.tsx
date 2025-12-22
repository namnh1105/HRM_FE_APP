import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMessages } from '../hooks';
import { ChatRoom, User } from '../types/api';
import LoadingIndicator from '../components/LoadingIndicator';
import { useNotifications } from '../hooks/useNotifications';

const Messages: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { unreadCount } = useNotifications();
  
  const {
    rooms,
    following,
    loading,
    error,
    createOrOpenChatWithUser,
  } = useMessages();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const openChat = (room: ChatRoom) => {
    const otherUser = room.users && room.users.length > 0 ? room.users[0] : null;
    if (otherUser) {
      // @ts-ignore - Navigation type issue
      navigation.navigate('ChatRoom', { roomId: room.id, otherUser });
    }
  };

  const openChatWithUser = async (user: User) => {
    console.log('[Messages] Opening chat with user:', {
      id: user.id,
      username: user.username,
      givenName: user.givenName,
      fullUser: user,
    });
    const room = await createOrOpenChatWithUser(user);
    if (room) {
      console.log('[Messages] Room created/found, navigating...');
      openChat(room);
    } else {
      console.log('[Messages] Failed to create/find room');
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][date.getDay()];
    return date.toLocaleDateString();
  };

  const getOtherParticipant = (room: ChatRoom): User | null => {
    // For private chats, get the other user (assuming current user is filtered out)
    if (room.type === 'private' && room.users && room.users.length > 0) {
      return room.users[0];
    }
    return null;
  };

  const renderStoryItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.storyItem} onPress={() => openChatWithUser(item)}>
      <View style={styles.storyAvatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.storyAvatar} />
        ) : (
          <View style={[styles.storyAvatar, styles.defaultAvatar]}>
            <Ionicons name="person" size={24} color="#999" />
          </View>
        )}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>
        {item.givenName || item.username}
      </Text>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item }: { item: ChatRoom }) => {
    const otherUser = getOtherParticipant(item);
    const hasUnread = (item.unreadCount || 0) > 0;
    
    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item)}>
        <View style={styles.avatarContainer}>
          {otherUser?.avatarUrl ? (
            <Image source={{ uri: otherUser.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultChatAvatar]}>
              <Ionicons name="person" size={28} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name || otherUser?.givenName || otherUser?.username || 'Unknown'}
            </Text>
            {item.lastMessage && (
              <Text style={styles.chatTime}>
                {formatLastMessageTime(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>
          
          {item.lastMessage && (
            <View style={styles.lastMessageContainer}>
              <Text 
                style={[
                  styles.lastMessage, 
                  hasUnread && styles.lastMessageUnread
                ]} 
                numberOfLines={1}
              >
                {item.lastMessage.content}
              </Text>
              {hasUnread && (
                <View style={styles.unreadBadgeContainer}>
                  <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => {
    // Kiểm tra xem đã có room với user này chưa
    const existingRoom = rooms.find(room => 
      room.type === 'private' && 
      room.users?.some(p => p.id === item.id)
    );

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => openChatWithUser(item)}>
        <View style={styles.avatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultChatAvatar]}>
              <Ionicons name="person" size={28} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.givenName || item.username}
            </Text>
          </View>
          
          <View style={styles.lastMessageContainer}>
            <Text style={[styles.lastMessage, styles.startChatText]} numberOfLines={1}>
              {existingRoom?.lastMessage 
                ? existingRoom.lastMessage.content 
                : 'Hãy bắt đầu cuộc trò chuyện ngay bây giờ'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Kết hợp rooms và following users
  const getCombinedList = () => {
    const userIdsInRooms = new Set(
      rooms.flatMap(room => room.users?.map(p => p.id) || [])
    );
    
    // Lấy users chưa có trong rooms
    const usersWithoutRooms = following.filter(user => !userIdsInRooms.has(user.id));
    
    // Trả về combined list: rooms trước, sau đó là users chưa có chat
    return [...rooms, ...usersWithoutRooms];
  };

  const combinedList = getCombinedList();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" color="#007398" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications' as never)}
        >
          <Ionicons name="notifications-outline" size={26} color="#262626" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8E8E8E" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tin nhắn"
          placeholderTextColor="#8E8E8E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Following List */}
      {following.length > 0 && (
        <View style={styles.followingContainer}>
          <Text style={styles.sectionTitle}>Đang theo dõi</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.followingList}
          >
            {following.map((user) => (
              <View key={user.id}>
                {renderStoryItem({ item: user })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Chat List */}
      <FlatList
        data={combinedList}
        keyExtractor={(item: any) => 'id' in item ? item.id : `user-${item.id}`}
        renderItem={({ item }) => {
          // Kiểm tra xem item là ChatRoom hay User
          // ChatRoom có 'type' và 'users' properties
          if ('type' in item && (item.type === 'private' || item.type === 'group')) {
            return renderChatItem({ item: item as ChatRoom });
          } else {
            return renderUserItem({ item: item as User });
          }
        }}
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
            <Text style={styles.emptySubText}>Bắt đầu nhắn tin với những người bạn theo dõi</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#262626',
    flex: 1,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#262626',
    padding: 0,
  },
  followingContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E8E',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  followingList: {
    paddingHorizontal: 12,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 64,
  },
  storyAvatarContainer: {
    marginBottom: 6,
  },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#6B4CE6',
  },
  defaultAvatar: {
    backgroundColor: '#E4E6EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyName: {
    fontSize: 11,
    color: '#262626',
    textAlign: 'center',
    fontWeight: '500',
  },
  chatList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatListContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  defaultChatAvatar: {
    backgroundColor: '#E4E6EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#44B700',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#262626',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#8E8E8E',
    marginLeft: 8,
    fontWeight: '400',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 13,
    color: '#8E8E8E',
    flex: 1,
    lineHeight: 18,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#262626',
  },
  startChatText: {
    color: '#8E8E8E',
    fontStyle: 'italic',
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B4CE6',
    marginLeft: 8,
  },
  unreadBadgeContainer: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B4CE6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#8E8E8E',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Messages;