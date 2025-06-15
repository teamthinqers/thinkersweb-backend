import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { auth, signInWithGoogle, signOut } from "@/lib/firebase";
import { User as FirebaseUser, onAuthStateChanged, getAuth } from "firebase/auth";

// Enhanced user info type
type UserInfo = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// Context type with additional helpers
type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Check if we already have cached user data to reduce flicker
const getCachedUser = (): UserInfo | null => {
  const cached = localStorage.getItem('dotspark_user');
  if (cached) {
    try {
      const userData = JSON.parse(cached);
      console.log("Found cached user data", userData.displayName);
      return {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL
      };
    } catch (e) {
      console.error("Error parsing cached user:", e);
      return null;
    }
  }
  return null;
};

// Enhanced auth provider with persistent login
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with cached data to reduce flicker on reload
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth changes
  useEffect(() => {
    console.log("Setting up Firebase auth state listener...");
    
    // Check for cached credentials immediately 
    const cachedUser = getCachedUser();
    if (cachedUser) {
      console.log("Using cached user credentials while Firebase initializes");
      setUser(cachedUser);
    }
    
    // Watch for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        console.log(`Firebase auth state changed: ${fbUser ? 'logged in' : 'logged out'}`);
        
        if (fbUser) {
          // Set local user state from Firebase user
          const userInfo = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL
          };
          
          setUser(userInfo);
          
          // Ensure user data is cached for persistence between sessions
          localStorage.setItem('dotspark_user', JSON.stringify({
            ...userInfo,
            lastLogin: new Date().toISOString(),
            persistUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          }));
          
          localStorage.setItem('dotspark_session_active', 'true');
          
          // Record timestamp of last authentication
          localStorage.setItem('auth_timestamp', Date.now().toString());
          
          // Redirect to dashboard if on auth page
          if (window.location.pathname === "/auth") {
            window.location.href = "/";
          }
        } else if (localStorage.getItem('dotspark_session_active') === 'true') {
          // If we think we should be logged in but Firebase says no, try to use cached credentials
          console.log("Firebase reports logged out but session marked active");
          
          const cachedUser = getCachedUser();
          if (cachedUser) {
            console.log("Using cached credentials as fallback");
            setUser(cachedUser);
          } else {
            // No valid cached credentials either
            console.log("No valid cached credentials, confirming logout");
            setUser(null);
            localStorage.removeItem('dotspark_session_active');
          }
        } else {
          // User is explicitly logged out
          console.log("User is definitely logged out");
          setUser(null);
          localStorage.removeItem('dotspark_user');
          localStorage.removeItem('dotspark_session_active');
        }
        
        // Always end loading state
        setIsLoading(false);
      },
      (error) => {
        console.error("Firebase auth error:", error);
        setIsLoading(false);
        
        // On error, try to use cached credentials as fallback
        const cachedUser = getCachedUser();
        if (cachedUser) {
          console.log("Using cached credentials after Firebase error");
          setUser(cachedUser);
        } else {
          setUser(null);
        }
      }
    );
    
    // Cleanup
    return () => {
      console.log("Cleaning up Firebase auth state listener");
      unsubscribe();
    };
  }, []);

  // Function to login with Google - ensures persistent login
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const user = await signInWithGoogle();
      console.log("Login successful with persistent session");
      
      // Firebase listener will handle most of the auth state change,
      // but we also explicitly set session active flag
      localStorage.setItem('dotspark_session_active', 'true');
    } catch (error) {
      console.error("Google login error:", error);
      setIsLoading(false);
    }
  };

  // Function to logout - only runs when user explicitly requests logout
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Mark session as explicitly ended
      localStorage.removeItem('dotspark_session_active');
      localStorage.removeItem('dotspark_user');
      
      // Sign out from Firebase
      await signOut();
      
      // Ensure user state is cleared immediately
      setUser(null);
      
      // After successful logout, redirect to home
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, try to clear user state
      setUser(null);
      localStorage.removeItem('dotspark_session_active');
      localStorage.removeItem('dotspark_user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}