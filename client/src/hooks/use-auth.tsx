import { useState, useEffect } from "react";
import { auth, signInWithGoogle, signOut, onAuthStateChanged, User } from "@/lib/auth-simple";

type UserInfo = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

// Enhanced Firebase auth hook with persistence
export function useAuth(): AuthContextType {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userInfo = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setUser(userInfo);
        // Store user in localStorage for persistence
        localStorage.setItem('dotspark_user', JSON.stringify(userInfo));
        console.log("User signed in and stored:", userInfo.displayName);
      } else {
        setUser(null);
        // Clear stored user on sign out
        localStorage.removeItem('dotspark_user');
        console.log("User signed out and cleared from storage");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const firebaseUser = await signInWithGoogle();
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    loginWithGoogle,
    logout
  };
}

// Export AuthProvider for backward compatibility (even though we're not using a provider pattern)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};