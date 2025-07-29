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

    // Check if we're in demo/development mode
    const isDemoMode = window.location.search.includes('demo=true') || 
                      window.location.pathname.includes('/test-') ||
                      localStorage.getItem('dotspark_demo_mode') === 'true';

    if (isDemoMode) {
      console.log('Demo mode detected - using authentication bypass');
      // Initialize auth bypass for demo mode
      authBypass.initialize().then(() => {
        bypassUnsubscribe = authBypass.onAuthStateChanged((bypassUser) => {
          setUser(bypassUser);
          setIsLoading(false);
        });
      });
    } else {
      console.log('Production mode detected - using Firebase authentication');
      // Use Firebase authentication for production
      firebaseUnsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          console.log('Firebase auth state changed:', `User ${firebaseUser.email} signed in`);
          setUser(firebaseUser);
        } else {
          console.log('Firebase auth state changed: User signed out');
          setUser(null);
        }
        setIsLoading(false);
      });
    }

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
    // Only allow bypass login in demo mode
    const isDemoMode = window.location.search.includes('demo=true') || 
                      window.location.pathname.includes('/test-') ||
                      localStorage.getItem('dotspark_demo_mode') === 'true';
    
    if (!isDemoMode) {
      throw new Error('Bypass authentication only available in demo mode');
    }

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