import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import MainTabs from './MainTabs';
import {
  Login,
  SignUp,
  ForgotPassword,
  CreateLeaveRequest,
  AttendanceHistory,
  Salary,
  WorkSchedule,
} from '../screens';

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
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main app with bottom tabs */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Auth screens */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

      {/* HRM detail screens */}
      <Stack.Screen name="CreateLeaveRequest" component={CreateLeaveRequest} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
      <Stack.Screen name="Salary" component={Salary} />
      <Stack.Screen name="WorkSchedule" component={WorkSchedule} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default RootNavigator;
