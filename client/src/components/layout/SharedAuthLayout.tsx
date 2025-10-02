import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Brain, Home, User, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth-new';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SharedAuthLayoutProps {
  children: ReactNode;
}

export default function SharedAuthLayout({ children }: SharedAuthLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();

  const isOnSocialFeed = location === '/home';
  const isOnMyNeura = location === '/myneura';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Collapsible */}
      <div className={`hidden md:flex flex-col transition-all duration-300 bg-white border-r border-amber-200/30 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-center h-14 border-b border-amber-200/30">
            {isSidebarOpen ? (
              <img 
                src="/dotspark-logo-combined.png?v=1" 
                alt="DotSpark" 
                className="h-8 w-auto"
              />
            ) : (
              <img 
                src="/dotspark-logo-transparent.png?v=1" 
                alt="DotSpark" 
                className="h-8 w-8 rounded-lg"
              />
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col items-center space-y-3 flex-1 py-4">
            <Link href="/home">
              <Button 
                variant="ghost" 
                size="icon"
                title="Home"
                className={`h-10 w-10 rounded-xl transition-all duration-300 ${
                  isOnSocialFeed 
                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                    : 'hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <Home className="w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/myneura">
              <Button 
                variant="ghost" 
                size="icon"
                title="My Neura"
                className={`h-10 w-10 rounded-xl transition-all duration-300 ${
                  isOnMyNeura 
                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                    : 'hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <Brain className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* User Avatar at Bottom */}
          {user && (
            <div className="mt-auto mb-4 flex justify-center">
              <Link href="/profile">
                <Avatar className="h-8 w-8 hover:ring-2 hover:ring-amber-400 transition-all duration-300 cursor-pointer">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="text-xs">
                    {user.displayName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Slim Header - Static across all pages */}
        <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-amber-200/30 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 backdrop-blur-sm shadow-sm">
          {/* Left: Sidebar Toggle + Logo */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-amber-100/70 rounded-lg transition-all duration-300"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5 text-amber-700" />
            </Button>

            {/* Logo - Mobile */}
            <Link href="/home">
              <div className="flex md:hidden items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <img 
                  src="/dotspark-logo-combined.png?v=1" 
                  alt="DotSpark" 
                  className="h-8 w-auto object-contain" 
                />
              </div>
            </Link>
          </div>
          
          {/* Center: Empty space */}
          <div className="flex-1"></div>

          {/* Right: Fixed position icons */}
          <div className="flex items-center gap-2">
            {/* Home Icon with LinkedIn-style underline */}
            <Link href="/home">
              <div className="relative flex flex-col items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isOnSocialFeed
                      ? 'bg-amber-50 text-amber-700'
                      : 'hover:bg-amber-50 hover:text-amber-600'
                  }`}
                  title="Home"
                >
                  <Home className="h-5 w-5" />
                </Button>
                {/* LinkedIn-style active indicator */}
                {isOnSocialFeed && (
                  <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-amber-600 rounded-full"></div>
                )}
              </div>
            </Link>

            {/* My Neura Icon with LinkedIn-style underline */}
            <Link href="/myneura">
              <div className="relative flex flex-col items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isOnMyNeura
                      ? 'bg-amber-50 text-amber-700'
                      : 'hover:bg-amber-50 hover:text-amber-600'
                  }`}
                  title="My Neura"
                >
                  <Brain className="h-5 w-5" />
                </Button>
                {/* LinkedIn-style active indicator */}
                {isOnMyNeura && (
                  <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-amber-600 rounded-full"></div>
                )}
              </div>
            </Link>

            {/* User Avatar */}
            {user && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="text-xs">
                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <div className="flex flex-col h-full bg-gray-50">
                    {/* Profile Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.photoURL || undefined} />
                          <AvatarFallback>
                            {user.displayName?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{user.displayName || 'User'}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Profile Actions */}
                    <nav className="flex-1 p-2">
                      <div className="space-y-1">
                        <Link href="/profile">
                          <Button variant="ghost" className="w-full justify-start text-sm h-9">
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </Button>
                        </Link>
                        <Link href="/settings">
                          <Button variant="ghost" className="w-full justify-start text-sm h-9">
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </Button>
                        </Link>
                      </div>
                    </nav>
                    
                    {/* Sign Out */}
                    <div className="p-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        className="w-full text-sm"
                        onClick={async () => {
                          try {
                            await logout();
                            setLocation("/auth");
                            toast({
                              title: "Signed Out",
                              description: "You have been successfully signed out.",
                            });
                          } catch (error) {
                            toast({
                              title: "Sign Out Error",
                              description: "There was an issue signing you out. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-amber-200/30">
                <img 
                  src="/dotspark-logo-combined.png?v=1" 
                  alt="DotSpark" 
                  className="h-8 w-auto"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 p-2">
                <div className="space-y-1">
                  <Link href="/home">
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-sm h-10 ${isOnSocialFeed ? 'bg-amber-50 text-amber-600' : ''}`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Home className="w-4 h-4 mr-3" />
                      Home
                    </Button>
                  </Link>
                  
                  <Link href="/myneura">
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-sm h-10 ${isOnMyNeura ? 'bg-amber-50 text-amber-600' : ''}`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Brain className="w-4 h-4 mr-3" />
                      My Neura
                    </Button>
                  </Link>
                </div>
              </div>

              {/* User Profile at Bottom */}
              {user && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>
                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    onClick={async () => {
                      try {
                        await logout();
                        setLocation("/auth");
                        setIsSidebarOpen(false);
                        toast({
                          title: "Signed Out",
                          description: "You have been successfully signed out.",
                        });
                      } catch (error) {
                        toast({
                          title: "Sign Out Error",
                          description: "There was an issue signing you out. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
