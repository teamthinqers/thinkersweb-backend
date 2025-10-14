import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Users, Sparkles, ArrowRight, CheckCircle, Network, Zap, MessageCircle, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect logged-in users to /myneura
  useEffect(() => {
    console.log("🚀 NEW HOMEPAGE LOADED - VERSION 2.0");
    if (!isLoading && user) {
      setLocation("/myneura");
    }
  }, [user, isLoading, setLocation]);

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
                onClick={() => setLocation("/")}
              >
                <img 
                  src="/dotspark-logo-combined.png?v=1" 
                  alt="DotSpark" 
                  className="h-10 w-auto object-contain" 
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-sm font-medium text-gray-700 hover:text-amber-600"
              >
                About
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open('https://wa.me/16067157733?text=Hey%20DotSpark%20:wave:', '_blank')}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Sign In / Register
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Animated Dots */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-amber-500 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
          {/* Hero Section - Split Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[600px]">
            
            {/* Left Column - Content */}
            <div className="space-y-8 lg:space-y-10 text-center lg:text-left">
              {/* DotSpark Logo */}
              <div className="inline-block animate-fade-in-up">
                <div className="relative group">
                  {/* Glow Effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-all duration-500"></div>
                  
                  {/* Logo with Text */}
                  <div className="relative flex items-center gap-4">
                    <img 
                      src="/dotspark-icon.png" 
                      alt="DotSpark" 
                      className="h-16 w-16 lg:h-20 lg:w-20 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 drop-shadow-2xl" 
                    />
                    <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      DotSpark
                    </span>
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div className="animate-fade-in-up space-y-6" style={{ animationDelay: '0.15s' }}>
                <div className="space-y-2">
                  <h1 className="text-[2.75rem] md:text-5xl lg:text-6xl font-medium leading-[1.1] bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, -apple-system, system-ui, sans-serif', letterSpacing: '-0.04em' }}>
                    A Human Intelligence Network
                  </h1>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-lg lg:text-xl text-gray-600/90 max-w-xl mx-auto lg:mx-0 animate-fade-in-up font-normal leading-relaxed" style={{ animationDelay: '0.3s', letterSpacing: '-0.005em' }}>
                Where human thoughts connect, evolve, and give rise to a collective intelligence that feels deeply human.
              </p>

              {/* CTA Button */}
              <div className="flex justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                <Button
                  size="lg"
                  onClick={() => setLocation("/auth")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Right Column - Power of Connected Intelligence */}
            <div className="relative hidden lg:flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full max-w-xl h-[500px]">
                
                {/* Human Nodes in Circle */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 45) * (Math.PI / 180);
                  const radius = 200;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={`human-${i}`}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        animation: `float 5s ease-in-out infinite`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    >
                      <div className="relative">
                        {/* Glowing Mind/Intelligence */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <div className="absolute inset-0 bg-amber-400/40 blur-lg rounded-full animate-pulse"></div>
                          <div className="relative w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full"></div>
                        </div>
                        
                        {/* Human Figure */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full blur-sm opacity-30"></div>
                          <div className="relative w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-xl border-2 border-gray-500/30">
                            <div className="w-8 h-8 bg-white/90 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Dynamic Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                  <defs>
                    <linearGradient id="powerFlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Lines to center (showing power flow) */}
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const radius = 200;
                    const x = Math.cos(angle) * radius + 50;
                    const y = Math.sin(angle) * radius + 50;
                    
                    return (
                      <line
                        key={`power-${i}`}
                        x1={`${x}%`}
                        y1={`${y}%`}
                        x2="50%"
                        y2="50%"
                        stroke="url(#powerFlow)"
                        strokeWidth="2.5"
                        className="opacity-50"
                      />
                    );
                  })}
                </svg>

                {/* Central Power Core - Amplified Intelligence */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative">
                    {/* Power Waves */}
                    <div className="absolute -inset-20 border-4 border-amber-400/40 rounded-full animate-ping" style={{ animationDuration: '2.5s' }}></div>
                    <div className="absolute -inset-24 border-2 border-orange-400/30 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.3s' }}></div>
                    <div className="absolute -inset-28 border border-amber-400/20 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.6s' }}></div>
                    
                    {/* Massive Power Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                    
                    {/* Core Energy Sphere */}
                    <div className="relative w-40 h-40 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-amber-300/30">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-full"></div>
                      <Zap className="w-20 h-20 text-white relative z-10 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Energy Particles Flowing Inward */}
                {[...Array(24)].map((_, i) => {
                  const angle = (i * 15) * (Math.PI / 180);
                  const startX = Math.cos(angle) * 200;
                  const startY = Math.sin(angle) * 200;
                  
                  return (
                    <div
                      key={`energy-${i}`}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50"
                      style={{
                        animation: `flowIn 2s ease-in infinite`,
                        animationDelay: `${i * 0.08}s`,
                        transform: `translate(${startX}px, ${startY}px)`
                      }}
                    />
                  );
                })}
                
                <style jsx>{`
                  @keyframes flowIn {
                    0% {
                      transform: translate(${200}px, 0px) scale(0.5);
                      opacity: 0.3;
                    }
                    100% {
                      transform: translate(0px, 0px) scale(1.5);
                      opacity: 0;
                    }
                  }
                `}</style>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Capture Thoughts</h3>
              <p className="text-gray-600">
                Quickly capture and preserve your insights, ideas, and learnings in one place.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                <Network className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Ideas</h3>
              <p className="text-gray-600">
                See how your thoughts interconnect and discover patterns across your knowledge.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Collective Intelligence</h3>
              <p className="text-gray-600">
                Share insights and learn from a community of thoughtful individuals.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Create Your Thoughts</h3>
                  <p className="text-gray-600">
                    Add thoughts with headings, summaries, emotions, and optional images. Each thought is a "dot" in your knowledge network.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Explore Connections</h3>
                  <p className="text-gray-600">
                    View your thoughts as an interactive cloud, discover patterns, and see how ideas relate to each other.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Share & Learn</h3>
                  <p className="text-gray-600">
                    Make thoughts public to contribute to collective intelligence, or keep them private for personal reflection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-gray-600 mb-6">
                Join DotSpark and begin building your knowledge network today.
              </p>
              <Button
                size="lg"
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>© 2025 DotSpark. Building collective intelligence together.</p>
        </div>
      </footer>
    </div>
  );
}
