import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import MainTabs from './MainTabs';
import { SignUp, Login } from '../screens';

const Stack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
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
      {/* Main app stack */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Auth screens */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
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
