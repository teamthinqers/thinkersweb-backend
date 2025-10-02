import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Brain, Users, Sparkles, MessageSquare, ArrowRight, 
  CheckCircle, Network, Zap, Globe, Shield, TrendingUp,
  Menu, X, User
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export default function NewLandingPage() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLocation(user ? "/home" : "/")}
              >
                <img 
                  src="/dotspark-logo-combined.png?v=1" 
                  alt="DotSpark" 
                  className="h-10 w-auto object-contain" 
                />
              </div>
            </div>

            {/* Desktop Navigation - Simple: About + Sign In only */}
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">
                About
              </span>
            </nav>

            {/* Right side - Sign In button only */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/auth")}
                className="hidden md:inline-flex"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Join Now
              </Button>

              {/* Mobile menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-6 mt-8">
                    <span className="text-lg font-medium hover:text-amber-600 cursor-pointer">About</span>
                    <SheetClose asChild>
                      <Button
                        onClick={() => setLocation("/auth")}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      >
                        Sign In
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 py-12 lg:py-20 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Welcome to the{" "}
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Collective Intelligence
                  </span>{" "}
                  Network
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Connect with thinkers worldwide. Share knowledge, discover insights, 
                  and enhance your cognitive capabilities through collective intelligence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => setLocation(user ? "/home" : "/auth")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {user ? "Go to Home" : "Get Started"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/about")}
                  className="border-2 border-amber-500 text-amber-700 hover:bg-amber-50 text-lg px-8 py-6 rounded-xl"
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    10K+
                  </div>
                  <div className="text-sm text-gray-600">Active Thinkers</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-sm text-gray-600">Knowledge Dots</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    100+
                  </div>
                  <div className="text-sm text-gray-600">Communities</div>
                </div>
              </div>
            </div>

            {/* Right side - Login/Signup Card or Welcome Card */}
            {!user ? (
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Join DotSpark Today
                    </h2>
                    <p className="text-gray-600">
                      Start your cognitive enhancement journey
                    </p>
                  </div>

                  <Button
                    onClick={() => setLocation("/auth")}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6 text-lg rounded-xl font-semibold"
                  >
                    Continue with Google
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <span
                      onClick={() => setLocation("/auth")}
                      className="text-amber-600 font-medium hover:underline cursor-pointer"
                    >
                      Sign in with Google
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-2xl p-8 text-white">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">
                      Welcome back, {user.displayName?.split(' ')[0]}!
                    </h2>
                    <p className="text-amber-100 text-lg">
                      Ready to expand your cognitive network?
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setLocation("/home")}
                      className="w-full bg-white text-amber-700 hover:bg-amber-50 py-6 text-lg rounded-xl font-semibold"
                    >
                      <Brain className="mr-2 h-5 w-5" />
                      Go to Home
                    </Button>
                    <Button
                      onClick={() => setLocation("/social")}
                      variant="outline"
                      className="w-full border-2 border-white text-white hover:bg-white/10 py-6 text-lg rounded-xl font-semibold"
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Explore Community
                    </Button>
                    <Button
                      onClick={() => setLocation("/chat")}
                      variant="outline"
                      className="w-full border-2 border-white text-white hover:bg-white/10 py-6 text-lg rounded-xl font-semibold"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      AI Chat
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-b from-white to-amber-50/30 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  DotSpark
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transform the way you learn, think, and connect with a global community of knowledge seekers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Neural Extension
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Enhance your cognitive capabilities with AI-powered insights and personalized learning paths
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Collective Intelligence
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect with thinkers worldwide and tap into the power of shared knowledge and insights
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Knowledge Dots
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Capture and organize insights into interconnected knowledge dots that grow with you
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <Network className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Neural Networks
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Build meaningful connections between ideas, people, and insights in your cognitive map
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Global Community
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Join a vibrant community of learners, thinkers, and innovators from around the world
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Privacy First
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Your data, your control. Choose what to share and what to keep private in your neural space
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Infographic Section - Placeholder for dots/sparks visuals */}
        <div className="bg-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                How{" "}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  DotSpark
                </span>{" "}
                Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A revolutionary approach to knowledge management and cognitive enhancement
              </p>
            </div>

            {/* Placeholder for visual infographics */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center border-4 border-amber-200">
                  <Sparkles className="h-16 w-16 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Capture Insights</h3>
                <p className="text-gray-600">
                  Save your thoughts, learnings, and discoveries as knowledge dots
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center border-4 border-purple-200">
                  <Network className="h-16 w-16 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Connect Ideas</h3>
                <p className="text-gray-600">
                  Link related concepts and watch your knowledge network grow
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center border-4 border-red-200">
                  <TrendingUp className="h-16 w-16 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Grow Together</h3>
                <p className="text-gray-600">
                  Share insights with the community and learn from collective intelligence
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Ready to Enhance Your Cognitive Abilities?
              </h2>
              <p className="text-xl text-white/90">
                Join thousands of thinkers who are already transforming their learning journey
              </p>
              <Button
                size="lg"
                onClick={() => setLocation(user ? "/home" : "/auth")}
                className="bg-white text-amber-700 hover:bg-amber-50 text-lg px-12 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                {user ? "Go to Home" : "Get Started for Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <img 
                src="/dotspark-logo-combined.png?v=1" 
                alt="DotSpark" 
                className="h-10 w-auto object-contain brightness-0 invert" 
              />
              <p className="text-sm text-gray-400">
                Your neural extension for cognitive enhancement and collective intelligence.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/home"><span className="hover:text-amber-400 cursor-pointer">Home</span></Link></li>
                <li><Link href="/social"><span className="hover:text-amber-400 cursor-pointer">Community</span></Link></li>
                <li><Link href="/chat"><span className="hover:text-amber-400 cursor-pointer">AI Chat</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about"><span className="hover:text-amber-400 cursor-pointer">About</span></Link></li>
                <li><span className="hover:text-amber-400 cursor-pointer">Blog</span></li>
                <li><span className="hover:text-amber-400 cursor-pointer">Careers</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-amber-400 cursor-pointer">Privacy</span></li>
                <li><span className="hover:text-amber-400 cursor-pointer">Terms</span></li>
                <li><span className="hover:text-amber-400 cursor-pointer">Security</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 DotSpark. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
