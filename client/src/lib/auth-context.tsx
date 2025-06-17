import React, { createContext, useContext, ReactNode } from "react";
import { useAuth as useAuthHook } from "@/hooks/use-auth";

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

// Create context without AuthProvider export to eliminate import errors
const AuthContext = createContext<AuthContextType | null>(null);

// Simple context provider that wraps the hook
export function DotSparkAuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Export useAuth that uses context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback to direct hook if context not available
    return useAuthHook();
  }
  return context;
}