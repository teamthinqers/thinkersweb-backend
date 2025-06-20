import React from "react";
import { Users, MessageCircle, Share2, Heart, TrendingUp, UserPlus, Globe, ArrowLeft, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Social() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Check if user came from dot interface
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    if (referrer.includes('/dot') || referrer.includes('/dot-capture')) {
      setLocation('/dot');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="relative text-center mb-12">
          {/* Backspace Button */}
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="absolute left-0 top-0 flex items-center gap-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 z-10"
            style={{ touchAction: 'manipulation' }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Users className="h-12 w-12 text-amber-600 animate-pulse" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Users className="h-12 w-12 text-amber-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              DotSpark Social
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect with fellow ThinQers, share insights, and discover collaborative learning opportunities
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Community Feed */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-amber-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Community Feed</CardTitle>
              </div>
              <CardDescription>
                Discover trending insights and conversations from the DotSpark community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <MessageCircle className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Connect with ThinQers */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-amber-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Connect</CardTitle>
              </div>
              <CardDescription>
                Find and connect with like-minded learners and thought leaders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Users className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Share Insights */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-amber-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Share Insights</CardTitle>
              </div>
              <CardDescription>
                Share your dots and insights with the community for collaborative learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Share2 className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-amber-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Trending Topics</CardTitle>
              </div>
              <CardDescription>
                Explore what's trending in the DotSpark learning community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <TrendingUp className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Collaborative Learning */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-amber-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Study Groups</CardTitle>
              </div>
              <CardDescription>
                Join or create study groups for collaborative learning experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <Heart className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          {/* Social Neura */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-red-200/50 cursor-pointer"
                onClick={() => setLocation("/social-neura")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white animate-pulse" />
                </div>
                <CardTitle className="text-xl text-gray-800">Social Neura</CardTitle>
              </div>
              <CardDescription>
                Neural intelligence for collaborative thinking and social insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:border-red-300">
                <Brain className="mr-2 h-4 w-4 text-red-600" />
                Explore Neural Features
              </Button>
            </CardContent>
          </Card>

          {/* Knowledge Exchange */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-amber-200/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-800">Knowledge Exchange</CardTitle>
              </div>
              <CardDescription>
                Participate in discussions and knowledge sharing sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <MessageCircle className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Banner */}
        <div className="text-center bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-8 border-2 border-amber-200/50">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Users className="h-8 w-8 text-amber-600 animate-bounce" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Users className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              Social Features Coming Soon!
            </h2>
          </div>
          <p className="text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">
            We're building amazing social features to connect ThinQers worldwide. 
            Share your dots, collaborate on insights, and grow together in our learning community.
          </p>
        </div>
      </div>
    </div>
  );
}