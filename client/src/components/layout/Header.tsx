import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon, BellIcon, HomeIcon, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
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

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

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
      await logout();
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const goToLandingPage = () => {
    setLocation("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
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
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mr-2">
            Dashboard
          </Button>
        </Link>
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
    </header>
  );
};

export default Header;
