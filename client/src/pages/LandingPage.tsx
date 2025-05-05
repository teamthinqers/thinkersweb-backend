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