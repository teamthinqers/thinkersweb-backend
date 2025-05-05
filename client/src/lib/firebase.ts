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

// Set auth persistence to local for session persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting Firebase auth persistence:", error);
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
    // Set auth persistence again before sign-in for extra assurance
    await setPersistence(auth, browserLocalPersistence);
    
    // Use signInWithPopup which works better in embedded environments like Replit
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign in successful:", result.user.displayName);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error.code, error.message);
    throw error;
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