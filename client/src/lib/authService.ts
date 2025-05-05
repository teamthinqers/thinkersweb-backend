/**
 * Auth Service
 * Centralized authentication control to fix persistent issues with Firebase auth
 */

import { auth, signInWithGoogle as firebaseSignInWithGoogle, signOut as firebaseSignOut } from "./firebase";
import { User as FirebaseUser } from "firebase/auth";
import { apiRequest, queryClient } from "./queryClient";
import { User as DbUser } from "@shared/schema";
import { navigateToHome, navigateToDashboard } from "./navigationService";

// Auth state
const state = {
  initialized: false,
  lastAuthTimestamp: 0,
  authRefreshInterval: null as NodeJS.Timeout | null,
  serverPingInterval: null as NodeJS.Timeout | null,
};

// Event listeners
type AuthEventType = 'signedIn' | 'signedOut' | 'sessionRestored' | 'sessionExpired' | 'error';
const listeners: Record<AuthEventType, Array<(data?: any) => void>> = {
  signedIn: [],
  signedOut: [],
  sessionRestored: [],
  sessionExpired: [],
  error: [],
};

// Subscribe to auth events
export function subscribeToAuth(
  event: AuthEventType,
  callback: (data?: any) => void
): () => void {
  listeners[event].push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = listeners[event].indexOf(callback);
    if (index !== -1) {
      listeners[event].splice(index, 1);
    }
  };
}

// Notify listeners of auth events
function notifyListeners(event: AuthEventType, data?: any): void {
  listeners[event].forEach(callback => callback(data));
}

// Sign in with Google - centralized to ensure proper error handling and server sync
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    console.log("Auth service: Starting Google sign-in process...");
    
    // Call Firebase sign in
    const user = await firebaseSignInWithGoogle();
    console.log("Auth service: Firebase authentication successful");
    
    // Store auth timestamp
    state.lastAuthTimestamp = Date.now();
    localStorage.setItem('auth_timestamp', state.lastAuthTimestamp.toString());
    
    // Sync with server
    await syncWithServer(user);
    
    // Start refresh intervals
    startAuthRefresh();
    startServerPing();
    
    // Notify listeners
    notifyListeners('signedIn', user);
    
    return user;
  } catch (error) {
    console.error("Auth service: Sign in error", error);
    notifyListeners('error', error);
    throw error;
  }
}

// Sign out - centralized to ensure proper cleanup
export async function signOut(redirectHome = true): Promise<void> {
  try {
    console.log("Auth service: Starting sign-out process...");
    
    // Stop intervals
    stopAuthRefresh();
    stopServerPing();
    
    // First clear server session
    try {
      await apiRequest("POST", "/api/logout");
      console.log("Auth service: Server logout successful");
    } catch (err) {
      console.warn("Auth service: Server logout failed, continuing with Firebase logout", err);
    }
    
    // Clear localStorage
    localStorage.removeItem('dotspark_user_data');
    localStorage.removeItem('auth_timestamp');
    
    // Clear query cache
    queryClient.setQueryData(["/api/user"], null);
    queryClient.invalidateQueries();
    
    // Firebase sign out
    await firebaseSignOut();
    console.log("Auth service: Firebase sign out successful");
    
    // Notify listeners
    notifyListeners('signedOut');
    
    // Redirect if requested
    if (redirectHome) {
      navigateToHome(true);
    }
  } catch (error) {
    console.error("Auth service: Sign out error", error);
    notifyListeners('error', error);
    
    // Force redirect for safety even if there was an error
    if (redirectHome) {
      navigateToHome(true);
    }
  }
}

// Sync Firebase auth with server
async function syncWithServer(firebaseUser: FirebaseUser): Promise<DbUser | null> {
  try {
    console.log("Auth service: Syncing with server...");
    
    // Retry mechanism with exponential backoff
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries) {
      try {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        
        console.log(`Auth service: Server sync attempt ${retries + 1}/${maxRetries}`);
        const response = await apiRequest("POST", "/api/auth/firebase", userData);
        const user = await response.json();
        
        console.log("Auth service: Server sync successful");
        
        // Store user data in query cache
        queryClient.setQueryData(["/api/user"], user);
        
        // Store backup in localStorage
        const backupData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || user?.username,
          photoURL: firebaseUser.photoURL,
          dbUserId: user?.id,
          lastAuthenticated: new Date().toISOString()
        };
        
        localStorage.setItem('dotspark_user_data', JSON.stringify(backupData));
        
        return user;
      } catch (error) {
        retries++;
        console.error(`Auth service: Server sync attempt ${retries} failed`, error);
        
        if (retries >= maxRetries) throw error;
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error("Failed to sync with server after maximum retries");
  } catch (error) {
    console.error("Auth service: Server sync error", error);
    notifyListeners('error', error);
    return null;
  }
}

// Start token refresh interval
function startAuthRefresh(): void {
  // Clear any existing interval
  stopAuthRefresh();
  
  // Create new interval (refresh every 10 minutes)
  state.authRefreshInterval = setInterval(async () => {
    try {
      if (auth.currentUser) {
        // Force token refresh
        const token = await auth.currentUser.getIdToken(true);
        console.log(`Auth service: Token refreshed at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error("Auth service: Token refresh error", error);
    }
  }, 10 * 60 * 1000);
  
  console.log("Auth service: Started auth refresh interval");
}

// Start server ping interval
function startServerPing(): void {
  // Clear any existing interval
  stopServerPing();
  
  // Create new interval (ping every 5 minutes)
  state.serverPingInterval = setInterval(async () => {
    try {
      if (auth.currentUser) {
        // Touch the server session
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            uid: auth.currentUser.uid,
            refreshToken: Date.now()
          }),
          credentials: 'include'
        });
        
        if (response.ok) {
          console.log(`Auth service: Server session refreshed at ${new Date().toISOString()}`);
        } else {
          console.warn('Auth service: Failed to refresh server session, status:', response.status);
          
          // Try to recover if session expired
          if (response.status === 401) {
            console.log('Auth service: Session expired, attempting recovery...');
            await recoverSession();
          }
        }
      }
    } catch (error) {
      console.error("Auth service: Server ping error", error);
    }
  }, 5 * 60 * 1000);
  
  console.log("Auth service: Started server ping interval");
}

// Stop auth refresh interval
function stopAuthRefresh(): void {
  if (state.authRefreshInterval) {
    clearInterval(state.authRefreshInterval);
    state.authRefreshInterval = null;
    console.log("Auth service: Stopped auth refresh interval");
  }
}

// Stop server ping interval
function stopServerPing(): void {
  if (state.serverPingInterval) {
    clearInterval(state.serverPingInterval);
    state.serverPingInterval = null;
    console.log("Auth service: Stopped server ping interval");
  }
}

// Recover session from localStorage if Firebase fails
export async function recoverSession(): Promise<boolean> {
  try {
    // Skip if already authenticated
    if (auth.currentUser) {
      console.log("Auth service: Session recovery skipped, already authenticated");
      return true;
    }
    
    console.log("Auth service: Attempting session recovery...");
    
    // Check localStorage for stored data
    const storedData = localStorage.getItem('dotspark_user_data');
    if (!storedData) {
      console.log("Auth service: No stored data found for recovery");
      return false;
    }
    
    // Parse stored data
    const userData = JSON.parse(storedData);
    const lastAuth = new Date(userData.lastAuthenticated);
    const now = new Date();
    const hoursSinceLastAuth = (now.getTime() - lastAuth.getTime()) / (1000 * 60 * 60);
    
    // Only use stored data if recent (24 hours)
    if (hoursSinceLastAuth > 24) {
      console.log("Auth service: Stored data too old for recovery");
      localStorage.removeItem('dotspark_user_data');
      return false;
    }
    
    console.log("Auth service: Found recent auth data, attempting recovery");
    
    // Attempt server side recovery
    const response = await apiRequest("POST", "/api/auth/recover", { 
      uid: userData.uid,
      email: userData.email
    });
    
    if (response.ok) {
      const user = await response.json();
      queryClient.setQueryData(["/api/user"], user);
      console.log("Auth service: Session recovery successful");
      notifyListeners('sessionRestored', user);
      return true;
    } else {
      console.log("Auth service: Server rejected recovery attempt");
      localStorage.removeItem('dotspark_user_data');
      return false;
    }
  } catch (error) {
    console.error("Auth service: Recovery error", error);
    localStorage.removeItem('dotspark_user_data');
    notifyListeners('error', error);
    return false;
  }
}

// Initialize auth service
export function initAuthService(): void {
  if (state.initialized) return;
  
  console.log("Auth service: Initializing");
  
  // Check for existing Firebase user
  if (auth.currentUser) {
    console.log("Auth service: Found existing Firebase user on init");
    syncWithServer(auth.currentUser)
      .then(() => {
        startAuthRefresh();
        startServerPing();
      })
      .catch(error => {
        console.error("Auth service: Error syncing existing user", error);
      });
  } else {
    // Try recovery
    recoverSession()
      .then(recovered => {
        if (recovered) {
          console.log("Auth service: Session recovered on init");
        } else {
          console.log("Auth service: No session to recover on init");
        }
      })
      .catch(error => {
        console.error("Auth service: Recovery error on init", error);
      });
  }
  
  state.initialized = true;
}

// Clean up on unload
window.addEventListener('beforeunload', () => {
  stopAuthRefresh();
  stopServerPing();
});

// Initialize on module load
initAuthService();