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
  Sparkles,
  Check
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { signOut } from "@/lib/authService";
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
  
  // Listen for Neura activation events
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
    
    window.addEventListener('storage', storageHandler);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', storageHandler);
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
  
  // Add a special effect to periodically check activation status
  useEffect(() => {
    // Function to check and update activation status
    const checkActivationStatus = () => {
      const activated = neuraStorage.isActivated();
      console.log("Header checking neuraStorage activation:", activated);
      setIsActivated(activated);
    };
    
    // Initial check
    checkActivationStatus();
    
    // Set up an interval to refresh status every 2 seconds
    // This helps ensure multi-device/multi-tab consistency
    const intervalId = setInterval(() => {
      // Check neuraStorage for activation status
      checkActivationStatus();
      // Refresh WhatsApp status as well if user is logged in
      if (user) {
        forceStatusRefresh();
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [user, forceStatusRefresh]);

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
      // Show the toast first so user gets immediate feedback
      toast({
        title: "Logging out...",
        description: "Please wait while we log you out safely",
      });
      
      // Use our centralized auth service for consistent behavior
      await signOut(true); // true = redirect to home page after logout
      
      // Toast notification handled by auth service redirect
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
  const goToDashboard = () => {
    if (isMobile) {
      setShowMobileNav(false);
    }
    // Direct navigation
    setLocation("/dashboard");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-2 py-3 flex items-center justify-between">
        {isMobile ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-primary h-11 w-11 mr-1"
              onClick={onMenuClick || (() => setShowMobileNav(!showMobileNav))}
            >
              <Menu className="h-7 w-7" />
            </Button>
            
            <div className="flex items-center">
              <Button 
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary mr-1 h-9 w-9"
                onClick={goToLandingPage}
              >
                <HomeIcon className="h-5 w-5" />
              </Button>
              
              {/* Always show "My Neura" when on the My Neura page */}
              {location === "/my-neura" || location === "/activate-neura" ? (
                <Button 
                  className="mr-1 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white h-9 px-2 relative"
                  size="sm"
                  onClick={() => setLocation("/my-neura")}
                >
                  <div className="flex items-center relative z-10">
                    <div className="relative">
                      <Brain className="h-4 w-4" />
                      {isActivated && <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                    </div>
                  </div>
                </Button>
              ) : isActivated ? (
                <Button 
                  className="mr-1 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white h-9 px-2 relative"
                  size="sm"
                  onClick={() => setLocation("/my-neura")}
                >
                  <div className="flex items-center relative z-10">
                    <div className="relative">
                      <Brain className="h-4 w-4" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </Button>
              ) : (
                <Button 
                  className="mr-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white h-9 px-2 relative"
                  size="sm"
                  onClick={() => setLocation("/activate-neura")}
                >
                  <div className="flex items-center relative z-10">
                    <Brain className="h-4 w-4" />
                  </div>
                </Button>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-white shadow">
                    {user?.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-primary text-white">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 text-sm">
                  <p className="font-medium">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              
              <div className="relative w-full max-w-xl">
                <form onSubmit={handleSearch}>
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
            </div>

            <div className="ml-4 flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2"
                onClick={goToDashboard}
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
              
              {/* Always show "My Neura" when on the My Neura page */}
              {location === "/my-neura" || location === "/activate-neura" ? (
                <Button 
                  className="mr-2 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white relative"
                  size="sm"
                  onClick={() => setLocation("/my-neura")}
                >
                  <span className="relative z-10 flex items-center">
                    <div className="relative mr-1.5">
                      <Brain className="h-4 w-4" />
                      {isActivated && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>}
                    </div>
                    <span>My Neura</span>
                  </span>
                </Button>
              ) : isActivated ? (
                <Button 
                  className="mr-2 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white relative"
                  size="sm"
                  onClick={() => setLocation("/my-neura")}
                >
                  <span className="relative z-10 flex items-center">
                    <div className="relative mr-1.5">
                      <Brain className="h-4 w-4" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span>My Neura</span>
                  </span>
                </Button>
              ) : (
                <Button 
                  className="mr-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white relative"
                  size="sm"
                  onClick={() => setLocation("/activate-neura")}
                >
                  <span className="relative z-10 flex items-center">
                    <Brain className="h-4 w-4 mr-1" />
                    <span>Activate Neura</span>
                  </span>
                </Button>
              )}
              
              
              <button 
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-2"
                onClick={handleNotifications}
              >
                <BellIcon className="h-5 w-5" />
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer">
                    <Avatar className="h-8 w-8 border-2 border-white shadow">
                      {user?.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                      ) : (
                        <AvatarFallback className="bg-primary text-white">
                          {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 text-sm">
                    <p className="font-medium">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer w-full">
                      Settings
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
            <h2 className="text-lg font-bold text-primary">DotSpark</h2>
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
                className="w-full justify-start mb-2"
                onClick={goToLandingPage}
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start mb-2"
                onClick={goToDashboard}
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                Dashboard
              </Button>
              
              {isActivated ? (
                <Button 
                  className="w-full justify-start mb-2 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white relative"
                  size="sm"
                  onClick={() => {
                    setShowMobileNav(false);
                    setLocation("/my-neura");
                  }}
                >
                  <span className="relative z-10 flex items-center">
                    <div className="relative mr-2">
                      <Brain className="h-4 w-4" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span>My Neura</span>
                  </span>
                </Button>
              ) : (
                <Button 
                  className="w-full justify-start mb-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white relative"
                  size="sm"
                  onClick={() => {
                    setShowMobileNav(false);
                    setLocation("/activate-neura");
                  }}
                >
                  <Brain className="h-5 w-5 mr-2" />
                  <span>Activate Neura</span>
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start mb-2 text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;