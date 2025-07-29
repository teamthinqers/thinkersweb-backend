import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, signInWithGoogle, signOut } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { authBypass, type BypassUser } from '@/lib/authBypass';

interface AuthContextType {
  user: User | BypassUser | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithBypass: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithGoogle: async () => {},
  loginWithBypass: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | BypassUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let firebaseUnsubscribe: (() => void) | null = null;
    let bypassUnsubscribe: (() => void) | null = null;

    // Initialize auth bypass first
    authBypass.initialize().then(() => {
      // Listen for bypass auth changes
      bypassUnsubscribe = authBypass.onAuthStateChanged((bypassUser) => {
        if (bypassUser) {
          console.log('Auth bypass state changed:', `User ${bypassUser.email} signed in`);
          setUser(bypassUser);
          setIsLoading(false);
        } else if (!user) {
          // Only set to null if no Firebase user exists
          setUser(null);
          setIsLoading(false);
        }
      });

      // Listen for Firebase authentication state changes
      firebaseUnsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          console.log('Firebase auth state changed:', `User ${firebaseUser.email} signed in`);
          setUser(firebaseUser);
        } else if (!authBypass.getCurrentUser()) {
          // Only set to null if no bypass user exists
          console.log('Firebase auth state changed: User signed out');
          setUser(null);
        }
        setIsLoading(false);
      });
    });

    return () => {
      firebaseUnsubscribe?.();
      bypassUnsubscribe?.();
    };
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithBypass = async () => {
    setIsLoading(true);
    try {
      await authBypass.signIn();
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Bypass login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Sign out from both Firebase and bypass
      await Promise.all([
        signOut().catch(() => {}), // Don't fail if Firebase signout fails
        authBypass.signOut().catch(() => {}) // Don't fail if bypass signout fails
      ]);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    loginWithGoogle,
    loginWithBypass,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}