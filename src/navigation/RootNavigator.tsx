import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import MainTabs from './MainTabs';
import { SignUp, Login, UserProfile, ChatRoom, FollowList, AddVideo, UploadDraft } from '../screens';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    // Give time for auth state to restore from AsyncStorage
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main app stack - always available */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Stack screens - có nút back, không có bottom navbar */}
      <Stack.Screen name="AddVideo" component={AddVideo} />
      <Stack.Screen name="UploadDraft" component={UploadDraft} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="FollowList" component={FollowList} />
      
      {/* Modal screens - có thể swipe down để đóng */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default RootNavigator;
