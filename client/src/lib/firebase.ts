import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  User, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";

// Log environment variables to help debug (without showing actual values)
console.log("Firebase environment variables available:", {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: !!import.meta.env.VITE_FIREBASE_APP_ID
});

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Use direct domain for Replit
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Force reauth if needed (helps with persistence issues)
if (auth.currentUser) {
  console.log("Existing user detected on initialization");
}

// Enhanced persistence strategy with fallbacks and multiple mechanisms
const setupPersistence = async () => {
  try {
    // First try to set maximum persistence
    await setPersistence(auth, browserLocalPersistence);
    console.log("Firebase auth persistence set to LOCAL successfully");
    
    // Store a flag in localStorage as backup
    localStorage.setItem('firebase_auth_persistence_set', 'true');
    localStorage.setItem('firebase_auth_persistence_timestamp', Date.now().toString());
    
    // Set up a watchdog to check and reset persistence if needed
    const watchdogInterval = setInterval(() => {
      const timestamp = localStorage.getItem('firebase_auth_persistence_timestamp');
      if (!timestamp || Date.now() - parseInt(timestamp) > 12 * 60 * 60 * 1000) { // 12 hours
        console.log("Refreshing persistence settings...");
        setPersistence(auth, browserLocalPersistence)
          .then(() => {
            localStorage.setItem('firebase_auth_persistence_timestamp', Date.now().toString());
            console.log("Persistence refreshed successfully");
          })
          .catch(err => console.warn("Persistence refresh failed:", err));
      }
    }, 60 * 60 * 1000); // Check every hour
    
    // Clear interval on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(watchdogInterval);
    });
  } catch (error) {
    console.error("Error setting Firebase auth persistence:", error);
    // Try again after a short delay as fallback
    setTimeout(() => {
      setPersistence(auth, browserLocalPersistence)
        .then(() => console.log("Firebase auth persistence retry successful"))
        .catch(err => console.error("Firebase auth persistence retry failed:", err));
    }, 3000);
  }
};

// Run setup
setupPersistence();

// Periodic token refresh function to keep Firebase auth session alive
const refreshTokenPeriodically = async () => {
  try {
    if (auth.currentUser) {
      // Force token refresh
      const token = await auth.currentUser.getIdToken(true);
      console.log(`Token refreshed at ${new Date().toISOString()} (${token.substring(0, 10)}...)`);
      
      // Also refresh the server session
      try {
        // Ping the server to keep session alive
        await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: auth.currentUser.uid,
            refreshToken: Date.now() // Just a timestamp to prevent caching
          }),
          credentials: 'include' // Important for sending cookies
        });
        console.log('Server session refreshed successfully');
      } catch (serverError) {
        console.warn('Failed to refresh server session, will retry next cycle', serverError);
      }
    }
  } catch (error) {
    console.error('Failed to refresh auth token:', error);
  }
};

// Initial immediate check and refresh
setTimeout(refreshTokenPeriodically, 1000);

// Short refresh interval (every 10 minutes)
const refreshInterval = setInterval(refreshTokenPeriodically, 10 * 60 * 1000); // 10 minutes

// Clear interval on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
  clearInterval(refreshInterval);
});

// Configure Google provider with custom parameters for better compatibility
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  // Force account selection even when one account is available
  prompt: 'select_account',
  // Specify the redirect origin for better handling in embedded environments
  login_hint: 'user@example.com'
});

// Helper functions for authentication
export const signInWithGoogle = async (): Promise<User> => {
  try {
    console.log("Starting Google sign-in process...");
    
    // Set auth persistence again before sign-in for extra assurance
    await setPersistence(auth, browserLocalPersistence)
      .then(() => console.log("Persistence set to LOCAL before sign in"));
    
    // Handle existing auth
    if (auth.currentUser) {
      console.log("User already signed in, refreshing token...");
      try {
        // Just return current user if already authenticated
        return auth.currentUser;
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        // Continue with new sign in if refresh failed
      }
    }
    
    // Use signInWithPopup which works better in embedded environments like Replit
    console.log("Opening Google sign-in popup...");
    const result = await signInWithPopup(auth, googleProvider);
    
    console.log("Google sign in successful:", result.user.displayName);
    console.log("User will be persisted:", result.user.uid);
    
    // Force token refresh after sign in for better persistence
    await result.user.getIdToken(true);
    
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error.code, error.message);
    
    // Provide more specific error messages for common issues
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in cancelled. Please try again when ready.");
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Sign-in popup was blocked. Please allow popups for this site.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("Network error. Please check your connection and try again.");
    } else {
      throw error;
    }
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log("Sign out successful");
  } catch (error: any) {
    console.error("Error signing out:", error.code, error.message);
    throw error;
  }
};