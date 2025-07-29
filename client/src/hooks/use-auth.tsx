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

    console.log('Auth initialization - isDemoMode:', isDemoMode);

    // First check backend session status to recover existing sessions
    const checkBackendSession = async (): Promise<boolean> => {
      try {
        console.log('Checking backend session...');
        const response = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        console.log('Backend session response:', response.status);
        if (response.ok) {
          const { authenticated, user } = await response.json();
          console.log('Backend session data:', { authenticated, user: user?.email, fullName: user?.fullName });
          if (authenticated && user) {
            console.log('✓ Backend session recovered for:', user.fullName || user.email);
            setUser(user);
            setIsLoading(false);
            return true; // Session recovered
          } else {
            console.log('Backend session response not authenticated or missing user data');
          }
        } else {
          console.log('Backend session check failed with status:', response.status);
        }
      } catch (error) {
        console.log('No backend session found:', error);
      }
      console.log('No valid backend session - proceeding with fresh auth setup');
      return false; // No session
    };

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
      
      // First try to recover backend session, then setup Firebase
      checkBackendSession().then((sessionRecovered) => {
        // Always setup Firebase authentication regardless of session recovery
        firebaseUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
              console.log('Firebase auth state changed:', `User ${firebaseUser.email} signed in`);
              
              // Sync with backend to establish session
              try {
                const token = await firebaseUser.getIdToken();
                console.log('Syncing Firebase user with backend:', firebaseUser.email);
                const response = await fetch('/api/auth/firebase', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    firebaseToken: token,
                    email: firebaseUser.email,
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL
                  })
                });
                
                if (response.ok) {
                  const userData = await response.json();
                  console.log('Backend session established successfully for:', userData.email, 'with fullName:', userData.fullName);
                  // Set the backend user data instead of Firebase user
                  setUser(userData);
                  
                  // Verify session was established
                  const statusCheck = await fetch('/api/auth/status', { credentials: 'include' });
                  const status = await statusCheck.json();
                  console.log('Session verification after sync:', status);
                } else {
                  const errorData = await response.json();
                  console.error('Failed to establish backend session:', response.status, errorData);
                  setUser(null);
                }
              } catch (error) {
                console.error('Error syncing with backend:', error);
                setUser(null);
              }
            } else {
              console.log('Firebase auth state changed: User signed out');
              // Also logout from backend
              try {
                await fetch('/api/logout', { 
                  method: 'POST', 
                  credentials: 'include' 
                });
              } catch (error) {
                console.log('Backend logout failed:', error);
              }
              setUser(null);
            }
            setIsLoading(false);
          });
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
      const userCredential = await signInWithGoogle();
      // The onAuthStateChanged handler will sync with backend automatically
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