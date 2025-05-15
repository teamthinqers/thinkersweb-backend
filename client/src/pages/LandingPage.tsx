import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, BookOpen, Users, Sparkles, BarChart2, MessageCircle, User, Menu, X } from "lucide-react";
import { WhatsAppContactButton } from "@/components/landing/WhatsAppContactButton";
import { CompactWhatsAppButton } from "@/components/landing/CompactWhatsAppButton";
import DashboardPreview from "@/components/landing/DashboardPreview";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { Check } from "lucide-react";
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
  const { isWhatsAppConnected } = useWhatsAppStatus();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with navigation - fixed at top */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-2 sm:px-4 md:px-6">
          <div className="flex items-center">
            <div className="flex items-center gap-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">DotSpark</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary">
                Home
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link href="/activate-dotspark" className="hidden sm:block ml-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white relative group"
                >
                  <Brain className="h-4 w-4 mr-1" />
                  <span>Activate DotSpark</span>
                  <Sparkles className="h-3 w-3 absolute top-1 right-1 text-white/80" />
                </Button>
              </Link>
            </div>
            
            {/* WhatsApp button, always visible on mobile and desktop regardless of login status */}
            <div className="hidden md:block">
              <WhatsAppContactButton />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="block md:hidden">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white px-2 py-0.5 h-7 rounded-md"
                  onClick={() => {
                    const whatsAppNumber = '16067157733';
                    const mobileAppLink = `whatsapp://send?phone=${whatsAppNumber}`;
                    window.location.href = mobileAppLink;
                    
                    setTimeout(() => {
                      const webFallbackUrl = `https://wa.me/${whatsAppNumber}`;
                      window.location.href = webFallbackUrl;
                    }, 500);
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Ask</span>
                </Button>
              </div>
              
              <Link href="/activate-dotspark" className="block sm:hidden">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white relative h-7 px-2"
                >
                  <Brain className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Activate</span>
                </Button>
              </Link>
            </div>
            
            {/* User profile or sign in button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full ml-1 p-0">
                    <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-white shadow">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                      ) : (
                        <AvatarFallback className="bg-primary text-white text-xs md:text-sm">
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
              <Button asChild size="sm" className="ml-1 h-8 md:h-10 text-xs md:text-sm px-2 md:px-4">
                <Link href="/auth">
                  Sign In
                </Link>
              </Button>
            )}
            
            {/* Mobile menu button - always visible */}
            <div className="md:hidden ml-1">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="lg" className="p-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col h-full">
                    <div className="mb-6 pb-2 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="font-bold">DotSpark</span>
                      </div>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                          <X className="h-5 w-5" />
                        </Button>
                      </SheetClose>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <SheetClose asChild>
                        <Link href="/" className="py-2 hover:text-primary transition-colors">
                          Home
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link href="/dashboard" className="py-2 hover:text-primary transition-colors">
                          Dashboard
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link href="/activate-dotspark" className="py-2 hover:text-primary transition-colors flex items-center gap-2 relative">
                          <Brain className="h-4 w-4 text-primary" />
                          <span>Activate DotSpark</span>
                          <Sparkles className="h-3 w-3 absolute left-1 top-6 text-indigo-400" />
                        </Link>
                      </SheetClose>
                    </div>
                    
                    <div className="mt-6">
                      {!user && (
                        <SheetClose asChild>
                          <WhatsAppContactButton 
                            variant="default"
                            showIcon={true}
                            label="Ask DotSpark"
                            className="w-full"
                          />
                        </SheetClose>
                      )}
                      
                      <div className="mt-4">
                        {user ? (
                          <SheetClose asChild>
                            <Button onClick={handleLogout} variant="outline" className="w-full">
                              Sign Out
                            </Button>
                          </SheetClose>
                        ) : (
                          <SheetClose asChild>
                            <Button asChild className="w-full">
                              <Link href="/auth">Sign In</Link>
                            </Button>
                          </SheetClose>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      {/* Enhanced Hero Section with Visual Elements - Centered for all screens */}
      <section className="relative pt-6 pb-8 md:py-12 lg:py-16 overflow-hidden">
        {/* Background visual elements with simplified neural dot patterns */}
        <div className="absolute inset-0 z-0">
          {/* Subtle gradient background effects */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="absolute left-[35%] top-[30%] w-1 h-1 bg-primary/40 rounded-full animate-pulse-slow"></div>
          <div className="absolute left-[32%] top-[40%] w-1 h-1 bg-primary/50 rounded-full animate-pulse-slow delay-300"></div>
          <div className="absolute left-[34%] top-[50%] w-1 h-1 bg-primary/60 rounded-full animate-pulse-slow delay-500"></div>
          <div className="absolute left-[31%] top-[60%] w-1 h-1 bg-primary/40 rounded-full animate-pulse-slow delay-700"></div>
          <div className="absolute left-[36%] top-[35%] w-0.5 h-0.5 bg-primary/30 rounded-full animate-pulse-slow delay-100"></div>
          <div className="absolute left-[33%] top-[45%] w-0.5 h-0.5 bg-primary/30 rounded-full animate-pulse-slow delay-600"></div>
          <div className="absolute left-[35%] top-[55%] w-0.5 h-0.5 bg-primary/30 rounded-full animate-pulse-slow delay-200"></div>
          
          <div className="absolute right-[35%] top-[30%] w-1 h-1 bg-blue-500/40 rounded-full animate-pulse-slow delay-400"></div>
          <div className="absolute right-[32%] top-[40%] w-1 h-1 bg-blue-500/50 rounded-full animate-pulse-slow delay-900"></div>
          <div className="absolute right-[34%] top-[50%] w-1 h-1 bg-blue-500/60 rounded-full animate-pulse-slow delay-600"></div>
          <div className="absolute right-[31%] top-[60%] w-1 h-1 bg-blue-500/40 rounded-full animate-pulse-slow delay-800"></div>
          <div className="absolute right-[36%] top-[35%] w-0.5 h-0.5 bg-blue-500/30 rounded-full animate-pulse-slow delay-300"></div>
          <div className="absolute right-[33%] top-[45%] w-0.5 h-0.5 bg-blue-500/30 rounded-full animate-pulse-slow delay-100"></div>
          <div className="absolute right-[35%] top-[55%] w-0.5 h-0.5 bg-blue-500/30 rounded-full animate-pulse-slow delay-700"></div>
          
          <div className="absolute left-[40%] top-[25%] w-0.5 h-0.5 bg-indigo-500/30 rounded-full animate-pulse-slow delay-200"></div>
          <div className="absolute left-[45%] top-[23%] w-0.5 h-0.5 bg-indigo-500/30 rounded-full animate-pulse-slow delay-800"></div>
          <div className="absolute left-[50%] top-[22%] w-0.5 h-0.5 bg-indigo-500/40 rounded-full animate-pulse-slow delay-500"></div>
          <div className="absolute left-[55%] top-[23%] w-0.5 h-0.5 bg-indigo-500/30 rounded-full animate-pulse-slow delay-300"></div>
          <div className="absolute left-[60%] top-[25%] w-0.5 h-0.5 bg-indigo-500/30 rounded-full animate-pulse-slow delay-700"></div>
          
          <div className="absolute left-[40%] top-[65%] w-0.5 h-0.5 bg-indigo-500/30 rounded-full animate-pulse-slow delay-400"></div>
          <div className="absolute left-[45%] top-[67%] w-0.5 h-0.5 bg-indigo-500/30 rounded-full animate-pulse-slow delay-100"></div>
          <div className="absolute left-[50%] top-[68%] w-0.5 h-0.5 bg-indigo-500/40 rounded-full animate-pulse-slow delay-600"></div>
          <div className="absolute left-[55%] top-[67%] w-0.5 h-0.5 bg-indigo-500/30 rounded-full animate-pulse-slow delay-300"></div>
          <div className="absolute left-[60%] top-[65%] w-0.5 h-0.5 bg-indigo-500/30 rounded-full animate-pulse-slow delay-900"></div>
          
          <div className="absolute left-[33%] top-[35%] w-[12px] h-[1px] bg-gradient-to-r from-primary/60 to-transparent rotate-[15deg] opacity-0 animate-spark-appear"></div>
          <div className="absolute right-[33%] top-[40%] w-[12px] h-[1px] bg-gradient-to-l from-blue-500/60 to-transparent rotate-[160deg] opacity-0 animate-spark-appear delay-1200"></div>
          <div className="absolute left-[40%] top-[50%] w-[12px] h-[1px] bg-gradient-to-r from-indigo-500/60 to-transparent rotate-[45deg] opacity-0 animate-spark-appear delay-2400"></div>
          <div className="absolute right-[40%] top-[45%] w-[12px] h-[1px] bg-gradient-to-l from-primary/60 to-transparent rotate-[120deg] opacity-0 animate-spark-appear delay-3600"></div>
          <div className="absolute left-[45%] top-[60%] w-[12px] h-[1px] bg-gradient-to-r from-blue-500/60 to-transparent rotate-[210deg] opacity-0 animate-spark-appear delay-4800"></div>
          <div className="absolute right-[45%] top-[30%] w-[12px] h-[1px] bg-gradient-to-l from-indigo-500/60 to-transparent rotate-[330deg] opacity-0 animate-spark-appear delay-6000"></div>
          
          <div className="absolute left-[38%] top-[42%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-spark-flash delay-1800"></div>
          <div className="absolute right-[38%] top-[42%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-spark-flash delay-3000"></div>
          <div className="absolute left-[47%] top-[55%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-spark-flash delay-4200"></div>
          <div className="absolute right-[47%] top-[35%] w-0.5 h-0.5 bg-white rounded-full opacity-0 animate-spark-flash delay-5400"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center max-w-3xl mx-auto">
            {/* Centered badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Introducing DotSpark</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-primary to-blue-600 dark:from-indigo-400 dark:via-primary dark:to-blue-400">Think Sharper, Stay You</span>
            </h1>
            
            {/* Subheadings */}
            <p className="text-lg md:text-xl font-medium text-foreground mt-2 max-w-2xl text-center">
              DotSpark is your personal cognitive OS, helping you use AI without losing yourself.
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground mt-1 md:mt-2 mb-4 max-w-2xl text-center">
              It's not artificial intelligence.<br/>
              It's authentic intelligence — powered by you.
            </p>
            
            <div className="relative h-16 w-full my-2 md:my-3 overflow-hidden">
              {/* Main straight line */}
              <div className="absolute left-0 top-1/2 w-full h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent transform -translate-y-1/2"></div>
              
              {/* Dots along the line - some with spark effects */}
              <div className="absolute left-[15%] top-1/2 w-2 h-2 bg-primary/60 rounded-full animate-pulse-slow transform -translate-y-1/2"></div>
              
              {/* Dot with spark */}
              <div className="absolute left-[25%] top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-primary/90 rounded-full animate-pulse-slow delay-300"></div>
                
                {/* Spark symbol */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 animate-spark-flash delay-1900">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z" fill="#3b82f6" stroke="#3b82f6" strokeWidth="1" />
                  </svg>
                </div>
                
                {/* Spark rays */}
                <div className="absolute w-4 h-[1px] bg-primary/80 rotate-0 -translate-x-1/2 opacity-0 animate-spark-appear delay-2000"></div>
                <div className="absolute w-4 h-[1px] bg-primary/80 rotate-45 -translate-x-1/2 opacity-0 animate-spark-appear delay-2100"></div>
                <div className="absolute w-4 h-[1px] bg-primary/80 rotate-90 -translate-x-1/2 opacity-0 animate-spark-appear delay-2200"></div>
                <div className="absolute w-4 h-[1px] bg-primary/80 rotate-135 -translate-x-1/2 opacity-0 animate-spark-appear delay-2300"></div>
              </div>
              
              <div className="absolute left-[35%] top-1/2 w-2 h-2 bg-indigo-500/60 rounded-full animate-pulse-slow delay-500 transform -translate-y-1/2"></div>
              <div className="absolute left-[45%] top-1/2 w-2 h-2 bg-indigo-500/70 rounded-full animate-pulse-slow delay-200 transform -translate-y-1/2"></div>
              
              {/* Center dot with spark */}
              <div className="absolute left-[50%] top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-indigo-500/90 rounded-full animate-pulse-slow"></div>
                
                {/* Spark symbol */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 animate-spark-flash delay-2900">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z" fill="#6366f1" stroke="#6366f1" strokeWidth="1" />
                  </svg>
                </div>
                
                {/* Spark rays */}
                <div className="absolute w-6 h-[1.5px] bg-indigo-500/80 rotate-0 -translate-x-1/2 opacity-0 animate-spark-appear delay-3000"></div>
                <div className="absolute w-6 h-[1.5px] bg-indigo-500/80 rotate-45 -translate-x-1/2 opacity-0 animate-spark-appear delay-3100"></div>
                <div className="absolute w-6 h-[1.5px] bg-indigo-500/80 rotate-90 -translate-x-1/2 opacity-0 animate-spark-appear delay-3200"></div>
                <div className="absolute w-6 h-[1.5px] bg-indigo-500/80 rotate-135 -translate-x-1/2 opacity-0 animate-spark-appear delay-3300"></div>
              </div>
              
              <div className="absolute left-[55%] top-1/2 w-2 h-2 bg-indigo-500/70 rounded-full animate-pulse-slow delay-400 transform -translate-y-1/2"></div>
              <div className="absolute left-[65%] top-1/2 w-2 h-2 bg-blue-500/60 rounded-full animate-pulse-slow delay-600 transform -translate-y-1/2"></div>
              
              {/* Dot with spark */}
              <div className="absolute left-[75%] top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500/90 rounded-full animate-pulse-slow delay-100"></div>
                
                {/* Spark symbol */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 animate-spark-flash delay-4900">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z" fill="#3b82f6" stroke="#3b82f6" strokeWidth="1" />
                  </svg>
                </div>
                
                {/* Spark rays */}
                <div className="absolute w-4 h-[1px] bg-blue-500/80 rotate-0 -translate-x-1/2 opacity-0 animate-spark-appear delay-5000"></div>
                <div className="absolute w-4 h-[1px] bg-blue-500/80 rotate-45 -translate-x-1/2 opacity-0 animate-spark-appear delay-5100"></div>
                <div className="absolute w-4 h-[1px] bg-blue-500/80 rotate-90 -translate-x-1/2 opacity-0 animate-spark-appear delay-5200"></div>
                <div className="absolute w-4 h-[1px] bg-blue-500/80 rotate-135 -translate-x-1/2 opacity-0 animate-spark-appear delay-5300"></div>
              </div>
              
              <div className="absolute left-[85%] top-1/2 w-2 h-2 bg-blue-500/60 rounded-full animate-pulse-slow delay-700 transform -translate-y-1/2"></div>
              
              {/* Sparks between specific dots */}
              <div className="absolute left-[20%] top-1/2 w-[40px] h-[1px] bg-gradient-to-r from-primary/80 to-transparent opacity-0 animate-spark-appear delay-1200"></div>
              <div className="absolute left-[30%] top-1/2 w-[40px] h-[1px] bg-gradient-to-r from-primary/80 to-transparent opacity-0 animate-spark-appear delay-3600"></div>
              <div className="absolute left-[40%] top-1/2 w-[40px] h-[1px] bg-gradient-to-r from-indigo-500/80 to-transparent opacity-0 animate-spark-appear delay-5400"></div>
              <div className="absolute left-[60%] top-1/2 w-[40px] h-[1px] bg-gradient-to-r from-indigo-500/80 to-transparent opacity-0 animate-spark-appear delay-2400"></div>
              <div className="absolute left-[70%] top-1/2 w-[40px] h-[1px] bg-gradient-to-r from-blue-500/80 to-transparent opacity-0 animate-spark-appear delay-6000"></div>
              <div className="absolute left-[80%] top-1/2 w-[40px] h-[1px] bg-gradient-to-r from-blue-500/80 to-transparent opacity-0 animate-spark-appear delay-4800"></div>
              
              {/* Flash sparks */}
              <div className="absolute left-[25%] top-[calc(50%-2px)] w-1 h-1 bg-white rounded-full opacity-0 animate-spark-flash delay-2000"></div>
              <div className="absolute left-[45%] top-[calc(50%-2px)] w-1 h-1 bg-white rounded-full opacity-0 animate-spark-flash delay-4000"></div>
              <div className="absolute left-[65%] top-[calc(50%-2px)] w-1 h-1 bg-white rounded-full opacity-0 animate-spark-flash delay-6000"></div>
              <div className="absolute left-[80%] top-[calc(50%-2px)] w-1 h-1 bg-white rounded-full opacity-0 animate-spark-flash delay-8000"></div>
            </div>
            
            {/* Action buttons with explanation boxes - Centered */}
            {user ? (
              <Button size="lg" asChild className="w-full md:w-2/3 relative overflow-hidden group mt-3">
                <Link href="/dashboard" className="flex items-center justify-center">
                  <span className="relative z-10">Go to Dashboard</span>
                  <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              </Button>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-3">
                {/* Button 1: Activate or View DotSpark */}
                <div className="bg-gradient-to-br from-primary/5 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/10 border border-primary/20 dark:border-primary/30 rounded-xl p-4 flex flex-col items-center shadow-lg shadow-primary/5 dark:shadow-primary/10 relative overflow-hidden group">
                  {/* Only show "Activated" status if the user is logged in AND WhatsApp is connected */}
                  {user && isWhatsAppConnected ? (
                    <Button size="lg" asChild className="w-full mb-3 relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 hover:from-emerald-600 hover:to-green-500 border-0 shadow-lg shadow-green-500/20 hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105 group">
                      <Link href="/dashboard" className="flex items-center justify-center relative z-10">
                        <Check className="mr-2 h-5 w-5" />
                        <span>DotSpark Activated</span>
                        <div className="absolute inset-0">
                          <div className="absolute top-1/2 left-1/4 w-0.5 h-10 bg-white/10 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="absolute top-1/2 left-1/3 w-0.5 h-8 bg-white/10 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="absolute top-1/2 left-1/2 w-0.5 h-12 bg-white/10 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                          <div className="absolute top-1/2 left-2/3 w-0.5 h-10 bg-white/10 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          <div className="absolute top-1/2 left-3/4 w-0.5 h-8 bg-white/10 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        </div>
                        <Sparkles className="h-4 w-4 ml-2 relative z-20" />
                      </Link>
                    </Button>
                  ) : (
                    <Button size="lg" asChild className="w-full mb-3 relative overflow-hidden bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary border-0 shadow-lg shadow-primary/20 hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 group">
                      <Link href="/activate-dotspark" className="flex items-center justify-center relative z-10">
                        <Brain className="mr-2 h-5 w-5" />
                        <span>Activate DotSpark</span>
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                          <Sparkles className="h-4 w-4 absolute top-1/2 left-3 transform -translate-y-1/2 text-white opacity-80 animate-pulse" />
                        </div>
                      </Link>
                    </Button>
                  )}
                  
                  <div className="text-sm text-muted-foreground text-left relative z-10">
                    <p className="mb-2 font-medium text-foreground">Premium dashboard integration:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Create a DotSpark account</li>
                      <li>Set up your personalized dashboard</li>
                      <li>Link your WhatsApp for synchronized insights</li>
                    </ol>
                  </div>
                </div>
                
                {/* Button 2: Ask DotSpark */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-900/50 rounded-xl p-4 flex flex-col items-center shadow-lg shadow-green-500/5 dark:shadow-green-900/10 relative overflow-hidden group">
                  <WhatsAppContactButton 
                    size="lg" 
                    label="Ask DotSpark"
                    showIcon={true}
                    variant="default"
                    className="w-full mb-3 relative overflow-hidden bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white border-0 shadow-lg shadow-green-500/20 hover:shadow-green-600/30 transition-all duration-300 transform hover:scale-105"
                  />

                  <div className="text-sm text-muted-foreground text-left relative z-10">
                    <p className="mb-2 font-medium text-green-700 dark:text-green-500">Instant ChatGPT-like experience:</p>
                    <p className="text-xs">Start using DotSpark immediately through WhatsApp - no account required. Interact naturally like with ChatGPT.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Visual showcase section replacing the WhatsApp mockup */}
      
      {/* Cognitive Enhancement Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced <span className="gradient-heading">Cognitive Enhancement</span> Technology</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              DotSpark functions as your neural bridge to professional knowledge, continuously learning from industry resources and adapting to your thinking patterns.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* DotSpark Chip Visualization */}
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
                    <p className="text-muted-foreground">Your neural extension learns from your interactions, getting smarter and more personalized over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Dashboard Preview Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your <span className="gradient-heading">DotSpark Dashboard</span> Preview
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience how your DotSpark visualizes connections and enhances your professional thinking.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="transform hover:scale-[1.01] transition-transform duration-300 shadow-xl rounded-xl overflow-hidden border border-primary/10">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">The <span className="gradient-heading">Science</span> of Professional Excellence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Research shows that professionals with cognitive operating systems and personalized knowledge frameworks achieve significantly greater career growth
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">87%</h3>
              <p className="text-muted-foreground">Of top professionals credit cognitive extensions for their career advancement<sup>1</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">3.5x</h3>
              <p className="text-muted-foreground">Faster professional development with personalized neural knowledge systems<sup>2</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">76%</h3>
              <p className="text-muted-foreground">Improvement in cognitive performance when using tuned neural extensions<sup>3</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">56%</h3>
              <p className="text-muted-foreground">Greater career growth rate among professionals with neural extension integration<sup>4</sup></p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground/70 mt-6 text-center">
            <p>Based on research: <sup>1</sup>Harvard Business Review (2023) <sup>2</sup>McKinsey Decision-Making Study (2022) <sup>3</sup>Journal of Organizational Behavior (2022) <sup>4</sup>Stanford Executive Decision Research (2021)</p>
          </div>
        </div>
      </section>

      {/* DotSpark Tuning Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        {/* DotSpark Background Effects */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute w-[600px] h-[600px] rounded-full border border-primary/20 top-1/4 left-1/4 animate-pulse-slow"></div>
          <div className="absolute w-[300px] h-[300px] rounded-full border border-secondary/20 top-1/2 left-1/3 animate-pulse-slow animation-delay-1000"></div>
          <div className="absolute w-8 h-8 rounded-full bg-primary/10 top-[20%] right-[25%] animate-float-slow"></div>
          <div className="absolute w-6 h-6 rounded-full bg-secondary/10 bottom-[25%] left-[20%] animate-float-slow animation-delay-2000"></div>
          <div className="absolute w-4 h-4 rounded-full bg-primary/10 bottom-[35%] right-[35%] animate-float-slow animation-delay-1500"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced <span className="gradient-heading">Tuning</span> Your DotSpark</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The more you train and align DotSpark, the more it adapts to your unique thinking patterns
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border border-primary/10 rounded-xl p-6 relative hover:border-primary/30 transition-all duration-300 cognitive-node">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl mb-4 shadow-inner">1</div>
              <h3 className="text-xl font-bold mb-3">Define Cognitive Pathways</h3>
              <p className="text-muted-foreground">Train your DotSpark by identifying the professional domains and thinking patterns you want it to emulate.</p>
              <div className="absolute top-6 right-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40"><path d="M2 12h5"></path><path d="M7 17l-5-5 5-5"></path><path d="M22 19c0-3.87-3.13-7-7-7H9"></path><path d="M22 5c0 3.87-3.13 7-7 7H9"></path></svg>
              </div>
            </div>
            
            <div className="bg-card border border-primary/10 rounded-xl p-6 relative hover:border-primary/30 transition-all duration-300 cognitive-node">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl mb-4 shadow-inner">2</div>
              <h3 className="text-xl font-bold mb-3">Seamless Integration</h3>
              <p className="text-muted-foreground">Connect your DotSpark to your daily workflow through WhatsApp, allowing for natural thought enhancement whenever needed.</p>
              <div className="absolute top-6 right-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40"><circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path><path d="M9 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path><path d="M15 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"></path></svg>
              </div>
            </div>
            
            <div className="bg-card border border-primary/10 rounded-xl p-6 relative hover:border-primary/30 transition-all duration-300 cognitive-node">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl mb-4 shadow-inner">3</div>
              <h3 className="text-xl font-bold mb-3">Adaptive Intelligence</h3>
              <p className="text-muted-foreground">The more you interact, the more your DotSpark learns your preferences and thinking style, continuously improving its output.</p>
              <div className="absolute top-6 right-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40"><path d="M22 17a10 10 0 0 0-20 0"></path><path d="M12 17v4"></path><path d="M12 3v4"></path><path d="M20 7a4 4 0 0 0-8 0"></path><path d="M4 7a4 4 0 0 1 8 0"></path></svg>
              </div>
            </div>
          </div>

          {/* DotSpark Explanation */}
          <div className="mt-16 max-w-3xl mx-auto text-center">
            <div className="p-6 bg-card border border-primary/20 rounded-xl relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <div className="bg-background p-2 rounded-full border border-primary/20 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 4a2.5 2.5 0 0 1 5 0v15a2.5 2.5 0 0 1-5 0V4Z"></path><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"></path></svg>
                </div>
              </div>
              <h4 className="text-xl font-bold mt-4 mb-3">Your Brain, Enhanced</h4>
              <p className="text-muted-foreground">
                DotSpark adapts to your unique thought patterns. The more you use and tune it, the better it understands how you think. Unlike generic AI tools, DotSpark becomes personalized to your specific needs, learning from each interaction and continuously improving its ability to generate frameworks that align with your thinking style.
              </p>
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
              DotSpark empowers professionals making complex decisions
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
      <section className="py-12 md:py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Generating <span className="gradient-heading">Frameworks</span> for Better Decisions</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
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
                
                {/* Star visual element - hidden on mobile devices to prevent text overlap */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50 animate-sparkling z-20 
                              hidden lg:flex items-center justify-center text-yellow-800 text-xs font-bold">
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
                  <p className="text-muted-foreground text-sm">Message to your neural extension about a complex decision</p>
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
                  <p className="text-muted-foreground text-sm">Your neural extension processes relevant business knowledge</p>
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
                  "Your neural extension has generated a 'Product Strategy Decision Matrix' with 7 critical evaluation criteria, weighted scoring system, and step-by-step implementation guide tailored to your specific resource constraints."
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
                Your neural extension generated this custom framework to guide your decision:
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
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBhNiA2IDAgMSAxLTEyIDAgNiA2IDAgMCAxIDEyIDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white">
              Ready to Amplify Your Professional Cognitive Power?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6 md:mb-10">
              Join innovative professionals who are extending their cognitive capabilities with neural frameworks, achieving breakthrough results and career advancement.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mobile-stack">
              <Button size="lg" variant="default" className="bg-white text-primary font-bold shadow-lg btn-bounce group relative overflow-hidden border-2 border-white hover:bg-white/90 w-full sm:w-auto" asChild>
                <Link href="/auth" className="px-4 md:px-8 flex items-center justify-center">
                  <span className="relative z-10">Get Started Now</span>
                  <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 btn-bounce w-full sm:w-auto" asChild>
                <Link href="/dashboard" className="px-4 md:px-8 justify-center">
                  Explore Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center w-full">
            <div className="flex items-center mb-4 md:mb-0">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2" />
              <span className="text-lg md:text-xl font-bold">DotSpark</span>
            </div>
            
            <div className="text-xs md:text-sm text-muted-foreground">
              © 2025 DotSpark. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}