import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = (): void => {
    console.log('Tài khoản:', username);
    console.log('Mật khẩu:', password);
  };

  return (
    <View style={styles.container}>
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

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
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
        <TouchableOpacity>
          <Text style={styles.register}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
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
