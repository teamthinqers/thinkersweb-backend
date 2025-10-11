import { useState, ReactNode, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Brain, Users, User, Settings, LogOut, Sparkles, UsersRound, Search, Bell } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth-new';
import { useToast } from '@/hooks/use-toast';
import FloatingDot from '@/components/FloatingDot';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from '@tanstack/react-query';

interface SharedAuthLayoutProps {
  children: ReactNode;
}

type SearchResult = {
  id: number;
  fullName: string | null;
  linkedinHeadline: string | null;
  linkedinPhotoUrl: string | null;
  avatar: string | null;
};

export default function SharedAuthLayout({ children }: SharedAuthLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const isOnSocial = location === '/social';
  const isOnMyNeura = location === '/myneura';
  const isOnMyDotSpark = location === '/my-dotspark';

  // Fetch notifications unread count
  const { data: notificationsData } = useQuery<{ 
    success: boolean; 
    notifications: any[]; 
    unreadCount: number 
  }>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.users || []);
          setShowSearchResults(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = (userId: number) => {
    setLocation(`/user/${userId}`);
    setSearchQuery('');
    setShowSearchResults(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleProfileClick(searchResults[selectedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSearchResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

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
            <Link href="/my-dotspark">
              <Button 
                variant="ghost" 
                title="My DotSpark"
                className={`${isSidebarOpen ? 'w-full justify-start h-10' : 'w-10 h-10'} rounded-xl transition-all duration-300 ${
                  isOnMyDotSpark 
                    ? 'text-white hover:opacity-90' 
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isOnMyDotSpark ? '#B85C3A' : 'transparent',
                  backgroundImage: isOnMyDotSpark 
                    ? 'linear-gradient(to bottom right, #C06A42, #B85C3A, #A04E2E)' 
                    : 'none',
                  color: isOnMyDotSpark ? 'white' : '#B85C3A'
                }}
              >
                <div className={`${isSidebarOpen ? '' : 'flex items-center justify-center'}`}>
                  <div className={`flex items-center justify-center bg-white rounded-full ${isSidebarOpen ? 'h-5 w-5 p-0.5' : 'h-8 w-8 p-1'}`}>
                    <img 
                      src="/dotspark-logo-transparent.png?v=1" 
                      alt="DotSpark" 
                      className="h-full w-full"
                    />
                  </div>
                </div>
                {isSidebarOpen && <span className="ml-3 text-sm font-medium">My DotSpark</span>}
              </Button>
            </Link>

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
                <Brain className={`w-5 h-5 ${isOnSocial ? '' : 'animate-pulse'}`} />
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
        <header className="relative z-[2000] flex items-center justify-between h-14 px-4 md:px-6 border-b border-amber-200/50 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50 backdrop-blur-sm shadow-sm">
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
          
          {/* Center: Search Bar (only visible when user is authenticated) */}
          <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
            {user && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search profiles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 bg-white border-amber-200 focus:border-amber-400 rounded-lg"
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-[9999]">
                    {searchResults.length > 0 ? (
                      <div className="py-1">
                        {searchResults.map((result, index) => (
                          <button
                            key={result.id}
                            onClick={() => handleProfileClick(result.id)}
                            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                              selectedIndex === index ? 'bg-amber-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={result.linkedinPhotoUrl || result.avatar || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                {result.fullName?.[0]?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm text-gray-900">{result.fullName || 'Unknown'}</p>
                              {result.linkedinHeadline && (
                                <p className="text-xs text-gray-500 truncate">{result.linkedinHeadline}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No profiles found
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Navigation Buttons with Icons and Text + User Avatar */}
          <div className="flex items-center gap-2">
            {/* My DotSpark Button with Logo Icon */}
            <Link href="/my-dotspark">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: '#B85C3A',
                  backgroundImage: 'linear-gradient(to bottom right, #C06A42, #B85C3A, #A04E2E)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundImage = 'linear-gradient(to bottom right, #A04E2E, #904428, #803A22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundImage = 'linear-gradient(to bottom right, #C06A42, #B85C3A, #A04E2E)';
                }}
                title="My DotSpark"
              >
                <div className="relative h-5 w-5 flex items-center justify-center bg-white rounded-full p-0.5">
                  <img 
                    src="/dotspark-logo-transparent.png?v=1" 
                    alt="DotSpark" 
                    className="h-full w-full"
                  />
                </div>
                <span className="text-white font-medium">My DotSpark</span>
              </Button>
            </Link>

            {/* Social Button with Brain Icon and Text */}
            <Link href="/social">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
                title="Social"
              >
                <Brain className="h-5 w-5 text-white animate-pulse" />
                <span className="text-white font-medium">Social</span>
              </Button>
            </Link>

            {/* My Neura Button with Brain Icon, Text and green active indicator */}
            <Link href="/myneura">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                title="My Neura"
              >
                <Brain className="h-5 w-5 text-white transition-all duration-300" />
                <span className="text-white font-medium">My Neura</span>
                {isOnMyNeura && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
                )}
              </Button>
            </Link>

            {/* Notifications Bell */}
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 bg-white/80 hover:bg-white border border-amber-200 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-amber-700" />
                {notificationsData && notificationsData.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {notificationsData.unreadCount > 9 ? '9+' : notificationsData.unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Avatar */}
            {user && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(user as any).avatar || (user as any).linkedinPhotoUrl || (user as any).photoURL || undefined} />
                      <AvatarFallback className="text-xs">
                        {(user as any).displayName?.[0]?.toUpperCase() || 'U'}
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
                          <AvatarImage src={(user as any).avatar || (user as any).linkedinPhotoUrl || (user as any).photoURL || undefined} />
                          <AvatarFallback>
                            {(user as any).displayName?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{(user as any).displayName || 'User'}</p>
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
                      <Brain className={`w-4 h-4 mr-3 ${isOnSocial ? '' : 'animate-pulse'}`} />
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
                      <AvatarImage src={(user as any).avatar || (user as any).linkedinPhotoUrl || (user as any).photoURL || undefined} />
                      <AvatarFallback>
                        {(user as any).displayName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{(user as any).displayName || 'User'}</p>
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

      {/* Global Floating Dot */}
      <FloatingDot 
        currentPage={location}
        onClick={() => {
          // TODO: Handle click - will be implemented next
          console.log('Floating dot clicked');
        }} 
      />
    </div>
  );
}
