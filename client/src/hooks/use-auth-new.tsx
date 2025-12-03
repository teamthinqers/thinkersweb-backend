import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth as firebaseAuth, signInWithGoogle as firebaseSignInWithGoogle, signOut as firebaseSignOut } from "@/lib/firebase";
import { apiRequest, queryClient } from "@/lib/queryClient";

// User type matching backend
export interface User {
  id: number;
  username: string;
  email: string;
  firebaseUid?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  bio?: string | null;
  aboutMe?: string | null;
  linkedinHeadline?: string | null;
  linkedinProfileUrl?: string | null;
  linkedinPhotoUrl?: string | null;
  cognitiveIdentityPublic?: boolean;
  hasCognitiveIdentity?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get stored user from localStorage
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem('dotspark_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
      if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
      return parsed;
    }
  } catch (e) {
    console.error('Error reading stored user:', e);
  }
  return null;
};

// Helper to store user in localStorage
const storeUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem('dotspark_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dotspark_user');
    }
  } catch (e) {
    console.error('Error storing user:', e);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user from Firebase to backend
  const syncUserWithBackend = useCallback(async (fbUser: FirebaseUser): Promise<User | null> => {
    try {
      const idToken = await fbUser.getIdToken();
      
      const response = await apiRequest('POST', '/api/auth/login', {
        idToken,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          // Ensure avatarUrl is set from multiple sources
          const userData: User = {
            ...data.user,
            avatarUrl: data.user.avatarUrl || data.user.avatar || fbUser.photoURL,
            avatar: data.user.avatar || fbUser.photoURL,
          };
          storeUser(userData);
          return userData;
        }
      }
      return null;
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
      return null;
    }
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log("🔐 Setting up Firebase auth listener...");
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      console.log("🔄 Firebase auth state changed:", fbUser?.email || 'null');
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        // User is signed in with Firebase
        setIsLoading(true);
        
        // First, check localStorage for cached user data
        const storedUser = getStoredUser();
        if (storedUser && storedUser.firebaseUid === fbUser.uid) {
          console.log("✅ Using cached user data for:", storedUser.email);
          setUser(storedUser);
          setIsLoading(false);
          
          // Invalidate ALL user-dependent queries so they refetch with auth token
          console.log("🔄 Invalidating ALL queries after auth restore...");
          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey[0];
              if (typeof key !== 'string') return false;
              return key.startsWith('/api/thinq-circles') ||
                     key.startsWith('/api/cognitive-identity') ||
                     key.startsWith('/api/dashboard') ||
                     key.startsWith('/api/me') ||
                     key.startsWith('/api/users');
            }
          });
          
          // Sync with backend in background (don't block UI)
          syncUserWithBackend(fbUser).then((syncedUser) => {
            if (syncedUser) {
              setUser(syncedUser);
            }
          });
        } else {
          // No cached data or different user, sync with backend
          console.log("🔄 Syncing user with backend...");
          const syncedUser = await syncUserWithBackend(fbUser);
          if (syncedUser) {
            setUser(syncedUser);
            // Invalidate ALL user-dependent queries so they refetch with auth token
            console.log("🔄 Invalidating ALL queries after backend sync...");
            queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0];
                if (typeof key !== 'string') return false;
                return key.startsWith('/api/thinq-circles') ||
                       key.startsWith('/api/cognitive-identity') ||
                       key.startsWith('/api/dashboard') ||
                       key.startsWith('/api/me') ||
                       key.startsWith('/api/users');
              }
            });
          } else {
            // Fallback: create user object from Firebase data
            const fallbackUser: User = {
              id: 0,
              username: fbUser.email?.split('@')[0] || 'user',
              email: fbUser.email || '',
              firebaseUid: fbUser.uid,
              fullName: fbUser.displayName,
              avatarUrl: fbUser.photoURL,
              avatar: fbUser.photoURL,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            setUser(fallbackUser);
            storeUser(fallbackUser);
          }
        }
        setIsLoading(false);
      } else {
        // User is signed out
        console.log("👋 User signed out");
        setUser(null);
        storeUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncUserWithBackend]);

  // Check auth - now just triggers a re-check
  const checkAuth = useCallback(async () => {
    // Firebase auth listener handles this automatically
    // This is kept for API compatibility
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("🔐 Starting Google sign-in...");
      const fbUser = await firebaseSignInWithGoogle();

      if (!fbUser) {
        throw new Error("No user returned from Google Sign-In");
      }

      console.log("✅ Google sign-in successful:", fbUser.email);
      // Firebase auth listener will handle the rest automatically
      
    } catch (err: any) {
      console.error("Login error:", err);
      setUser(null);
      setError(err.message || "Failed to sign in with Google");
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage first
      storeUser(null);
      setUser(null);
      
      // Sign out from Firebase
      await firebaseSignOut();
      
      // Try to logout from backend
      try {
        await apiRequest('POST', '/api/auth/logout', {});
      } catch (e) {
        // Ignore backend logout errors
      }
      
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading, error, checkAuth, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
