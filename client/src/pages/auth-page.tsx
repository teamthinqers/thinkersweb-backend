import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-new";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { loginWithGoogle, checkAuth } = useAuth();
  
  const getRedirectPath = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        setLocation(`/${redirect}`);
      } else {
        setLocation('/myneura');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      await checkAuth();
      getRedirectPath();
    } catch (error) {
      console.error("❌ Google sign in error:", error);
      setIsLoading(false);
      
      const errorMessage = error instanceof Error ? error.message : "Could not sign in with Google. Please try again.";
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Logo at top left */}
      <div className="absolute top-6 left-6">
        <img 
          src="/dotspark-logo-combined.png?v=1" 
          alt="DotSpark" 
          className="h-8 w-auto cursor-pointer" 
          onClick={() => setLocation("/")}
        />
      </div>

      {/* Centered card */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">Welcome back</h1>
          
          <div className="space-y-4">
            <Button 
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-6 text-base rounded-lg font-medium flex items-center justify-center gap-3"
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.42-.76-2.94-.76-4.59 0-1.66.28-3.18.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-6">
              By clicking Continue, you agree to DotSpark's{' '}
              <button onClick={() => setLocation('/terms')} className="text-blue-600 hover:underline">
                User Agreement
              </button>
              ,{' '}
              <button onClick={() => setLocation('/privacy')} className="text-blue-600 hover:underline">
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
