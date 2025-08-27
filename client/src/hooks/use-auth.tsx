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
      // Skip backend session recovery if user recently logged out (but allow for new logins)
      const recentLogout = localStorage.getItem('recent_logout');
      if (recentLogout) {
        const logoutTime = parseInt(recentLogout);
        const timeSinceLogout = Date.now() - logoutTime;
        if (timeSinceLogout < 3000) { // Reduced to 3 seconds to allow faster new logins
          console.log("⏭️ Skipping backend session check - recent logout detected");
          return false; // Don't remove the logout marker yet
        } else {
          // Remove the logout marker if enough time has passed
          localStorage.removeItem('recent_logout');
        }
      }
      
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
              id: data.user.firebaseUid || `backend-${data.user.id}`,
              email: data.user.email,
              displayName: data.user.fullName || data.user.username,
              photoURL: data.user.avatarUrl,
              fullName: data.user.fullName
            } as any;
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
      
      // Always setup Firebase authentication listener (don't wait for backend session check)
      firebaseUnsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        console.log('🔥 Firebase auth state changed:', firebaseUser ? `User ${firebaseUser.email} signed in` : 'User signed out');
        
        // Clear recent logout on any auth state change to allow immediate new logins
        localStorage.removeItem('recent_logout');
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
                console.log('✅ Firebase user synced with backend:', backendUser.email);
                
                // Create unified user object
                const unifiedUser = {
                  id: firebaseUser.uid,
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                  photoURL: firebaseUser.photoURL,
                  fullName: firebaseUser.displayName
                } as any;
                
                setUser(unifiedUser);
                setIsLoading(false);
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
            console.log('Firebase auth state changed: User signed out - clearing all state');
            
            // Ensure complete state cleanup when Firebase user signs out
            setUser(null);
            setIsLoading(false);
            
            // Clear any residual local storage
            localStorage.removeItem('dotspark_user');
            localStorage.removeItem('dotspark_user_data');
            localStorage.removeItem('dotspark_session_active');
            localStorage.removeItem('auth_timestamp');
            sessionStorage.removeItem('dotspark_temp_auth');
            
            console.log('✅ User state cleared after Firebase signout');
          }
        });
      
      // Also check for existing backend session (but don't block Firebase auth)
      checkBackendSession().catch(error => {
        console.log("Background session check failed:", error);
      });
    }

    return () => {
      firebaseUnsubscribe?.();
    };
  }, []);

  const loginWithGoogle = async () => {
    console.log('🚀 Starting Google login process...');
    
    // Clear any blocking logout markers immediately
    localStorage.removeItem('recent_logout');
    console.log('✅ Cleared recent logout marker');
    
    setIsLoading(true);
    try {
      console.log('📱 Calling Firebase signInWithGoogle...');
      const userCredential = await signInWithGoogle();
      console.log('✅ Firebase sign-in successful:', userCredential.displayName);
      
      // The onAuthStateChanged handler will sync with backend automatically
      console.log('⏳ Waiting for onAuthStateChanged to sync with backend...');
    } catch (error) {
      console.error('❌ Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Bypass login completely removed - Firebase only

  const logout = async () => {
    console.log('🚪 Starting logout process...');
    setIsLoading(true);
    
    try {
      // 1. Clear server-side session first
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('✅ Server session cleared successfully');
        } else {
          console.warn('⚠️ Server logout returned non-200:', response.status);
        }
      } catch (error) {
        console.warn('⚠️ Server logout failed, continuing with client cleanup:', error);
      }
      
      // 2. Clear all local storage and session storage immediately + mark recent logout
      localStorage.removeItem('dotspark_user');
      localStorage.removeItem('dotspark_user_data');
      localStorage.removeItem('dotspark_session_active');
      localStorage.removeItem('auth_timestamp');
      sessionStorage.removeItem('dotspark_temp_auth');
      
      // Mark recent logout to prevent immediate session recovery
      localStorage.setItem('recent_logout', Date.now().toString());
      console.log('✅ Local storage cleared and logout timestamp set');
      
      // 3. Sign out of Firebase (this will trigger onAuthStateChanged)
      await signOut();
      console.log('✅ Firebase signout completed');
      
      // Note: User state will be updated by onAuthStateChanged handler
      // Don't set setIsLoading(false) here - let onAuthStateChanged handle it
      console.log('✅ Logout process completed - waiting for auth state change');
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Force state cleanup even if Firebase logout fails
      setUser(null);
      setIsLoading(false);
      
      // Clear storage as fallback
      try {
        localStorage.removeItem('dotspark_user');
        localStorage.removeItem('dotspark_user_data');
        localStorage.removeItem('dotspark_session_active');
        localStorage.removeItem('auth_timestamp');
        sessionStorage.removeItem('dotspark_temp_auth');
      } catch (storageError) {
        console.error('Failed to clear storage during error cleanup:', storageError);
      }
      
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