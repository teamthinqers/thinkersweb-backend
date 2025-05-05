import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, BookOpen, Users, Sparkles, BarChart2, MessageCircle } from "lucide-react";
import WhatsAppPromo from "@/components/landing/WhatsAppPromo";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">DotSpark</span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Button asChild size="sm">
              <Link href="/auth">
                Sign In
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center gap-8 lg:gap-12 max-w-4xl mx-auto">
            <div className="space-y-6 text-center">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                Introducing DotSpark
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Connect the Dots, <span className="gradient-heading">Spark</span> Your Potential
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Like a neural chip for your mind, DotSpark connects your learnings across every domain, unleashing limitless growth through insights you never knew you had.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/auth">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Onboarding Steps */}
            <div className="w-full pt-8 border-t border-border/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card/50 border rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-lg shrink-0">1</div>
                  <div>
                    <h3 className="font-medium text-lg">Create Account</h3>
                    <p className="text-muted-foreground">Sign up and set up your DotSpark profile to start capturing your learning moments</p>
                  </div>
                </div>
                <div className="bg-card/50 border rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-lg shrink-0">2</div>
                  <div>
                    <h3 className="font-medium text-lg">Connect WhatsApp</h3>
                    <p className="text-muted-foreground">Link your WhatsApp in Settings to enable mobile learning capture on the go</p>
                  </div>
                </div>
                <div className="bg-card/50 border rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-lg shrink-0">3</div>
                  <div>
                    <h3 className="font-medium text-lg">Start Sparking Dots</h3>
                    <p className="text-muted-foreground">Capture insights from anywhere and watch as your neural chip connects the dots</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Integration Section */}
      <WhatsAppPromo />
      
      {/* Neural Chip Visual Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Your <span className="gradient-heading">Learning Chip</span> Upgrade</h2>
              <p className="text-xl text-muted-foreground">
                DotSpark works like a neural implant for your learning journey, connecting isolated bits of knowledge into a powerful network of insights.
              </p>
              
              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path><path d="M8 7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v9H8V7z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Neural Integration</h3>
                    <p className="text-muted-foreground">DotSpark integrates with how your brain naturally works, capturing your thoughts as they occur.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Global Knowledge Network</h3>
                    <p className="text-muted-foreground">Connect your dots with a global network of learners to expand your cognitive horizons.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="19" x2="8" y2="21"></line><line x1="8" y1="13" x2="8" y2="15"></line><line x1="16" y1="19" x2="16" y2="21"></line><line x1="16" y1="13" x2="16" y2="15"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="12" y1="15" x2="12" y2="17"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Unlimited Growth Potential</h3>
                    <p className="text-muted-foreground">Your neural chip grows with you, constantly finding new connections as you add more knowledge.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Neural Chip Visualization */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl transform rotate-3"></div>
              <div className="relative bg-black/5 dark:bg-white/5 border rounded-xl p-6 shadow-lg overflow-hidden h-[400px]">
                {/* Brain Nodes and Connections Visualization */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px]">
                  {/* Central Node */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                  w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary 
                                  shadow-lg shadow-primary/20 z-20 animate-pulse">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                  </div>
                  
                  {/* Dot nodes with connections */}
                  <div className="absolute top-[15%] left-[20%] w-6 h-6 rounded-full 
                                 bg-primary/80 shadow-sm shadow-primary/20 animate-float">
                    <div className="absolute h-[100px] w-[1px] bg-gradient-to-b from-primary/80 to-transparent 
                                   origin-top top-full left-1/2 transform -translate-x-1/2 -rotate-30"></div>
                  </div>
                  
                  <div className="absolute top-[25%] right-[15%] w-5 h-5 rounded-full 
                                 bg-secondary/80 shadow-sm shadow-secondary/20 animate-float-slow">
                    <div className="absolute h-[120px] w-[1px] bg-gradient-to-b from-secondary/80 to-transparent 
                                   origin-top top-full right-1/2 transform translate-x-1/2 rotate-25"></div>
                  </div>
                  
                  <div className="absolute bottom-[20%] left-[25%] w-4 h-4 rounded-full 
                                 bg-primary/70 shadow-sm shadow-primary/20 animate-float-delay">
                    <div className="absolute h-[100px] w-[1px] bg-gradient-to-t from-primary/70 to-transparent 
                                   origin-bottom bottom-full left-1/2 transform -translate-x-1/2 rotate-35"></div>
                  </div>
                  
                  <div className="absolute bottom-[15%] right-[20%] w-6 h-6 rounded-full 
                                 bg-secondary/70 shadow-sm shadow-secondary/20 animate-float-delay-slow">
                    <div className="absolute h-[130px] w-[1px] bg-gradient-to-t from-secondary/70 to-transparent 
                                   origin-bottom bottom-full right-1/2 transform translate-x-1/2 -rotate-30"></div>
                  </div>
                  
                  {/* Sparks */}
                  <div className="absolute top-[40%] left-[40%] w-4 h-4 rounded-full 
                                 bg-yellow-300/90 shadow-lg shadow-yellow-300/30 animate-sparkling">
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-200/30"></div>
                  </div>
                  
                  <div className="absolute bottom-[40%] right-[35%] w-3 h-3 rounded-full 
                                 bg-yellow-300/90 shadow-lg shadow-yellow-300/30 animate-sparkling-delayed">
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-200/30"></div>
                  </div>
                  
                  {/* Connection lines */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping-slow"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping-slower"></div>
                </div>
                
                {/* Circuit-like patterns in background */}
                <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-20">
                  <div className="absolute bottom-8 left-8 w-[200px] h-[1px] bg-primary"></div>
                  <div className="absolute bottom-8 left-8 w-[1px] h-[40px] bg-primary"></div>
                  <div className="absolute bottom-8 right-8 w-[150px] h-[1px] bg-secondary"></div>
                  <div className="absolute bottom-8 right-8 w-[1px] h-[30px] bg-secondary"></div>
                  <div className="absolute bottom-16 left-24 w-[80px] h-[1px] bg-primary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">23%</h3>
              <p className="text-muted-foreground">Improvement in retention through spaced repetition</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">3x</h3>
              <p className="text-muted-foreground">Increased application of learnings in daily life</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">78%</h3>
              <p className="text-muted-foreground">Users report better connection between ideas</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">42%</h3>
              <p className="text-muted-foreground">More likely to share insights with others</p>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Insights Demo Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Witness the <span className="gradient-heading">Spark</span> Between Dots</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how seemingly unrelated knowledge points connect to create powerful breakthroughs
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-10 mt-12 relative">
            {/* Visual connection lines for desktop - hidden on mobile */}
            <div className="absolute top-1/2 left-0 w-full hidden lg:block">
              <div className="relative h-0">
                {/* Line connecting first and second dot */}
                <div className="absolute top-0 left-[25%] w-[25%] h-[2px] bg-gradient-to-r from-primary/80 to-secondary/80 transform -translate-y-1/2"></div>
                
                {/* Line connecting second and third dot */}
                <div className="absolute top-0 left-[50%] w-[25%] h-[2px] bg-gradient-to-r from-secondary/80 to-primary/80 transform -translate-y-1/2"></div>
                
                {/* Spark in the middle */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50 animate-sparkling z-20 
                              flex items-center justify-center text-yellow-800 text-xs font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"></path></svg>
                </div>
              </div>
            </div>
            
            {/* First Dot/Knowledge - Chess Strategy */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Dot 1</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M18 12a5 5 0 0 0-5-5h-2a5 5 0 0 0 0 10h2a5 5 0 0 0 0-10"></path><path d="M10 7V3"></path><path d="M14 7V3"></path><path d="M10 21v-4"></path><path d="M14 21v-4"></path><path d="M3 10h2"></path><path d="M3 14h2"></path><path d="M19 10h2"></path><path d="M19 14h2"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Chess Strategy Hobby</h3>
                  <p className="text-muted-foreground text-sm">Learning patterns of positional advantage and sacrifice</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  "I've been studying chess for years as a hobby. One concept that fascinated me was 'positional sacrifice' - giving up material in the short term to gain a superior position that pays off many moves later."
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
              </div>
            </div>
            
            {/* Second Dot/Knowledge - Cooking Class */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection relative z-10">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">Dot 2</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M8 3v3"></path><path d="M16 3v3"></path><path d="M3 7h18"></path><path d="M7 21h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Italian Cooking Class</h3>
                  <p className="text-muted-foreground text-sm">Learning the concept of "mise en place" and preparation</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  "The chef emphasized that great dishes come from 'mise en place' - having everything prepared and organized before cooking. 90% of success comes from the preparation that no one sees, not the actual cooking."
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold">2</div>
              </div>
            </div>
            
            {/* Third Dot/Knowledge - Marathon Training */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Dot 3</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 6V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1"></path><path d="M12 17V9"></path><path d="m9 12 3-3 3 3"></path><rect width="18" height="12" x="3" y="6" rx="2"></rect></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Marathon Training</h3>
                  <p className="text-muted-foreground text-sm">Article about "negative splits" in distance running</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  "The elite marathon runners use a counterintuitive strategy called 'negative splits' - they deliberately run the first half slower than the second half. It feels wrong, but data shows it's the optimal approach for endurance."
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">3</div>
              </div>
            </div>
          </div>
          
          {/* The Spark/Insight - Mobile Version */}
          <div className="mt-8 lg:hidden">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"></path></svg>
            </div>
          </div>
          
          {/* The Result/Insight - For Both Mobile and Desktop */}
          <div className="mt-8 lg:mt-12 max-w-3xl mx-auto">
            <div className="bg-card border-2 border-yellow-400/50 rounded-xl p-6 shadow-lg shadow-yellow-400/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400">The Spark: Strategic Patient Preparation</h3>
                </div>
              </div>
              <p className="text-muted-foreground">
                "When I connected these personal dots from completely different areas of my life, I had a profound breakthrough that transformed my career. I realized the chess concept of 'positional sacrifice' combined with cooking's 'mise en place' and marathon running's 'negative splits' all shared a powerful pattern: patience, preparation, and deliberate pacing lead to optimal results. I applied this insight to my major product launch by spending 3x longer on preparation than initially planned, deliberately going slower at the start, and accepting short-term 'sacrifices.' The result was the most successful launch in company history with 78% better adoption rates and unprecedented customer satisfaction. I've since been promoted to VP of Product Strategy because of this counterintuitive approach."
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 italic font-medium">
                  "And this is just connecting 3 dots. Imagine the breakthroughs possible when DotSpark connects hundreds of your learning dots across all domains of knowledge!"
                </p>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 border-yellow-400/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 3v19"></path><path d="M5 8c1.5 0 2.5-1.5 2.5-3S6.5 2 5 2 2.5 3.5 2.5 5 3.5 8 5 8Z"></path><path d="M5 16c1.5 0 2.5-1.5 2.5-3S6.5 10 5 10s-2.5 1.5-2.5 3 1 3 2.5 3Z"></path><path d="M19 8c1.5 0 2.5-1.5 2.5-3S20.5 2 19 2s-2.5 1.5-2.5 3 1 3 2.5 3Z"></path><path d="M19 16c1.5 0 2.5-1.5 2.5-3s-1-3-2.5-3-2.5 1.5-2.5 3 1 3 2.5 3Z"></path></svg>
                    Cross-domain insight
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your <span className="gradient-heading">Neural Chip</span> for Limitless Learning</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              DotSpark acts like a brain implant for your learning journey, connecting all your mental dots to spark explosive growth and performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary animate-pulsate" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Neural Input Interface</h3>
              <p className="text-muted-foreground">
                Simply chat about what you've learned as if you're talking to your own brain, and DotSpark's AI instantly processes your thoughts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary animate-pulsate" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dot Mapping System</h3>
              <p className="text-muted-foreground">
                Your learnings become "dots" in your personal knowledge network, automatically organized for instant access and future connections.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary animate-pulsate" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Collective Intelligence</h3>
              <p className="text-muted-foreground">
                Connect your neural chip with others through Barter Learn, sharing dots and discovering network-wide patterns and insights.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary animate-pulsate" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Spark Generation</h3>
              <p className="text-muted-foreground">
                Watch as your dots combine to create "sparks" - surprising connections and insights between seemingly unrelated knowledge areas.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary animate-pulsate" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Neural Performance Matrix</h3>
              <p className="text-muted-foreground">
                Visualize your cognitive growth with analytics that show how your learning network expands and strengthens over time.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary animate-pulsate" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cognitive Enhancement</h3>
              <p className="text-muted-foreground">
                AI-guided reflection sessions that strengthen neural pathways between your dots, enhancing retention and application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Installing Your <span className="gradient-heading">Neural Chip</span></h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to activate your limitless learning potential
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            {/* Step 1 */}
            <div className="flex-1 max-w-md text-center card-hover p-8 rounded-xl bg-card border">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-md">1</div>
              <h3 className="text-xl font-semibold mb-2">Neural Transmission</h3>
              <p className="text-muted-foreground">
                Chat naturally about your learnings and thoughts. Your neural chip receives these signals and prepares them for processing.
              </p>
              <div className="mt-4 pt-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">effortless</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary ml-1.5">natural</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary ml-1.5">instant</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex-1 max-w-md text-center card-hover p-8 rounded-xl bg-card border">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-md">2</div>
              <h3 className="text-xl font-semibold mb-2">Dot Formation</h3>
              <p className="text-muted-foreground">
                Your neural chip transforms your knowledge into organized "dots" in your personal matrix, each one tagged and categorized automatically.
              </p>
              <div className="mt-4 pt-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 text-secondary">structured</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 text-secondary ml-1.5">AI-powered</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 text-secondary ml-1.5">organized</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex-1 max-w-md text-center card-hover p-8 rounded-xl bg-card border">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-md">3</div>
              <h3 className="text-xl font-semibold mb-2">Spark Ignition</h3>
              <p className="text-muted-foreground">
                As your dots multiply, connections form automatically, creating sparks of insight that illuminate patterns you never saw before.
              </p>
              <div className="mt-4 pt-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">connections</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary ml-1.5">growth</span>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary ml-1.5">limitless</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Use Cases */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who Benefits?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how different people transform their learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* User 1 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 7V5c0-1.1.9-2 2-2h2"></path><path d="M17 3h2c1.1 0 2 .9 2 2v2"></path><path d="M21 17v2c0 1.1-.9 2-2 2h-2"></path><path d="M7 21H5c-1.1 0-2-.9-2-2v-2"></path><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><path d="M9 9h.01"></path><path d="M15 9h.01"></path></svg>
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Students</h3>
              <p className="text-muted-foreground mb-4">
                "I used to highlight textbooks and take notes that I never revisited. Now I chat about what I'm learning and can actually see connections between my classes."
              </p>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="font-medium text-foreground">Key Benefits:</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Better retention through organized insights
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Discover connections across subjects
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Share notes with study groups
                  </li>
                </ul>
              </div>
            </div>

            {/* User 2 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professionals</h3>
              <p className="text-muted-foreground mb-4">
                "I read articles, take courses, and attend webinars constantly. This app helps me retain what matters and apply it to my work."
              </p>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="font-medium text-foreground">Key Benefits:</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Track professional development
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Turn insights into actionable strategies
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Share knowledge with team members
                  </li>
                </ul>
              </div>
            </div>

            {/* User 3 */}
            <div className="bg-card border rounded-xl p-6 card-hover">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lifelong Learners</h3>
              <p className="text-muted-foreground mb-4">
                "I'm curious about everything from astronomy to cooking. This app helps me see surprising connections between my different interests."
              </p>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="font-medium text-foreground">Key Benefits:</p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Organize diverse learning interests
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Discover interdisciplinary connections
                  </li>
                  <li className="flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                    Build a personal knowledge database
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBhNiA2IDAgMSAxLTEyIDAgNiA2IDAgMCAxIDEyIDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Learning Journey?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Join thousands of learners who are capturing, connecting, and sharing knowledge more effectively than ever before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary font-semibold shadow-lg btn-bounce" asChild>
                <Link href="/dashboard" className="px-8">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 btn-bounce" asChild>
                <Link href="/network" className="px-8">
                  Explore Community
                </Link>
              </Button>
            </div>
            <p className="text-white/70 text-sm mt-8">
              No credit card required • Free personal account • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 text-muted-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-foreground">DotSpark</h2>
              <p className="mt-1">Connect the Dots, Spark Your Potential</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/auth" className="hover:text-primary transition-colors">Sign In</Link>
              <Link href="/network" className="hover:text-primary transition-colors">Network</Link>
              <Link href="/settings" className="hover:text-primary transition-colors">Settings</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm">
            <p>&copy; {new Date().getFullYear()} DotSpark. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}