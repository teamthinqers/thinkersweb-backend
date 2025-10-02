import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Users, Plus, User, LogOut, Settings, Heart, Eye,
  Grid3x3, List, Clock, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setLocation("/home")}
            >
              <img 
                src="/dotspark-logo-combined.png?v=1" 
                alt="DotSpark" 
                className="h-10 w-auto object-contain" 
              />
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/home")}
                className="text-sm font-medium text-amber-600"
              >
                <Users className="h-4 w-4 mr-2" />
                Social
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/myneura")}
                className="text-sm font-medium"
              >
                <Brain className="h-4 w-4 mr-2" />
                MyNeura
              </Button>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                        {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
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
      </main>

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
    </div>
  );
}
