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
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-2 sm:px-4 md:px-6">
          <div className="flex items-center">
            <div 
              className="flex items-center gap-1 cursor-pointer active:opacity-80 transition-opacity" 
              onClick={() => setLocation("/dashboard")}
            >
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
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white px-2 py-0.5 h-7 rounded-md"
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
                        For the OG Thin<span className="relative inline-block px-3 py-2 bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white font-bold rounded-lg shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 border-2 border-amber-500/20">Q</span>ers
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
                  className="w-full !bg-gradient-to-r !from-orange-600 !to-amber-600 hover:!from-amber-600 hover:!to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
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
                  {isNeuraActivated && isPWAInstalled && (
                    <div className="mt-1 text-xs text-green-600 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>Installed</span>
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
                    <p className="text-muted-foreground">Your neural mirror learns from your interactions, getting smarter and more personalized over time.</p>
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
              <p className="text-muted-foreground">Improvement in cognitive performance when using tuned neural mirrors<sup>3</sup></p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">56%</h3>
              <p className="text-muted-foreground">Greater career growth rate among professionals with neural mirror integration<sup>4</sup></p>
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
                  <p className="text-muted-foreground text-sm">Message to your neural mirror about a complex decision</p>
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
                  <p className="text-muted-foreground text-sm">Your neural mirror processes relevant business knowledge</p>
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
                  "Your neural mirror has generated a 'Product Strategy Decision Matrix' with 7 critical evaluation criteria, weighted scoring system, and step-by-step implementation guide tailored to your specific resource constraints."
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
                Your neural mirror generated this custom framework to guide your decision:
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