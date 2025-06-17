import { useState, useEffect } from "react";

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

// Minimal auth hook to avoid React hooks initialization errors
export function useAuth(): AuthContextType {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Simulate successful login for testing
      const mockUser = {
        uid: "test-uid",
        email: "test@dotspark.com",
        displayName: "Test User",
        photoURL: null
      };
      setUser(mockUser);
      localStorage.setItem('dotspark_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('dotspark_user');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for stored user on mount
    try {
      const storedUser = localStorage.getItem('dotspark_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error restoring user:", error);
    }
  }, []);

  return {
    user,
    isLoading,
    loginWithGoogle,
    logout
  };
}