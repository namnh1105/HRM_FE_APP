import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthLogin } from '../hooks';
import { useAuthContext } from '../context/AuthContext';

const PRIMARY_BUTTON_COLOR = '#333333';
const GOOGLE_BUTTON_COLOR = '#F7F7F7';
const FACEBOOK_BUTTON_COLOR = '#1877F2';

const Login = ({ navigation }: any) => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    handleLogin,
  } = useAuthLogin(navigation);

  const { signInWithGoogle, user } = useAuthContext();

  // Close modal when authenticated - RootNavigator will handle navigation
  React.useEffect(() => {
    if (user) {
      navigation.goBack();
    }
  }, [user, navigation]);

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Close button */}
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Đăng nhập vào Scrolla</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Tên đăng nhập"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Mật khẩu"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: PRIMARY_BUTTON_COLOR, opacity: isLoading ? 0.6 : 1 }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: GOOGLE_BUTTON_COLOR, borderWidth: 1, borderColor: '#ccc' }]}
        onPress={signInWithGoogle}
      >
        <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={styles.googleIcon} />
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.socialButton, { backgroundColor: FACEBOOK_BUTTON_COLOR }]}
        onPress={() => Alert.alert("Chưa hỗ trợ Facebook")}
      >
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png' }} style={styles.socialIcon} />
        <Text style={styles.socialButtonText}>Continue with Facebook</Text>
      </TouchableOpacity>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>Bạn chưa có tài khoản? </Text>
        <TouchableOpacity onPress={navigateToSignUp}>
          <Text style={styles.register}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 35, 
    justifyContent: "center", 
    backgroundColor: "#fff" 
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  title: { 
    fontSize: 22, 
    marginBottom: 30, 
    textAlign: "center", 
    fontWeight: "600" 
  },
  formContainer: { 
    marginBottom: 30 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    padding: 15, 
    borderRadius: 5, 
    marginBottom: 10 
  },
  button: { 
    padding: 15, 
    borderRadius: 5, 
    alignItems: "center", 
    marginBottom: 20 
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  socialButton: { 
    padding: 15, 
    borderRadius: 5, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 10 
  },
  socialButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600", 
    marginLeft: 10 
  },
  googleIcon: { 
    width: 24, 
    height: 24, 
    marginRight: 10 
  },
  socialIcon: { 
    width: 24, 
    height: 24, 
    marginRight: 10 
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  bottomText: {
    color: '#666',
    fontSize: 14,
  },
  register: {
    color: PRIMARY_BUTTON_COLOR,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
