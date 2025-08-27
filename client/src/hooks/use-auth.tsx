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

    // Check for existing backend session and sync with frontend
    const checkBackendSession = async (): Promise<boolean> => {
      try {
        console.log("Checking for existing backend session...");
        const response = await fetch("/api/auth/session-check", {
          method: "GET",
          credentials: "include", // Important: include cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            console.log("✅ Found existing backend session for user:", data.user.email || data.user.username);
            // Create a user object compatible with frontend auth
            const backendUser = {
              uid: data.user.firebaseUid || `backend-${data.user.id}`,
              id: data.user.id, // Use the backend user ID directly
              email: data.user.email,
              displayName: data.user.fullName || data.user.username,
              photoURL: data.user.avatarUrl,
              fullName: data.user.fullName
            } as any;
            console.log('✅ Setting user from backend session:', { id: backendUser.id, email: backendUser.email });
            setUser(backendUser);
            setIsLoading(false);
            return true;
          }
        }
        
        console.log("No existing backend session found");
        return false;
      } catch (error) {
        console.log("Backend session check failed:", error);
        return false;
      }
    };

    // Always use Firebase authentication - no demo mode
    {
      console.log('Production mode detected - using Firebase authentication');
      
      // Always setup Firebase listener, but check backend session first
      checkBackendSession().then((sessionRecovered) => {
        // Setup Firebase authentication for new logins regardless of session recovery
        // This ensures proper sync between Firebase and backend
        firebaseUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            console.log('Firebase auth state changed:', `User ${firebaseUser.email} signed in`);
            
            try {
              // Sync Firebase user with backend
              const response = await fetch('/api/auth/firebase', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                }),
              });

              if (response.ok) {
                const backendUser = await response.json();
                console.log('✅ Firebase user synced with backend:', backendUser.user?.email || backendUser.email);
                
                // Use the backend user ID instead of Firebase UID for consistency
                const unifiedUser = {
                  id: backendUser.user?.id || backendUser.id,
                  uid: firebaseUser.uid,
                  email: backendUser.user?.email || backendUser.email,
                  displayName: firebaseUser.displayName || backendUser.user?.fullName || firebaseUser.email?.split('@')[0],
                  photoURL: firebaseUser.photoURL || backendUser.user?.avatar,
                  fullName: backendUser.user?.fullName || firebaseUser.displayName
                } as any;
                
                console.log('✅ Setting unified user:', { id: unifiedUser.id, email: unifiedUser.email });
                setUser(unifiedUser);
                setIsLoading(false);

                // Verify session is active after sync
                setTimeout(async () => {
                  try {
                    const sessionCheck = await fetch('/api/auth/session-check', { credentials: 'include' });
                    const sessionData = await sessionCheck.json();
                    console.log('Session verification after Firebase sync:', sessionData);
                  } catch (err) {
                    console.log('Session verification failed:', err);
                  }
                }, 1000);
              } else {
                console.error('Failed to sync Firebase user with backend');
                setUser(null);
                setIsLoading(false);
              }
            } catch (error) {
              console.error('Firebase backend sync error:', error);
              setUser(null);
              setIsLoading(false);
            }
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