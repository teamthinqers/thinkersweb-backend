import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-new";
import { ArrowLeft } from "lucide-react";
import { isMobileBrowser } from "@/lib/mobile-detection";

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
        // Check if user is on mobile browser and redirect accordingly
        if (isMobileBrowser()) {
          setLocation('/mobile-landing');
        } else {
          setLocation('/myneura');
        }
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30">
      {/* Logo at top left */}
      <div className="absolute top-6 left-6">
        <img 
          src="/dotspark-logo-combined.png?v=1" 
          alt="DotSpark" 
          className="h-8 w-auto cursor-pointer" 
          onClick={() => setLocation("/")}
        />
      </div>

      {/* Back button at top right */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation("/")}
          className="text-sm font-medium text-gray-700 border-gray-300 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Centered content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Sign In Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
              {/* DotSpark branding - Same as Hero */}
              <div className="text-center mb-8">
                <div className="inline-block mb-6">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                    <div className="relative flex items-center gap-3 justify-center">
                      <img 
                        src="/dotspark-icon.png" 
                        alt="DotSpark" 
                        className="h-14 w-14 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 drop-shadow-2xl" 
                      />
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        DotSpark
                      </span>
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl font-medium leading-tight bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                  A Human Intelligence Network
                </h1>
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

            {/* ThinQers Community Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 flex flex-col">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-9 h-9">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join ThinQers Community</h2>
                <p className="text-gray-600 text-sm">
                  Connect with fellow ThinQers on WhatsApp. Share insights, learn from others, and be part of the collective intelligence network.
                </p>
              </div>
              
              <div className="mt-auto">
                <a
                  href="https://chat.whatsapp.com/E6Mwv20MUrCG58xuVJQNTv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold text-base rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Join Community
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
