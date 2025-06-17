import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup, 
  signOut as firebaseSignOut, 
  User, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { prepareAuthEnvironment, withAuthRecovery, handleMissingInitialStateError } from "./auth-recovery";

// Log environment variables to help debug (without showing actual values)
console.log("Firebase environment variables available:", {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: !!import.meta.env.VITE_FIREBASE_APP_ID
});

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredVars = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      throw new Error(`Firebase configuration error: Missing ${key}`);
    }
  }
  
  return requiredVars;
};

// Validate and get Firebase configuration
const validatedConfig = validateFirebaseConfig();

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: validatedConfig.apiKey,
  authDomain: `${validatedConfig.projectId}.firebaseapp.com`,
  projectId: validatedConfig.projectId,
  storageBucket: `${validatedConfig.projectId}.appspot.com`,
  messagingSenderId: "123456789", // Default for web apps
  appId: validatedConfig.appId,
};

// Initialize Firebase with proper duplicate app handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    app = getApp();
    console.log("Using existing Firebase app");
  } else {
    console.error("Firebase initialization error:", error);
    throw new Error("Failed to initialize Firebase. Please check configuration.");
  }
}

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

// Configure Google provider with enhanced settings
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Add additional parameters to prevent state issues
  access_type: 'offline',
  include_granted_scopes: 'true'
});

// Add scopes for better authentication
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Create a recovery-enhanced sign-in function
const _signInWithGoogleBase = async (): Promise<User> => {
  console.log("Starting Google sign-in process...");
  
  // Check auth state before proceeding
  if (!auth) {
    throw new Error("Firebase auth not initialized properly");
  }
  
  if (auth.currentUser) {
    console.log("User already signed in:", auth.currentUser.displayName);
    
    // Force token refresh to ensure maximum longevity even for existing sessions
    await auth.currentUser.getIdToken(true);
    console.log("Refreshed token for existing user session");
    
    return auth.currentUser;
  }
  
  // Prepare environment to prevent "missing initial state" error
  await prepareAuthEnvironment();
  
  console.log("Attempting Google sign-in popup...");
  const result = await signInWithPopup(auth, googleProvider);
  
  if (!result.user) {
    throw new Error("No user data returned from Google sign-in");
  }
  
  return result.user;
};

// Enhanced sign in with Google using recovery system
export const signInWithGoogle = withAuthRecovery(
  async (): Promise<User> => {
    const user = await _signInWithGoogleBase();
    
    console.log("Google sign in successful:", user.displayName);
    
    // Store enhanced user info in localStorage as backup with longer expiration
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString(),
      // Add explicit fields for persistence
      persistUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      rememberMe: true // Always remember by default
    };
    
    localStorage.setItem('dotspark_user', JSON.stringify(userData));
    localStorage.setItem('dotspark_session_active', 'true');
    
    // Force an explicit token refresh to maximize token lifetime
    await user.getIdToken(true);
    console.log("Initial token refresh completed for new login");
    
    return user;
  },
  {
    clearStorage: true,
    retryAttempts: 2,
    retryDelay: 1000
  }
);

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