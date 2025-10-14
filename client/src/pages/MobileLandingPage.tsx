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
    // WhatsApp number for DotSpark
    const phoneNumber = "16067157733";
    const message = encodeURIComponent(
      `Hi! I just signed up with DotSpark using ${userEmail}. I'd like to connect my WhatsApp to stay updated with my insights and community.`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.location.href = whatsappUrl; // Use location.href instead of window.open for better mobile compatibility
  };

  const handleJoinCommunity = () => {
    window.open("https://chat.whatsapp.com/E6Mwv20MUrCG58xuVJQNTv", "_blank");
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
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                DotSpark
              </h1>
              <p className="text-xs text-muted-foreground">A Human Intelligence Network</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to DotSpark!</h2>
          <p className="text-muted-foreground">
            {user?.fullName || user?.email}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You're now part of our human intelligence network. Choose how you'd like to continue:
          </p>
        </div>

        {/* Option Cards */}
        <div className="space-y-4">
          {/* WhatsApp Connection */}
          <Card className="border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Connect via WhatsApp</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stay connected and capture your thoughts on the go. Get seamless access to your DotSpark directly from Whatsapp.
                  </p>
                  <Button
                    onClick={handleWhatsAppConnect}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Continue with WhatsApp
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Access */}
          <Card className="border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">Join the Community</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore shared insights, connect with others, and discover collective intelligence from our growing community.
                  </p>
                  <Button
                    onClick={handleJoinCommunity}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Explore Community
                    <ArrowRight className="h-4 w-4 ml-2" />
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
