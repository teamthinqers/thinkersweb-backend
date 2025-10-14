import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Brain, Users, Sparkles, ArrowRight, CheckCircle, Network, Zap, MessageCircle, Lightbulb, User, Target } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
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
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
              >
                <SiWhatsapp className="h-5 w-5" />
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero Section - Split Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen py-12 lg:py-20">
            
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    // Scroll to features or about section
                    const featuresSection = document.querySelector('.features-section');
                    featuresSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 w-full sm:w-48 py-6 text-lg font-semibold transform hover:scale-105 transition-all duration-300"
                >
                  Know Why?
                </Button>
                <Button
                  size="lg"
                  onClick={() => setLocation("/auth")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white w-full sm:w-48 py-6 text-lg font-semibold shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Right Column - Intelligence Network */}
            <div className="relative hidden lg:flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full max-w-lg aspect-square">
                
                {/* Central Hub - Brain */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>
                    <div className="absolute -inset-8 border-2 border-amber-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute -inset-12 border border-orange-400/20 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
                    
                    <div className="relative w-28 h-28 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                      <Brain className="w-14 h-14 text-white" />
                    </div>
                  </div>
                </div>

                {/* Human Nodes Around */}
                {[...Array(6)].map((_, i) => {
                  const angle = (i * 60) * (Math.PI / 180);
                  const radius = 180;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 animate-pulse"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '3s'
                      }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full blur-lg opacity-30"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                  {[...Array(6)].map((_, i) => {
                    const angle = (i * 60) * (Math.PI / 180);
                    const radius = 180;
                    const x = Math.cos(angle) * radius + 50;
                    const y = Math.sin(angle) * radius + 50;
                    
                    return (
                      <line
                        key={i}
                        x1="50%"
                        y1="50%"
                        x2={`${x}%`}
                        y2={`${y}%`}
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        className="opacity-40"
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Why DotSpark Section */}
          <div className="features-section min-h-screen flex items-center py-12">
            <div className="max-w-6xl mx-auto px-4 w-full">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                
                {/* Left - Visual */}
                <div className="relative order-2 lg:order-1">
                  <div className="relative w-full max-w-sm mx-auto" style={{ height: '300px' }}>
                    
                    {/* Central Brain/Thought Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                        
                        {/* Main icon - Pulsating */}
                        <div className="relative w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse" style={{ animationDuration: '2s' }}>
                          <Lightbulb className="w-16 h-16 text-white animate-pulse" style={{ animationDuration: '1.5s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Thought Waves */}
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-amber-400/30 rounded-full"
                        style={{
                          width: `${i * 80 + 100}px`,
                          height: `${i * 80 + 100}px`,
                          animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
                          animationDelay: `${i * 0.3}s`
                        }}
                      />
                    ))}

                    {/* Floating Thought Particles */}
                    {[...Array(8)].map((_, i) => {
                      const angle = (i * 45) * (Math.PI / 180);
                      const radius = 150;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      
                      return (
                        <div
                          key={`thought-${i}`}
                          className="absolute top-1/2 left-1/2"
                          style={{
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        >
                          <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full shadow-lg"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right - Content */}
                <div className="order-1 lg:order-2 space-y-5">
                  <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Why DotSpark
                  </h2>
                  
                  <div className="space-y-5 text-base lg:text-lg text-gray-700 leading-relaxed">
                    <p>
                      In a world obsessed with Artificial Intelligence, we're forgetting what made us intelligent in the first place — <span className="font-semibold text-gray-900">Thinking</span>.
                    </p>
                    
                    <p>
                      DotSpark was built for those who choose to <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">ThinQ</span>, for those who believe <span className="font-semibold text-gray-900">Human Intelligence</span> still holds untapped potential, and that when it connects, it becomes far more powerful than AI.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Inside the Network Section */}
          <div className="py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-4">
                  Inside the Network
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Three pillars of Human Intelligence, amplified
                </p>
              </div>

              {/* Three Pillars - Grid Layout */}
              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                
                {/* Pillar 1: Self Reflection */}
                <div className="text-center space-y-6">
                  <div className="relative w-full max-w-xs mx-auto h-64">
                    {/* Central Person */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Orbiting Dots */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full shadow-lg"
                        style={{
                          animation: `orbit 8s linear infinite`,
                          animationDelay: `${-i * 1.33}s`,
                          transformOrigin: '0 0'
                        }}
                      />
                    ))}
                    
                    <style>{`
                      @keyframes orbit {
                        from {
                          transform: translate(-50%, -50%) rotate(0deg) translateX(90px);
                        }
                        to {
                          transform: translate(-50%, -50%) rotate(360deg) translateX(90px);
                        }
                      }
                    `}</style>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Self Reflection
                    </h3>
                    <p className="text-sm font-semibold text-amber-600">Where Thinking Begins</p>
                    <p className="text-gray-700 leading-relaxed">
                      Every journey starts with a thought. DotSpark gives you a private space to capture those thoughts — not for validation, but for clarity.
                    </p>
                  </div>
                </div>

                {/* Pillar 2: Thought Circles */}
                <div className="text-center space-y-6">
                  <div className="relative w-full max-w-xs mx-auto h-64">
                    {/* Central Target Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                          <Target className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* 3 Profile Avatars Around */}
                    {[...Array(3)].map((_, i) => {
                      const angle = (i * 120 + 30) * (Math.PI / 180);
                      const radius = 80;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2"
                          style={{
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            animation: `float ${3 + (i % 2)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`
                          }}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-amber-300 rounded-full blur-sm opacity-30"></div>
                            <div className="relative w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                              <User className="w-7 h-7 text-white" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Thought Circles
                    </h3>
                    <p className="text-sm font-semibold text-amber-600">Think, Share, Evolve</p>
                    <p className="text-gray-700 leading-relaxed">
                      ThinQers create private Thought Circles to explore perspectives and refine their thinking together. It's not about debate — it's about discovery.
                    </p>
                  </div>
                </div>

                {/* Pillar 3: The Social Brain */}
                <div className="text-center space-y-6">
                  <div className="relative w-full max-w-xs mx-auto h-64">
                    {/* Central Core - Pulsating */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-orange-300 to-red-300 rounded-full blur-xl opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center animate-pulse" style={{ animationDuration: '1.5s' }}>
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Neural Network Nodes */}
                    {[...Array(12)].map((_, i) => {
                      const angle = (i * 30) * (Math.PI / 180);
                      const radius = 80 + (i % 3) * 25;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      
                      return (
                        <div
                          key={i}
                          className="absolute top-1/2 left-1/2"
                          style={{
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            animation: `pulse ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        >
                          <div className="w-2 h-2 bg-gradient-to-br from-orange-400 to-red-400 rounded-full shadow-lg"></div>
                        </div>
                      );
                    })}

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
                      {[...Array(12)].map((_, i) => {
                        const angle = (i * 30) * (Math.PI / 180);
                        const radius = 80 + (i % 3) * 25;
                        const x = Math.cos(angle) * radius + 50;
                        const y = Math.sin(angle) * radius + 50;
                        
                        return (
                          <line
                            key={i}
                            x1="50%"
                            y1="50%"
                            x2={`${x}%`}
                            y2={`${y}%`}
                            stroke="url(#socialGradient)"
                            strokeWidth="1"
                            className="opacity-30"
                          />
                        );
                      })}
                      <defs>
                        <linearGradient id="socialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      The Social Brain
                    </h3>
                    <p className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Where Intelligence Connects</p>
                    <p className="text-gray-700 leading-relaxed">
                      When ideas from many circles converge, a collective brain begins to form — where ThinQers co-create and grow shared intelligence.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* From the Founder Section */}
          <div className="py-20 lg:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-4">
                  From the Founder
                </h2>
              </div>

              <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl p-8 lg:p-12 border border-amber-100 shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Hey ThinQers,
                </p>
                
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed mb-8">
                  <p>
                    Thank you for taking a moment to pause, reflect, and reach here.
                  </p>
                  
                  <p>
                    The world today is flooded with big data, but I've always believed that true intelligence lives in the small, distilled pieces of human data — the kind that can't be measured, only felt.
                  </p>
                  
                  <p>
                    DotSpark was born from that belief. It's a space for those who choose to think, connect, and reflect deeply. I'm on a mission to build a network of ThinQers who see thinking not as an act of isolation, but as a bridge to collective understanding.
                  </p>
                  
                  <p className="font-medium text-gray-800">
                    Because I believe the next evolution of intelligence won't be artificial. It will be <span className="font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Connected Human Intelligence</span> — and it will be far more powerful than AI.
                  </p>
                </div>

                <div className="border-t border-amber-200 pt-6">
                  <p className="text-xl font-bold text-gray-900">Aravindh Rajendran</p>
                  <p className="text-gray-600">Founder, DotSpark</p>
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
