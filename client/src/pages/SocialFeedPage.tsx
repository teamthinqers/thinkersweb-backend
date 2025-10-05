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
import { GRID_CONSTANTS, dotsCollide, getDotSize, getIdentityCardTop, getChannelConfig } from "@/lib/gridConstants";
import ThoughtCloudGrid from "@/components/ThoughtCloudGrid";

// Import ThoughtDot type from shared component
import { ThoughtDot } from "@/components/ThoughtCloudGrid";

// Channel-specific visual configurations now in gridConstants

export default function SocialFeedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDot, setSelectedDot] = useState<ThoughtDot | null>(null);
  const [dots, setDots] = useState<ThoughtDot[]>([]);
  const [viewMode, setViewMode] = useState<'cloud' | 'feed'>('cloud');
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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

  // Load and filter thoughts
  useEffect(() => {
    if (!publicDots || !(publicDots as any).thoughts) return;

    let dotsArray = (publicDots as any).thoughts;
    
    // Filter recent if enabled
    if (showRecentOnly) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dotsArray = dotsArray.filter((dot: any) => new Date(dot.createdAt) >= sevenDaysAgo);
    }

    setDots(dotsArray);
  }, [publicDots, showRecentOnly]);

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
        {/* Toolbar - hide in fullscreen */}
        {!isFullscreen && (
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
        )}

        {/* Loading State */}
        {dotsLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        )}

        {/* Thought Cloud View */}
        {!dotsLoading && viewMode === 'cloud' && (
          <>
            {dots.length === 0 ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center space-y-4">
                  <Brain className="h-16 w-16 text-amber-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-gray-700">No social thoughts yet</h3>
                  <p className="text-gray-500">
                    Be the first to share your insights with the community
                  </p>
                </div>
              </div>
            ) : (
              <ThoughtCloudGrid
                thoughts={dots}
                isFullscreen={isFullscreen}
                onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                onDotClick={(dot) => setSelectedDot(dot)}
                patternId="social-pattern"
              />
            )}
          </>
        )}

        {/* Feed List View */}
        {!dotsLoading && viewMode === 'feed' && (
          <div className={`space-y-4 ${isFullscreen ? 'h-full overflow-y-auto p-6' : ''}`}>
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
