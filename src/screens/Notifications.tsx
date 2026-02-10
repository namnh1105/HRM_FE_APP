import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications';
import type { HrmNotification } from '../types/notification';

const Notifications: React.FC = () => {
  const {
    isAuthenticated,
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    getIcon,
    formatTime,
    markAsRead,
    markAllAsRead,
    navigateToLogin,
  } = useNotifications();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.authPrompt}>
          <Ionicons name="lock-closed-outline" size={64} color="#94A3B8" />
          <Text style={styles.authTitle}>Vui lòng đăng nhập</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={navigateToLogin}
          >
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.authPrompt}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.authTitle, { marginTop: 12 }]}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.authPrompt}>
          <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
          <Text style={[styles.authTitle, { color: '#EF4444' }]}>Không thể tải thông báo</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={refetch}>
            <Text style={styles.loginBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: HrmNotification }) => {
    const iconInfo = getIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.cardUnread]}
        onPress={() => { if (!item.isRead) markAsRead(item.id); }}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: iconInfo.bg }]}>
          <Ionicons name={iconInfo.name as any} size={22} color={iconInfo.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllAsRead()}>
            <Text style={styles.markAll}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      {unreadCount > 0 && (
        <View style={styles.countRow}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{unreadCount} chưa đọc</Text>
          </View>
        </View>
      )}

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>Không có thông báo</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  markAll: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  countRow: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardUnread: {
    backgroundColor: '#F8FBFF',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
    color: '#1E293B',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 12,
  },
});

export default Notifications;
