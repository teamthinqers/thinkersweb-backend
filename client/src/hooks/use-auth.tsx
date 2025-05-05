import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User as DbUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth, signInWithGoogle, signOut } from "@/lib/firebase";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { useLocation } from "wouter";

// Simplified user info type
type UserInfo = {
  id?: number;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isNewUser?: boolean;
};

// Context type
type AuthContextType = {
  user: UserInfo | null;
  firebaseUser: FirebaseUser | null;
  dbUser: DbUser | null;
  isLoading: boolean;
  error: Error | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

// Create context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get database user when Firebase user is available
  const {
    data: dbUser,
    error: dbError,
    isLoading: isDbLoading,
  } = useQuery<DbUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!firebaseUser,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  // Firebase auth state listener
  useEffect(() => {
    console.log("Setting up Firebase auth state listener...");
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log(`Firebase auth state changed: ${user ? 'logged in' : 'logged out'}`);
        setFirebaseUser(user);
        setIsLoading(false);
        
        if (user) {
          // Store backup in localStorage
          localStorage.setItem('dotspark_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
          }));
          
          // Sync with server
          syncUserWithServer(user);
        } else {
          // Clear localStorage on logout
          localStorage.removeItem('dotspark_user');
          
          // Clear query cache
          queryClient.setQueryData(["/api/user"], null);
        }
      },
      (error) => {
        console.error("Firebase auth error:", error);
        setIsLoading(false);
        
        toast({
          title: "Authentication Error",
          description: "Please refresh the page and try again",
          variant: "destructive"
        });
      }
    );
    
    // Try to recover from localStorage if needed
    const tryRecoverFromStorage = async () => {
      const savedUser = localStorage.getItem('dotspark_user');
      
      if (savedUser && !auth.currentUser) {
        try {
          const userData = JSON.parse(savedUser);
          const lastLogin = new Date(userData.lastLogin);
          const now = new Date();
          const hoursSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
          
          // Only use if less than 24 hours old
          if (hoursSinceLogin < 24) {
            console.log("Found user data in localStorage, using as backup");
            
            // Try to get user from server
            apiRequest("POST", "/api/auth/firebase", userData)
              .then(response => {
                console.log("Recovery response status:", response.status);
                
                if (!response.ok) {
                  return response.text().then(errorText => {
                    console.error("Server recovery error:", errorText);
                    throw new Error(`Server recovery failed: ${response.status}`);
                  });
                }
                
                return response.json();
              })
              .then(user => {
                console.log("Server recognized stored user:", user.username || user.email);
                queryClient.setQueryData(["/api/user"], user);
                
                // Show a welcome back toast
                toast({
                  title: "Welcome back!",
                  description: `Signed in as ${user.username || user.email}`,
                });
              })
              .catch(error => {
                console.error("Failed to verify stored user:", error);
                localStorage.removeItem('dotspark_user');
              });
          } else {
            // Too old, remove it
            localStorage.removeItem('dotspark_user');
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
          localStorage.removeItem('dotspark_user');
        }
      }
    };
    
    // Try recovery once on mount
    tryRecoverFromStorage();
    
    return () => {
      console.log("Cleaning up Firebase auth state listener");
      unsubscribe();
    };
  }, [toast]);

  // Sync Firebase user with server
  const syncUserWithServer = async (fbUser: FirebaseUser) => {
    try {
      console.log("Syncing user with server...");
      
      const userData = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      };
      
      console.log("Sending user data to server:", JSON.stringify(userData));
      
      // Get the raw response
      const response = await apiRequest("POST", "/api/auth/firebase", userData);
      
      // Log detailed response info for debugging
      console.log("Server response status:", response.status);
      
      // Check for error status
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      // Parse the JSON response
      const user = await response.json();
      console.log("Server sync successful:", user.username || user.email);
      
      // Update cache
      queryClient.setQueryData(["/api/user"], user);
      
      // Redirect and welcome new users
      if (user.isNewUser) {
        setLocation("/dashboard");
        toast({
          title: "Welcome to DotSpark!",
          description: "Your account has been created successfully.",
        });
      }
    } catch (error) {
      // Log the full error details
      console.error("Server sync error:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      
      // Show a more specific error message
      toast({
        title: "Connection Error",
        description: "We're having trouble connecting to the server. Some features may be limited.",
        variant: "destructive",
      });
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Firebase signin (auth state change will handle the rest)
      await signInWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Try server logout first
      try {
        await apiRequest("POST", "/api/logout");
        console.log("Server logout successful");
      } catch (err) {
        console.warn("Server logout failed:", err);
      }
      
      // Clear localStorage
      localStorage.removeItem('dotspark_user');
      
      // Clear query cache
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      
      // Firebase logout
      await signOut();
      console.log("Firebase logout successful");
      
      // Reload page to clear all state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
      
      toast({
        title: "Logout Failed",
        description: "Please try again or refresh the page",
        variant: "destructive",
      });
    }
  };

  // Combine Firebase user with DB user info
  const user: UserInfo | null = firebaseUser ? {
    id: dbUser ? dbUser.id : undefined,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || (dbUser ? dbUser.username : null) || "User",
    photoURL: firebaseUser.photoURL,
    isNewUser: dbUser ? (dbUser.createdAt.getTime() === dbUser.updatedAt.getTime()) : false,
  } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        dbUser: dbUser || null,
        isLoading: isLoading || isDbLoading,
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