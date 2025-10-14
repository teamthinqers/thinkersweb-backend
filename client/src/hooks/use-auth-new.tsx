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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for redirect result on mount (for mobile Google login)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        setIsLoading(true);
        const result = await getRedirectResult(firebaseAuth);
        if (result && result.user) {
          console.log("✅ Got redirect result from Google sign-in");
          const idToken = await result.user.getIdToken();
          
          // Exchange token for backend session
          const response = await apiRequest('POST', '/api/auth/login', { idToken });
          const data = await response.json() as { user: User; isNewUser: boolean };
          
          if (response.ok && data && data.user) {
            console.log("✅ Backend session created from redirect");
            setUser(data.user);
          } else {
            throw new Error("Failed to create session from redirect");
          }
          
          // Sign out from Firebase
          await firebaseAuth.signOut();
        } else {
          // No redirect result, check normal auth status
          await checkAuth();
        }
      } catch (err) {
        console.error("Redirect result error:", err);
        setError("Failed to complete sign-in");
        await checkAuth();
      } finally {
        setIsLoading(false);
      }
    };
    
    handleRedirectResult();
  }, []);

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
        setUser(data.user || null);
      } else {
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

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const provider = new GoogleAuthProvider();
      
      // Use redirect flow for mobile devices (more reliable)
      // Use popup flow for desktop devices (better UX)
      if (isMobileBrowser()) {
        console.log("📱 Mobile detected - using redirect flow for Google sign-in");
        await signInWithRedirect(firebaseAuth, provider);
        // The result will be handled in the useEffect with getRedirectResult
        return;
      }
      
      // Desktop: Use popup flow
      console.log("💻 Desktop detected - using popup flow for Google sign-in");
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
