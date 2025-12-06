import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const Profile = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      checkAuthenticationStatus();
    }, [])
  );

  const checkAuthenticationStatus = async () => {
    try {
      // Check for auth token
      const authToken = await AsyncStorage.getItem('authToken');

      if (!authToken) {
        setIsAuthenticated(false);
        setLoading(false);
        // Don't auto-redirect, let user choose to login
        return;
      }

      // If token exists, get user info
      const userInfoString = await AsyncStorage.getItem('userInfo');
      if (userInfoString) {
        const userData = JSON.parse(userInfoString);
        setUserInfo(userData);
      }

      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setLoading(false);
      // Don't auto-redirect on error, let user choose to login
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all auth data
              await AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']);

              // Navigate to Login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
            }
          },
        },
      ],
    );
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang kiểm tra đăng nhập...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If not authenticated, show login option
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.notAuthContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>?</Text>
            </View>
            <Text style={styles.title}>Chưa đăng nhập</Text>
            <Text style={styles.description}>
              Bạn cần đăng nhập để sử dụng tính năng này
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show profile content for authenticated users
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>

      </View>

      <View style={styles.content}>
        {userInfo ? (
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userInfo.givenName ? userInfo.givenName[0].toUpperCase() : 'U'}
              </Text>
            </View>

            <Text style={styles.userName}>
              {userInfo.givenName} {userInfo.familyName}
            </Text>

            <Text style={styles.userEmail}>
              {userInfo.username || userInfo.email}
            </Text>
          </View>
        ) : (
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>U</Text>
            </View>
            <Text style={styles.userName}>Người dùng</Text>
          </View>
        )}

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Thông tin cá nhân</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Cài đặt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Hỗ trợ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Điều khoản sử dụng</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    marginBottom: 10,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    minWidth: 150,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;
