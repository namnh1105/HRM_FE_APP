import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { logout } from '../store/slices/authSlice';
import { performCompleteLogout } from '../store';
import { RootState } from '../store';

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
  const reduxAuth = useSelector((state: RootState) => state.auth);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sync with Redux store (but not during logout)
  useEffect(() => {
    if (isLoggingOut) {
      console.log('[AuthContext] Skipping Redux sync during logout');
      return;
    }
    
    console.log('[AuthContext] Redux auth state changed:', {
      isAuthenticated: reduxAuth.isAuthenticated,
      hasUser: !!reduxAuth.user,
      username: reduxAuth.user?.username,
    });
    
    if (reduxAuth.isAuthenticated && reduxAuth.user) {
      // Convert Redux user to GoogleUser format if needed
      const googleUser: GoogleUser = {
        id: reduxAuth.user.id,
        email: '', // Redux user doesn't have email
        name: reduxAuth.user.givenName + ' ' + reduxAuth.user.familyName,
        picture: '', // Redux user doesn't have picture
        given_name: reduxAuth.user.givenName,
        family_name: reduxAuth.user.familyName,
      };
      setUser(googleUser);
    } else {
      setUser(null);
    }
  }, [reduxAuth.isAuthenticated, reduxAuth.user, isLoggingOut]);

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

  // Check for existing user session on app start (still needed for initial load)
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        console.log('[AuthContext] Checking initial auth state...');
        const storedUser = await AsyncStorage.getItem('userInfo');
        const authToken = await AsyncStorage.getItem('authToken');
        
        console.log('[AuthContext] Initial check:', {
          hasStoredUser: !!storedUser,
          hasToken: !!authToken,
        });
        
        if (storedUser && authToken) {
          const userData: GoogleUser = JSON.parse(storedUser);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error checking auth state:', error);
        setUser(null);
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
      console.log('[AuthContext] Starting sign out...');
      
      // Set logout flag to prevent Redux sync from restoring user
      setIsLoggingOut(true);
      
      // 1. Dispatch logout action to Redux first
      dispatch(logout());
      
      // 2. Clear local state
      setUser(null);
      
      // 3. Perform complete logout
      await performCompleteLogout();
      
      console.log('[AuthContext] Sign out completed successfully');
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
      // Even if there's an error, ensure state is cleared
      setUser(null);
      dispatch(logout());
      throw error;
    } finally {
      // Reset logout flag after a delay to allow state to settle
      setTimeout(() => setIsLoggingOut(false), 500);
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
