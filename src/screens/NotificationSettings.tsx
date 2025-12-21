import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { NotificationPreferences } from '../store/api/notificationApi';

const NotificationSettings: React.FC = () => {
  const { preferences, isLoading, isUpdating, updatePreferences } = useNotificationPreferences();

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!preferences) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải cài đặt thông báo</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt chung</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Bật tất cả thông báo push</Text>
            <Text style={styles.settingDescription}>
              Nhận thông báo đẩy trên thiết bị
            </Text>
          </View>
          <Switch
            value={preferences.globalPushEnabled}
            onValueChange={(value) => updatePreference('globalPushEnabled', value)}
            disabled={isUpdating}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Chế độ Không làm phiền</Text>
            <Text style={styles.settingDescription}>
              Tắt thông báo trong khoảng thời gian nhất định
            </Text>
          </View>
          <Switch
            value={preferences.doNotDisturb}
            onValueChange={(value) => updatePreference('doNotDisturb', value)}
            disabled={saving}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tin nhắn</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Thông báo tin nhắn</Text>
            <Text style={styles.settingDescription}>
              Thông báo khi có tin nhắn mới
            </Text>
          </View>
          <Switch
            value={preferences.messageEnabled}
            onValueChange={(value) => updatePreference('messageEnabled', value)}
            disabled={saving}
          />
        </View>

        {preferences.messageEnabled && (
          <View style={[styles.settingItem, styles.subSetting]}>
            <Text style={styles.settingLabel}>Thông báo push tin nhắn</Text>
            <Switch
              value={preferences.messagePushEnabled}
              onValueChange={(value) => updatePreference('messagePushEnabled', value)}
              disabled={saving}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tương tác</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Thông báo like</Text>
            <Text style={styles.settingDescription}>
              Khi có người thích video hoặc bình luận của bạn
            </Text>
          </View>
          <Switch
            value={preferences.likeEnabled}
            onValueChange={(value) => updatePreference('likeEnabled', value)}
            disabled={saving}
          />
        </View>

        {preferences.likeEnabled && (
          <View style={[styles.settingItem, styles.subSetting]}>
            <Text style={styles.settingLabel}>Thông báo push like</Text>
            <Switch
              value={preferences.likePushEnabled}
              onValueChange={(value) => updatePreference('likePushEnabled', value)}
              disabled={saving}
            />
          </View>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Thông báo bình luận</Text>
            <Text style={styles.settingDescription}>
              Khi có người bình luận video của bạn
            </Text>
          </View>
          <Switch
            value={preferences.commentEnabled}
            onValueChange={(value) => updatePreference('commentEnabled', value)}
            disabled={saving}
          />
        </View>

        {preferences.commentEnabled && (
          <View style={[styles.settingItem, styles.subSetting]}>
            <Text style={styles.settingLabel}>Thông báo push bình luận</Text>
            <Switch
              value={preferences.commentPushEnabled}
              onValueChange={(value) => updatePreference('commentPushEnabled', value)}
              disabled={saving}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mạng xã hội</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Thông báo follow</Text>
            <Text style={styles.settingDescription}>
              Khi có người theo dõi bạn
            </Text>
          </View>
          <Switch
            value={preferences.followEnabled}
            onValueChange={(value) => updatePreference('followEnabled', value)}
            disabled={saving}
          />
        </View>

        {preferences.followEnabled && (
          <View style={[styles.settingItem, styles.subSetting]}>
            <Text style={styles.settingLabel}>Thông báo push follow</Text>
            <Switch
              value={preferences.followPushEnabled}
              onValueChange={(value) => updatePreference('followPushEnabled', value)}
              disabled={saving}
            />
          </View>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Thông báo mention (@)</Text>
            <Text style={styles.settingDescription}>
              Khi có người nhắc đến bạn
            </Text>
          </View>
          <Switch
            value={preferences.mentionEnabled}
            onValueChange={(value) => updatePreference('mentionEnabled', value)}
            disabled={saving}
          />
        </View>

        {preferences.mentionEnabled && (
          <View style={[styles.settingItem, styles.subSetting]}>
            <Text style={styles.settingLabel}>Thông báo push mention</Text>
            <Switch
              value={preferences.mentionPushEnabled}
              onValueChange={(value) => updatePreference('mentionPushEnabled', value)}
              disabled={saving}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hệ thống</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Thông báo hệ thống</Text>
            <Text style={styles.settingDescription}>
              Cập nhật và thông báo quan trọng
            </Text>
          </View>
          <Switch
            value={preferences.systemEnabled}
            onValueChange={(value) => updatePreference('systemEnabled', value)}
            disabled={saving}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subSetting: {
    paddingLeft: 32,
    backgroundColor: '#fafafa',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
  },
  savingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginTop: 10,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
  },
});

export default NotificationSettings;
