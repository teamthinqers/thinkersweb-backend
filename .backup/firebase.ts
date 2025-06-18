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

// Set maximum persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Firebase auth persistence set to LOCAL successfully"))
  .catch(err => console.error("Firebase auth persistence failed:", err));

// Configure Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Simple sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    console.log("Starting Google sign-in process...");
    
    if (auth.currentUser) {
      console.log("User already signed in:", auth.currentUser.displayName);
      return auth.currentUser;
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign in successful:", result.user.displayName);
    
    // Store user info in localStorage as backup
    localStorage.setItem('dotspark_user', JSON.stringify({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      lastLogin: new Date().toISOString()
    }));
    
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

// Simple sign out
export const signOut = async (): Promise<void> => {
  try {
    // Clear backup
    localStorage.removeItem('dotspark_user');
    
    // Sign out of Firebase
    await firebaseSignOut(auth);
    console.log("Sign out successful");
  } catch (error: any) {
    console.error("Error signing out:", error.code, error.message);
    throw error;
  }
};