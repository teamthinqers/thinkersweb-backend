import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Brain, BookOpen, Users, Sparkles, BarChart2, 
  MessageCircle, MessageSquare, User, Menu, X, Check, CheckCircle, Download,
  Smartphone, Monitor, Share, Plus
} from "lucide-react";

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
import { useAuth } from "@/hooks/use-auth";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { neuraStorage } from "@/lib/neuraStorage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState<string | null>(null);
  const { 
    isWhatsAppConnected, 
    simulateActivation, 
    forceStatusRefresh 
  } = useWhatsAppStatus();
  
  // Use neuraStorage for Neura activation status
  const [isNeuraActivated, setIsNeuraActivated] = useState(() => {
    return neuraStorage.isActivated();
  });
  
  // Track PWA installation status
  const [isPWAInstalled, setIsPWAInstalled] = useState(() => {
    // Check if app is running in standalone mode (PWA installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://');
    
    // Also check localStorage for installation status
    const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
    
    return isStandalone || wasInstalled;
  });
  
  // Track setup completion status
  const [isSetupCompleted, setIsSetupCompleted] = useState(() => {
    return neuraStorage.isSetupCompleted();
  });
  
  // Listen for Neura activation changes and track setup completion
  useEffect(() => {
    const handleActivation = (activated: boolean) => {
      console.log("LandingPage received activation event:", activated);
      setIsNeuraActivated(activated);
      
      // Check if all setup steps are complete and mark setup as complete if needed
      if (activated && user && isWhatsAppConnected && isPWAInstalled) {
        neuraStorage.markSetupCompleted();
      }
    };
    
    // Handle setup completion status changes
    const handleSetupCompleted = (completed: boolean) => {
      console.log("LandingPage received setup completion event:", completed);
      setIsSetupCompleted(completed);
    };
    
    // Set up event listeners using neuraStorage utility
    const unsubscribeActivation = neuraStorage.addActivationListener(handleActivation);
    const unsubscribeSetup = neuraStorage.addSetupCompletionListener(handleSetupCompleted);
    
    // Add event listener for storage changes (in case activation happens in another tab)
    const storageHandler = () => {
      const activationStatus = neuraStorage.isActivated();
      const setupStatus = neuraStorage.isSetupCompleted();
      setIsNeuraActivated(activationStatus);
      setIsSetupCompleted(setupStatus);
    };
    
    window.addEventListener('storage', storageHandler);
    
    // Check if all steps are complete on mount/update and mark setup complete if needed
    if (isNeuraActivated && user && isWhatsAppConnected && isPWAInstalled && !isSetupCompleted) {
      neuraStorage.markSetupCompleted();
    }
    
    // Clean up
    return () => {
      window.removeEventListener('storage', storageHandler);
      unsubscribeActivation();
      unsubscribeSetup();
    };
  }, [user, isNeuraActivated, isWhatsAppConnected, isPWAInstalled, isSetupCompleted]);

  // Add PWA installation event listeners
  useEffect(() => {
    const handleDisplayModeChange = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true ||
                         document.referrer.includes('android-app://');
      setIsPWAInstalled(isInstalled);
    };

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Listen for appinstalled event (when PWA is installed)
    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  // For WhatsApp activation status
  const isActiveInLocalStorage = localStorage.getItem('whatsapp_activated') === 'true';
  const isWhatsAppActivated = isWhatsAppConnected || isActiveInLocalStorage;
  
  // Check for activation status every 2 seconds to ensure consistency
  useEffect(() => {
    const checkActivationStatus = () => {
      const status = neuraStorage.isActivated();
      setIsNeuraActivated(status);
    };
    
    const intervalId = setInterval(checkActivationStatus, 2000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Persist activation status in localStorage if backend confirms it
  useEffect(() => {
    if (isWhatsAppConnected && !isActiveInLocalStorage) {
      console.log("Backend confirms WhatsApp connection - updating localStorage");
      localStorage.setItem('whatsapp_activated', 'true');
    }
  }, [isWhatsAppConnected, isActiveInLocalStorage]);
  
  // When component mounts, refresh WhatsApp status
  useEffect(() => {
    // Force a status refresh when component mounts
    forceStatusRefresh();
  }, [forceStatusRefresh]);
  
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
      <header className="border-b bg-gradient-to-r from-slate-50 to-amber-50 dark:from-slate-900 dark:to-amber-950/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-2 sm:px-4 md:px-6">
          <div className="flex items-center">
            <div 
              className="flex items-center gap-1 cursor-pointer active:opacity-80 transition-opacity" 
              onClick={() => setLocation("/dotspark-tuning")}
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-amber-800 dark:text-amber-600">DotSpark</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary">
                Home
              </Link>
              <Button 
                className="bg-gradient-to-r from-amber-700 to-primary hover:from-amber-800 hover:to-primary/90 text-white h-9 px-3 relative shadow-md"
                size="sm"
                onClick={() => setLocation("/dashboard")}
              >
                <div className="flex items-center gap-2 relative z-10">
                  <div className="relative">
                    <Brain className="h-4 w-4" />
                    {isNeuraActivated && <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>}
                  </div>
                  <span className="text-xs">My Neura</span>
                </div>
              </Button>
              <Button 
                className={`${isNeuraActivated 
                  ? "bg-gradient-to-r from-amber-700 to-primary hover:from-amber-800 hover:to-primary/90" 
                  : "bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-900 hover:to-amber-800"} 
                  text-white h-9 px-3 relative`}
                size="sm"
                onClick={() => setLocation("/sectioned-dotspark-tuning")}
              >
                <div className="flex items-center gap-2 relative z-10">
                  <div className="flex items-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-xs">My DotSpark</span>
                </div>
              </Button>
            </div>
            
            {/* Contact options button (WhatsApp/Direct Chat), always visible on desktop regardless of login status */}
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  // Fetch WhatsApp number first
                  fetch('/api/whatsapp/contact')
                    .then(res => res.json())
                    .then(data => {
                      setWhatsAppNumber(data.phoneNumber);
                      setContactDialogOpen(true);
                    })
                    .catch(err => {
                      console.error("Error fetching WhatsApp contact:", err);
                      // Fallback to hardcoded number if API fails
                      setWhatsAppNumber('16067157733');
                      setContactDialogOpen(true);
                    });
                }}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white border-transparent"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask DotSpark
              </Button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="block md:hidden">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white px-2 py-0.5 h-7 rounded-md"
                  onClick={() => {
                    // Fetch WhatsApp number first
                    fetch('/api/whatsapp/contact')
                      .then(res => res.json())
                      .then(data => {
                        setWhatsAppNumber(data.phoneNumber);
                        setContactDialogOpen(true);
                      })
                      .catch(err => {
                        console.error("Error fetching WhatsApp contact:", err);
                        // Fallback to hardcoded number if API fails
                        setWhatsAppNumber('16067157733');
                        setContactDialogOpen(true);
                      });
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Ask</span>
                </Button>
              </div>
              
              <div className="flex sm:hidden gap-1">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-700 to-primary hover:from-amber-800 hover:to-primary/90 text-white relative h-7 px-2 shadow-md"
                  onClick={() => setLocation("/dashboard")}
                >
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <Brain className="h-3.5 w-3.5" />
                      {isNeuraActivated && (
                        <div className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <span className="text-xs">My Neura</span>
                  </div>
                </Button>
              </div>
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
                        <Link href="/" className="py-2 hover:text-primary transition-colors flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span>Home</span>
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <div onClick={() => setLocation("/sectioned-dotspark-tuning")} className="py-2 hover:text-primary transition-colors flex items-center gap-2 cursor-pointer">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          <span className="font-medium bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent">My DotSpark</span>
                        </div>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <div onClick={() => setLocation("/dashboard")} className="py-2 hover:text-primary transition-colors flex items-center gap-2 cursor-pointer">
                          <div className="relative">
                            <Brain className="h-4 w-4" />
                            {isNeuraActivated && (
                              <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <span>My Neura</span>
                        </div>
                      </SheetClose>
                    </div>
                    
                    <div className="mt-6">
                      {!user && (
                        <SheetClose asChild>
                          <Button 
                            variant="default"
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white border-transparent"
                            onClick={() => {
                              // Fetch WhatsApp number first
                              fetch('/api/whatsapp/contact')
                                .then(res => res.json())
                                .then(data => {
                                  setWhatsAppNumber(data.phoneNumber);
                                  setContactDialogOpen(true);
                                })
                                .catch(err => {
                                  console.error("Error fetching WhatsApp contact:", err);
                                  // Fallback to hardcoded number if API fails
                                  setWhatsAppNumber('16067157733');
                                  setContactDialogOpen(true);
                                });
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Ask DotSpark
                          </Button>
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
        {/* Background visual elements with simplified DotSpark patterns */}
        <div className="absolute inset-0 z-0">
          {/* Subtle gradient background effects using warm amber/orange color scheme */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/3 dark:bg-amber-400/5 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/3 dark:bg-orange-400/5 rounded-full blur-3xl opacity-60 translate-y-1/3 -translate-x-1/4"></div>
          

        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center max-w-3xl mx-auto">
            {/* Centered badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Introducing DotSpark</span>
            </div>
            
            {/* Heading */}
            <div className="container px-4 max-w-4xl mx-auto text-center">
              <div className="mx-auto text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                <div className="relative text-center mx-auto h-[70px] sm:h-[90px] flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center w-full px-4">
                    <div className="flex items-center justify-center w-full max-w-[480px] mx-auto">
                      <span className="font-sans tracking-normal text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200 whitespace-nowrap">
                        For the OG Thin<span className="relative inline-block px-3 py-2 bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white font-bold rounded-lg shadow-lg border-2 border-amber-500/20">Q</span>ers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            

            {/* Subheadings */}
            <div className="text-lg md:text-xl text-muted-foreground mt-4 md:mt-4 mb-4 max-w-2xl mx-auto text-center px-4">
              <p className="leading-tight md:leading-normal max-w-2xl mx-auto">
                Built on inspirations from <span className="font-semibold text-amber-700 dark:text-amber-400">ancient Indian wisdom</span>,<br className="hidden md:inline" /> 
                to preserve and sharpen your <span className="font-semibold text-amber-700 dark:text-amber-400">Natural Intelligence</span> in an AI Driven World.
              </p>
            </div>
            

            
            {/* Action buttons with explanation boxes - Centered */}
            {user ? (
              <Button size="lg" asChild className="w-full md:w-2/3 relative overflow-hidden group mt-1">
                <Link href="/sectioned-dotspark-tuning" className="flex items-center justify-center">
                  <span className="relative z-10">Go to My DotSpark</span>
                  <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                </Link>
              </Button>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-1">
                {/* Button 1: Activate or View DotSpark */}
                <div className="bg-gradient-to-br from-primary/5 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/10 border border-primary/20 dark:border-primary/30 rounded-xl p-4 flex flex-col items-center shadow-lg shadow-primary/5 dark:shadow-primary/10 relative overflow-hidden group">
                  {/* Only show "Activated" status if the user is logged in AND WhatsApp is connected */}
                  {user && isWhatsAppConnected ? (
                    <Button size="lg" asChild className="w-full mb-3 relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-500 hover:from-red-600 hover:to-orange-500 border-0 shadow-lg shadow-orange-500/20 hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105 group">
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
                    <Button size="lg" asChild className="w-full mb-3 relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-600 border-0 shadow-lg shadow-amber-600/20 hover:shadow-amber-700/30 transition-all duration-300 transform hover:scale-105 group">
                      <Link href="/sectioned-dotspark-tuning" className="flex items-center justify-center relative z-10">
                        <Sparkles className="mr-2 h-5 w-5" />
                        <span>Activate DotSpark</span>
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                          <div className="h-4 w-4 absolute top-1/2 left-3 transform -translate-y-1/2 text-white opacity-80 animate-pulse" />
                        </div>
                      </Link>
                    </Button>
                  )}
                  
                  <div className="text-sm text-muted-foreground text-left relative z-10">
                    <p className="mb-2 font-medium text-foreground">Get started in 3 easy steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Sign up for an account</li>
                      <li>Activate your DotSpark</li>
                      <li>Download the Web App for better experience</li>
                    </ol>
                  </div>
                </div>
                
                {/* Button 2: Ask DotSpark */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-900/50 rounded-xl p-4 flex flex-col items-center shadow-lg shadow-orange-500/5 dark:shadow-orange-900/10 relative overflow-hidden group">
                  {/* Blinking dots around WhatsApp section */}
                  <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-orange-400/40 rounded-full animate-pulse" style={{animationDelay: '10s'}}></div>
                  <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-amber-500/30 rounded-full animate-pulse" style={{animationDelay: '10.5s'}}></div>
                  <div className="absolute top-1/2 right-1 w-0.5 h-0.5 bg-orange-500/20 rounded-full animate-pulse" style={{animationDelay: '11s'}}></div>
                  <Button
                    size="lg"
                    onClick={() => setContactDialogOpen(true)}
                    className="w-full mb-3 relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-600/30 transition-all duration-300 transform hover:scale-105"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    <span>Ask DotSpark</span>
                  </Button>

                  <div className="text-sm text-muted-foreground text-left relative z-10">
                    <p className="mb-2 font-medium text-orange-700 dark:text-orange-500">Instant ChatGPT-like experience:</p>
                    <p className="text-xs">Start using AI chat immediately - no account required and be assured your chats & thoughts are protected.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Setup DotSpark 3-step process section */}
      <section id="setup-dotspark" className="py-16 bg-gradient-to-b from-amber-50/30 to-orange-50/20 dark:from-amber-950/20 dark:to-orange-950/10 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">
              Setup <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">DotSpark</span> in 3 Simple Steps
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto" style={{ display: "grid", gridTemplateRows: "1fr" }}>
            {/* Step 1: Sign In */}
            <div className="bg-card rounded-lg p-6 relative group hover:shadow-lg transition-all duration-300 border border-amber-200/30 dark:border-amber-800/30 overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors duration-300"></div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 mb-4 relative z-10">
                <User className="h-6 w-6" />
              </div>
              <div className="absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/80 text-white font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign In or Register</h3>
              <p className="text-muted-foreground text-sm">Create your account to personalize your DotSpark experience.</p>
              <div className="mt-auto pt-4">
                <Button asChild className="w-full !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!from-orange-600 hover:!to-amber-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <Link href="/auth">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Step 2: Activate DotSpark */}
            <div className="bg-card rounded-lg p-6 relative group hover:shadow-lg transition-all duration-300 border border-orange-200/30 dark:border-orange-800/30 overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-colors duration-300"></div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 text-orange-600 mb-4 relative z-10">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/80 text-white font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Activate DotSpark</h3>
              <p className="text-muted-foreground text-sm">Configure your DotSpark to mirror your natural intelligence & thinking style.</p>
              <div className="mt-auto pt-4">
                <Button 
                  className="w-full !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!from-orange-600 hover:!to-amber-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => setLocation("/sectioned-dotspark-tuning")}
                >
                  Activate DotSpark
                </Button>
              </div>
            </div>
            
            {/* Step 3: Install Web App */}
            <div className="bg-card rounded-lg p-6 relative group hover:shadow-lg transition-all duration-300 border border-orange-200/30 dark:border-orange-800/30 overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-colors duration-300"></div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 text-orange-600 mb-4 relative z-10">
                <Download className="h-6 w-6" />
              </div>
              <div className="absolute top-6 right-6 flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/80 text-white font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Install Web App</h3>
              <p className="text-muted-foreground text-sm">Download the Web App for better experience.</p>
              <div className="mt-auto pt-4">
                <Button 
                  onClick={() => setInstallDialogOpen(true)}
                  className="w-full !bg-gradient-to-r !from-amber-500 !to-orange-600 hover:!from-orange-600 hover:!to-amber-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Download className="h-5 w-5 mr-2" />
                  <span>Install App</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Enhanced gamified progress tracker */}
          <div className="max-w-2xl mx-auto mt-16 relative">
            {/* Additional blinking dots around setup section */}
            <div className="absolute -left-8 top-[20%] w-0.5 h-0.5 bg-amber-400/40 rounded-full animate-pulse" style={{animationDelay: '7s'}}></div>
            <div className="absolute -left-12 top-[60%] w-1 h-1 bg-orange-500/30 rounded-full animate-pulse" style={{animationDelay: '7.5s'}}></div>
            <div className="absolute -right-8 top-[30%] w-0.5 h-0.5 bg-amber-500/40 rounded-full animate-pulse" style={{animationDelay: '8s'}}></div>
            <div className="absolute -right-12 top-[70%] w-1 h-1 bg-orange-400/30 rounded-full animate-pulse" style={{animationDelay: '8.5s'}}></div>
            
            {/* Tiny sparks around progress area */}
            <div className="absolute -left-6 top-[40%] text-yellow-400/20 text-xs animate-pulse" style={{animationDelay: '9s'}}>✦</div>
            <div className="absolute -right-6 top-[50%] text-yellow-500/20 text-xs animate-pulse" style={{animationDelay: '9.5s'}}>✦</div>
            {/* Progress percentage display */}
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-white rounded-full px-4 py-1 font-bold shadow-lg transition-all duration-500
              ${isSetupCompleted 
                ? 'bg-gradient-to-r from-orange-500 to-red-600 scale-110' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}
            >
              {isSetupCompleted ? (
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  <span>100% Complete</span>
                </span>
              ) : (
                <span>{user ? (isNeuraActivated ? (isPWAInstalled ? "100%" : "67%") : "33%") : "0%"} Complete</span>
              )}
            </div>
            
            {/* Progress path */}
            <div className="relative">
              {/* Path line */}
              <div className="absolute top-1/2 left-0 w-full h-2 bg-muted/50 rounded-full -translate-y-1/2 z-0"></div>
              
              {/* Active path */}
              <div 
                className={`absolute top-1/2 left-0 h-2 rounded-full -translate-y-1/2 z-10 transition-all duration-1000 ease-out
                  ${isSetupCompleted 
                    ? 'bg-gradient-to-r from-orange-400 via-red-500 to-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'}`}
                style={{ 
                  width: isSetupCompleted 
                    ? "100%" 
                    : user 
                      ? (isNeuraActivated ? (isPWAInstalled ? "100%" : "67%") : "33%") 
                      : "0%",
                  boxShadow: isSetupCompleted 
                    ? "0 0 15px rgba(239, 68, 68, 0.7)" 
                    : "0 0 10px rgba(245, 158, 11, 0.5)"
                }}
              ></div>
              
              {/* Step markers */}
              <div className="flex justify-between items-center relative z-20">
                {/* Step 1: Sign In */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg mb-3 transition-all duration-500
                    ${user ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white scale-110' : 'bg-card border-2 border-muted text-muted-foreground'}`}>
                    {user ? (
                      <CheckCircle className="h-6 w-6 md:h-8 md:w-8" />
                    ) : (
                      <div className="rounded-full bg-amber-500/20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                        <span className="font-bold text-lg text-amber-600">1</span>
                      </div>
                    )}
                  </div>
                  <span className={`font-bold text-sm ${user ? 'text-orange-500' : 'text-muted-foreground'}`}>Sign In</span>
                  {user && (
                    <div className="animate-pulse mt-1 text-xs text-orange-500 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
                
                {/* Step 2: Activate DotSpark */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg mb-3 transition-all duration-500
                    ${isNeuraActivated ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white scale-110' : 
                    user ? 'bg-card border-2 border-amber-400 text-amber-500 animate-pulse' : 
                    'bg-card border-2 border-muted text-muted-foreground'}`}>
                    {isNeuraActivated ? (
                      <CheckCircle className="h-6 w-6 md:h-8 md:w-8" />
                    ) : (
                      <div className="rounded-full bg-orange-500/20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                        <span className="font-bold text-lg text-orange-600">2</span>
                      </div>
                    )}
                  </div>
                  <span className={`font-bold text-sm
                    ${isNeuraActivated ? 'text-amber-600' : user ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    Activate DotSpark
                  </span>
                  {isNeuraActivated && (
                    <div className="animate-pulse mt-1 text-xs text-amber-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Completed</span>
                    </div>
                  )}
                  {user && !isNeuraActivated && (
                    <div className="mt-1 text-xs text-amber-500 flex items-center">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      <span>Next step</span>
                    </div>
                  )}
                </div>
                
                {/* Step 3: Install Web App */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg mb-3 transition-all duration-500
                    ${isPWAInstalled ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white scale-110' : 
                    isNeuraActivated ? 'bg-card border-2 border-orange-500 text-orange-500 animate-pulse' : 
                    'bg-card border-2 border-muted text-muted-foreground'}`}>
                    {isPWAInstalled ? (
                      <CheckCircle className="h-6 w-6 md:h-8 md:w-8" />
                    ) : (
                      <div className="rounded-full bg-orange-500/20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                        <span className="font-bold text-lg text-orange-600">3</span>
                      </div>
                    )}
                  </div>
                  <span className={`font-bold text-sm
                    ${isPWAInstalled ? 'text-orange-600' : isNeuraActivated ? 'text-orange-500' : 'text-muted-foreground'}`}>
                    Install Web App
                  </span>
                  {isPWAInstalled && (
                    <div className="animate-pulse mt-1 text-xs text-orange-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Installed</span>
                    </div>
                  )}
                  {isNeuraActivated && !isPWAInstalled && (
                    <div className="mt-1 text-xs text-orange-500 flex items-center">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      <span>Ready to install</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Reward message when all steps are completed */}
            {(user && isNeuraActivated) || isSetupCompleted ? (
              <div className="mt-8 text-center">
                <div className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <Sparkles className="h-5 w-5 mr-2" />
                      <span className="font-bold text-lg">Setup Complete!</span>
                      <Sparkles className="h-5 w-5 ml-2" />
                    </div>
                    <p className="text-sm">Your DotSpark is ready to assist you anytime, anywhere</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Visual showcase section replacing the WhatsApp mockup */}
      
      {/* Why DotSpark Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Why <span className="gradient-heading">DotSpark</span>?</h2>
            
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
              
              <p>
                AI isn't the enemy. It should assist, not replace. Support, not decide.
              </p>
              
              <p className="font-bold text-xl text-amber-700 dark:text-amber-400">
                DotSpark keeps thinking where it belongs — with you.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How DotSpark Works Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">How <span className="gradient-heading">DotSpark</span> Works?</h2>
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
              
              {/* Layer 1: Evenly distributed dots across canvas */}
              <div className="absolute inset-0">
                {/* Top row - distributed horizontally */}
                <div className="absolute top-[15%] left-[12%] w-4 h-4 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50"></div>
                <div className="absolute top-[18%] left-[32%] w-3 h-3 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute top-[12%] left-[52%] w-3.5 h-3.5 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '0.8s'}}></div>
                <div className="absolute top-[20%] left-[72%] w-2.5 h-2.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '1.2s'}}></div>
                <div className="absolute top-[16%] left-[88%] w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '1.6s'}}></div>
                
                {/* Second row */}
                <div className="absolute top-[32%] left-[8%] w-3.5 h-3.5 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute top-[35%] left-[25%] w-3 h-3 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '0.7s'}}></div>
                <div className="absolute top-[28%] left-[45%] w-4 h-4 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '1.1s'}}></div>
                <div className="absolute top-[38%] left-[65%] w-2.5 h-2.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute top-[30%] left-[82%] w-3.5 h-3.5 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '0.4s'}}></div>
                
                {/* Middle row */}
                <div className="absolute top-[48%] left-[15%] w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-[52%] left-[38%] w-4.5 h-4.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '0.9s'}}></div>
                <div className="absolute top-[45%] left-[58%] w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '1.3s'}}></div>
                <div className="absolute top-[50%] left-[78%] w-2.5 h-2.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '1.7s'}}></div>
                
                {/* Fourth row */}
                <div className="absolute top-[65%] left-[20%] w-3.5 h-3.5 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '0.6s'}}></div>
                <div className="absolute top-[68%] left-[42%] w-3 h-3 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '1.0s'}}></div>
                <div className="absolute top-[62%] left-[62%] w-4 h-4 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '1.4s'}}></div>
                <div className="absolute top-[70%] left-[85%] w-2.5 h-2.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '1.8s'}}></div>
                
                {/* Bottom row */}
                <div className="absolute top-[82%] left-[12%] w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '0.8s'}}></div>
                <div className="absolute top-[85%] left-[35%] w-3.5 h-3.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '1.2s'}}></div>
                <div className="absolute top-[80%] left-[55%] w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" style={{animationDelay: '1.6s'}}></div>
                <div className="absolute top-[88%] left-[75%] w-2.5 h-2.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-600/50" style={{animationDelay: '2.0s'}}></div>
              </div>
              
              {/* Layer 2: Interconnecting lines */}
              <div className="absolute inset-0">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500">
                  <defs>
                    <linearGradient id="amberConnection" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#b45309" stopOpacity="0.7"/>
                      <stop offset="50%" stopColor="#d97706" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3"/>
                    </linearGradient>
                    <linearGradient id="amberConnection2" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#92400e" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="#d97706" stopOpacity="0.4"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Evenly distributed network connections */}
                  
                  {/* Horizontal connections across rows */}
                  <path d="M96 75 Q200 90 256 90" stroke="url(#amberConnection)" strokeWidth="2" fill="none" strokeDasharray="3,3">
                    <animate attributeName="stroke-dashoffset" values="0;6;0" dur="2s" repeatCount="indefinite"/>
                  </path>
                  <path d="M256 90 Q400 85 416 100" stroke="url(#amberConnection2)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '0.3s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.5s" repeatCount="indefinite"/>
                  </path>
                  <path d="M416 100 Q550 95 576 100" stroke="url(#amberConnection)" strokeWidth="2" fill="none" strokeDasharray="3,3" style={{animationDelay: '0.6s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;6;0" dur="2.2s" repeatCount="indefinite"/>
                  </path>
                  
                  {/* Vertical connections between rows */}
                  <path d="M200 175 Q210 200 200 240" stroke="url(#amberConnection2)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '0.9s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.8s" repeatCount="indefinite"/>
                  </path>
                  <path d="M360 140 Q370 200 304 260" stroke="url(#amberConnection)" strokeWidth="2" fill="none" strokeDasharray="3,3" style={{animationDelay: '1.2s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;6;0" dur="2.3s" repeatCount="indefinite"/>
                  </path>
                  <path d="M520 190 Q510 250 464 290" stroke="url(#amberConnection2)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '0.4s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.4s" repeatCount="indefinite"/>
                  </path>
                  
                  {/* Diagonal cross connections */}
                  <path d="M96 75 Q300 200 464 290" stroke="url(#amberConnection)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '0.7s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.6s" repeatCount="indefinite"/>
                  </path>
                  <path d="M576 100 Q400 200 160 325" stroke="url(#amberConnection2)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" style={{animationDelay: '1.0s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;6;0" dur="2.1s" repeatCount="indefinite"/>
                  </path>
                  <path d="M120 240 Q350 280 624 390" stroke="url(#amberConnection)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '1.3s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.7s" repeatCount="indefinite"/>
                  </path>
                  
                  {/* Middle row connections */}
                  <path d="M120 240 Q280 260 464 225" stroke="url(#amberConnection2)" strokeWidth="2" fill="none" strokeDasharray="3,3" style={{animationDelay: '0.5s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;6;0" dur="2.9s" repeatCount="indefinite"/>
                  </path>
                  <path d="M304 260 Q450 245 624 250" stroke="url(#amberConnection)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '0.8s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.4s" repeatCount="indefinite"/>
                  </path>
                  
                  {/* Bottom row network */}
                  <path d="M160 325 Q300 340 336 340" stroke="url(#amberConnection2)" strokeWidth="2" fill="none" strokeDasharray="3,3" style={{animationDelay: '1.4s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;6;0" dur="2.6s" repeatCount="indefinite"/>
                  </path>
                  <path d="M336 340 Q450 350 496 310" stroke="url(#amberConnection)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '0.2s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.8s" repeatCount="indefinite"/>
                  </path>
                  <path d="M496 310 Q600 330 680 350" stroke="url(#amberConnection2)" strokeWidth="2" fill="none" strokeDasharray="3,3" style={{animationDelay: '1.5s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;6;0" dur="1.8s" repeatCount="indefinite"/>
                  </path>
                  
                  {/* Final bottom connections */}
                  <path d="M96 410 Q250 420 280 400" stroke="url(#amberConnection)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '1.7s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.0s" repeatCount="indefinite"/>
                  </path>
                  <path d="M280 400 Q400 405 440 400" stroke="url(#amberConnection2)" strokeWidth="2" fill="none" strokeDasharray="3,3" style={{animationDelay: '0.6s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;6;0" dur="2.3s" repeatCount="indefinite"/>
                  </path>
                  <path d="M440 400 Q550 410 600 440" stroke="url(#amberConnection)" strokeWidth="1.5" fill="none" strokeDasharray="4,4" style={{animationDelay: '1.1s'}}>
                    <animate attributeName="stroke-dashoffset" values="0;8;0" dur="2.5s" repeatCount="indefinite"/>
                  </path>
                </svg>
              </div>
              
              {/* Layer 3: More distributed dots for exponential network */}
              <div className="absolute inset-0">
                {/* Central region dots */}
                <div className="absolute top-[45%] left-[48%] w-4 h-4 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse shadow-lg shadow-amber-500/60" style={{animationDelay: '0.2s'}}></div>
                <div className="absolute top-[52%] left-[52%] w-3.5 h-3.5 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-600/60" style={{animationDelay: '0.7s'}}></div>
                <div className="absolute top-[48%] left-[45%] w-3 h-3 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-700/60" style={{animationDelay: '1.1s'}}></div>
                <div className="absolute top-[55%] left-[47%] w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse shadow-lg shadow-amber-500/60" style={{animationDelay: '1.4s'}}></div>
                
                {/* Mid-region connecting dots */}
                <div className="absolute top-[62%] left-[42%] w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-600/60" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-[38%] left-[58%] w-3.5 h-3.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-700/60" style={{animationDelay: '0.9s'}}></div>
                <div className="absolute top-[65%] left-[55%] w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse shadow-lg shadow-amber-500/60" style={{animationDelay: '1.3s'}}></div>
                <div className="absolute top-[35%] left-[42%] w-3 h-3 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-600/60" style={{animationDelay: '1.6s'}}></div>
                
                {/* Outer connecting layer */}
                <div className="absolute top-[25%] left-[62%] w-2.5 h-2.5 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-700/60" style={{animationDelay: '0.4s'}}></div>
                <div className="absolute top-[75%] left-[38%] w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse shadow-lg shadow-amber-500/60" style={{animationDelay: '0.8s'}}></div>
                <div className="absolute top-[22%] left-[48%] w-2.5 h-2.5 rounded-full bg-amber-600 dark:bg-amber-500 animate-pulse shadow-lg shadow-amber-600/60" style={{animationDelay: '1.2s'}}></div>
                <div className="absolute top-[78%] left-[52%] w-3 h-3 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse shadow-lg shadow-amber-700/60" style={{animationDelay: '1.5s'}}></div>
              </div>
              
              {/* Layer 4: Sparks throughout the visualization */}
              <div className="absolute inset-0">
                {/* Scattered sparks */}
                <div className="absolute top-[22%] left-[65%] animate-float">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="absolute top-[58%] left-[28%] animate-float-slow">
                  <Sparkles className="h-3 w-3 text-amber-700 dark:text-amber-500" />
                </div>
                <div className="absolute top-[38%] right-[22%] animate-float-delay">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="absolute bottom-[35%] left-[72%] animate-float">
                  <Sparkles className="h-3 w-3 text-amber-700 dark:text-amber-500" />
                </div>
                <div className="absolute top-[68%] right-[35%] animate-float-slow">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="absolute bottom-[22%] right-[68%] animate-float-delay">
                  <Sparkles className="h-3 w-3 text-amber-700 dark:text-amber-500" />
                </div>
                <div className="absolute top-[85%] left-[45%] animate-float">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="absolute top-[12%] left-[55%] animate-float-slow">
                  <Sparkles className="h-3 w-3 text-amber-700 dark:text-amber-500" />
                </div>
                
                {/* Bouncing spark effects */}
                <div className="absolute top-[28%] left-[78%] w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60 animate-bounce" style={{animationDelay: '1.8s'}}></div>
                <div className="absolute top-[72%] left-[18%] w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/60 animate-bounce" style={{animationDelay: '2.2s'}}></div>
                <div className="absolute top-[45%] right-[12%] w-3.5 h-3.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60 animate-bounce" style={{animationDelay: '1.6s'}}></div>
                <div className="absolute bottom-[52%] left-[85%] w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/60 animate-bounce" style={{animationDelay: '2.4s'}}></div>
                <div className="absolute bottom-[68%] right-[78%] w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/60 animate-bounce" style={{animationDelay: '2.0s'}}></div>
              </div>
              
              {/* Exponential glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/10 dark:via-amber-900/10 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          {/* Content below visualization */}
          <div className="text-center max-w-4xl mx-auto mt-12">
            <p className="text-lg text-foreground leading-relaxed">
              DotSpark is inspired by ancient Indian methods of layered thinking, where raw and valuable thoughts were preserved and connected over time. It helps you capture these meaningful dots and gradually links them based on your unique way of thinking. When such dots from progressive thinkers come together, they create an exponential, compounding spark — building a thinking edge that no AI can replace.
            </p>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">The <span className="gradient-heading">Science</span> of Human Intelligence</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Neuroscience reveals that the human brain has immense untapped potential, with most people using only a fraction of their cognitive capabilities
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">86B</h3>
              <p className="text-muted-foreground">Neurons in the human brain, each capable of forming thousands of connections<sup>1</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">10%</h3>
              <p className="text-muted-foreground">Of brain potential typically accessed by most people in their daily cognitive tasks<sup>2</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">40%</h3>
              <p className="text-muted-foreground">Increase in neural connectivity when engaging in deliberate cognitive enhancement practices<sup>3</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">2.5M</h3>
              <p className="text-muted-foreground">Years of evolution that shaped human intelligence, optimized for pattern recognition and creative thinking<sup>4</sup></p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground/70 mt-6 text-center">
            <p>Based on research: <sup>1</sup>Nature Neuroscience (2023) <sup>2</sup>Journal of Cognitive Enhancement (2022) <sup>3</sup>Proceedings of the National Academy of Sciences (2023) <sup>4</sup>Science: Human Evolution Studies (2022)</p>
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
      
      {/* Contact Options Dialog */}
      <ContactOptionsDialog 
        open={contactDialogOpen} 
        onOpenChange={setContactDialogOpen}
        whatsAppNumber={whatsAppNumber}
      />

      {/* Mobile App Installation Dialog */}
      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Install DotSpark App
            </DialogTitle>
            <DialogDescription>
              Choose your device type for specific installation instructions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Android Instructions */}
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Android Devices</h4>
                  <p className="text-xs text-muted-foreground">Chrome, Samsung Internet, Edge</p>
                </div>
              </div>
              <ol className="text-sm space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 text-xs rounded-full flex items-center justify-center font-medium">1</span>
                  <span>Open <a href="https://www.dotspark.in" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-green-700">https://www.dotspark.in</a> in your mobile browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 text-xs rounded-full flex items-center justify-center font-medium">2</span>
                  <span>Tap the menu button (⋮) in your browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 text-xs rounded-full flex items-center justify-center font-medium">3</span>
                  <span>Select "Install app" or "Add to Home screen"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 text-xs rounded-full flex items-center justify-center font-medium">4</span>
                  <span>Confirm installation when prompted</span>
                </li>
              </ol>
            </div>

            {/* iOS Instructions */}
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">iPhone & iPad</h4>
                  <p className="text-xs text-muted-foreground">Safari browser</p>
                </div>
              </div>
              <ol className="text-sm space-y-2 ml-2">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs rounded-full flex items-center justify-center font-medium">1</span>
                  <span>Open <a href="https://www.dotspark.in" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-blue-700">https://www.dotspark.in</a> in Safari browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs rounded-full flex items-center justify-center font-medium">2</span>
                  <span>Tap the Share button <Share className="inline h-3 w-3" /> at the bottom</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs rounded-full flex items-center justify-center font-medium">3</span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs rounded-full flex items-center justify-center font-medium">4</span>
                  <span>Tap "Add" in the top right corner</span>
                </li>
              </ol>
            </div>

            {/* Easy Alternative */}
            <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-200">Easy Alternative</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300">Works on any mobile device</p>
                </div>
              </div>
              <div className="text-sm text-amber-800 dark:text-amber-200 ml-2">
                <p className="mb-2">Open <a href="https://www.dotspark.in" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100">https://www.dotspark.in</a> in your mobile browser</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">You'll see a guide at the bottom to download the WebApp automatically</p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                onClick={() => setInstallDialogOpen(false)} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600"
              >
                Got it!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}