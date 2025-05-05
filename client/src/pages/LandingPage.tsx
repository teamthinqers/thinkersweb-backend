import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, BookOpen, Users, Sparkles, BarChart2, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                Introducing DotSpark
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Connect the Dots, <span className="gradient-heading">Spark</span> Your Potential
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Like a neural chip for your mind, DotSpark connects your learnings across every domain, unleashing limitless growth through insights you never knew you had.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
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
            <div className="flex-1 w-full max-w-xl">
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-70"></div>
                <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-secondary/20 rounded-full blur-3xl opacity-70"></div>
                <div className="relative bg-card border rounded-xl shadow-2xl overflow-hidden">
                  <div className="border-b px-6 py-4 flex items-center bg-muted/50">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm font-medium ml-auto text-muted-foreground">Chat Interface</div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 bg-muted p-4 rounded-xl">
                        Today I learned that consistency in small daily learning sessions is more effective than occasional cramming.
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Brain className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div className="flex-1 bg-card border p-4 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">I've captured that insight as a learning entry:</p>
                        <h3 className="font-medium">The Power of Daily Learning Habits</h3>
                        <p className="text-sm mt-1">Consistent small sessions produce better results than infrequent long sessions...</p>
                        <div className="flex gap-2 mt-3">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">habit-formation</span>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary/10 text-secondary">learning-science</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            
            {/* First Dot/Knowledge - Psychology */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Dot 1</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Psychology Course</h3>
                  <p className="text-muted-foreground text-sm">Learning about the impact of environmental cues on behavior</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  "In my psychology studies, I discovered how subtle environmental factors can dramatically influence decision-making and habit formation."
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
              </div>
            </div>
            
            {/* Second Dot/Knowledge - UX Design */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection relative z-10">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">Dot 2</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">UX Design Workshop</h3>
                  <p className="text-muted-foreground text-sm">Studying user interface patterns and digital product design</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  "I've been learning about user experience design principles and how to create intuitive interfaces that users can navigate effortlessly."
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold">2</div>
              </div>
            </div>
            
            {/* Third Dot/Knowledge - Climate Change */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Dot 3</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2v8"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h2"></path><path d="M20 18h2"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M22 22H2"></path><path d="M12 18v-1"></path><path d="M20 17a8 8 0 1 0-16 0"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Environmental Science</h3>
                  <p className="text-muted-foreground text-sm">Reading about behavior change challenges in sustainability efforts</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  "I've been studying why people struggle to adopt climate-friendly behaviors despite caring about the environment. The gap between intention and action is fascinating."
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><path d="M12 2v8"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h2"></path><path d="M20 18h2"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M22 22H2"></path><path d="m16 6-4 4-4-4"></path><path d="M16 18a4 4 0 0 0-8 0"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400">The Spark: Sustainable UX Innovation</h3>
                </div>
              </div>
              <p className="text-muted-foreground">
                "By connecting my dots from psychology, UX design, and environmental science, I created a breakthrough digital interface that uses behavioral psychology principles to nudge users toward sustainable choices. My app redesign incorporates subtle environmental cues that bridge the intention-action gap, making eco-friendly behaviors feel intuitive and effortless. This innovation would have been impossible without seeing the connections between these separate fields of study!"
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
              <h2 className="text-2xl font-bold text-foreground">Learning Repository</h2>
              <p className="mt-1">Capture, Connect, Transform</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/auth" className="hover:text-primary transition-colors">Sign In</Link>
              <Link href="/network" className="hover:text-primary transition-colors">Network</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Learning Repository. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}