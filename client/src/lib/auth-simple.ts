import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup, 
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Set up persistent authentication
setPersistence(auth, browserLocalPersistence).then(() => {
  console.log("Firebase auth persistence enabled - users will stay signed in");
}).catch((error) => {
  console.error("Failed to set auth persistence:", error);
});

// Simple Google sign-in function
export const signInWithGoogle = async (): Promise<User> => {
  try {
    console.log("Starting Google sign-in...");
    console.log("Firebase config check:", {
      hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
      authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`
    });
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", result.user.displayName);
    return result.user;
  } catch (error: any) {
    console.error("Google sign-in error details:", {
      code: error.code,
      message: error.message,
      customData: error.customData,
      credential: error.credential
    });
    
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in cancelled by user");
    } else if (error.code === "auth/unauthorized-domain") {
      throw new Error("This domain is not authorized for Google sign-in. Please contact support.");
    } else if (error.code === "auth/operation-not-allowed") {
      throw new Error("Google sign-in is not enabled. Please contact support.");
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("Sign-in popup was blocked. Please allow popups and try again.");
    }
    throw error;
  }
};

// Simple sign out function
export const signOut = async (): Promise<void> => {
  try {
    // First, sign out from Firebase
    await firebaseSignOut(auth);
    console.log("Firebase sign out successful");
    
    // Then, destroy backend session
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        console.log("Backend session destroyed successfully");
      } else {
        console.warn("Backend session destroy failed, but Firebase signout succeeded");
      }
    } catch (sessionError) {
      console.warn("Failed to destroy backend session:", sessionError);
      // Don't throw - Firebase signout succeeded which is main requirement
    }
    
    // Clear any localStorage items
    localStorage.removeItem('dotspark-settings');
    localStorage.removeItem('user-preferences');
    
    console.log("Complete sign out successful");
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Export auth instance and utilities
export { auth, onAuthStateChanged };
export type { User };