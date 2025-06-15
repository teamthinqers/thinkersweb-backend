import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signOut } from "@/lib/auth-simple";

export default function TestGoogleAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Testing Google sign-in...");
      const result = await signInWithGoogle();
      setUser(result);
      console.log("Sign-in successful:", result.displayName);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err.message || "Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signOut();
      setUser(null);
      console.log("Sign-out successful");
    } catch (err: any) {
      console.error("Sign-out error:", err);
      setError(err.message || "Sign-out failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Google Auth Test</h1>
        
        {!user ? (
          <div className="space-y-4">
            <Button 
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full h-12 text-lg"
            >
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
            
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 rounded text-red-700 dark:text-red-200">
                Error: {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-100 dark:bg-green-900 border border-green-400 rounded">
              <h3 className="font-semibold text-green-800 dark:text-green-200">Sign-in Successful!</h3>
              <p className="text-green-700 dark:text-green-300">Name: {user.displayName}</p>
              <p className="text-green-700 dark:text-green-300">Email: {user.email}</p>
              <p className="text-green-700 dark:text-green-300">UID: {user.uid}</p>
            </div>
            
            <Button 
              onClick={handleSignOut}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}