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
              <div className="animate-fade-in-up space-y-4" style={{ animationDelay: '0.15s' }}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', letterSpacing: '-0.02em' }}>
                  A Human Intelligence Network
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-gray-600 max-w-xl mx-auto lg:mx-0 animate-fade-in-up font-light leading-relaxed" style={{ animationDelay: '0.3s', letterSpacing: '-0.01em' }}>
                Where human thoughts converge to create collective intelligence that transcends individual minds.
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

            {/* Right Column - Collective Intelligence Visualization */}
            <div className="relative hidden lg:flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full max-w-xl aspect-square">
                
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-orange-100/20 to-amber-100/20 rounded-full blur-3xl"></div>
                
                {/* Central Neural Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                  <div className="relative">
                    {/* Expanding rings - representing signal propagation */}
                    <div className="absolute -inset-16 border border-amber-300/40 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute -inset-20 border border-orange-300/30 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
                    <div className="absolute -inset-24 border border-amber-300/20 rounded-full animate-ping" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
                    
                    {/* Core node */}
                    <div className="relative w-32 h-32 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full"></div>
                      <Network className="w-16 h-16 text-white relative z-10" />
                    </div>
                  </div>
                </div>

                {/* Mind Nodes - Outer Ring */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30) * (Math.PI / 180);
                  const radius = 220;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const sizes = [56, 48, 52, 48, 56, 52, 48, 56, 52, 48, 56, 48];
                  
                  return (
                    <div
                      key={`outer-${i}`}
                      className="absolute top-1/2 left-1/2 z-10"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        animation: `float 6s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    >
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/50 to-orange-200/50 rounded-full blur-md"></div>
                        <div 
                          className="relative bg-gradient-to-br from-amber-400/90 to-orange-400/90 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/20"
                          style={{ width: sizes[i], height: sizes[i] }}
                        >
                          <Brain className="w-6 h-6 text-white/90" />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Connection Web - Neural Pathways */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                  <defs>
                    <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.15" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Mesh connections between nodes */}
                  {[...Array(12)].map((_, i) => {
                    const angle1 = (i * 30) * (Math.PI / 180);
                    const radius = 220;
                    const x1 = Math.cos(angle1) * radius + 50;
                    const y1 = Math.sin(angle1) * radius + 50;
                    
                    // Connect to center
                    return (
                      <g key={`connection-${i}`}>
                        <line
                          x1="50%"
                          y1="50%"
                          x2={`${x1}%`}
                          y2={`${y1}%`}
                          stroke="url(#neuralGradient)"
                          strokeWidth="1.5"
                          filter="url(#glow)"
                        />
                        
                        {/* Connect to adjacent nodes */}
                        {i < 11 && (() => {
                          const angle2 = ((i + 1) * 30) * (Math.PI / 180);
                          const x2 = Math.cos(angle2) * radius + 50;
                          const y2 = Math.sin(angle2) * radius + 50;
                          
                          return (
                            <line
                              x1={`${x1}%`}
                              y1={`${y1}%`}
                              x2={`${x2}%`}
                              y2={`${y2}%`}
                              stroke="url(#neuralGradient)"
                              strokeWidth="1"
                              strokeDasharray="4,4"
                            />
                          );
                        })()}
                      </g>
                    );
                  })}
                </svg>

                {/* Energy particles flowing through network */}
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={`particle-${i}`}
                      className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animation: `pulse ${1.5 + Math.random() * 2}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 3}s`,
                        opacity: 0.7
                      }}
                    />
                  ))}
                </div>
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
