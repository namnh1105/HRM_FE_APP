import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';

type SignUpProps = {
  navigation: any;
};

export const SignUp: React.FC<SignUpProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username) return Alert.alert('Error', 'Username không được bỏ trống');
    if (!givenName) return Alert.alert('Error', 'Tên không được bỏ trống');
    if (!familyName) return Alert.alert('Error', 'Họ không được bỏ trống');
    if (!password) return Alert.alert('Error', 'Password không được bỏ trống');
    if (!confirmPassword) return Alert.alert('Error', 'Xác nhận mật khẩu không được bỏ trống');
    if (password !== confirmPassword) return Alert.alert('Error', 'Xác nhận mật khẩu không khớp');

    setLoading(true);

    try {
      const response = await fetch('https://your-api.com/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, givenName, familyName, password }),
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Đăng ký thành công!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      Alert.alert('Error', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Given Name<Text style={styles.required}>(*)</Text></Text>
        <TextInput style={styles.input} value={givenName} onChangeText={setGivenName} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Family Name<Text style={styles.required}>(*)</Text></Text>
        <TextInput style={styles.input} value={familyName} onChangeText={setFamilyName} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password<Text style={styles.required}>(*)</Text></Text>
        <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password<Text style={styles.required}>(*)</Text></Text>
        <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username<Text style={styles.required}>(*)</Text></Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button title={loading ? 'Signing Up...' : 'Sign Up'} onPress={handleSignUp} disabled={loading} />
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Bạn đã có tài khoản? </Text>
        <Text style={styles.loginLink}  onPress={() => navigation.navigate('Login')}>
          Đăng nhập
        </Text>
      </View>

      <Text style={styles.hint}>Các mục chứa (*) không được bỏ trống</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    marginTop: 50,
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    flexDirection: 'row',
  },
  required: {
    color: 'red',
    fontSize: 12,
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 5,
  },
  buttonWrapper: {
    marginTop: 15,
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  loginText: {
    fontSize: 14,
    color: '#555',
  },
  loginLink: {
    fontSize: 14,
    color: '#fe2c55',
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '##fe2c55',
    textAlign: 'center',
    marginBottom: 25,
  },
});
