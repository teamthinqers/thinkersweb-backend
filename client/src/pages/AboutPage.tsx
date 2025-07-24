import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, ArrowLeft, Brain, BookOpen, Users, Sparkles, BarChart2, 
  MessageCircle, MessageSquare, User, Menu, X, Check, CheckCircle, Download,
  Smartphone, Monitor, Share, Plus, Home as HomeIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Dynamic Word component for cycling through words with animation
const DynamicWord = ({ words, interval = 2000 }: { words: string[], interval?: number }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (!words || words.length <= 1) return;
    
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsAnimating(false);
      }, 500); // Half a second for the fade out/in animation
    }, interval);
    
    return () => clearInterval(timer);
  }, [words, interval]);
  
  // Calculate the max width based on the longest word plus period
  const maxWordLength = words?.reduce((max, word) => 
    (word.length + 1) > max ? (word.length + 1) : max, 0) || 11; // +1 for period
  
  // Get width in pixels (approximately)
  const width = `${maxWordLength * 0.7}em`;
  
  return (
    <div 
      className={`relative inline-block text-center transition-opacity duration-500 ${
        isAnimating 
          ? 'opacity-0 blur-sm' 
          : 'opacity-100 blur-0'
      }`}
      style={{
        textShadow: isAnimating ? 'none' : '0 0 12px rgba(178, 120, 255, 0.5)',
        width: width,
        display: 'inline-block',
        textAlign: 'left',
        minWidth: '120px'
      }}
    >
      <span
        style={{
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundImage: 'linear-gradient(135deg, #b278ff, #ff6ad5)',
        }}
      >
        {(words?.[currentIndex] || 'Preserved') + '.'}
      </span>
    </div>
  );
};

// Import all the same components from the original LandingPage
import { WhatsAppContactButton } from "@/components/landing/WhatsAppContactButton";
import { CompactWhatsAppButton } from "@/components/landing/CompactWhatsAppButton";
import { ContactOptionsDialog } from "@/components/landing/ContactOptionsDialog";
import DashboardPreview from "@/components/landing/DashboardPreview";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";

export default function AboutPage() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with back button */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <img src="/dotspark-logo-icon.jpeg" alt="DotSpark" className="h-8 w-8 rounded-full" />
            <span className="text-xl font-bold">DotSpark</span>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/60" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center max-w-3xl mx-auto py-24">
            {/* Centered badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-6">
              <img src="/dotspark-logo-icon.jpeg" alt="DotSpark" className="h-8 w-8 rounded" />
              <span>Introducing DotSpark</span>
            </div>
            
            {/* Heading */}
            <div className="text-center mb-8">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                <span className="font-sans tracking-normal text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200">
                  For the OG Thin<span className="relative inline-block px-3 py-2 bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white font-bold rounded-lg shadow-lg border-2 border-amber-500/20">Q</span>ers
                </span>
              </div>
              
              <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground mb-4">
                Your Natural Intelligence. <DynamicWord words={['Preserved', 'Enhanced', 'Amplified', 'Protected']} />
              </div>
            </div>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-8">
              Built to preserve your way of thinking, protect your cognitive identity, and sharpen your clarity — without surrendering it to AI.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                  Start Chatting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              
              {user ? (
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                    <BarChart2 className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Sign Up
                    <User className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why DotSpark Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Why <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">DotSpark</span>?</h2>
            
            <div className="max-w-4xl mx-auto space-y-8 text-lg leading-relaxed text-foreground">
              <p className="font-medium">
                Human evolution was never shaped by the masses — it was led by the few who chose to think.
              </p>
              
              <p>
                From fire to frameworks, progress has always come from those who questioned, connected, and carved their own path.
              </p>
              
              <p className="font-semibold text-xl text-amber-800 dark:text-amber-600">
                DotSpark is built for them.
              </p>
              
              <div className="space-y-2">
                <p>Not for the ones who let AI think for them.</p>
                <p>Not for the ones who follow default prompts.</p>
              </div>
              
              <p className="font-medium text-xl text-amber-800 dark:text-amber-600">
                It's for the OG Thinkers, those who believe human intelligence is still the sharpest edge.
              </p>
              
              <div className="mt-12 p-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
                <p className="text-lg leading-relaxed">
                  DotSpark is inspired by ancient Indian methods of layered thinking, where raw and valuable thoughts were preserved and connected over time. It helps you capture these meaningful dots and gradually links them based on your unique way of thinking. When such dots from progressive thinkers come together, they create an exponential, compounding spark — building a thinking edge that no AI can replace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How DotSpark Works Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">How <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">DotSpark</span> Works?</h2>
          </div>
          
          <div className="relative max-w-6xl mx-auto mb-16">
            {/* Enhanced multi-dimensional dot visualization */}
            <div className="relative h-[500px] bg-gradient-to-br from-amber-50/30 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/30 rounded-2xl border-2 border-amber-200 dark:border-amber-800 overflow-hidden shadow-xl">
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-full h-full" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(180, 83, 9, 0.4) 1px, transparent 0)`,
                  backgroundSize: '60px 60px'
                }}></div>
              </div>
              
              {/* Floating dots with animation */}
              <div className="absolute inset-0">
                {/* Top row */}
                <div className="absolute top-16 left-20 w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute top-20 left-40 w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-md animate-bounce"></div>
                <div className="absolute top-12 left-60 w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg animate-pulse"></div>
                
                {/* Middle row */}
                <div className="absolute top-40 left-16 w-6 h-6 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full shadow-xl animate-bounce"></div>
                <div className="absolute top-48 left-48 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg animate-pulse"></div>
                <div className="absolute top-44 left-72 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full shadow-lg animate-bounce"></div>
                
                {/* Bottom row */}
                <div className="absolute top-72 left-24 w-3 h-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-md animate-pulse"></div>
                <div className="absolute top-68 left-52 w-4 h-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-lg animate-bounce"></div>
                <div className="absolute top-76 left-68 w-6 h-6 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full shadow-xl animate-pulse"></div>
                
                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0.3"/>
                    </linearGradient>
                  </defs>
                  <path d="M 80 64 Q 200 120 240 192" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-pulse"/>
                  <path d="M 160 80 Q 280 140 320 200" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-pulse"/>
                  <path d="M 64 160 Q 180 220 280 280" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-pulse"/>
                </svg>
              </div>
              
              {/* Center spark effect */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-2xl animate-ping"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white animate-spin" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Three-step process */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Capture Thoughts</h3>
              <p className="text-muted-foreground">
                Save your valuable insights, ideas, and learnings as individual dots through our chat interface.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Connect Patterns</h3>
              <p className="text-muted-foreground">
                DotSpark intelligently connects related thoughts and identifies patterns in your thinking.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Generate Insights</h3>
              <p className="text-muted-foreground">
                Transform connected dots into powerful frameworks and actionable insights for better decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">The <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Science</span> of Human Intelligence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Neuroscience reveals that the human brain has immense untapped potential, with most people using only a fraction of their cognitive capabilities
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-amber-600">86B</h3>
              <p className="text-muted-foreground">Neurons in the human brain, each capable of forming thousands of connections</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-orange-600">10%</h3>
              <p className="text-muted-foreground">Average cognitive capacity utilized by most individuals</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-amber-600">100T</h3>
              <p className="text-muted-foreground">Synaptic connections possible in a fully optimized brain</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-orange-600">∞</h3>
              <p className="text-muted-foreground">Potential for growth when human intelligence is properly preserved and enhanced</p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Contact Section */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Enhance Your Thinking?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of progressive thinkers who are already using DotSpark to preserve and enhance their natural intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <WhatsAppContactButton />
          </div>
        </div>
      </section>
    </div>
  );
}