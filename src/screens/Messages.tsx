import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMessages } from '../hooks';
import { ChatRoom, User } from '../types/api';

const Messages: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    rooms,
    following,
    loading,
    error,
    createOrOpenChatWithUser,
  } = useMessages();

  const openChat = (room: ChatRoom) => {
    const otherUser = room.users && room.users.length > 0 ? room.users[0] : null;
    if (otherUser) {
      navigation.navigate('ChatRoom' as never, { roomId: room.id, otherUser } as never);
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
              <Text style={styles.lastMessage} numberOfLines={1}>
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
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/40' }} 
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="camera-outline" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="create-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stories/Following List */}
      <View style={styles.storiesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesList}
        >
          {/* Add Story Button */}
          <TouchableOpacity style={styles.storyItem}>
            <View style={styles.addStoryContainer}>
              <Ionicons name="add" size={24} color="#000" />
            </View>
            <Text style={styles.storyName}>Your story</Text>
          </TouchableOpacity>

          {/* Following Users */}
          {following.map((user) => (
            <View key={user.id}>
              {renderStoryItem({ item: user })}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Chat List */}
      <FlatList
        data={combinedList}
        keyExtractor={(item) => 'id' in item ? item.id : `user-${item.id}`}
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
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubText}>Start chatting with people you follow</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    padding: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginLeft: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  storiesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  storiesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 70,
  },
  storyAvatarContainer: {
    marginBottom: 6,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#0095F6',
  },
  defaultAvatar: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStoryContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  storyName: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultChatAvatar: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#31A24C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  chatTime: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  startChatText: {
    color: '#999',
    fontStyle: 'italic',
  },
  unreadBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0095F6',
    marginLeft: 8,
  },
  unreadBadgeContainer: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0095F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
  },
});

export default Messages;