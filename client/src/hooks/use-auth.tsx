import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, signInWithGoogle, signOut } from '@/lib/auth-simple';
import { User } from 'firebase/auth';
// Bypass authentication completely removed

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let firebaseUnsubscribe: (() => void) | null = null;
    let bypassUnsubscribe: (() => void) | null = null;

    // Check if we're in demo/development mode - DISABLED for production
    const isDemoMode = false; // Force production mode for all users
    
    // Demo mode completely removed

    console.log('Auth initialization - isDemoMode:', isDemoMode);

    // Simplified auth - always trust Firebase authentication
    const checkBackendSession = async (): Promise<boolean> => {
      // Skip backend session checks - Firebase handles authentication
      return false;
    };

    // Always use Firebase authentication - no demo mode
    {
      console.log('Production mode detected - using Firebase authentication');
      
      // First try to recover backend session, then setup Firebase
      checkBackendSession().then((sessionRecovered) => {
        // Firebase authentication only - no backend session dependency
        firebaseUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            console.log('Firebase auth state changed:', `User ${firebaseUser.email} signed in`);
            
            // Create user object directly from Firebase - no backend sync needed
            const unifiedUser = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
              photoURL: firebaseUser.photoURL,
              fullName: firebaseUser.displayName
            };
            
            console.log('✅ Firebase user authenticated:', unifiedUser.email);
            setUser(unifiedUser);
            setIsLoading(false);
          } else {
            console.log('Firebase auth state changed: User signed out');
            setUser(null);
            setIsLoading(false);
          }
        });
      });
    }

    return () => {
      firebaseUnsubscribe?.();
    };
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      // The onAuthStateChanged handler will sync with backend automatically
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Bypass login completely removed - Firebase only

  const logout = async () => {
    setIsLoading(true);
    try {
      // Firebase logout only
      await signOut();
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