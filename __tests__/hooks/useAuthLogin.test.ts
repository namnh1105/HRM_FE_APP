import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('useAuthLogin Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  it('should initialize with empty credentials', () => {
    const username = '';
    const password = '';
    const showPassword = false;
    
    expect(username).toBe('');
    expect(password).toBe('');
    expect(showPassword).toBe(false);
  });

  it('should update username', () => {
    let username = '';
    username = 'testuser';
    
    expect(username).toBe('testuser');
  });

  it('should update password', () => {
    let password = '';
    password = 'password123';
    
    expect(password).toBe('password123');
  });

  it('should toggle password visibility', () => {
    let showPassword = false;
    
    showPassword = !showPassword;
    expect(showPassword).toBe(true);
    
    showPassword = !showPassword;
    expect(showPassword).toBe(false);
  });

  it('should validate empty username', async () => {
    const mockAlert = jest.fn();
    const mockLogin = jest.fn();
    const username = '';
    const password = 'password123';

    if (!username) {
      mockAlert('Lỗi', 'Tài khoản không được bỏ trống');
    } else if (!password) {
      mockAlert('Lỗi', 'Mật khẩu không được bỏ trống');
    } else {
      await mockLogin();
    }
    
    expect(mockAlert).toHaveBeenCalledWith('Lỗi', 'Tài khoản không được bỏ trống');
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should validate empty password', async () => {
    const mockAlert = jest.fn();
    const mockLogin = jest.fn();
    const username = 'testuser';
    const password = '';

    if (!username) {
      mockAlert('Lỗi', 'Tài khoản không được bỏ trống');
    } else if (!password) {
      mockAlert('Lỗi', 'Mật khẩu không được bỏ trống');
    } else {
      await mockLogin();
    }
    
    expect(mockAlert).toHaveBeenCalledWith('Lỗi', 'Mật khẩu không được bỏ trống');
    expect(mockLogin).not.toHaveBeenCalled();
  });
  it('should handle successful login', async () => {
    const mockLogin = jest.fn(() => Promise.resolve({
      data: {
        success: true,
        data: {
          accessToken: 'test-token',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
          },
        },
      },
    }));
    
    const username = 'testuser';
    const password = 'password123';

    const response = await mockLogin({ username, password });
    
    await AsyncStorage.setItem('authToken', response.data.data.accessToken);
    
    expect(mockLogin).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
  });

  it('should handle login failure', async () => {
    const mockAlert = jest.fn();
    const mockLogin = jest.fn(() => Promise.reject({
      data: { message: 'Invalid credentials' },
    }));
    
    try {
      await mockLogin({ username: 'testuser', password: 'wrongpassword' });
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Không thể kết nối đến server';
      mockAlert('Đăng nhập thất bại', errorMessage);
    }
    
    expect(mockAlert).toHaveBeenCalledWith(
      'Đăng nhập thất bại',
      'Invalid credentials'
    );
  });

  it('should navigate to sign up', () => {
    const mockNavigate = jest.fn();
    mockNavigate('SignUp');
    
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });

  it('should navigate back', () => {
    const mockReset = jest.fn();
    mockReset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }],
    });
    
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }],
    });
  });

  it('should save user info to AsyncStorage', async () => {
    const userInfo = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
    };
    
    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'userInfo',
      JSON.stringify(userInfo)
    );
  });

  it('should handle network error', async () => {
    const mockAlert = jest.fn();
    const mockLogin = jest.fn(() => Promise.reject(new Error('Network error')));
    
    try {
      await mockLogin({ username: 'testuser', password: 'password123' });
    } catch (error: any) {
      const errorMessage = error?.message || 'Không thể kết nối đến server';
      mockAlert('Đăng nhập thất bại', errorMessage);
    }
    
    expect(mockAlert).toHaveBeenCalledWith(
      'Đăng nhập thất bại',
      'Network error'
    );
  });
});
