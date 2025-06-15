import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { auth, signInWithGoogle, signOut } from "@/lib/firebase";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";

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
export function AuthProvider({ children }: { children: ReactNode }) {
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
          const currentPath = window.location.pathname;
          if (currentPath === '/auth') {
            console.log('User logged in, redirecting to dashboard');
            setLocation('/dashboard');
          }
        } else {
          // User logged out
          setUser(null);
        }
      },
      (error) => {
        console.error("Firebase auth error:", error);
        setUser(null);
      }
    );

    return () => {
      console.log("Cleaning up Firebase auth listener");
      unsubscribe();
    };
  }, [setLocation]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      console.log("Starting Google login...");
      const user = await signInWithGoogle();
      console.log("Google login successful:", user.email);
      // Firebase auth state change will handle the rest
    } catch (error) {
      console.error("Google login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Starting logout...");
      await signOut();
      console.log("Logout successful");
      setLocation('/');
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      loginWithGoogle,
      logout,
    }}>
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