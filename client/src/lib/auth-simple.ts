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
    console.log("🚀 Starting Google sign-in...");
    console.log("🔧 Firebase config check:", {
      hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID,
      authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`
    });
    
    console.log("📱 Opening Google auth popup...");
    const result = await signInWithPopup(auth, googleProvider);
    
    console.log("✅ Google sign-in successful!", {
      displayName: result.user.displayName,
      email: result.user.email,
      uid: result.user.uid,
      emailVerified: result.user.emailVerified
    });
    
    return result.user;
  } catch (error: any) {
    console.error("❌ Google sign-in error details:", {
      code: error.code,
      message: error.message,
      customData: error.customData,
      credential: error.credential,
      stack: error.stack
    });
    
    // Enhanced error handling with specific Firebase Auth errors
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("🚪 Sign-in cancelled by user");
    } else if (error.code === "auth/unauthorized-domain") {
      throw new Error("🚫 This domain is not authorized for Google sign-in. Check Firebase Console → Authentication → Settings → Authorized domains");
    } else if (error.code === "auth/operation-not-allowed") {
      throw new Error("⛔ Google sign-in is not enabled. Check Firebase Console → Authentication → Sign-in methods → Google");
    } else if (error.code === "auth/popup-blocked") {
      throw new Error("🚫 Sign-in popup was blocked. Please allow popups and try again.");
    } else if (error.code === "auth/admin-restricted-operation") {
      throw new Error("🔒 This Firebase project restricts authentication to specific users only. Check Firebase Console → Authentication → Users tab for allowed users.");
    } else if (error.code === "auth/user-disabled") {
      throw new Error("🚫 This user account has been disabled. Contact support.");
    } else if (error.code === "auth/cancelled-popup-request") {
      throw new Error("🔄 Another sign-in popup is already open. Close it and try again.");
    } else if (error.code === "auth/web-storage-unsupported") {
      throw new Error("💾 Your browser doesn't support web storage required for authentication.");
    }
    
    // Generic error with helpful debugging info
    throw new Error(`🔥 Firebase Auth Error: ${error.code} - ${error.message}. Check browser console for details.`);
  }
};

// Simple sign out function
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log("Sign out successful");
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};

// Export auth instance and utilities
export { auth, onAuthStateChanged };
export type { User };