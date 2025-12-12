import React, { useState, useEffect } from 'react';
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

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyDNcEObCdau80DEjD8Y0cJcp11VwO3AQBY",
  authDomain: "scrollaapp-5133b.firebaseapp.com",
  projectId: "scrollaapp-5133b",
  storageBucket: "scrollaapp-5133b.firebasestorage.app",
  messagingSenderId: "992738352132",
  appId: "1:992738352132:ios:a716172babfb40ade7e951",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

  // GOOGLE LOGIN
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: "992738352132-msog5kfv8ljbrh67l78s68ivilaine5l.apps.googleusercontent.com",
    androidClientId: "992738352132-oruq3t0u9o1omve5invjgl1np85j60el.apps.googleusercontent.com",
    webClientId: "992738352132-t6o4p03gjnvlh31jhjvrp6cpjkjvc8o2.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (!idToken) return Alert.alert("Lỗi", "Không lấy được Google ID Token");

      const credential = GoogleAuthProvider.credential(idToken);

      signInWithCredential(auth, credential)
        .then((userCredential) => {
          Alert.alert("Thành công", `Xin chào: ${userCredential.user.displayName}`);
          navigation.navigate("MainTabs");
        })
        .catch((err) => Alert.alert("Firebase Error", err.message));
    }
  }, [response]);

  // NORMAL SIGN UP
  const handleSignUp = async () => {
    if (!givenName || !familyName || !username || !password || !confirmPassword)
      return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");

    if (password !== confirmPassword)
      return Alert.alert("Lỗi", "Mật khẩu không trùng khớp");

    setLoading(true);

    try {
      const res = await fetch("https://scrolla.bitoj.io.vn/api/v1/auth/register", {
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
        onPress={() => promptAsync()}
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
  socialButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 15, borderRadius: 5, marginBottom: 15 },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  socialIcon: { width: 20, height: 20, marginRight: 10, tintColor: "#fff" },
  socialButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default SignUp;
