import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { 
  SearchIcon, 
  BellIcon, 
  HomeIcon, 
  LogOut, 
  ChevronDown, 
  Menu, 
  LayoutDashboard,
  Brain, 
  User,
  MessageSquare,
  Users
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
// signOut import removed - using logout from useAuth hook instead
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Button 
} from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { neuraStorage } from "@/lib/neuraStorage";

interface HeaderProps {
  onSearch: (query: string) => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onMenuClick, showMenuButton }) => {
  // State and hooks
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const isMobile = useMobile();
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  // State for Neura activation using neuraStorage - forced check on every render
  const [isActivated, setIsActivated] = useState(() => {
    const status = neuraStorage.isActivated();
    console.log("Header initial state:", status);
    return status;
  });
  
  // Get WhatsApp status with our enhanced hook
  const { 
    isWhatsAppConnected, 
    simulateActivation, 
    forceStatusRefresh 
  } = useWhatsAppStatus();
  
  // Update activation status when component mounts
  useEffect(() => {
    setIsActivated(neuraStorage.isActivated());
  }, []);
  
  // Listen for Neura activation events and periodic checks
  useEffect(() => {
    // Function to handle activation state changes
    const handleActivation = (activated: boolean) => {
      console.log("Header received activation event:", activated);
      setIsActivated(activated);
    };
    
    // Initial check on mount
    const initialStatus = neuraStorage.isActivated();
    console.log("Header initial activation check:", initialStatus);
    setIsActivated(initialStatus);
    
    // Set up event listener using neuraStorage utility
    const unsubscribe = neuraStorage.addActivationListener(handleActivation);
    
    // Add event listener for storage changes (in case activation happens in another tab)
    const storageHandler = () => {
      const status = neuraStorage.isActivated();
      console.log("Storage event detected, activation status:", status);
      setIsActivated(status);
    };
    
    // Periodic check for activation status (every 5 seconds)
    const checkActivationStatus = () => {
      const status = neuraStorage.isActivated();
      setIsActivated(status);
    };
    
    const intervalId = setInterval(checkActivationStatus, 5000);
    
    window.addEventListener('storage', storageHandler);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', storageHandler);
      clearInterval(intervalId);
      // Call the unsubscribe function
      unsubscribe();
    };
  }, []);
  
  // When component mounts, refresh WhatsApp status
  useEffect(() => {
    // Always force a status refresh when Header mounts
    // This is important to synchronize status across multiple browser windows/tabs
    if (user) {
      console.log("Header mounted, refreshing WhatsApp status");
      
      // If we're activated in neuraStorage, simulate activation first
      if (neuraStorage.isActivated()) {
        // Simulate activation for immediate UI update
        simulateActivation();
      }
      
      // Regardless of local status, force a backend check
      setTimeout(() => {
        forceStatusRefresh();
      }, 500);
    }
  }, [user, simulateActivation, forceStatusRefresh]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "This feature is coming soon!",
      duration: 3000,
    });
  };

  const handleLogout = async () => {
    try {
      console.log("User initiated logout");
      
      // Use the centralized logout from useAuth hook
      await logout();
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of DotSpark.",
      });
      
      // Redirect to home page after successful logout
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error during logout",
        description: "There was a problem logging out. We'll reload the page to ensure you're signed out.",
        variant: "destructive",
      });
      
      // Force a page reload as fallback if logout fails
      setTimeout(() => {
        window.location.replace("/?forcedLogout=true");
      }, 1500);
    }
  };

  // Direct navigation with Link component
  const goToLandingPage = () => {
    if (isMobile) {
      setShowMobileNav(false);
    }
    // Direct navigation
    setLocation("/");
  };

  // Direct navigation with Link component
  const goToMyNeura = () => {
    if (isMobile) {
      setShowMobileNav(false);
    }
    // Direct navigation to dashboard (My Neura)
    setLocation("/dashboard");
  };

  return (
    <>
      <header className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-2 py-3 flex items-center justify-between shadow-sm">
        {isMobile ? (
          <>
            {/* Logo on left that's clickable to My Neura */}
            <div 
              className="flex items-center gap-2 cursor-pointer active:opacity-80 transition-opacity"
              onClick={() => setLocation("/my-neura")}
            >
              <img src="/dotspark-logo-icon.png?v=2" alt="DotSpark" className="h-8 w-8 object-contain rounded" />
              <span className="text-lg font-semibold text-amber-700 dark:text-amber-300">DotSpark</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Neura status indicator - just brain icon with green indicator */}
              <div className="bg-gradient-to-r from-amber-700 to-primary text-white h-9 w-9 p-0 shadow-md rounded-md flex items-center justify-center">
                <div className="relative">
                  <Brain className={`h-5 w-5 ${isActivated ? 'text-green-300' : 'text-white'}`} />
                  {isActivated && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>}
                </div>
              </div>
              
              {/* Social Neura button with brain icon */}
              <Button
                variant="ghost"
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 transition-all duration-300 ml-2"
                onClick={() => setLocation("/social-neura")}
              >
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <Brain className="h-4 w-4 animate-pulse hover:animate-bounce transition-all duration-300" />
                    <div className="absolute inset-0 animate-ping opacity-30">
                      <Brain className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-xs">Social</span>
                </div>
              </Button>
              
              {/* Profile button - Mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0 h-9 w-9">
                    <Avatar className="h-8 w-8 border-2 border-white shadow">
                      {(user?.photoURL || (user as any)?.avatarUrl) ? (
                        <AvatarImage src={user?.photoURL || (user as any)?.avatarUrl} alt={(user?.displayName || (user as any)?.fullName) || 'User'} />
                      ) : (
                        <AvatarFallback className="bg-primary text-white">
                          {(user?.displayName || (user as any)?.fullName) ? (user?.displayName || (user as any)?.fullName).charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 text-sm">
                    <p className="font-medium">{(user?.displayName || (user as any)?.fullName) || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-neura" className="cursor-pointer w-full">
                      <img src="/dotspark-logo-icon.png?v=2?v=2" alt="DotSpark" className="mr-2 h-4 w-4 object-contain rounded" />
                      My DotSpark
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Neural Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/social" className="cursor-pointer w-full">
                      <Users className="mr-2 h-4 w-4" />
                      DotSpark Social
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Menu button (hamburger) on far right */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary h-10 w-10"
                onClick={onMenuClick || (() => setShowMobileNav(!showMobileNav))}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="mr-4 text-gray-600 hover:text-primary"
                onClick={goToLandingPage}
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="mr-4 text-gray-600 hover:text-primary"
                onClick={() => setLocation("/my-neura")}
              >
                <img src="/dotspark-logo-icon.png?v=2?v=2" alt="DotSpark" className="h-5 w-5 mr-1 object-contain rounded" />
                <span className="hidden sm:inline">My DotSpark</span>
              </Button>

            </div>

            <div className="ml-4 flex items-center">
              
              {/* My Neura with brain icon and green indicator */}
              <Button
                variant="ghost"
                size="sm"
                className="mr-3 bg-gradient-to-r from-amber-700 to-primary text-white shadow-md hover:bg-gradient-to-r hover:from-amber-800 hover:to-primary"
                onClick={() => setLocation("/dashboard")}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Brain className={`h-5 w-5 ${isActivated ? 'text-green-300' : 'text-white'}`} />
                    {isActivated && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                  </div>
                  <span className="text-sm font-medium">My Neura</span>
                </div>
              </Button>
              
              {/* Social Neura button with brain icon */}
              <Button
                variant="ghost"
                size="sm"
                className="mr-2 bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-md hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-700 transition-all duration-300"
                onClick={() => setLocation("/social-neura")}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Brain className="h-5 w-5 animate-pulse hover:animate-bounce transition-all duration-300" />
                    <div className="absolute inset-0 animate-ping opacity-30">
                      <Brain className="h-5 w-5" />
                    </div>
                  </div>
                  <span className="text-sm font-medium">Social</span>
                </div>
              </Button>
              
              {/* Profile button - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    <Avatar className="h-8 w-8 border-2 border-white shadow">
                      {(user?.photoURL || (user as any)?.avatarUrl) ? (
                        <AvatarImage src={user?.photoURL || (user as any)?.avatarUrl} alt={(user?.displayName || (user as any)?.fullName) || 'User'} />
                      ) : (
                        <AvatarFallback className="bg-primary text-white">
                          {(user?.displayName || (user as any)?.fullName) ? (user?.displayName || (user as any)?.fullName).charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 text-sm">
                    <p className="font-medium">{(user?.displayName || (user as any)?.fullName) || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-neura" className="cursor-pointer w-full">
                      <img src="/dotspark-logo-icon.png?v=2?v=2" alt="DotSpark" className="mr-2 h-4 w-4 object-contain rounded" />
                      My DotSpark
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Neural Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/social" className="cursor-pointer w-full">
                      <Users className="mr-2 h-4 w-4" />
                      DotSpark Social
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </header>
      
      {/* Mobile Navigation Menu - Only shown when not using the main sidebar */}
      {isMobile && showMobileNav && !onMenuClick && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex justify-between items-center p-4 border-b">
            <div 
              onClick={() => {
                setShowMobileNav(false);
                setLocation("/my-neura");
              }} 
              className="cursor-pointer flex items-center active:opacity-80 transition-opacity"
            >
              <img src="/dotspark-logo-wordmark.png?v=2?v=2" alt="DotSpark" className="h-10 w-auto rounded-sm" />
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMobileNav(false)}
            >
              &times;
            </Button>
          </div>
          <div className="p-4">
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search your learnings..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <SearchIcon className="h-5 w-5" />
                </div>
              </form>
            </div>
            
            <nav className="space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start mb-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={goToLandingPage}
              >
                <HomeIcon className="h-5 w-5 mr-2 text-amber-600" />
                Home
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start mb-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={goToMyNeura}
              >
                <Brain className="h-5 w-5 mr-2 text-amber-600" />
                My DotSpark
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start mb-2 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                onClick={() => {
                  setShowMobileNav(false);
                  setLocation("/social");
                }}
              >
                <Users className="h-5 w-5 mr-2 animate-pulse" />
                DotSpark Social
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;