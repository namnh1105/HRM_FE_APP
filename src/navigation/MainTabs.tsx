import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, Dimensions } from 'react-native';
import { Home, Search, Shop, Messages, Profile } from '../screens';
import BottomNavbar from '../components/BottomNavbar';

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tab positions map
const TAB_POSITIONS: { [key: string]: number } = {
  Home: 0,
  Search: 1,
  Shop: 2,
  Messages: 3,
  Profile: 4,
};

// Wrapper component with slide animation
const AnimatedScreen = ({ children, routeName, currentTab }: any) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevTabRef = useRef(currentTab);

  useEffect(() => {
    const currentPosition = TAB_POSITIONS[currentTab];
    const targetPosition = TAB_POSITIONS[routeName];
    const prevPosition = TAB_POSITIONS[prevTabRef.current];
    
    // Determine direction
    const isGoingRight = currentPosition > prevPosition;
    
    // Set initial position based on direction
    if (currentTab === routeName) {
      // This is the target tab
      slideAnim.setValue(isGoingRight ? SCREEN_WIDTH : -SCREEN_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (prevTabRef.current === routeName) {
      // This was the previous tab
      Animated.timing(slideAnim, {
        toValue: isGoingRight ? -SCREEN_WIDTH : SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    prevTabRef.current = currentTab;
  }, [currentTab, routeName]);

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ translateX: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

const MainTabs: React.FC = () => {
  const [currentTab, setCurrentTab] = React.useState('Home');

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: false,
      }}
      tabBar={(props) => {
        // Track current tab
        const activeRoute = props.state.routes[props.state.index].name;
        if (activeRoute !== currentTab) {
          setCurrentTab(activeRoute);
        }
        return <BottomNavbar {...props} />;
      }}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      >
        {() => (
          <AnimatedScreen routeName="Home" currentTab={currentTab}>
            <Home />
          </AnimatedScreen>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Search" 
        options={{
          tabBarLabel: 'Tìm kiếm',
        }}
      >
        {() => (
          <AnimatedScreen routeName="Search" currentTab={currentTab}>
            <Search />
          </AnimatedScreen>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Shop" 
        options={{
          tabBarLabel: 'Shop',
        }}
      >
        {() => (
          <AnimatedScreen routeName="Shop" currentTab={currentTab}>
            <Shop />
          </AnimatedScreen>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Messages" 
        options={{
          tabBarLabel: 'Hộp thư',
        }}
      >
        {() => (
          <AnimatedScreen routeName="Messages" currentTab={currentTab}>
            <Messages />
          </AnimatedScreen>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Profile" 
        options={{
          tabBarLabel: 'Hồ sơ',
        }}
      >
        {() => (
          <AnimatedScreen routeName="Profile" currentTab={currentTab}>
            <Profile />
          </AnimatedScreen>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabs;