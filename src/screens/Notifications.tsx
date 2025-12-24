import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../store/api/notificationApi';
import { useNavigation } from '@react-navigation/native';

const NotificationsScreen: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refreshNotifications } =
    useNotifications();
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type and actionUrl
    if (notification.actionUrl) {
      const url = notification.actionUrl;
      
      // Close notifications screen first
      navigation.goBack();
      
      // Then navigate to the target
      setTimeout(() => {
        if (url.includes('/chat/')) {
          const roomId = url.split('/chat/')[1];
          navigation.navigate('ChatRoom' as never, { roomId } as never);
        } else if (url.includes('/video/')) {
          const videoId = url.split('/video/')[1]?.split('?')[0];
          // Navigate to video detail screen
          // navigation.navigate('VideoDetail', { videoId });
        } else if (url.includes('/profile/')) {
          const userId = url.split('/profile/')[1];
          navigation.navigate('UserProfile' as never, { userId } as never);
        }
      }, 100);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setIsRefreshing(false);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'like':
        return '❤️';
      case 'comment':
        return '💭';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      case 'system':
        return '📢';
      default:
        return '🔔';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const timeAgo = getTimeAgo(new Date(item.createdAt));

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getNotificationIcon(item.type)}</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' năm trước';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' tháng trước';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' ngày trước';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' giờ trước';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' phút trước';

    return 'Vừa xong';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => markAllAsRead()} style={styles.markAllButton}>
              <Text style={styles.markAllText}>Đọc hết</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    width: 70,
    alignItems: 'flex-end',
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  markAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 6,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default NotificationsScreen;
