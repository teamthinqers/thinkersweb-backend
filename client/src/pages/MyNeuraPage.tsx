import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Users, Sparkles, MessageSquare, Plus,
  Menu, User, LogOut, Settings, TrendingUp, Heart,
  Share2, Eye, MoreHorizontal, Maximize, Minimize, Clock,
  Grid3x3, List, Bookmark, Fingerprint, Hash, Lightbulb, MessageCircle, Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-new";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";

// Type for a thought with user info
type ThoughtDot = {
  id: number;
  heading: string;
  summary: string;
  emotion?: string;
  imageUrl?: string;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
    avatar?: string;
    email?: string;
  };
  isSaved?: boolean;
  savedAt?: string;
  x?: number;
  y?: number;
  size?: number;
  rotation?: number;
};

export default function MyNeuraPage() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedThought, setSelectedThought] = useState<ThoughtDot | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtDot[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'cloud' | 'feed'>('cloud');
  
  // Cache for thought positions to prevent teleporting on refetch
  const positionCacheRef = useState(() => new Map<number, { x: number; y: number; size: number; rotation: number }>())[0];

  // Fetch user's personal thoughts from MyNeura
  const { data: myNeuraThoughts, isLoading } = useQuery({
    queryKey: ['/api/thoughts/myneura'],
    enabled: !!user,
  });

  useEffect(() => {
    if (myNeuraThoughts && (myNeuraThoughts as any).thoughts) {
      const rawThoughts = (myNeuraThoughts as any).thoughts;
      
      // Filter by recent if enabled (last 7 days)
      const filtered = showRecentOnly 
        ? rawThoughts.filter((t: ThoughtDot) => {
            const thoughtDate = new Date(t.createdAt);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return thoughtDate >= sevenDaysAgo;
          })
        : rawThoughts;

      // Calculate grid positions for visual cloud
      const positioned = filtered.map((thought: ThoughtDot, index: number) => {
        // Check cache first
        const cached = positionCacheRef.get(thought.id);
        if (cached) {
          return { ...thought, ...cached };
        }

        // Calculate new position
        const isMobile = window.innerWidth < 768;
        const cols = isMobile ? 3 : 5;
        const rows = isMobile ? 7 : 4;
        const totalCells = cols * rows;
        
        // Limit to grid capacity
        if (index >= totalCells) return null;
        
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const cellWidth = 100 / cols;
        const cellHeight = 100 / rows;
        
        const x = (col * cellWidth) + (cellWidth / 2);
        const y = (row * cellHeight) + (cellHeight / 2);
        
        const sizes = isMobile ? [60, 70, 80] : [80, 100, 120];
        const size = sizes[index % sizes.length];
        const rotation = (index * 13) % 360;
        
        const position = { x, y, size, rotation };
        positionCacheRef.set(thought.id, position);
        
        return { ...thought, ...position };
      }).filter(Boolean) as ThoughtDot[];

      setThoughts(positioned);
    }
  }, [myNeuraThoughts, showRecentOnly, positionCacheRef]);

  return (
    <SharedAuthLayout>
      <div className={`flex-1 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-amber-100 via-orange-100 to-red-100' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          {/* Thought Cloud Canvas */}
          <div className={`relative w-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-2xl border-2 border-amber-300 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
            {/* Toolbar - Neura Navigation */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 backdrop-blur-md border-b-2 border-amber-300 px-6 py-3 flex items-center gap-4">
              {/* 1. Cognitive Identity */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-white/70 hover:shadow-md rounded-lg transition-all duration-300"
                title="Cognitive Identity"
              >
                <Fingerprint className="h-4 w-4 text-amber-700" />
                <span className="text-sm font-semibold text-amber-900">Cognitive Identity</span>
              </Button>

              {/* 2. Learning Engine */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-white/70 hover:shadow-md rounded-lg transition-all duration-300"
                title="Learning Engine"
              >
                <Lightbulb className="h-4 w-4 text-amber-700" />
                <span className="text-sm font-semibold text-amber-900">Learning Engine</span>
              </Button>

              {/* 3. Sparks */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-white/70 hover:shadow-md rounded-lg transition-all duration-300"
                title="Sparks"
              >
                <Zap className="h-4 w-4 text-amber-700" />
                <span className="text-sm font-semibold text-amber-900">Sparks</span>
              </Button>

              {/* 4. Social Reflections */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-white/70 hover:shadow-md rounded-lg transition-all duration-300"
                title="Social Reflections"
              >
                <MessageCircle className="h-4 w-4 text-amber-700" />
                <span className="text-sm font-semibold text-amber-900">Social Reflections</span>
              </Button>

              {/* 5. Thoughts */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 hover:bg-white/70 hover:shadow-md rounded-lg transition-all duration-300"
                title="Thoughts"
              >
                <Hash className="h-4 w-4 text-amber-700" />
                <span className="text-sm font-semibold text-amber-900">Thoughts ({thoughts.length})</span>
              </Button>
            </div>
            
            {/* Cloud View */}
            {viewMode === 'cloud' && (
              <>
                {/* Cloud background pattern */}
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="myneura-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="25" cy="25" r="3" fill="#F59E0B" opacity="0.6"/>
                        <circle cx="75" cy="75" r="3" fill="#EA580C" opacity="0.6"/>
                        <circle cx="50" cy="50" r="2" fill="#F97316" opacity="0.7"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#myneura-pattern)"/>
                  </svg>
                </div>

                {/* Floating Thoughts Container */}
                <div className="relative min-h-[600px] h-[calc(100vh-300px)] max-h-[900px] p-8">
                  {/* Fullscreen toggle button - top right of grid */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-amber-100 shadow-md"
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
                  
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Sparkles className="h-12 w-12 text-amber-500 animate-pulse mx-auto" />
                    <p className="text-gray-500">Loading your thought cloud...</p>
                  </div>
                </div>
              ) : thoughts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4 max-w-md">
                    <Brain className="h-16 w-16 text-amber-500 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-700">Your cloud awaits</h3>
                    <p className="text-gray-500">
                      Start capturing your thoughts or save inspiring ideas from others
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => setLocation("/?create=personal")}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Thought
                      </Button>
                      <Button
                        onClick={() => setLocation("/")}
                        variant="outline"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Browse Community
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                thoughts.map((thought) => (
                  <div
                    key={thought.id}
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-110 hover:z-50 group"
                    style={{
                      left: `${thought.x}%`,
                      top: `${thought.y}%`,
                      transform: `translate(-50%, -50%)`,
                      width: `${thought.size}px`,
                      height: `${thought.size}px`,
                      animation: `float-${thought.id % 3} ${6 + (thought.id % 4)}s ease-in-out infinite`,
                    }}
                    onClick={() => setSelectedThought(thought)}
                  >
                    {/* Outer pulsing ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" 
                         style={{ transform: 'scale(1.15)' }} />
                    
                    {/* Middle glow layer */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
                    
                    {/* Main circular thought */}
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-3 border-amber-400 group-hover:border-orange-500 shadow-xl group-hover:shadow-2xl transition-all flex flex-col items-center justify-center p-4 backdrop-blur-sm">
                      
                      {/* User avatar or saved indicator */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        {thought.isSaved ? (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center border-2 border-white shadow-md">
                            <Bookmark className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <Avatar className="h-8 w-8 border-2 border-white shadow-md">
                            {thought.user?.avatar ? (
                              <AvatarImage src={thought.user.avatar} alt={thought.user.fullName || 'User'} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                                {thought.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        )}
                      </div>

                      {/* Emotion badge */}
                      {thought.emotion && (
                        <div className="text-center mb-2">
                          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md">
                            {thought.emotion}
                          </span>
                        </div>
                      )}

                      {/* Image - if present */}
                      {thought.imageUrl && (
                        <div className="mb-2">
                          <img 
                            src={thought.imageUrl} 
                            alt={thought.heading}
                            className="w-full h-20 object-cover rounded-md"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {/* Heading - center */}
                      <h3 className="text-xs font-extrabold text-amber-900 text-center line-clamp-3 leading-tight mb-2">
                        {thought.heading}
                      </h3>

                      {/* Summary preview - bottom */}
                      <p className="text-[10px] font-medium text-gray-700 text-center line-clamp-2 mt-auto">
                        {thought.summary}
                      </p>
                    </div>

                    {/* Sparkle particle effect */}
                    <div className="absolute top-0 right-2 w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping opacity-90" />
                    <div className="absolute bottom-2 left-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse opacity-80" />
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
                ) : thoughts.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4 max-w-md">
                      <Brain className="h-16 w-16 text-amber-500 mx-auto" />
                      <h3 className="text-xl font-semibold text-gray-700">Your collection awaits</h3>
                      <p className="text-gray-500">
                        Create your first thought or save inspiring ideas from the community
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
                    {thoughts.map((thought) => (
                      <Card 
                        key={thought.id} 
                        className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-amber-500"
                        onClick={() => setSelectedThought(thought)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3 mb-3">
                            {thought.isSaved ? (
                              <>
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                  <Bookmark className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">Saved from {thought.user?.fullName || 'Community'}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(thought.savedAt || thought.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Avatar className="h-10 w-10 border-2 border-amber-200">
                                  {thought.user?.avatar ? (
                                    <AvatarImage src={thought.user.avatar} alt={thought.user.fullName || 'User'} />
                                  ) : (
                                    <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm">
                                      {thought.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">My Thought</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(thought.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </>
                            )}
                            {thought.emotion && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                {thought.emotion}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-900">
                            {thought.heading}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {thought.imageUrl && (
                            <img 
                              src={thought.imageUrl} 
                              alt={thought.heading}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          <p className="text-gray-700 line-clamp-3">
                            {thought.summary}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Thought Modal */}
      <Dialog open={!!selectedThought} onOpenChange={(open) => !open && setSelectedThought(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedThought && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-4">
                  {selectedThought.isSaved ? (
                    <>
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center border-2 border-purple-200">
                        <Bookmark className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Saved from {selectedThought.user?.fullName || 'Community'}</p>
                        <p className="text-sm text-gray-500">{selectedThought.user?.email}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-12 w-12 border-2 border-amber-200">
                        {selectedThought.user?.avatar ? (
                          <AvatarImage src={selectedThought.user.avatar} alt={selectedThought.user.fullName || 'User'} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            {selectedThought.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">My Thought</p>
                        <p className="text-sm text-gray-500">Created {new Date(selectedThought.createdAt).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                </div>
                
                {selectedThought.emotion && (
                  <Badge className="w-fit bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    {selectedThought.emotion}
                  </Badge>
                )}
                
                <DialogTitle className="text-2xl font-bold text-gray-900 mt-4">
                  {selectedThought.heading}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Image - if present */}
                {selectedThought.imageUrl && (
                  <div className="space-y-2">
                    <img 
                      src={selectedThought.imageUrl} 
                      alt={selectedThought.heading}
                      className="w-full max-h-96 object-cover rounded-lg shadow-lg"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <CardContent className="pt-6">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedThought.summary}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-15px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
      `}</style>
    </SharedAuthLayout>
  );
}
