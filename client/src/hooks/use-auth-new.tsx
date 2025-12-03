import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { isMobileBrowser } from "@/lib/mobile-detection";

// User type matching backend
export interface User {
  id: number;
  username: string;
  email: string;
  firebaseUid?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
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
      // Convert date strings back to Date objects
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status - first from localStorage, then optionally from backend
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First check localStorage for persisted user
      const storedUser = getStoredUser();
      if (storedUser) {
        console.log("✅ Found stored user:", storedUser.email);
        setUser(storedUser);
        setIsLoading(false);
        return;
      }
      
      // If no stored user, try backend session (for development environment)
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.user) {
            setUser(data.user);
            storeUser(data.user);
          } else if (data) {
            setUser(data);
            storeUser(data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        // Backend might not be available, that's OK if we have localStorage
        console.log("Backend auth check failed, using localStorage only");
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setUser(null);
      setError("Failed to check authentication");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    let processed = false;
    
    const initAuth = async () => {
      if (processed) return;
      processed = true;
      
      try {
        setIsLoading(true);
        console.log("🔍 Checking existing session...");
        await checkAuth();
      } catch (err) {
        console.error("❌ Auth check error:", err);
        setError("Failed to check authentication");
      } finally {
        setIsLoading(false);
        console.log("✅ Auth check complete");
      }
    };
    
    initAuth();
  }, []);

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const provider = new GoogleAuthProvider();
      
      // Try popup flow for all devices (more reliable than redirect)
      console.log("🔐 Starting Google sign-in with popup flow...");
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseUser = result.user;

      if (!firebaseUser) {
        throw new Error("No user returned from Google Sign-In");
      }

      console.log("✅ Google sign-in successful, getting ID token...");

      // Step 2: Get the Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      if (!idToken) {
        throw new Error("Failed to get Firebase ID token");
      }

      console.log("✅ ID token obtained, exchanging for backend session...");

      // Step 3: Exchange Firebase ID token for backend session
      const response = await apiRequest('POST', '/api/auth/login', {
        idToken,
      });
      
      console.log("📡 Backend response status:", response.status, response.statusText);
      
      const data = await response.json() as { user: User; isNewUser: boolean };
      
      console.log("📡 Backend response data:", data);

      if (!response.ok) {
        console.error("❌ Backend returned error:", data);
        throw new Error((data as any).error || "Failed to create session");
      }

      if (data && data.user) {
        console.log("✅ Backend session created successfully");
        setUser(data.user);
        storeUser(data.user); // Persist to localStorage for stateless backend
      } else {
        throw new Error("Failed to create session");
      }

      // Step 3: Sign out from Firebase (we only use it for OAuth, not for session)
      await firebaseAuth.signOut();

    } catch (err: any) {
      console.error("Login error:", err);
      setUser(null);
      setError(err.message || "Failed to sign in with Google");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout - destroy backend session and clear local storage
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage first
      storeUser(null);
      setUser(null);
      
      // Try to logout from backend (may fail if stateless)
      try {
        await apiRequest('POST', '/api/auth/logout', {});
      } catch (e) {
        // Ignore backend logout errors for stateless setup
      }
      
      // Also sign out from Firebase if somehow still signed in
      try {
        await firebaseAuth.signOut();
      } catch (e) {
        // Ignore Firebase signout errors
      }
      
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, checkAuth, loginWithGoogle, logout }}>
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
