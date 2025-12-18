import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';

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
    { id: 'Search', label: 'Tìm kiếm', icon: 'search', library: 'Ionicons' },
    { id: 'AddVideo', label: 'Thêm video', icon: 'add-circle', library: 'Ionicons', isSpecial: true },
    { id: 'Messages', label: 'Hộp thư', icon: 'chatbubble-ellipses', library: 'Ionicons' },
    { id: 'Profile', label: 'Hồ sơ', icon: 'person', library: 'Ionicons' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.98)', 'rgba(248,250,252,1)']}
        style={styles.gradientBackground}
      >
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
                  {tab.isSpecial ? (
                    <View style={styles.specialRectangle}>
                      <Ionicons
                        name={tab.icon as any}
                        size={20}
                        color="#fff"
                      />
                    </View>
                  ) : (
                    <>
                      {isFocused && (
                        <View style={styles.activeIndicator} />
                      )}
                      <Ionicons
                        name={tab.icon as any}
                        size={22}
                        color={
                          isFocused ? '#000' : '#666'
                        }
                      />
                    </>
                  )}
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
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  gradientBackground: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    backgroundColor: '#fff',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    minHeight: 60,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    maxWidth: width / 6,
  },
  specialTab: {
    // No transform
  },
  activeTab: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    paddingVertical: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    position: 'relative',
  },
  specialIconContainer: {
    // No special styling needed
  },
  specialRectangle: {
    backgroundColor: '#000',
    borderRadius: 6,
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeIconContainer: {
    // No transform
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 30,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 2,
  },
  specialTabLabel: {
    fontSize: 9,
    color: '#000',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#000',
    fontWeight: '600',
    fontSize: 10,
  },
});

export default BottomNavbar;