import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Users, Sparkles, MessageSquare, Plus,
  Menu, User, LogOut, Settings, TrendingUp, Heart,
  Share2, Eye, MoreHorizontal, Maximize, Minimize, Clock,
  Grid3x3, List, Bookmark
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedDot, setSelectedDot] = useState<ThoughtDot | null>(null);
  const [dots, setDots] = useState<ThoughtDot[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'cloud' | 'feed'>('cloud'); // Cloud grid or Feed list
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Cache for dot positions to prevent teleporting on refetch
  const positionCacheRef = useState(() => new Map<number, { x: number; y: number; size: number; rotation: number }>())[0];

  // Fetch social thoughts from all users for the thought cloud (public, no auth required)
  const { data: publicDots, isLoading } = useQuery({
    queryKey: ['/api/thoughts?limit=50'],
  });

  // Save thought to MyNeura mutation
  const saveToMyNeuraMutation = useMutation({
    mutationFn: async (thoughtId: number) => {
      const response = await fetch(`/api/thoughts/myneura/save/${thoughtId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save thought');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved to MyNeura!",
        description: "This thought is now in your personal cloud",
      });
      // Invalidate MyNeura queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] });
      setSelectedDot(null); // Close the modal
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Transform and position thoughts using collision-free grid system
  useEffect(() => {
    if (!publicDots || !(publicDots as any).thoughts) return;

    let dotsArray = (publicDots as any).thoughts;
    
    // Apply recent filter if enabled (last 7 days)
    if (showRecentOnly) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dotsArray = dotsArray.filter((dot: any) => new Date(dot.createdAt) >= sevenDaysAgo);
    }
    
    // Simple, bulletproof grid configuration
    const minContainerWidth = window.innerWidth < 640 ? 340 : 800; // Mobile vs Desktop
    const minContainerHeight = 600; // From min-h-[600px]
    
    // CRITICAL: Apply padding FIRST to match positioning
    const padding = 5; // Must match positioning padding below
    const effectiveWidth = minContainerWidth * (100 - padding * 2) / 100;
    const effectiveHeight = minContainerHeight * (100 - padding * 2) / 100;
    
    // Simple grid: Choose columns based on viewport, calculate rows for capacity
    const gridColumns = window.innerWidth < 640 ? 3 : 5; // 3 cols mobile, 5 desktop
    const gridRows = Math.ceil(dotsArray.length / gridColumns); // Exactly enough rows
    
    // Calculate cell dimensions in pixels
    const cellWidthPx = effectiveWidth / gridColumns;
    const cellHeightPx = effectiveHeight / gridRows;
    
    // Size dots to fit with visual effects - NO artificial limits
    // Visual effects scale dots by ~1.3x (pulsing ring + glow)
    // Safety factor ensures dots never touch even with effects
    const visualScaleFactor = 1.35; // Conservative 35% for all effects  
    const safetyFactor = 0.85; // Use 85% of available space
    const dotSize = Math.min(cellWidthPx, cellHeightPx) / visualScaleFactor * safetyFactor;
    // No min/max - trust the calculation to prevent overlap
    
    // Track occupied cells to prevent collisions
    const occupiedCells = new Set<number>();
    
    const transformedDots: ThoughtDot[] = dotsArray.map((dot: any, index: number) => {
      // Check if we have cached position for this dot
      const cached = positionCacheRef.get(dot.id);
      
      if (cached) {
        // Use cached position to prevent teleporting
        return {
          ...dot,
          ...cached,
        };
      }
      
      // Collision-free sequential allocation
      let cellIndex = index;
      
      // Safety check for occupied cells
      while (occupiedCells.has(cellIndex) && cellIndex < gridColumns * gridRows) {
        cellIndex++;
      }
      
      occupiedCells.add(cellIndex);
      
      const col = cellIndex % gridColumns;
      const row = Math.floor(cellIndex / gridColumns);
      
      // Calculate cell center position in percentages
      // Use padding to ensure dots don't touch edges
      const padding = 5; // 5% padding on each side
      const availableWidth = 100 - (padding * 2);
      const availableHeight = 100 - (padding * 2);
      
      const cellWidthPct = availableWidth / gridColumns;
      const cellHeightPct = availableHeight / gridRows;
      
      const x = padding + cellWidthPct * col + cellWidthPct / 2;
      const y = padding + cellHeightPct * row + cellHeightPct / 2;
      
      // No rotation for cleaner look
      const rotation = 0;
      
      // Cache this position for future renders
      const position = { x, y, size: dotSize, rotation };
      positionCacheRef.set(dot.id, position);

      return {
        ...dot,
        ...position,
      };
    });

    setDots(transformedDots);
  }, [publicDots, positionCacheRef, showRecentOnly]);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLocation(user ? "/home" : "/")}
              >
                <img 
                  src="/dotspark-logo-combined.png?v=1" 
                  alt="DotSpark" 
                  className="h-10 w-auto object-contain" 
                />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/home">
                  <span className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">
                    Home
                  </span>
                </Link>
              </nav>
            </div>

            {/* Right side - Actions and User menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Avatar className="h-8 w-8 border border-amber-200">
                        {user.photoURL ? (
                          <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2 text-sm">
                      <p className="font-medium">{user.displayName || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/myneura" className="cursor-pointer w-full">
                        <Brain className="mr-2 h-4 w-4" />
                        My Neura
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Thought Cloud */}
      <main className={`flex-1 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          {/* Thought Cloud Canvas */}
          <div className={`relative w-full bg-gradient-to-br from-white/60 to-amber-50/40 shadow-2xl border border-amber-100 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-amber-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-gray-900">{dots.length} Thoughts</span>
                </div>
                <div className="h-6 w-px bg-gray-300" />
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'cloud' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('cloud')}
                    className={`h-8 ${viewMode === 'cloud' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <Grid3x3 className="h-4 w-4 mr-1" />
                    Cloud
                  </Button>
                  <Button
                    variant={viewMode === 'feed' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('feed')}
                    className={`h-8 ${viewMode === 'feed' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <List className="h-4 w-4 mr-1" />
                    Feed
                  </Button>
                </div>
                
                <div className="h-6 w-px bg-gray-300" />
                <Button
                  variant={showRecentOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRecentOnly(!showRecentOnly)}
                  className={showRecentOnly ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Recent
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {viewMode === 'cloud' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="hover:bg-amber-100"
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
                )}
              </div>
            </div>
            
            {/* Cloud View */}
            {viewMode === 'cloud' && (
              <>
                {/* Cloud background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="cloud-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="25" cy="25" r="2" fill="#F59E0B" opacity="0.3"/>
                        <circle cx="75" cy="75" r="2" fill="#EA580C" opacity="0.3"/>
                        <circle cx="50" cy="50" r="1.5" fill="#F97316" opacity="0.4"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cloud-pattern)"/>
                  </svg>
                </div>

                {/* Floating Dots Container */}
                <div className="relative min-h-[600px] h-[calc(100vh-300px)] max-h-[900px] p-8">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Sparkles className="h-12 w-12 text-amber-500 animate-pulse mx-auto" />
                    <p className="text-gray-500">Loading thought cloud...</p>
                  </div>
                </div>
              ) : dots.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4 max-w-md">
                    <Brain className="h-16 w-16 text-amber-500 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-700">The cloud is waiting</h3>
                    <p className="text-gray-500">
                      Use the floating dot button to share your first thought with the community
                    </p>
                  </div>
                </div>
              ) : (
                dots.map((dot) => (
                  <div
                    key={dot.id}
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110 hover:z-50 group"
                    style={{
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      transform: `translate(-50%, -50%)`,
                      width: `${dot.size}px`,
                      height: `${dot.size}px`,
                      animation: `float-${dot.id % 3} ${6 + (dot.id % 4)}s ease-in-out infinite`,
                    }}
                    onClick={() => setSelectedDot(dot)}
                  >
                    {/* Outer pulsing ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" 
                         style={{ transform: 'scale(1.15)' }} />
                    
                    {/* Middle glow layer */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                    
                    {/* Main circular dot */}
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white via-amber-50 to-orange-50 border-3 border-amber-300 group-hover:border-orange-400 shadow-xl group-hover:shadow-2xl transition-all flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                      
                      {/* User avatar - centered at top */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Avatar className="h-8 w-8 border-2 border-white shadow-md">
                          {dot.user?.avatar ? (
                            <AvatarImage src={dot.user.avatar} alt={dot.user.fullName || 'User'} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                              {dot.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>

                      {/* Emotion badge - at the very top */}
                      {dot.emotion && (
                        <div className="text-center mb-2">
                          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                            {dot.emotion}
                          </span>
                        </div>
                      )}

                      {/* Image - if present */}
                      {dot.imageUrl && (
                        <div className="mb-2">
                          <img 
                            src={dot.imageUrl} 
                            alt={dot.heading}
                            className="w-full h-20 object-cover rounded-md"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {/* Heading - center */}
                      <h3 className="text-xs font-bold text-gray-900 text-center line-clamp-3 leading-tight mb-2">
                        {dot.heading}
                      </h3>

                      {/* Summary preview - at bottom */}
                      <p className="text-[10px] text-gray-600 text-center line-clamp-2 mt-auto">
                        {dot.summary.substring(0, 60)}...
                      </p>

                      {/* Quick action indicators - only show on hover */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors">
                          <Heart className="h-3 w-3 text-red-500" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors">
                          <Eye className="h-3 w-3 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Sparkle particle effect */}
                    <div className="absolute top-0 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />
                    <div className="absolute bottom-2 left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse opacity-60" />
                  </div>
                ))
              )}
                </div>
              </>
            )}
            
            {/* Feed View */}
            {viewMode === 'feed' && (
              <div className="relative h-[calc(100vh-200px)] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <Sparkles className="h-12 w-12 text-amber-500 animate-pulse mx-auto" />
                      <p className="text-gray-500">Loading feed...</p>
                    </div>
                  </div>
                ) : dots.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 max-w-md">
                      <Brain className="h-16 w-16 text-amber-500 mx-auto" />
                      <h3 className="text-xl font-semibold text-gray-700">No thoughts yet</h3>
                      <p className="text-gray-500">
                        Be the first to share your insights with the community
                      </p>
                      <Button
                        onClick={() => setLocation("/dashboard?create=dot")}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Dot
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
                    {dots.map((dot) => (
                      <Card 
                        key={dot.id} 
                        className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-amber-500"
                        onClick={() => setSelectedDot(dot)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10 border-2 border-amber-200">
                              {dot.user?.avatar ? (
                                <AvatarImage src={dot.user.avatar} alt={dot.user.fullName || 'User'} />
                              ) : (
                                <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm">
                                  {dot.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{dot.user?.fullName || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(dot.createdAt).toLocaleDateString()} · {new Date(dot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {dot.emotion && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                {dot.emotion}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-900">
                            {dot.heading}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {dot.imageUrl && (
                            <img 
                              src={dot.imageUrl} 
                              alt={dot.heading}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          <p className="text-gray-700 line-clamp-3 mb-4">
                            {dot.summary.length > 150 ? `${dot.summary.substring(0, 150)}...` : dot.summary}
                          </p>
                          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                              <Heart className="h-4 w-4 mr-1" />
                              Like
                            </Button>
                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Comment
                            </Button>
                            <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-600 hover:bg-green-50">
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Expanded Dot Modal */}
      <Dialog open={!!selectedDot} onOpenChange={(open) => !open && setSelectedDot(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedDot && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-amber-200">
                    {selectedDot.user?.avatar ? (
                      <AvatarImage src={selectedDot.user.avatar} alt={selectedDot.user.fullName || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        {selectedDot.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedDot.user?.fullName || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{selectedDot.user?.email}</p>
                  </div>
                  {selectedDot.emotion && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      {selectedDot.emotion}
                    </Badge>
                  )}
                </div>
                
                <DialogTitle className="text-2xl font-bold text-gray-900 mt-2">
                  {selectedDot.heading}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Image - if present */}
                {selectedDot.imageUrl && (
                  <div className="space-y-2">
                    <img 
                      src={selectedDot.imageUrl} 
                      alt={selectedDot.heading}
                      className="w-full max-h-96 object-cover rounded-lg shadow-lg"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Main Summary Content */}
                <div className="space-y-2">
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="pt-6">
                      <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                        {selectedDot.summary}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Save to MyNeura Button - Only show if viewing others' thoughts */}
                {user && selectedDot.user?.email && selectedDot.user.email !== user.email && (
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                    size="lg"
                    onClick={() => saveToMyNeuraMutation.mutate(selectedDot.id)}
                    disabled={saveToMyNeuraMutation.isPending}
                  >
                    <Bookmark className="h-5 w-5 mr-2" />
                    {saveToMyNeuraMutation.isPending ? 'Saving...' : 'Save to MyNeura'}
                  </Button>
                )}

                {/* Engagement Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discuss
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Timestamp */}
                <div className="text-sm text-gray-500 text-center">
                  Created {new Date(selectedDot.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating animation keyframes - injected via style tag */}
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-15px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) translateX(0px); }
          33% { transform: translate(-50%, -50%) translateY(-10px) translateX(5px); }
          66% { transform: translate(-50%, -50%) translateY(-5px) translateX(-5px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) translateY(0px); }
          50% { transform: translate(-50%, -50%) rotate(2deg) translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
