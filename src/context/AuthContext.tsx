import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

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
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  const { promptAsync } = useGoogleAuth({
    onSuccess: (googleUser) => {
      setUser(googleUser);
    },
    onError: (error) => {
      console.error('Google auth error:', error);
    }
  });

  // Check for existing user session on app start
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('google_user');
        const accessToken = await AsyncStorage.getItem('access_token');

        if (storedUser && accessToken) {
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
      await AsyncStorage.multiRemove(['google_user', 'access_token']);
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
