import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { auth, signInWithGoogle, signOut } from "@/lib/firebase";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";

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

// Simple auth provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up Firebase auth state listener...");
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        console.log(`Firebase auth state changed: ${fbUser ? 'logged in' : 'logged out'}`);
        
        if (fbUser) {
          const userInfo = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
          };
          setUser(userInfo);
          localStorage.setItem('dotspark_user', JSON.stringify(userInfo));
        } else {
          console.log("User is definitely logged out");
          setUser(null);
          localStorage.removeItem('dotspark_user');
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error("Firebase auth error:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      console.log("Attempting Google sign-in...");
      await signInWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Attempting sign out...");
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}