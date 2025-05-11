import React, { useState } from "react";
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
  Sparkles
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
import { Check } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onMenuClick, showMenuButton }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { isWhatsAppConnected } = useWhatsAppStatus();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const isMobile = useMobile();
  const [showMobileNav, setShowMobileNav] = useState(false);

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
              
              {isWhatsAppConnected ? (
                <Button 
                  className="mr-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white relative"
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                >
                  <div className="absolute inset-0 bg-white/10 rounded animate-pulse"></div>
                  <span className="relative z-10 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    <Sparkles className="h-3 w-3 absolute top-1 right-0.5" />
                    Neural Activated
                  </span>
                </Button>
              ) : (
                <Button 
                  className="mr-2 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white"
                  size="sm"
                  onClick={() => setLocation("/activate-neural")}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  <Sparkles className="h-3 w-3 absolute top-1 right-1" />
                  Activate Neural
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
              
              {isWhatsAppConnected ? (
                <Button 
                  className="w-full justify-start mb-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white relative"
                  size="sm"
                  onClick={() => {
                    setShowMobileNav(false);
                    setLocation("/dashboard");
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 rounded animate-pulse"></div>
                  <span className="relative z-10 flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    <span>Neural Extension Activated</span>
                    <Sparkles className="h-3 w-3 absolute top-2 right-2" />
                  </span>
                </Button>
              ) : (
                <Button 
                  className="w-full justify-start mb-2 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white relative"
                  size="sm"
                  onClick={() => {
                    setShowMobileNav(false);
                    setLocation("/activate-neural");
                  }}
                >
                  <Brain className="h-5 w-5 mr-2" />
                  <span>Activate Neural Extension</span>
                  <Sparkles className="h-3 w-3 absolute top-2 right-2" />
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
