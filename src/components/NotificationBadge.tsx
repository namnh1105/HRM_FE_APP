import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationBadgeProps {
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onPress, size = 'medium' }) => {
  const { unreadCount } = useNotifications();

  const sizeStyles = {
    small: { iconSize: 20, badgeSize: 16, fontSize: 10 },
    medium: { iconSize: 24, badgeSize: 18, fontSize: 11 },
    large: { iconSize: 28, badgeSize: 20, fontSize: 12 },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={[styles.iconContainer, { width: currentSize.iconSize, height: currentSize.iconSize }]}>
        <Text style={[styles.icon, { fontSize: currentSize.iconSize }]}>🔔</Text>
      </View>
      {unreadCount > 0 && (
        <View
          style={[
            styles.badge,
            {
              minWidth: currentSize.badgeSize,
              height: currentSize.badgeSize,
              borderRadius: currentSize.badgeSize / 2,
            },
          ]}
        >
          <Text style={[styles.badgeText, { fontSize: currentSize.fontSize }]}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '#000',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
