import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Users, Sparkles, MessageSquare, Plus,
  Menu, User, LogOut, Settings, TrendingUp, Heart,
  Share2, Eye, MoreHorizontal
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
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ThoughtDot {
  id: number;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  userId: number;
  user?: {
    id: number;
    fullName: string | null;
    avatar: string | null;
    email: string;
  };
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
  
  // Cache for dot positions to prevent teleporting on refetch
  const positionCacheRef = useState(() => new Map<number, { x: number; y: number; size: number; rotation: number }>())[0];

  // Fetch public dots from all users for the thought cloud
  const { data: publicDots, isLoading } = useQuery({
    queryKey: ['/api/social/dots'],
    enabled: !!user,
  });

  // Transform and position dots in an organic cloud formation
  useEffect(() => {
    if (!publicDots || !(publicDots as any).dots) return;

    const transformedDots: ThoughtDot[] = (publicDots as any).dots.map((dot: any, index: number) => {
      // Check if we have cached position for this dot
      const cached = positionCacheRef.get(dot.id);
      
      if (cached) {
        // Use cached position to prevent teleporting
        return {
          ...dot,
          ...cached,
        };
      }
      
      // Generate new organic positioning using golden angle spiral
      const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
      const radius = 12 * Math.sqrt(index + 1); // Spiral outward
      const angle = index * goldenAngle;
      
      // Convert polar to cartesian with some randomness
      const x = Math.max(5, Math.min(95, 50 + radius * Math.cos(angle) + (Math.random() - 0.5) * 15));
      const y = Math.max(5, Math.min(95, 50 + radius * Math.sin(angle) + (Math.random() - 0.5) * 15));
      
      // Vary dot sizes based on recency and engagement
      const baseSize = 140;
      const sizeVariation = Math.random() * 60 + 20;
      const size = baseSize + sizeVariation;
      
      // Random rotation for visual variety
      const rotation = Math.random() * 20 - 10;
      
      // Cache this position for future renders
      const position = { x, y, size, rotation };
      positionCacheRef.set(dot.id, position);

      return {
        ...dot,
        ...position,
      };
    });

    setDots(transformedDots);
  }, [publicDots, positionCacheRef]);

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
                    Thought Cloud
                  </span>
                </Link>
                <Link href="/dashboard">
                  <span className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">
                    My Neura
                  </span>
                </Link>
                <Link href="/social">
                  <span className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">
                    Network
                  </span>
                </Link>
                <Link href="/chat">
                  <span className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors cursor-pointer">
                    AI Chat
                  </span>
                </Link>
              </nav>
            </div>

            {/* Right side - Actions and User menu */}
            <div className="flex items-center gap-3">
              {user && (
                <Button
                  onClick={() => setLocation("/dashboard?create=dot")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Dot</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              )}

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
                      <Link href="/dashboard" className="cursor-pointer w-full">
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
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              The Thought Cloud
            </h1>
            <p className="text-gray-600 text-lg">
              Explore insights floating across the collective intelligence network
            </p>
          </div>

          {/* Thought Cloud Canvas */}
          <div className="relative w-full bg-gradient-to-br from-white/60 to-amber-50/40 rounded-3xl shadow-2xl border border-amber-100 overflow-hidden backdrop-blur-sm">
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
                      Be the first to share your thoughts and insights with the community
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

                      {/* One-word summary - at the very top */}
                      <div className="text-center mb-2">
                        <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                          {dot.oneWordSummary}
                        </span>
                      </div>

                      {/* Summary heading - center */}
                      <h3 className="text-xs font-bold text-gray-900 text-center line-clamp-3 leading-tight mb-2">
                        {dot.summary}
                      </h3>

                      {/* Pulse indicator - at bottom */}
                      <div className="flex items-center gap-1 text-[10px] text-amber-600 mt-auto">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium truncate max-w-[80px]">{dot.pulse}</span>
                      </div>

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
          </div>

          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{dots.length}</p>
                  <p className="text-xs text-gray-500">Floating Thoughts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(dots.map(d => d.userId)).size}
                  </p>
                  <p className="text-xs text-gray-500">Active Thinkers</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">Live</p>
                  <p className="text-xs text-gray-500">Real-time Updates</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">∞</p>
                  <p className="text-xs text-gray-500">Insights Shared</p>
                </div>
              </div>
            </div>
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
                  <div>
                    <p className="font-semibold text-gray-900">{selectedDot.user?.fullName || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{selectedDot.user?.email}</p>
                  </div>
                </div>
                
                <Badge className="w-fit bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  {selectedDot.oneWordSummary}
                </Badge>
                
                <DialogTitle className="text-2xl font-bold text-gray-900 mt-4">
                  {selectedDot.summary}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Anchor Layer */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Anchor Layer
                  </h4>
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="pt-4">
                      <p className="text-gray-800 leading-relaxed">{selectedDot.anchor}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Pulse Layer */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Pulse Layer
                  </h4>
                  <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <p className="text-purple-900 font-medium">{selectedDot.pulse}</p>
                  </div>
                </div>

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
