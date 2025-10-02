import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

// User type matching backend
export interface User {
  id: number;
  username: string;
  email: string;
  firebaseUid?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status from backend session
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Important: include session cookie
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.user) {
          console.log("✅ User authenticated:", data.user.email);
          setUser(data.user);
        } else {
          console.log("ℹ️ No authenticated user");
          setUser(null);
        }
      } else {
        console.log("ℹ️ Auth check returned:", response.status);
        setUser(null);
      }
    } catch (err) {
      console.error("❌ Auth check error:", err);
      setUser(null);
      setError("Failed to check authentication");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Step 1: Open Google OAuth popup via Firebase
      const provider = new GoogleAuthProvider();
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
      
      const data = await response.json() as { user: User; isNewUser: boolean };

      if (data && data.user) {
        console.log("✅ Backend session created successfully");
        setUser(data.user);
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

  // Logout - destroy backend session
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      await apiRequest('POST', '/api/auth/logout', {});
      
      // Also sign out from Firebase if somehow still signed in
      try {
        await firebaseAuth.signOut();
      } catch (e) {
        // Ignore Firebase signout errors
      }
      
      setUser(null);
      
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
