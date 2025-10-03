import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Brain, Users, User, Settings, LogOut, Sparkles } from 'lucide-react';
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

  const isOnSocial = location === '/social';
  const isOnMyNeura = location === '/myneura';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Always Visible, Collapsible */}
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
          <div className={`flex flex-col space-y-3 flex-1 py-4 ${isSidebarOpen ? 'px-2' : 'items-center'}`}>
            <Link href="/social">
              <Button 
                variant="ghost" 
                title="Social"
                className={`${isSidebarOpen ? 'w-full justify-start h-10' : 'w-10 h-10'} rounded-xl transition-all duration-300 ${
                  isOnSocial 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Users className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3 text-sm font-medium">Social</span>}
              </Button>
            </Link>
            
            <Link href="/myneura">
              <Button 
                variant="ghost" 
                title="My Neura"
                className={`${isSidebarOpen ? 'w-full justify-start h-10' : 'w-10 h-10'} rounded-xl transition-all duration-300 ${
                  isOnMyNeura 
                    ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white hover:from-amber-600 hover:via-amber-700 hover:to-orange-700' 
                    : 'hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <Brain className="w-5 h-5" />
                {isSidebarOpen && <span className="ml-3 text-sm font-medium">My Neura</span>}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Slim Header - Static across all pages */}
        <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b-2 border-amber-300 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 backdrop-blur-sm shadow-md">
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
            <Link href="/social">
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

          {/* Right: Navigation Icons - Chat page style */}
          <div className="flex items-center gap-3">
            {/* Social Icon */}
            <Link href="/social">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-3 bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
                title="Social"
              >
                <Users className="h-5 w-5 text-white" />
              </Button>
            </Link>

            {/* My Neura Icon with green active indicator */}
            <Link href="/myneura">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-3 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                title="My Neura"
              >
                <Brain className="h-5 w-5 text-white transition-all duration-300" />
                {isOnMyNeura && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
                )}
              </Button>
            </Link>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2 ml-4">
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
                  <Link href="/social">
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-sm h-10 rounded-xl ${isOnSocial ? 'bg-red-500 text-white hover:bg-red-600' : 'hover:bg-red-50 hover:text-red-600'}`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Users className="w-4 h-4 mr-3" />
                      Social
                    </Button>
                  </Link>
                  
                  <Link href="/myneura">
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-sm h-10 rounded-xl ${isOnMyNeura ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white hover:from-amber-600 hover:via-amber-700 hover:to-orange-700' : 'hover:bg-amber-50 hover:text-amber-600'}`}
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
