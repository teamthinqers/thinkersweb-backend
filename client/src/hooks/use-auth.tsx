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

// AuthProvider removed to prevent React hooks errors

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Return mock auth data when provider is not available
    return {
      user: null,
      isLoading: false,
      loginWithGoogle: async () => {},
      logout: async () => {}
    };
  }
  return context;
}