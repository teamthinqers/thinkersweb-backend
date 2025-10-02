import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Users, Plus, User, LogOut, Settings, Heart, Eye,
  Grid3x3, List, Clock, Loader2, Menu
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ThoughtDot {
  id: number;
  heading: string;
  summary: string;
  emotion?: string;
  imageUrl?: string;
  userId: number;
  visibility: string;
  user?: {
    id: number;
    fullName: string | null;
    avatar: string | null;
    email?: string;
  };
  isSaved?: boolean;
  createdAt: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export default function SocialFeedPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedDot, setSelectedDot] = useState<ThoughtDot | null>(null);
  const [dots, setDots] = useState<ThoughtDot[]>([]);
  const [viewMode, setViewMode] = useState<'cloud' | 'feed'>('cloud');
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated (with delay to prevent blank screen)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!authLoading && !user) {
      // Add small delay to prevent race conditions
      timeout = setTimeout(() => {
        setLocation("/auth");
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [user, authLoading, setLocation]);

  // Fetch public thoughts from all users
  const { data: publicDots, isLoading: dotsLoading } = useQuery({
    queryKey: ['/api/thoughts?limit=50'],
    enabled: !!user, // Only fetch if user is logged in
  });

  // Save thought to MyNeura
  const saveToMyNeuraMutation = useMutation({
    mutationFn: async (thoughtId: number) => {
      const response = await apiRequest('POST', `/api/thoughts/myneura/save/${thoughtId}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved!",
        description: "Thought saved to your MyNeura",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] });
      setSelectedDot(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Transform thoughts into positioned dots
  useEffect(() => {
    if (!publicDots || !(publicDots as any).thoughts) return;

    let dotsArray = (publicDots as any).thoughts;
    
    // Filter recent if enabled
    if (showRecentOnly) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dotsArray = dotsArray.filter((dot: any) => new Date(dot.createdAt) >= sevenDaysAgo);
    }
    
    // Grid positioning
    const isMobile = window.innerWidth < 640;
    const gridColumns = isMobile ? 3 : 5;
    const gridRows = Math.ceil(dotsArray.length / gridColumns);
    
    const transformedDots: ThoughtDot[] = dotsArray.map((dot: any, index: number) => {
      const col = index % gridColumns;
      const row = Math.floor(index / gridColumns);
      
      const padding = 5;
      const availableWidth = 100 - (padding * 2);
      const availableHeight = 100 - (padding * 2);
      
      const cellWidth = availableWidth / gridColumns;
      const cellHeight = availableHeight / gridRows;
      
      const x = padding + (col * cellWidth) + (cellWidth / 2);
      const y = padding + (row * cellHeight) + (cellHeight / 2);
      
      const sizes = isMobile ? [60, 70, 80] : [80, 100, 120];
      const size = sizes[index % sizes.length];
      const rotation = (index * 13) % 360;
      
      return {
        ...dot,
        x,
        y,
        size,
        rotation,
      };
    });
    
    setDots(transformedDots);
  }, [publicDots, showRecentOnly]);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated (instead of blank redirect)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30">
        <Brain className="h-16 w-16 text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
        <p className="text-gray-600 mb-6">Please sign in to view the social feed</p>
        <Button
          onClick={() => setLocation("/auth")}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          Sign In
        </Button>
      </div>
    );
  }

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
                title="Social Feed"
                className="h-10 w-10 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300"
              >
                <Users className="w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/myneura">
              <Button 
                variant="ghost" 
                size="icon"
                title="My Neura"
                className="h-10 w-10 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all duration-300"
              >
                <Brain className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* User Avatar at Bottom */}
          {user && (
            <div className="mt-auto mb-4 flex justify-center">
              <Link href="/profile">
                <Avatar className="h-8 w-8 hover:ring-2 hover:ring-amber-400 transition-all duration-300">
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
        {/* Slim Header - Static */}
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
            {/* Social Feed Icon - Active */}
            <Link href="/home">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-300 shadow-sm"
                title="Social Feed"
              >
                <Users className="h-5 w-5 text-white" />
              </Button>
            </Link>

            {/* My Neura Icon */}
            <Link href="/myneura">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 rounded-lg transition-all duration-300 shadow-sm"
                title="My Neura"
              >
                <Brain className="h-5 w-5 text-white" />
              </Button>
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-600" />
            Social Thoughts
          </h1>
          
          <div className="flex items-center gap-2">
            {/* Recent Filter */}
            <Button
              variant={showRecentOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowRecentOnly(!showRecentOnly)}
              className={showRecentOnly ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </Button>
            
            {/* View Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'cloud' ? 'feed' : 'cloud')}
            >
              {viewMode === 'cloud' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {dotsLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        )}

        {/* Thought Cloud View */}
        {!dotsLoading && viewMode === 'cloud' && (
          <div className="relative w-full min-h-[600px] bg-gradient-to-br from-amber-50/30 to-orange-50/20 rounded-2xl border border-amber-100 overflow-hidden">
            {dots.map((dot) => (
              <div
                key={dot.id}
                className="absolute cursor-pointer transition-transform hover:scale-110"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  transform: `translate(-50%, -50%) rotate(${dot.rotation}deg)`,
                }}
                onClick={() => setSelectedDot(dot)}
              >
                <div className="relative w-full h-full">
                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse opacity-20"></div>
                  
                  {/* Main dot */}
                  <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg flex items-center justify-center">
                    <div className="text-white text-center p-2">
                      <p className="text-xs font-semibold line-clamp-2">
                        {dot.heading}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feed List View */}
        {!dotsLoading && viewMode === 'feed' && (
          <div className="space-y-4">
            {dots.map((dot) => (
              <div
                key={dot.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 transition-colors cursor-pointer"
                onClick={() => setSelectedDot(dot)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={dot.user?.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        {dot.user?.fullName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{dot.user?.fullName || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(dot.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {dot.emotion && (
                    <Badge variant="secondary" className="text-xs">
                      {dot.emotion}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{dot.heading}</h3>
                <p className="text-gray-600 text-sm">{dot.summary}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!dotsLoading && dots.length === 0 && (
          <div className="text-center py-20">
            <Brain className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No thoughts yet. Be the first to share!</p>
          </div>
        )}

        {/* Thought Detail Dialog */}
        {selectedDot && (
          <Dialog open={!!selectedDot} onOpenChange={() => setSelectedDot(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedDot.heading}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedDot.user?.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      {selectedDot.user?.fullName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{selectedDot.user?.fullName || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedDot.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700">{selectedDot.summary}</p>
                
                {selectedDot.imageUrl && (
                  <img 
                    src={selectedDot.imageUrl} 
                    alt={selectedDot.heading}
                    className="w-full rounded-lg"
                  />
                )}
                
                {selectedDot.emotion && (
                  <Badge variant="secondary">{selectedDot.emotion}</Badge>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => saveToMyNeuraMutation.mutate(selectedDot.id)}
                    disabled={saveToMyNeuraMutation.isPending}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Save to MyNeura
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
                      className="w-full justify-start text-sm h-10 bg-red-50 text-red-600"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <Users className="w-4 h-4 mr-3" />
                      Social Feed
                    </Button>
                  </Link>
                  
                  <Link href="/myneura">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm h-10"
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
