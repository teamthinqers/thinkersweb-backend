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

// Set auth persistence to local for session persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase auth persistence set to LOCAL successfully");
  })
  .catch((error) => {
    console.error("Error setting Firebase auth persistence:", error);
  });

// Extra safety measure - check persistence every minute
setInterval(() => {
  // Check if we're supposed to be logged in
  if (auth.currentUser) {
    console.log(`Auth persistence check: User still logged in as ${auth.currentUser.displayName || auth.currentUser.email}`);
  }
}, 60000);

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