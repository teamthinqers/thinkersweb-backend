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
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
          {/* DotSpark branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-4">
              <img 
                src="/dotspark-logo-icon.png?v=2" 
                alt="DotSpark" 
                className="w-10 h-10 rounded-lg"
              />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900">Welcome to DotSpark</h1>
            <p className="text-gray-600 mt-2">Sign in to start thinking deeper</p>
          </div>
          
          <div className="space-y-3">
            {/* LinkedIn Sign In */}
            <Button 
              className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white py-6 text-base rounded-lg font-medium flex items-center justify-center gap-3"
              onClick={() => window.location.href = '/api/auth/linkedin'}
              type="button"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </Button>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign In */}
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
