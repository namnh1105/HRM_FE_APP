import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuthContext } from '../context/AuthContext';

const PRIMARY_BUTTON_COLOR = '#333333';
const GOOGLE_BUTTON_COLOR = '#F7F7F7';
const FACEBOOK_BUTTON_COLOR = '#1877F2';

const SignUp = ({ navigation }: any) => {
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithGoogle, user } = useAuthContext();

  // Navigate to MainTabs when user is authenticated
  React.useEffect(() => {
    if (user) {
      navigation.navigate("MainTabs");
    }
  }, [user, navigation]);

  // NORMAL SIGN UP
  const handleSignUp = async () => {
    if (!givenName || !familyName || !username || !password || !confirmPassword)
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");

    if (password !== confirmPassword)
      return Alert.alert("Lỗi", "Mật khẩu không trùng khớp");

    setLoading(true);

    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, givenName, familyName, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return Alert.alert(
          "Đăng ký thất bại",
          `Status: ${res.status}\nError: ${data.error}\nMessage: ${data.message}`
        );
      }

      Alert.alert("Thành công", "Đăng ký thành công!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng kí vào Scrolla</Text>

      <View style={styles.formContainer}>
        <TextInput style={styles.input} value={givenName} onChangeText={setGivenName} placeholder="Tên" />
        <TextInput style={styles.input} value={familyName} onChangeText={setFamilyName} placeholder="Họ" />
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Tên đăng nhập" />
        <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Mật khẩu" />
        <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Xác nhận mật khẩu" />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: PRIMARY_BUTTON_COLOR, opacity: loading ? 0.6 : 1 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng kí</Text>}
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
    </View>
  );
};

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 35, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, marginBottom: 30, textAlign: "center", fontWeight: "600" },
  formContainer: { marginBottom: 30 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 15, borderRadius: 5, marginBottom: 10 },
  button: { padding: 15, borderRadius: 5, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  socialButton: { padding: 15, borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  socialButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 10 },
  googleIcon: { width: 24, height: 24, marginRight: 10 },
  socialIcon: { width: 24, height: 24, marginRight: 10 },
});

export default SignUp;
