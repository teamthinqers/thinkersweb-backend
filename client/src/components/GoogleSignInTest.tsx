import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GoogleSignInTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Direct Firebase import to avoid any cached issues
      const { initializeApp } = await import("firebase/app");

      
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };
      
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);

      
      console.log("Attempting Google sign-in...");
      const result = await signInWithPopup(auth, provider);
      
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.avatarUrl
      });
      
      console.log("Google sign-in successful!", result.user.displayName);
      
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Google Sign-In Test</h3>
      
      {!user ? (
        <Button 
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Signing in..." : "Test Google Sign-In"}
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-green-600 font-medium">✓ Sign-in successful!</p>
          <p>Name: {user.displayName}</p>
          <p>Email: {user.email}</p>
          <Button 
            onClick={() => setUser(null)}
            variant="outline"
            className="w-full"
          >
            Clear Test
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-red-600 mt-2">Error: {error}</p>
      )}
    </div>
  );
}