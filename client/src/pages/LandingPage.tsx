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
            <h2 className="text-3xl font-bold mb-4">The <span className="gradient-heading">Science</span> of Connected Learning</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Research shows how connecting knowledge across domains enhances learning effectiveness
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">29%</h3>
              <p className="text-muted-foreground">Higher retention rates with interdisciplinary learning approaches<sup>1</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">2.5x</h3>
              <p className="text-muted-foreground">Better problem-solving ability when connecting knowledge across domains<sup>2</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">65%</h3>
              <p className="text-muted-foreground">Of innovations come from connecting ideas across different fields<sup>3</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">40%</h3>
              <p className="text-muted-foreground">Increase in creative thinking with integrated learning methods<sup>4</sup></p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground/70 mt-6 text-center">
            <p>Based on research: <sup>1</sup>Journal of Educational Psychology (2022) <sup>2</sup>Cognitive Science Review (2021) <sup>3</sup>Harvard Innovation Study (2020) <sup>4</sup>MIT Learning Research (2023)</p>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M5 3a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Healthcare Professionals</h3>
              <p className="text-muted-foreground">Doctors and healthcare providers who need evidence-based frameworks for complex patient care decisions.</p>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Product Managers</h3>
              <p className="text-muted-foreground">PMs who need to balance user needs, business goals, and technical constraints with organized thinking frameworks.</p>
            </div>
            
            <div className="border bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Investors</h3>
              <p className="text-muted-foreground">Financial professionals who need structured frameworks to evaluate opportunities and make data-driven investment decisions.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Witness the Spark Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
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