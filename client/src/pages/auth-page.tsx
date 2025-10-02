import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loginWithGoogle } = useAuth();
  
  // Get redirect path from URL if any
  const getRedirectPath = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        setLocation(`/${redirect}`);
      } else {
        // Default redirect to home after login
        setLocation('/home');
      }
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      getRedirectPath();
    }
  }, [user]);

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      console.log("🚀 Starting Google Sign In process");
      
      await loginWithGoogle();
      
      console.log("✅ Google login completed successfully");
      
      // Navigate after successful login
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
    <div className="flex min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30">
      {/* Left side with Google auth */}
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 flex items-center gap-2"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome to DotSpark</h2>
            <p className="mt-2 text-gray-600">
              Sign in to access your collective intelligence network
            </p>
          </div>

          {/* Google Sign In Button */}
          <div className="w-full space-y-6">
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 text-lg rounded-xl font-semibold flex items-center justify-center gap-3"
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-6 w-6">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.42-.76-2.94-.76-4.59 0-1.66.28-3.18.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <p className="text-sm text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Right side with branding/marketing */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-100/40 to-orange-100/30 p-10">
        <div className="w-full max-w-2xl mx-auto flex flex-col justify-center">
          <div className="space-y-8">
            {/* Hero Section Content */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2 text-sm mb-4">
                <img src="/dotspark-logo-icon.png?v=2" alt="DotSpark" className="h-6 w-6 rounded" />
                <span className="font-semibold text-amber-700">Introducing DotSpark</span>
              </div>
              
              <div className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                <span className="font-sans tracking-normal text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500">
                  For the OG Thin<span className="relative inline-block px-2 py-1 bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-lg shadow-lg border-2 border-amber-500/20">Q</span>ers
                </span>
              </div>
              
              <p className="text-lg text-gray-600 mb-6">
                Built on inspirations from <span className="font-semibold text-amber-700">ancient Indian wisdom</span>, 
                to preserve and sharpen your <span className="font-semibold text-amber-700">Natural Intelligence</span> in an AI Driven World.
              </p>
            </div>

            {/* 3-Step Process */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-center">
                Setup <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">DotSpark</span> in 3 Simple Steps
              </h2>
              
              <div className="space-y-4">
                {/* Step 1: Sign In */}
                <div className="bg-white/80 border border-amber-200/50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm mr-3">1</div>
                    <h3 className="text-lg font-semibold">Sign In with Google</h3>
                  </div>
                  <p className="text-gray-600 text-sm ml-11">
                    Quick and secure authentication to access your DotSpark network.
                  </p>
                </div>

                {/* Step 2: Activate DotSpark */}
                <div className="bg-white/80 border border-orange-200/50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm mr-3">2</div>
                    <h3 className="text-lg font-semibold">Activate the Dot</h3>
                  </div>
                  <p className="text-gray-600 text-sm ml-11">
                    Configure the Dot settings to capture your valuable thoughts.
                  </p>
                </div>

                {/* Step 3: Install Web App */}
                <div className="bg-white/80 border border-orange-200/50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm mr-3">3</div>
                    <h3 className="text-lg font-semibold">Join the Community</h3>
                  </div>
                  <p className="text-gray-600 text-sm ml-11">
                    Connect with thinkers worldwide and share collective intelligence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
