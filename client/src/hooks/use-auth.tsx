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
  
  // Recovery mechanism from localStorage if Firebase auth fails
  useEffect(() => {
    // Only try recovery if not already authenticated and not in initial loading state
    if (!firebaseUser && !initializing) {
      try {
        // Check localStorage for previously stored authentication data
        const storedUserData = localStorage.getItem('dotspark_user_data');
        
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          const lastAuth = new Date(userData.lastAuthenticated);
          const now = new Date();
          const hoursSinceLastAuth = (now.getTime() - lastAuth.getTime()) / (1000 * 60 * 60);
          
          // Only use localStorage data if it's less than 24 hours old
          if (hoursSinceLastAuth < 24) {
            console.log('Found recent authentication data in localStorage, attempting recovery...');
            
            // Attempt to recover session from server using uid from localStorage
            apiRequest("POST", "/api/auth/recover", { 
              uid: userData.uid,
              email: userData.email
            })
            .then(() => {
              console.log('Session recovery successful');
              // Force refresh auth state by invalidating the query
              queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            })
            .catch(error => {
              console.error('Failed to recover session:', error);
              // Clear localStorage if recovery failed
              localStorage.removeItem('dotspark_user_data');
            });
          } else {
            console.log('Stored authentication data is too old, not using for recovery');
            localStorage.removeItem('dotspark_user_data');
          }
        }
      } catch (error) {
        console.error('Error during auth recovery:', error);
      }
    }
  }, [firebaseUser, initializing]);

  // Get database user if available
  const {
    data: dbUser,
    error: dbError,
    isLoading: isDbLoading,
  } = useQuery<DbUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!firebaseUser,
    retry: 3, // Retry up to 3 times for server connection issues
    retryDelay: attemptIndex => Math.min(1000 * Math.pow(2, attemptIndex), 30000), // Exponential backoff
  });

  // Ping server to keep session alive periodically
  useEffect(() => {
    let pingInterval: NodeJS.Timeout | null = null;
    
    const pingServer = async () => {
      // Only ping if we have an active Firebase user
      if (firebaseUser) {
        try {
          // Touch the server session to prevent timeout
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              uid: firebaseUser.uid,
              refreshTime: new Date().toISOString()
            }),
            credentials: 'include' // Important for cookies
          });
          
          if (response.ok) {
            console.log(`Server session refreshed at ${new Date().toISOString()}`);
          } else {
            console.warn('Failed to refresh server session, status:', response.status);
            
            // If the session is gone (401), try to recover it
            if (response.status === 401) {
              console.log('Session expired, attempting recovery...');
              // Create a closure to avoid dependency issues
              const recoverSession = async () => {
                try {
                  // Attempt server side login again
                  const userData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                  };
                  
                  const response = await apiRequest("POST", "/api/auth/firebase", userData);
                  const user = await response.json();
                  
                  // Update cached user data
                  queryClient.setQueryData(["/api/user"], user);
                  console.log("Session recovered successfully");
                } catch (err) {
                  console.error("Failed to recover session:", err);
                }
              };
              
              recoverSession();
            }
          }
        } catch (error) {
          console.error('Error refreshing server session:', error);
        }
      }
    };
    
    // Start pinging if we have a user
    if (firebaseUser) {
      // Ping once immediately
      pingServer();
      
      // Then set up interval (every 5 minutes)
      pingInterval = setInterval(pingServer, 5 * 60 * 1000);
      
      console.log('Started server ping interval to keep session alive');
    }
    
    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
        console.log('Stopped server ping interval');
      }
    };
  }, [firebaseUser]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    console.log("Setting up Firebase auth state listener...");
    let isFirstRun = true;
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        console.log(`Firebase auth state changed: ${user ? 'logged in' : 'logged out'} at ${new Date().toISOString()}`);
        
        // Force token refresh if user is logged in to ensure long-lived token
        if (user) {
          // Immediately refresh the token to maximize its lifetime
          user.getIdToken(true)
            .then(token => {
              console.log(`Token refreshed upon auth state change (${token.substring(0, 10)}...)`);
            })
            .catch(err => {
              console.error('Error refreshing token on auth state change:', err);
            });
        }
        
        setFirebaseUser(user);
        
        // Always mark initialization as complete to prevent loading states
        setInitializing(false);
        
        if (user) {
          // Always sync with server when Firebase says we're logged in
          registerOrLoginServerSide(user);
          
          if (!isFirstRun) {
            // Only show the toast on non-initial auth changes
            toast({
              title: "Welcome back!",
              description: `Signed in as ${user.displayName || user.email}`,
            });
          }
        } else {
          // User logged out of Firebase, but only clear server session if not initial load
          if (!isFirstRun) {
            console.log("User logged out from Firebase");
            // Clear user data from query cache
            queryClient.setQueryData(["/api/user"], null);
          }
        }
        
        isFirstRun = false;
      },
      (error) => {
        // Handle errors in the auth state listener
        console.error("Firebase auth state listener error:", error);
        setInitializing(false);
        toast({
          title: "Authentication Error",
          description: "Please refresh the page to try again",
          variant: "destructive"
        });
      }
    );
    
    return () => {
      console.log("Cleaning up Firebase auth state listener");
      unsubscribe();
    };
  }, [toast]);

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
      
      console.log("Starting server-side authentication...");
      
      // Add retry mechanism for server connection issues
      let retries = 0;
      const maxRetries = 5; // Increased retries
      let success = false;
      let user;
      
      while (!success && retries < maxRetries) {
        try {
          // Add timestamp to see timing of requests in logs
          console.log(`Authentication attempt ${retries + 1}/${maxRetries} at ${new Date().toISOString()}`);
          
          const response = await apiRequest("POST", "/api/auth/firebase", userData);
          user = await response.json();
          success = true;
          console.log("Server authentication successful:", user?.username || user?.email);
        } catch (error) {
          retries++;
          console.error(`Authentication attempt ${retries} failed:`, error);
          
          // If we've reached max retries, throw the error to be caught by outer catch
          if (retries >= maxRetries) throw error;
          
          // Wait with exponential backoff but max 10 seconds
          const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
          console.log(`Retrying authentication in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      if (success && user) {
        // Store the user in query cache
        queryClient.setQueryData(["/api/user"], user);
        console.log("User data cached in query client");
        
        // Redirect to dashboard if they're a new user
        if (user.isNewUser) {
          setLocation("/dashboard");
          toast({
            title: "Welcome to DotSpark!",
            description: "Your account has been created successfully.",
          });
        }
      }
    } catch (error) {
      console.error("Error syncing with server:", error);
      toast({
        title: "Authentication Error",
        description: "We're having trouble connecting to the server. Please try again in a moment.",
        variant: "destructive",
      });
      
      // Rather than signing out immediately, we'll just invalidate the query
      // to allow retry mechanisms to work
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Only sign out as a last resort if explicitly a firebase auth error
      if (error && (error as Error).message && (error as Error).message.includes("firebase")) {
        auth.signOut().catch(() => {}); // Silent catch
      }
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
      console.log("Starting logout process...");
      
      // Show confirmation toast
      toast({
        title: "Logging out...",
        description: "Please wait while we log you out.",
      });
      
      // Add a small delay to ensure toast is shown
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Logout from the server first with retry
      let serverLogoutSuccessful = false;
      
      // Try server logout up to 3 times
      for (let i = 0; i < 3; i++) {
        try {
          await apiRequest("POST", "/api/logout");
          serverLogoutSuccessful = true;
          console.log("Server logout successful");
          break;
        } catch (err) {
          console.warn(`Server logout attempt ${i+1} failed, retrying...`, err);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      
      // Then logout from Firebase
      try {
        await signOut();
        console.log("Firebase logout successful");
      } catch (fbError) {
        console.error("Firebase logout error:", fbError);
        // Continue with logout process even if Firebase logout fails
      }
      
      // Clear user data in query client
      queryClient.setQueryData(["/api/user"], null);
      console.log("Cleared user data from query cache");
      
      // Invalidate queries to force refetch on next load
      queryClient.invalidateQueries();
      
      // Force a page reload to clear all state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "Please try again or refresh the page",
        variant: "destructive",
      });
    }
  };

  // Store user info in localStorage for persistence backup
  useEffect(() => {
    if (firebaseUser && dbUser) {
      // Store basic user data in localStorage for persistence backup
      const persistentUserData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || dbUser?.username,
        photoURL: firebaseUser.photoURL,
        dbUserId: dbUser.id,
        lastAuthenticated: new Date().toISOString()
      };
      
      // Save to localStorage for persistence backup
      localStorage.setItem('dotspark_user_data', JSON.stringify(persistentUserData));
      console.log('User data stored in localStorage for persistence backup');
    }
  }, [firebaseUser, dbUser]);

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