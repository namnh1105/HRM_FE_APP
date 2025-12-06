import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';

const Login = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (): Promise<void> => {
    if (!username) return Alert.alert('Lỗi', 'Tài khoản không được bỏ trống');
    if (!password) return Alert.alert('Lỗi', 'Mật khẩu không được bỏ trống');

    setLoading(true);

    try {
      const response = await fetch('https://scrolla.bitoj.io.vn/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login API Response:', data);

      if (!response.ok) {
        Alert.alert('Đăng nhập thất bại', data.message || 'Sai tài khoản hoặc mật khẩu');
        return;
      }

      if (data.success && data.data.accessToken) {
        // Lưu token với key nhất quán với Profile.tsx
        await AsyncStorage.setItem('authToken', data.data.accessToken);

        // Lưu thông tin user nếu có
        if (data.data.user) {
          await AsyncStorage.setItem('userInfo', JSON.stringify(data.data.user));
          console.log('Saved user info:', data.data.user);
        }

        console.log('Login successful, token saved');

        Alert.alert('Đăng nhập thành công', 'Chào mừng bạn đã quay trở lại!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate về MainTabs với Profile tab được chọn
              navigation.navigate('MainTabs', { screen: 'Profile' });
            }
          },
        ]);
      } else {
        Alert.alert('Đăng nhập thất bại', data.message || 'Có lỗi xảy ra trong quá trình đăng nhập');
        console.log('API returned success=false or missing token:', data);
      }
    } catch (error) {
      Alert.alert('Lỗi', `Không thể kết nối đến server.\n${error}`);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigator Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng nhập</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        {/* ...existing code... */}
      <Image
        source={{
          uri: 'https://i.pinimg.com/236x/81/63/78/81637861f1566bb718979b454ce94eed.jpg',
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập tài khoản"
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        value={username}
        onChangeText={setUsername}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Nhập mật khẩu"
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <FontAwesome
            name={showPassword ? 'eye' : 'eye-slash'}
            size={20}
            color={COLORS.TEXT_SECONDARY}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <FontAwesome
          name="facebook-square"
          size={22}
          color="#1877F2"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Tiếp tục với Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Image
          source={{
            uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png',
          }}
          style={styles.iconImage}
          resizeMode="contain"
        />
        <Text style={styles.buttonText}>Tiếp tục với Google</Text>
      </TouchableOpacity>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>Bạn không có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.register}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SECONDARY,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  placeholder: {
    width: 34, // Same width as back button to center the title
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    resizeMode: 'cover',
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
    borderRadius: 120,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    marginBottom: 12,
    color: COLORS.TEXT,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  inputPassword: {
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    color: COLORS.TEXT,
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  loginButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    borderWidth: 1,
    borderColor: COLORS.SECONDARY,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  iconImage: {
    width: 22,
    height: 22,
    position: 'absolute',
    left: 15,
  },
  buttonText: {
    fontSize: 12,
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  icon: {
    position: 'absolute',
    left: 15,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  bottomText: {
    color: COLORS.TEXT_SECONDARY,
  },
  register: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
});
