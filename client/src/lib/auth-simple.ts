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
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", result.user.displayName);
    return result.user;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in cancelled by user");
    }
    throw error;
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