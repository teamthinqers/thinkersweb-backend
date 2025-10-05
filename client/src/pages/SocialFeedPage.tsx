import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Users, Heart,
  Grid3x3, List, Clock, Loader2, Maximize, Minimize, RefreshCw,
  PenTool, Bookmark, Sparkles
} from "lucide-react";
import { SiWhatsapp, SiLinkedin, SiOpenai } from 'react-icons/si';
import { useAuth } from "@/hooks/use-auth-new";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";
import { GRID_CONSTANTS, dotsCollide, getDotSize, getIdentityCardTop } from "@/lib/gridConstants";

interface ThoughtDot {
  id: number;
  heading: string;
  summary: string;
  emotion?: string;
  imageUrl?: string;
  channel?: string;
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

// Channel-specific visual configurations
const getChannelConfig = (channel?: string) => {
  switch (channel) {
    case 'write':
      return {
        icon: PenTool,
        color: 'from-amber-400 via-orange-400 to-red-400',
        borderColor: 'border-amber-300',
        hoverBorderColor: 'border-orange-400',
        bgGradient: 'from-white via-amber-50 to-orange-50',
        badgeBg: 'bg-amber-500',
        name: 'Write'
      };
    case 'linkedin':
      return {
        icon: SiLinkedin,
        color: 'from-blue-400 via-blue-500 to-blue-600',
        borderColor: 'border-blue-300',
        hoverBorderColor: 'border-blue-500',
        bgGradient: 'from-white via-blue-50 to-blue-100',
        badgeBg: 'bg-blue-600',
        name: 'LinkedIn'
      };
    case 'whatsapp':
      return {
        icon: SiWhatsapp,
        color: 'from-green-400 via-green-500 to-green-600',
        borderColor: 'border-green-300',
        hoverBorderColor: 'border-green-500',
        bgGradient: 'from-white via-green-50 to-green-100',
        badgeBg: 'bg-green-600',
        name: 'WhatsApp'
      };
    case 'chatgpt':
      return {
        icon: SiOpenai,
        color: 'from-purple-400 via-purple-500 to-purple-600',
        borderColor: 'border-purple-300',
        hoverBorderColor: 'border-purple-500',
        bgGradient: 'from-white via-purple-50 to-purple-100',
        badgeBg: 'bg-purple-600',
        name: 'ChatGPT'
      };
    case 'aihelp':
      return {
        icon: Sparkles,
        color: 'from-violet-400 via-fuchsia-400 to-pink-400',
        borderColor: 'border-violet-300',
        hoverBorderColor: 'border-fuchsia-400',
        bgGradient: 'from-white via-violet-50 to-fuchsia-50',
        badgeBg: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
        name: 'AI Help'
      };
    default:
      return {
        icon: PenTool,
        color: 'from-amber-400 via-orange-400 to-red-400',
        borderColor: 'border-amber-300',
        hoverBorderColor: 'border-orange-400',
        bgGradient: 'from-white via-amber-50 to-orange-50',
        badgeBg: 'bg-amber-500',
        name: 'Default'
      };
  }
};

export default function SocialFeedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDot, setSelectedDot] = useState<ThoughtDot | null>(null);
  const [dots, setDots] = useState<ThoughtDot[]>([]);
  const [viewMode, setViewMode] = useState<'cloud' | 'feed'>('cloud');
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [page, setPage] = useState(0);
  const [allDotsLoaded, setAllDotsLoaded] = useState<ThoughtDot[]>([]);
  
  // Cache for thought positions to prevent teleporting on refetch
  const positionCacheRef = useState(() => new Map<number, { x: number; y: number; size: number; rotation: number }>())[0];

  // Drag state for panning the grid
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  
  const DOTS_PER_PAGE = 10;
  
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

  // Load all thoughts and store them
  useEffect(() => {
    if (!publicDots || !(publicDots as any).thoughts) return;

    let dotsArray = (publicDots as any).thoughts;
    
    // Filter recent if enabled
    if (showRecentOnly) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dotsArray = dotsArray.filter((dot: any) => new Date(dot.createdAt) >= sevenDaysAgo);
    }

    setAllDotsLoaded(dotsArray);
  }, [publicDots, showRecentOnly]);

  // Display paginated dots with positions
  useEffect(() => {
    if (allDotsLoaded.length === 0) {
      setDots([]);
      return;
    }

    // Get current page of dots (10 most recent + any loaded pages)
    const startIndex = 0;
    const endIndex = (page + 1) * DOTS_PER_PAGE;
    const dotsToDisplay = allDotsLoaded.slice(startIndex, endIndex);
    
    // Calculate cloud/universe positions with collision detection
    const positionedDots: Array<{ x: number; y: number; size: number; rotation: number }> = [];
    
    const transformedDots: ThoughtDot[] = dotsToDisplay.map((dot: any, index: number) => {
      // Check cache first
      const cached = positionCacheRef.get(dot.id);
      if (cached) {
        positionedDots.push(cached);
        return { ...dot, ...cached };
      }

      // Calculate new position with cloud-like distribution
      const isMobile = window.innerWidth < 768;
      
      // Use standardized margins
      const marginX = GRID_CONSTANTS.MARGIN_X;
      const marginY = GRID_CONSTANTS.MARGIN_Y;
      const safeZoneX = 100 - (marginX * 2);
      const safeZoneY = 100 - (marginY * 2);
      
      // Generate pseudo-random but consistent position based on thought ID
      const seed = dot.id * 9876543;
      let pseudoRandom1 = (Math.sin(seed) * 10000) % 1;
      let pseudoRandom2 = (Math.cos(seed * 1.5) * 10000) % 1;
      
      // Create clusters/layers for depth
      const dotsPerLayer = isMobile 
        ? GRID_CONSTANTS.LAYOUT.DOTS_PER_LAYER_MOBILE 
        : GRID_CONSTANTS.LAYOUT.DOTS_PER_LAYER_DESKTOP;
      const layer = Math.floor(index / dotsPerLayer);
      const layerOffset = layer * (isMobile 
        ? GRID_CONSTANTS.LAYOUT.LAYER_OFFSET_MOBILE 
        : GRID_CONSTANTS.LAYOUT.LAYER_OFFSET_DESKTOP);
      
      // Use standardized size calculation
      const size = getDotSize(dot.id, isMobile);
      
      // Try to find a non-overlapping position
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = GRID_CONSTANTS.COLLISION.MAX_ATTEMPTS;
      
      do {
        // Position within safe zone with organic distribution
        x = marginX + (Math.abs(pseudoRandom1) * safeZoneX);
        y = marginY + (Math.abs(pseudoRandom2) * (safeZoneY * 0.7)) + layerOffset;
        
        // Check for collisions with existing dots
        const hasCollision = positionedDots.some(existing => 
          dotsCollide(x, y, size, existing.x, existing.y, existing.size)
        );
        
        if (!hasCollision || attempts >= maxAttempts) {
          break;
        }
        
        // Generate new random position for next attempt
        attempts++;
        pseudoRandom1 = (Math.sin(seed * (attempts + 1)) * 10000) % 1;
        pseudoRandom2 = (Math.cos(seed * (attempts + 1) * 1.5) * 10000) % 1;
      } while (attempts < maxAttempts);
      
      const rotation = (dot.id * 13) % 360;
      
      const position = { x, y, size, rotation };
      positionCacheRef.set(dot.id, position);
      positionedDots.push(position);
      
      return {
        ...dot,
        ...position,
      };
    });
    
    setDots(transformedDots);
  }, [allDotsLoaded, page, positionCacheRef]);

  // Drag handlers for panning the grid
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'cloud') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewMode !== 'cloud') return;
    
    const deltaY = e.clientY - dragStart.y;
    setPanOffset(prev => ({ x: 0, y: prev.y + deltaY }));
    setDragStart({ x: e.clientX, y: e.clientY });
    
    // Load more dots if dragged up significantly and more exist
    if (deltaY > 100 && (page + 1) * DOTS_PER_PAGE < allDotsLoaded.length) {
      setPage(prev => prev + 1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
    <SharedAuthLayout>
      <div className={`flex-1 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
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
          <div className={`relative w-full bg-gradient-to-br from-amber-50/70 to-orange-50/50 shadow-2xl border border-amber-200 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
            
            {/* Cloud background pattern */}
            <div className="absolute inset-0 opacity-25">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="social-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="25" cy="25" r="2" fill="#F59E0B" opacity="0.4"/>
                    <circle cx="75" cy="75" r="2" fill="#EA580C" opacity="0.4"/>
                    <circle cx="50" cy="50" r="1.5" fill="#F97316" opacity="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#social-pattern)"/>
              </svg>
            </div>

            {/* Floating Thoughts Container */}
            <div 
              className={`relative min-h-[600px] h-[calc(100vh-200px)] max-h-[1200px] p-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                transform: `translateY(${panOffset.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {/* Refresh button - top right of grid */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  positionCacheRef.clear();
                  window.location.reload();
                }}
                className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-amber-100 shadow-md"
                title="Refresh thought cloud"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              {/* Fullscreen toggle button - bottom right of grid */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute bottom-4 right-4 z-20 bg-white/80 hover:bg-amber-100 shadow-md"
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="h-4 w-4 mr-2" />
                    Exit
                  </>
                ) : (
                  <>
                    <Maximize className="h-4 w-4 mr-2" />
                    Fullscreen
                  </>
                )}
              </Button>

            {dots.map((dot) => {
              const channelConfig = getChannelConfig(dot.channel);
              const ChannelIcon = channelConfig.icon;
              
              return (
              <div
                key={dot.id}
                className="absolute transition-all duration-300 hover:z-50 group"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  transform: `translate(-50%, -50%)`,
                }}
              >
                {/* Identity Card - Always Visible */}
                <div 
                  className="absolute left-1/2 z-50"
                  style={{ 
                    top: getIdentityCardTop(dot.size || 110),
                    transform: 'translateX(-50%)', // Center horizontally
                  }}
                >
                  <Card className="bg-white/95 backdrop-blur-md shadow-lg border-2 border-amber-200">
                    <CardContent className="p-2 px-3">
                      <div className="flex items-center gap-2 justify-center">
                        <Avatar className="h-7 w-7 border-2 border-amber-300">
                          {dot.user?.avatar ? (
                            <AvatarImage src={dot.user.avatar} alt={dot.user.fullName || 'User'} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                              {dot.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <p className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                          {dot.user?.fullName || 'Anonymous'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Dot Container */}
                <div
                  className="cursor-pointer transition-all duration-300 hover:scale-110"
                  style={{
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    animation: `float-${dot.id % 3} ${6 + (dot.id % 4)}s ease-in-out infinite`,
                  }}
                  onClick={() => setSelectedDot(dot)}
                >
                  {/* Outer pulsing ring with channel color */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${channelConfig.color} opacity-30 group-hover:opacity-50 transition-opacity animate-pulse`}
                       style={{ transform: 'scale(1.2)' }} />
                  
                  {/* Middle glow layer with channel color */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${channelConfig.color} blur-lg opacity-60 group-hover:opacity-80 transition-opacity`} />
                  
                  {/* Main circular thought with solid channel styling */}
                  <div className={`relative w-full h-full rounded-full bg-white border-4 ${channelConfig.borderColor} group-hover:${channelConfig.hoverBorderColor} shadow-2xl group-hover:shadow-[0_20px_60px_-15px_rgba(251,146,60,0.5)] transition-all flex flex-col items-center justify-center p-4 overflow-hidden`}>
                    {/* Solid background layer with channel gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${channelConfig.bgGradient} opacity-95`} />
                    
                    {/* Content wrapper */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-2">
                      
                      {/* Heading - prominently displayed in center */}
                      <h3 className="text-sm font-bold text-gray-900 text-center line-clamp-4 leading-tight">
                        {dot.heading}
                      </h3>

                    </div>
                  </div>

                  {/* Channel indicator badge */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className={`h-6 w-6 rounded-full ${channelConfig.badgeBg} flex items-center justify-center border-2 border-white shadow-md`}>
                            <ChannelIcon className="h-3 w-3 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">From {channelConfig.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Sparkle particle effect */}
                  <div className="absolute top-0 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />
                  <div className="absolute bottom-2 left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse opacity-60" />
                </div>
              </div>
              );
            })}
            </div>
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
        </div>
      </div>
    </SharedAuthLayout>
  );
}
