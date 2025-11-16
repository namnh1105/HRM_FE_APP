import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

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

  const handleSignUp = async () => {
    if (!givenName || !familyName || !username || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Xác nhận mật khẩu không khớp');
    }
    
    setLoading(true);

    try {
      const response = await fetch('https://scrolla.bitoj.io.vn/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, givenName, familyName, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Đăng ký Thất bại',
          `Trạng thái: ${response.status}\nLỗi: ${data.error || 'Không rõ'}\nThông báo: ${data.message || 'Không có thông báo'}`
        );
        return;
      }

      if (data.success) {
        Alert.alert('Thành công', 'Đăng ký thành công!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Lỗi', data.message || 'Đăng ký thất bại');
      }

    } catch (error) {
      Alert.alert('Lỗi', `Không thể kết nối đến server.\n${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
   // Alert.alert('Thông báo', `Bạn chọn Đăng nhập với ${provider}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng kí vào Scrolla</Text>

      <View style={styles.formContainer}>
        <TextInput style={styles.input} value={givenName} onChangeText={setGivenName} placeholder="Tên" />
        <TextInput style={styles.input} value={familyName} onChangeText={setFamilyName} placeholder="Họ" />
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Tên đăng nhập" autoCapitalize="none" />
        <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Mật khẩu" />
        <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Xác nhận mật khẩu" />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: PRIMARY_BUTTON_COLOR, opacity: loading ? 0.7 : 1 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Đăng kí</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: GOOGLE_BUTTON_COLOR, borderColor: '#ccc', borderWidth: 1 }]}
              onPress={() => handleSocialSignIn('Google')}
              disabled={loading}
          >
              <Image 
                  source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
                  style={styles.googleIcon} 
              />
              <Text style={[styles.socialButtonText, { color: '#333' }]}>Continue with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: FACEBOOK_BUTTON_COLOR }]}
              onPress={() => handleSocialSignIn('Facebook')}
              disabled={loading}
          >
              <Image 
                  source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png' }} 
                  style={styles.socialIcon} 
              />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 35, 
    justifyContent: 'center', 
    backgroundColor: '#ffffff'
  },
  title: { 
    fontSize: 22, 
    marginBottom: 30, 
    textAlign: 'center', 
    fontWeight: '600', 
    color: '#333' 
  },
  formContainer: {
    marginBottom: 30, 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 15, 
    borderRadius: 5, 
    marginBottom: 10, 
    fontSize: 14 
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    height: 50,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialButtonsContainer: {
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15, 
    height: 50,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#ffffff'
  },
  googleIcon: { 
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialButtonText: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#ffffff',
  }
});

export default SignUp;