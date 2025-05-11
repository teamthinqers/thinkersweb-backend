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

// Set maximum persistence - this ensures users stay logged in until they explicitly logout
// The browserLocalPersistence option keeps the user logged in even after closing the browser
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase auth persistence set to LOCAL successfully");
    // Force refresh token to ensure maximum longevity
    if (auth.currentUser) {
      auth.currentUser.getIdToken(true)
        .then(() => console.log("Firebase token refreshed on init"))
        .catch(err => console.error("Firebase token refresh error:", err));
    }
  })
  .catch(err => console.error("Firebase auth persistence failed:", err));

// Configure Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Enhanced sign in with Google for persistent logins
export const signInWithGoogle = async (): Promise<User> => {
  try {
    console.log("Starting Google sign-in process...");
    
    if (auth.currentUser) {
      console.log("User already signed in:", auth.currentUser.displayName);
      
      // Force token refresh to ensure maximum longevity even for existing sessions
      await auth.currentUser.getIdToken(true);
      console.log("Refreshed token for existing user session");
      
      return auth.currentUser;
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign in successful:", result.user.displayName);
    
    // Store enhanced user info in localStorage as backup with longer expiration
    const userData = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      lastLogin: new Date().toISOString(),
      // Add explicit fields for persistence
      persistUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      rememberMe: true // Always remember by default
    };
    
    localStorage.setItem('dotspark_user', JSON.stringify(userData));
    localStorage.setItem('dotspark_session_active', 'true');
    
    // Force an explicit token refresh to maximize token lifetime
    await result.user.getIdToken(true);
    console.log("Initial token refresh completed for new login");
    
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error.code, error.message);
    
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in cancelled. Please try again when ready.");
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Sign-in popup was blocked. Please allow popups for this site.");
    } else {
      throw error;
    }
  }
};

// Enhanced sign out - only called when user explicitly chooses to logout
export const signOut = async (): Promise<void> => {
  try {
    console.log("User initiated sign out - explicitly logging out");
    
    // Clear all auth-related backups
    localStorage.removeItem('dotspark_user');
    localStorage.removeItem('dotspark_user_data');
    localStorage.removeItem('dotspark_session_active');
    localStorage.removeItem('auth_timestamp');
    
    // Clear any cached auth data
    sessionStorage.removeItem('dotspark_temp_auth');
    
    // Sign out of Firebase
    await firebaseSignOut(auth);
    console.log("Sign out successful - user explicitly logged out");
  } catch (error: any) {
    console.error("Error signing out:", error.code, error.message);
    
    // Even if there's an error, try to clear localStorage
    try {
      localStorage.removeItem('dotspark_user');
      localStorage.removeItem('dotspark_user_data');
      localStorage.removeItem('dotspark_session_active');
      localStorage.removeItem('auth_timestamp');
      sessionStorage.removeItem('dotspark_temp_auth');
    } catch (e) {
      console.error("Error clearing storage during sign out:", e);
    }
    
    throw error;
  }
};