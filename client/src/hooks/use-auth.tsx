import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as DbUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth, signInWithGoogle, signOut } from "@/lib/firebase";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { useLocation } from "wouter";

type UserInfo = {
  id?: number;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isNewUser?: boolean;
};

type AuthContextType = {
  user: UserInfo | null;
  firebaseUser: FirebaseUser | null;
  dbUser: DbUser | null;
  isLoading: boolean;
  error: Error | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Get database user if available
  const {
    data: dbUser,
    error: dbError,
    isLoading: isDbLoading,
  } = useQuery<DbUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!firebaseUser,
  });

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setInitializing(false);
      
      if (user) {
        // If user is logged in with Firebase but we don't have a session, create one
        registerOrLoginServerSide(user);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Register or login on the server side when Firebase authentication is successful
  const registerOrLoginServerSide = async (fbUser: FirebaseUser) => {
    try {
      // Check if the user exists or needs to be created
      const userData = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      };
      
      const response = await apiRequest("POST", "/api/auth/firebase", userData);
      const user = await response.json();
      
      queryClient.setQueryData(["/api/user"], user);
      
      // Redirect to dashboard if they're a new user
      if (user.isNewUser) {
        setLocation("/dashboard");
        toast({
          title: "Welcome to DotSpark!",
          description: "Your account has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Error syncing with server:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with the server.",
        variant: "destructive",
      });
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<void> => {
    try {
      await signInWithGoogle();
      // Authentication state change listener will handle the server-side auth
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  // Logout from both Firebase and the server
  const logout = async (): Promise<void> => {
    try {
      // Logout from the server first
      await apiRequest("POST", "/api/logout");
      // Then logout from Firebase
      await signOut();
      
      // Clear user data in query client
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      
      // Redirect to home page
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: error instanceof Error ? error.message : "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  // Combine Firebase user with DB user info
  const user: UserInfo | null = firebaseUser ? {
    id: dbUser?.id,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || dbUser?.username || "User",
    photoURL: firebaseUser.photoURL,
    isNewUser: dbUser?.createdAt === dbUser?.updatedAt, // Check if user was just created
  } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        dbUser,
        isLoading: initializing || isDbLoading,
        error: dbError || null,
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