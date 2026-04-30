import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Dashboard,
  LeaveRequest,
  Attendance,
  Notifications,
  Profile,
  EmployeeList,
  Reports,
} from '../screens';
import BottomNavbar from '../components/BottomNavbar';

import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  const { roles } = useSelector((state: RootState) => state.auth);
  const isManager = roles.includes('MANAGER');

  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavbar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      
      {isManager ? (
        <>
          <Tab.Screen name="Employees" component={EmployeeList} /> 
        </>
      ) : (
        <Tab.Screen name="LeaveRequest" component={LeaveRequest} />
      )}

      <Tab.Screen name="Attendance" component={Attendance} />

      {isManager ? (
        <Tab.Screen name="Payroll" component={Salary} />
      ) : (
        <Tab.Screen name="Notifications" component={Notifications} />
      )}

      {isManager && <Tab.Screen name="Reports" component={Reports} />}
      
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default MainTabs;