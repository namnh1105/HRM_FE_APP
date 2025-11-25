import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  library: 'Ionicons';
  isSpecial?: boolean;
}

const { width } = Dimensions.get('window');

const BottomNavbar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const tabs: TabConfig[] = [
    { id: 'Home', label: 'Trang chủ', icon: 'home', library: 'Ionicons' },
    { id: 'Shop', label: 'Cửa hàng', icon: 'storefront', library: 'Ionicons' },
    { id: 'AddVideo', label: 'Thêm video', icon: 'add-circle', library: 'Ionicons', isSpecial: true },
    { id: 'Messages', label: 'Hộp thư', icon: 'chatbubble-ellipses', library: 'Ionicons' },
    { id: 'Profile', label: 'Hồ sơ', icon: 'person', library: 'Ionicons' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        {tabs.map((tab, index) => {
          const { options } = descriptors[state.routes[index].key];
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index].key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(state.routes[index].name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabItem,
                tab.isSpecial && styles.specialTab,
                isFocused && styles.activeTab,
              ]}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  tab.isSpecial && styles.specialIconContainer,
                  isFocused && styles.activeIconContainer,
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={tab.isSpecial ? 20 : 24}
                  color={
                    tab.isSpecial
                      ? '#fff'
                      : isFocused
                      ? '#007AFF'
                      : '#666'
                  }
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  tab.isSpecial && styles.specialTabLabel,
                  isFocused && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    minHeight: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    maxWidth: width / 5,
  },
  specialTab: {
    // Special styling for the "add" button
  },
  activeTab: {
    // Add any active tab styling here
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  specialIconContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  activeIconContainer: {
    // Active icon container styling
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 4,
  },
  specialTabLabel: {
    fontSize: 9,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF', // Blue color for active label
    fontWeight: '600',
  },
});

export default BottomNavbar;