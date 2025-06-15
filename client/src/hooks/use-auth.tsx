import React from "react";

// Simple user info type
type UserInfo = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// Context type
type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

// Create context
export const AuthContext = React.createContext<AuthContextType | null>(null);

// Simple auth provider that doesn't use complex hooks
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const loginWithGoogle = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Simplified login - just for demo
      console.log("Login requested");
      setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setIsLoading(true);
    try {
      setUser(null);
      console.log("Logout successful");
      setIsLoading(false);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  }, []);

  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      loginWithGoogle,
      logout,
    }),
    [user, isLoading, loginWithGoogle, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}