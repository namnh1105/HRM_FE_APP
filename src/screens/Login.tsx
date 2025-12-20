import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthLogin } from '../hooks';
import { useAuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';
import LoadingIndicator from '../components/LoadingIndicator';

const PRIMARY_BUTTON_COLOR = '#333333';
const GOOGLE_BUTTON_COLOR = '#F7F7F7';
const FACEBOOK_BUTTON_COLOR = '#1877F2';

const Login = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
  });

  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    handleLogin,
  } = useAuthLogin(navigation);

  const { signInWithGoogle, user } = useAuthContext();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Close modal when authenticated - RootNavigator will handle navigation
  React.useEffect(() => {
    if (user) {
      navigation.goBack();
    }
  }, [user, navigation]);

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const onLoginPress = async () => {
    try {
      await handleLogin();
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Đăng nhập thất bại',
        message: error?.message || 'Vui lòng kiểm tra lại thông tin đăng nhập',
        type: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Close button */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="logo-youtube" size={60} color="#FF6B6B" />
            <Text style={styles.logoText}>Scrolla</Text>
          </View>

          <Text style={styles.title}>Đăng nhập vào Scrolla</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Tên đăng nhập"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { opacity: isLoading ? 0.6 : 1 }]}
            onPress={onLoginPress}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <LoadingIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={signInWithGoogle}
            activeOpacity={0.8}
          >
            <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={() => setAlertConfig({
              visible: true,
              title: 'Thông báo',
              message: 'Tính năng đăng nhập Facebook sẽ sớm được hỗ trợ',
              type: 'info',
            })}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-facebook" size={24} color="#fff" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Tiếp tục với Facebook</Text>
          </TouchableOpacity>

          <View style={styles.bottom}>
            <Text style={styles.bottomText}>Bạn chưa có tài khoản? </Text>
            <TouchableOpacity onPress={navigateToSignUp} activeOpacity={0.7}>
              <Text style={styles.register}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 35,
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  title: { 
    fontSize: 24, 
    marginBottom: 30, 
    textAlign: "center", 
    fontWeight: "700",
    color: '#333',
  },
  formContainer: { 
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  button: { 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: PRIMARY_BUTTON_COLOR,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 17, 
    fontWeight: "700"
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  socialButton: { 
    padding: 15, 
    borderRadius: 12, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  googleButton: {
    backgroundColor: GOOGLE_BUTTON_COLOR,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  facebookButton: {
    backgroundColor: FACEBOOK_BUTTON_COLOR,
  },
  socialButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600",
  },
  googleIcon: { 
    width: 24, 
    height: 24, 
    marginRight: 10 
  },
  socialIcon: { 
    marginRight: 10,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  bottomText: {
    color: '#666',
    fontSize: 15,
  },
  register: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 15,
  },
});
