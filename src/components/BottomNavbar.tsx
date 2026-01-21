import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const BottomNavbar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const tabs = [
    { name: 'Home', label: 'Home', icon: 'home' },
    { name: 'Profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.navbar}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index].key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={onPress}
            >
              <Ionicons
                name={isFocused ? tab.icon as any : `${tab.icon}-outline` as any}
                size={24}
                color={isFocused ? '#007bff' : '#666'}
              />
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? '#007bff' : '#666' }
              ]}>
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
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomNavbar;