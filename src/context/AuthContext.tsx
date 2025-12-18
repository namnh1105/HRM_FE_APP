import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { logout } from '../store/slices/authSlice';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

interface AuthContextType {
  user: GoogleUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  const { promptAsync } = useGoogleAuth({
    onSuccess: async (googleUser) => {
      // Lưu user vào state
      setUser(googleUser);
      // Đồng bộ với AsyncStorage để Profile có thể đọc được
      await AsyncStorage.setItem('userInfo', JSON.stringify(googleUser));
    },
    onError: (error) => {
      console.error('Google auth error:', error);
    }
  });

  // Check for existing user session on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userInfo');
        const authToken = await AsyncStorage.getItem('authToken');
        if (storedUser && authToken) {
          const userData: GoogleUser = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const handleSignInWithGoogle = () => {
    promptAsync();
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      // Clear AsyncStorage first
      await AsyncStorage.multiRemove(['authToken', 'userInfo', 'refreshToken']);
      // Dispatch logout action
      dispatch(logout());
      // Clear local state
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
