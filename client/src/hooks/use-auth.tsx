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

// Simple auth hook without complex Firebase integration
export function useAuth(): AuthContextType {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Mock login for now - user can implement real Firebase later
    setTimeout(() => {
      setUser({
        uid: "mock-user",
        email: "user@example.com",
        displayName: "Mock User",
        photoURL: null
      });
      setIsLoading(false);
    }, 1000);
  };

  const logout = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(null);
      setIsLoading(false);
    }, 500);
  };

  return {
    user,
    isLoading,
    loginWithGoogle,
    logout
  };
}