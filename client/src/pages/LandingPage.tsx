import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, BookOpen, Users, Sparkles, BarChart2, MessageCircle, User } from "lucide-react";
import WhatsAppPromo from "@/components/landing/WhatsAppPromo";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LandingPage() {
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-white shadow">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                      ) : (
                        <AvatarFallback className="bg-primary text-white">
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 text-sm">
                    <p className="font-medium">{user.displayName || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth">
                  Sign In
                </Link>
              </Button>
            )}
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
                Your <span className="gradient-heading">Second Brain</span> for Professional Excellence
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                DotSpark works as your second brain, continuously learning from the best books and resources in your field to enhance your decision-making and spark professional breakthroughs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                {user ? (
                  <Button size="lg" asChild>
                    <Link href="/dashboard">
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" asChild>
                      <Link href="/auth?redirect=settings/whatsapp">
                        Get Started <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/auth">
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* Onboarding Steps */}
            <div className="w-full pt-8 border-t border-border/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card/50 border rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-lg shrink-0">1</div>
                  <div>
                    <h3 className="font-medium text-lg">Set Up Your Second Brain</h3>
                    <p className="text-muted-foreground">Create your account and define your professional interests so your second brain can start working for you</p>
                  </div>
                </div>
                <div className="bg-card/50 border rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-lg shrink-0">2</div>
                  <div>
                    <h3 className="font-medium text-lg">Connect via WhatsApp</h3>
                    <p className="text-muted-foreground">Interact with your second brain anytime through our intelligent WhatsApp assistant</p>
                  </div>
                </div>
                <div className="bg-card/50 border rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-lg shrink-0">3</div>
                  <div>
                    <h3 className="font-medium text-lg">Receive Insights & Frameworks</h3>
                    <p className="text-muted-foreground">Get custom decision frameworks and insights tailored to your professional challenges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Integration Section */}
      <WhatsAppPromo />
      
      {/* Second Brain Intelligence Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your <span className="gradient-heading">Second Brain</span> for Decision Excellence</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              DotSpark works relentlessly in the background, studying industry resources and generating professional frameworks to enhance your decision-making capabilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Neural Chip Visualization */}
            <div className="relative order-2 md:order-1">
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
            
            {/* Key Features */}
            <div className="space-y-8 order-1 md:order-2">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Professional Knowledge Aggregation</h3>
                    <p className="text-muted-foreground">DotSpark continuously learns from top business books, articles, and resources in your field.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Framework Generation</h3>
                    <p className="text-muted-foreground">Get customized decision frameworks and templates tailored to your specific professional challenges.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Adaptive Intelligence</h3>
                    <p className="text-muted-foreground">Your second brain learns from your interactions, getting smarter and more personalized over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">The <span className="gradient-heading">Science</span> of Better Decision-Making</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Research shows that professionals with structured frameworks make significantly better decisions
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">87%</h3>
              <p className="text-muted-foreground">Of successful executives rely on decision frameworks for complex challenges<sup>1</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">3.2x</h3>
              <p className="text-muted-foreground">Higher success rate for businesses using systematic decision processes<sup>2</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">71%</h3>
              <p className="text-muted-foreground">Reduction in decision fatigue when using structured frameworks<sup>3</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">48%</h3>
              <p className="text-muted-foreground">Increase in implementation effectiveness with framework-based decisions<sup>4</sup></p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground/70 mt-6 text-center">
            <p>Based on research: <sup>1</sup>Harvard Business Review (2023) <sup>2</sup>McKinsey Decision-Making Study (2022) <sup>3</sup>Journal of Organizational Behavior (2022) <sup>4</sup>Stanford Executive Decision Research (2021)</p>
          </div>
        </div>
      </section>

      {/* How to Set Up Your Second Brain */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How to <span className="gradient-heading">Activate</span> Your Second Brain</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Getting started with your professional second brain is simple and effective
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border rounded-xl p-6 relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl mb-4">1</div>
              <h3 className="text-xl font-bold mb-3">Define Your Focus Areas</h3>
              <p className="text-muted-foreground">Create your account and select the professional domains and challenges you want your second brain to master.</p>
              <div className="absolute top-6 right-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
              </div>
            </div>
            
            <div className="bg-card border rounded-xl p-6 relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl mb-4">2</div>
              <h3 className="text-xl font-bold mb-3">Connect with WhatsApp</h3>
              <p className="text-muted-foreground">Link your WhatsApp account to interact with your second brain anytime and anywhere with simple text commands.</p>
              <div className="absolute top-6 right-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40"><circle cx="12" cy="12" r="10"></circle><path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z"></path><line x1="9" y1="9" x2="9" y2="9"></line><line x1="15" y1="9" x2="15" y2="9"></line></svg>
              </div>
            </div>
            
            <div className="bg-card border rounded-xl p-6 relative">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl mb-4">3</div>
              <h3 className="text-xl font-bold mb-3">Get Decision Frameworks</h3>
              <p className="text-muted-foreground">Ask your second brain for solutions to your professional challenges and receive customized frameworks and insights.</p>
              <div className="absolute top-6 right-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287L12 3Z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who <span className="gradient-heading">Benefits</span> Most</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              DotSpark's second brain technology empowers professionals making complex decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Career Growth Aspirants</h3>
              <p className="text-muted-foreground">Professionals seeking career advancement who need strategic frameworks to make better decisions and demonstrate leadership thinking.</p>
            </div>

            <div className="border bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Business Leaders</h3>
              <p className="text-muted-foreground">Executives and managers who need data-backed frameworks for strategic decisions and organizational challenges.</p>
            </div>
            
            <div className="border bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m3 16 4 4 4-4"></path><path d="M7 20V4"></path><path d="M21 12a9 9 0 0 0-9-9"></path><path d="M3 8a9 9 0 0 1 9 9"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Startup Founders</h3>
              <p className="text-muted-foreground">Entrepreneurs who need to make rapid, well-informed decisions with limited resources and maximum impact.</p>
            </div>
            
            <div className="border bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Consultants</h3>
              <p className="text-muted-foreground">Professional advisors who need to quickly develop frameworks and recommendations for diverse client challenges.</p>
            </div>
            
            <div className="border bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Investors</h3>
              <p className="text-muted-foreground">Financial professionals who need structured frameworks to evaluate opportunities and make data-driven investment decisions.</p>
            </div>
            
            <div className="border bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M5 3a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Healthcare Professionals</h3>
              <p className="text-muted-foreground">Doctors and healthcare providers who need evidence-based frameworks for complex patient care decisions.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Framework Generation Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Generating <span className="gradient-heading">Frameworks</span> for Better Decisions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how DotSpark transforms your professional challenges into structured decision frameworks
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
            
            {/* First Input - Professional Challenge */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Input</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9.5 13a9.77 9.77 0 0 0 4.812 4.812c.775.384 1.687.118 2.147-.665l1.473-2.503a1.44 1.44 0 0 0-.43-1.88l-1.585-1.038a1.56 1.56 0 0 0-1.742-.06L13 12.5l-3.5-3.5V8.05c.85-.25 1.72-.405 2.628-.47a1.56 1.56 0 0 0 1.445-1.3l.265-1.587A1.44 1.44 0 0 0 12.5 3c-5.68.488-10.204 5.01-10.692 10.692a1.44 1.44 0 0 0 1.357 1.538l1.586.264c.725.12 1.42-.246 1.664-.97L7.5 13l2 2z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Your Business Challenge</h3>
                  <p className="text-muted-foreground text-sm">Message to your second brain about a complex decision</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  "I need to decide between expanding our product line or focusing on optimizing our existing flagship product. We have limited resources and I'm not sure which strategy would yield better results."
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">1</div>
              </div>
            </div>
            
            {/* Second Element - Knowledge Integration */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection relative z-10">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">Processing</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M4 17V7c0-2 2-4 4-4h8c2 0 4 2 4 4v10c0 2-2 4-4 4h-8c-2 0-4-2-4-4Z"></path><path d="M12 17v4"></path><path d="M8 21h8"></path><path d="M22 17H2"></path><path d="M22 7H2"></path><path d="M12 7v10"></path><path d="M12 7H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-4Z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Knowledge Integration</h3>
                  <p className="text-muted-foreground text-sm">Your second brain processes relevant business knowledge</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Sources analyzed:</span> Product Strategy (HBR), Innovator's Dilemma, Blue Ocean Strategy, core vs. innovation balance metrics, market penetration case studies, product lifecycle management best practices
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold">2</div>
              </div>
            </div>
            
            {/* Third Element - Framework Output */}
            <div className="bg-card border rounded-xl p-6 card-hover neural-connection">
              <div className="text-right mb-3 lg:hidden">
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Output</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 7h10"></path><path d="M7 12h10"></path><path d="M7 17h5"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Structured Framework</h3>
                  <p className="text-muted-foreground text-sm">Decision framework with weighted criteria and process steps</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  "Your second brain has generated a 'Product Strategy Decision Matrix' with 7 critical evaluation criteria, weighted scoring system, and step-by-step implementation guide tailored to your specific resource constraints."
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
          
          {/* Framework Box - For Both Mobile and Desktop */}
          <div className="mt-8 lg:mt-12 max-w-3xl mx-auto">
            <div className="bg-card border-2 border-yellow-400/50 rounded-xl p-6 shadow-lg shadow-yellow-400/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path><path d="M8 7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v9H8V7z"></path></svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-700 dark:text-yellow-400">Decision Framework</h3>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Your second brain generated this custom framework to guide your decision:
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                <h4 className="font-bold text-lg mb-3 text-primary text-center">Product Portfolio Optimization Framework</h4>
                
                {/* Infographic Header */}
                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="text-center px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-xs text-muted-foreground font-medium">OPTION A</span>
                    <p className="font-semibold text-sm">Product Expansion</p>
                  </div>

                  <div className="text-xs font-medium text-muted-foreground">WEIGHTED DECISION CRITERIA</div>
                  
                  <div className="text-center px-4 py-2 bg-secondary/10 rounded-lg border border-secondary/20">
                    <span className="text-xs text-muted-foreground font-medium">OPTION B</span>
                    <p className="font-semibold text-sm">Flagship Optimization</p>
                  </div>
                </div>
                
                {/* Criteria Bars */}
                <div className="space-y-3.5">
                  {/* Market Saturation */}
                  <div className="flex items-center">
                    <div className="w-[30%] pr-3">
                      <div className="text-xs font-medium">Market Saturation</div>
                      <div className="text-[10px] text-muted-foreground">Current market penetration levels</div>
                    </div>
                    <div className="w-[45%]">
                      <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div className="w-[25%] pl-3 text-right">
                      <span className="text-xs font-semibold">25%</span>
                    </div>
                  </div>
                  
                  {/* Resource Allocation */}
                  <div className="flex items-center">
                    <div className="w-[30%] pr-3">
                      <div className="text-xs font-medium">Resource Allocation</div>
                      <div className="text-[10px] text-muted-foreground">Efficiency of team distribution</div>
                    </div>
                    <div className="w-[45%]">
                      <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <div className="w-[25%] pl-3 text-right">
                      <span className="text-xs font-semibold">20%</span>
                    </div>
                  </div>
                  
                  {/* Competitive Differentiation */}
                  <div className="flex items-center">
                    <div className="w-[30%] pr-3">
                      <div className="text-xs font-medium">Competitive Edge</div>
                      <div className="text-[10px] text-muted-foreground">Differentiation potential</div>
                    </div>
                    <div className="w-[45%]">
                      <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <div className="w-[25%] pl-3 text-right">
                      <span className="text-xs font-semibold">20%</span>
                    </div>
                  </div>
                  
                  {/* Revenue Growth */}
                  <div className="flex items-center">
                    <div className="w-[30%] pr-3">
                      <div className="text-xs font-medium">Revenue Growth</div>
                      <div className="text-[10px] text-muted-foreground">Projected financial impact</div>
                    </div>
                    <div className="w-[45%]">
                      <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div className="w-[25%] pl-3 text-right">
                      <span className="text-xs font-semibold">15%</span>
                    </div>
                  </div>
                  
                  {/* Implementation Complexity */}
                  <div className="flex items-center">
                    <div className="w-[30%] pr-3">
                      <div className="text-xs font-medium">Implementation</div>
                      <div className="text-[10px] text-muted-foreground">Operational complexity</div>
                    </div>
                    <div className="w-[45%]">
                      <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                    <div className="w-[25%] pl-3 text-right">
                      <span className="text-xs font-semibold">10%</span>
                    </div>
                  </div>
                  
                  {/* Additional Criteria */}
                  <div className="flex items-center">
                    <div className="w-[30%] pr-3">
                      <div className="text-xs font-medium">Other Factors</div>
                      <div className="text-[10px] text-muted-foreground">Brand & risk assessment</div>
                    </div>
                    <div className="w-[45%]">
                      <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                    <div className="w-[25%] pl-3 text-right">
                      <span className="text-xs font-semibold">10%</span>
                    </div>
                  </div>
                </div>
                
                {/* Framework Recommendation */}
                <div className="mt-4 flex justify-between items-center border-t border-primary/10 pt-3">
                  <div className="text-xs text-muted-foreground">
                    <div className="font-medium">Recommendation engine</div>
                    <div>Based on 14 data points</div>
                  </div>
                  <div className="px-3 py-1.5 bg-secondary rounded-full border border-secondary text-sm font-semibold text-white shadow-md">
                    Optimize Flagship Product: 72% confidence
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground italic">
                Complete with implementation guide, metrics dashboard template, and evaluation spreadsheet.
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
              Ready to Elevate Your Professional Decision-Making?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Join forward-thinking professionals who are transforming complex business challenges into structured frameworks for more confident and strategic decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-primary font-semibold shadow-lg btn-bounce" asChild>
                <Link href="/auth" className="px-8">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 btn-bounce" asChild>
                <Link href="/dashboard" className="px-8">
                  Explore Dashboard
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
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="text-xl font-bold">DotSpark</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 DotSpark. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}