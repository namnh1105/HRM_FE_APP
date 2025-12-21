import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Shop, Messages, Profile } from '../screens';
import BottomNavbar from '../components/BottomNavbar';

const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <BottomNavbar {...props} />}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={Search}
        options={{
          tabBarLabel: 'Tìm kiếm',
        }}
      />
      <Tab.Screen 
        name="Shop" 
        component={Shop}
        options={{
          tabBarLabel: 'Shop',
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={Messages}
        options={{
          tabBarLabel: 'Hộp thư',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarLabel: 'Hồ sơ',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;