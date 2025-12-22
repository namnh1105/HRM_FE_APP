import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
const logoImage = require('../../assets/logo.jpg');
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';
import LoadingIndicator from '../components/LoadingIndicator';

const PRIMARY_BUTTON_COLOR = '#6B4CE6';
const GOOGLE_BUTTON_COLOR = '#F7F7F7';
const FACEBOOK_BUTTON_COLOR = '#1877F2';

const SignUp = ({ navigation }: any) => {
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
  });

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

  // NORMAL SIGN UP
  const handleSignUp = async () => {
    if (!givenName || !familyName || !username || !password || !confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Vui lòng nhập đầy đủ thông tin',
        type: 'warning',
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Mật khẩu không trùng khớp',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, givenName, familyName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlertConfig({
          visible: true,
          title: 'Đăng ký thất bại',
          message: data.message || `Lỗi: ${res.status}`,
          type: 'error',
        });
        return;
      }

      setAlertConfig({
        visible: true,
        title: 'Thành công',
        message: 'Đăng ký thành công! Hãy đăng nhập để tiếp tục.',
        type: 'success',
      });
      
      setTimeout(() => {
        navigation.navigate("Login");
      }, 1500);
    } catch {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không thể kết nối server',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color="#333" />
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
              <Image source={logoImage} style={styles.logoImage} />
              <Text style={styles.logoText}>Scrolla</Text>
            </View>

            <Text style={styles.title}>Đăng kí vào Scrolla</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={givenName} 
                  onChangeText={setGivenName} 
                  placeholder="Tên" 
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={familyName} 
                  onChangeText={setFamilyName} 
                  placeholder="Họ" 
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="at-outline" size={20} color="#666" style={styles.inputIcon} />
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
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  secureTextEntry 
                  value={confirmPassword} 
                  onChangeText={setConfirmPassword} 
                  placeholder="Xác nhận mật khẩu" 
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { opacity: loading ? 0.6 : 1 }]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <LoadingIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Đăng ký</Text>
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
          </Animated.View>
        </ScrollView>
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

// STYLES
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 35,
    paddingTop: 80,
    paddingBottom: 30,
  },
  contentContainer: {
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  title: { 
    fontSize: 24, 
    marginBottom: 25, 
    textAlign: "center", 
    fontWeight: "700",
    color: '#333',
  },
  formContainer: { 
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
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
    marginVertical: 20,
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
});

export default SignUp;
