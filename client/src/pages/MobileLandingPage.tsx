import { useAuth } from "@/hooks/use-auth-new";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Users, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isMobileBrowser } from "@/lib/mobile-detection";

export default function MobileLandingPage() {
  const { user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Force cache clear on mount
    console.log("🔄 Mobile Landing Page v2.1 - October 14, 2025");
    
    // If not mobile browser, redirect to main app
    if (!isMobileBrowser()) {
      setLocation("/mydotspark");
      return;
    }

    // If not authenticated, redirect to landing
    if (!isLoading && !user) {
      setLocation("/");
      return;
    }

    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user, isLoading, setLocation]);

  const handleWhatsAppConnect = () => {
    // WhatsApp BOT number for DotSpark
    const phoneNumber = "16067157733";
    const message = encodeURIComponent(
      `Hi! I just signed up with DotSpark using ${userEmail}. I'd like to connect my WhatsApp to stay updated with my insights and community.`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    console.log("📱 Opening WhatsApp BOT:", whatsappUrl);
    window.location.href = whatsappUrl;
  };

  const handleJoinCommunity = () => {
    const communityUrl = "https://chat.whatsapp.com/E6Mwv20MUrCG58xuVJQNTv";
    console.log("👥 Opening WhatsApp COMMUNITY:", communityUrl);
    window.open(communityUrl, "_blank");
  };

  const handleBackToHome = async () => {
    try {
      setIsLoggingOut(true);
      console.log("🔓 Signing out user and returning to homepage...");
      await logout();
      console.log("✅ Logout successful, redirecting to homepage");
      setLocation("/");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Still redirect even if logout fails
      setLocation("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:to-amber-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:to-amber-950">
      {/* Header - More spacious and centered */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-b from-white/95 via-amber-50/90 to-orange-50/80 border-b border-amber-200/40 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          {/* Back button - Top left */}
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHome}
              disabled={isLoggingOut}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100/50 rounded-full"
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Logo and Brand - Centered with more space */}
          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            {/* Logo with enhanced glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-2 shadow-lg">
                <img 
                  src="/dotspark-icon.png" 
                  alt="DotSpark" 
                  className="h-14 w-14 drop-shadow-lg" 
                />
              </div>
            </div>
            
            {/* Brand text - More spacious */}
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
                DotSpark
              </h1>
              <p className="text-xs font-medium text-amber-700/70 dark:text-amber-400/70 tracking-wide">
                A Human Intelligence Network
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Welcome Section - More elegant */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100/80 to-orange-100/80 rounded-full mb-4 shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">Welcome Back!</span>
          </div>
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {user?.fullName || user?.email?.split('@')[0]}
          </p>
        </div>

        {/* Option Cards - Redesigned */}
        <div className="space-y-5">
          {/* WhatsApp Connection - More stylish */}
          <div 
            onClick={handleWhatsAppConnect}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <Card className="relative border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl shadow-xl overflow-hidden transform group-hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-green-400/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative">
                  {/* Icon with animation */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <MessageCircle className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Connect via WhatsApp
                      </h3>
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                        Start capturing thoughts instantly
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                    Stay connected and capture your thoughts on the go. Get seamless access to your DotSpark directly from WhatsApp.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Tap to connect
                    </span>
                    <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Community Access - More stylish */}
          <div 
            onClick={handleJoinCommunity}
            className="group relative cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <Card className="relative border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950 dark:to-orange-950 rounded-2xl shadow-xl overflow-hidden transform group-hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative">
                  {/* Icon with animation */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Join ThinQers Community
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Connect with fellow thinkers
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                    Explore shared insights, connect with others, and discover collective intelligence from our growing community.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      Tap to join
                    </span>
                    <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
