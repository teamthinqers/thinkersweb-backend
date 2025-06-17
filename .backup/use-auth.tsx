import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { auth, signInWithGoogle, signOut } from "@/lib/firebase";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { useLocation } from "wouter";

// Ultra-simple user info type
type UserInfo = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// Context type simplified
type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Extremely simplified auth provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for Firebase auth changes
  useEffect(() => {
    console.log("Setting up Firebase auth state listener...");
    
    // Watch for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        console.log(`Firebase auth state changed: ${fbUser ? 'logged in' : 'logged out'}`);
        
        if (fbUser) {
          // Set local user state from Firebase user
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL
          });
          
          // Redirect to dashboard if on auth page
          if (window.location.pathname === "/auth") {
            setLocation("/");
          }
        } else {
          // User is logged out
          setUser(null);
        }
        
        // Always end loading state
        setIsLoading(false);
      },
      (error) => {
        console.error("Firebase auth error:", error);
        setIsLoading(false);
        setUser(null);
      }
    );
    
    // Cleanup
    return () => {
      console.log("Cleaning up Firebase auth state listener");
      unsubscribe();
    };
  }, [setLocation]);

  // Function to login with Google
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Firebase listener will handle the auth state change
    } catch (error) {
      console.error("Google login error:", error);
      setIsLoading(false);
    }
  };

  // Function to logout
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Firebase
      await signOut();
      
      // After successful logout, redirect to home
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
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
    throw new Error("useAuth must be used within an authentication context");
  }
  return context;
}