import React, { createContext, ReactNode, useContext, useState } from "react";

// Minimal user info type
type UserInfo = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// Minimal context type
type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

// Create context with default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

// Minimal auth provider - no Firebase dependencies
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    try {
      console.log("Mock Google sign-in for development");
      // Mock user for development - replace with real auth later
      const mockUser = {
        uid: "dev-user-123",
        email: "developer@example.com", 
        displayName: "Developer User",
        photoURL: null
      };
      setUser(mockUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}