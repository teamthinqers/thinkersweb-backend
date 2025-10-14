import { useAuth } from "@/hooks/use-auth-new";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isMobileBrowser } from "@/lib/mobile-detection";

export default function MobileLandingPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [userEmail, setUserEmail] = useState<string>("");

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
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-200/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            {/* Logo with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-md opacity-40"></div>
              <img 
                src="/dotspark-icon.png" 
                alt="DotSpark" 
                className="relative h-12 w-12 drop-shadow-lg" 
              />
            </div>
            
            {/* Brand text */}
            <div className="flex flex-col items-start">
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
                DotSpark
              </h1>
              <p className="text-xs font-medium text-amber-700/80 dark:text-amber-400/70 tracking-wide">
                A Human Intelligence Network
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 max-w-lg">
        {/* Welcome Section */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-2">Welcome to DotSpark!</h2>
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            {user?.fullName || user?.email}
          </p>
        </div>

        {/* Option Cards */}
        <div className="space-y-3">
          {/* WhatsApp Connection */}
          <Card className="border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-colors bg-gradient-to-br from-green-50/90 via-emerald-50/70 to-green-50/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1">Connect via WhatsApp</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Stay connected and capture your thoughts on the go. Get seamless access to your DotSpark directly from Whatsapp.
                  </p>
                  <Button
                    onClick={handleWhatsAppConnect}
                    size="sm"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                    Continue with WhatsApp
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Access */}
          <Card className="border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-amber-50/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1">Join the Community</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Explore shared insights, connect with others, and discover collective intelligence from our growing community.
                  </p>
                  <Button
                    onClick={handleJoinCommunity}
                    size="sm"
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" />
                    Explore Community
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
