import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Brain, Users, Heart,
  Cloud, List as ListIcon, Loader2, Maximize, Minimize, RefreshCw,
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

  // Load thoughts
  useEffect(() => {
    if (!publicDots || !(publicDots as any).thoughts) return;
    setDots((publicDots as any).thoughts);
  }, [publicDots]);

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
      {/* Floating animations for dots */}
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-12px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
      `}</style>
      <div className={`flex-1 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          {/* Thought Cloud Canvas */}
          <div className={`relative w-full bg-gradient-to-br from-amber-50/70 to-orange-50/50 shadow-2xl border border-amber-200 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
            {/* Toolbar - Social Navigation - hide in fullscreen */}
            {!isFullscreen && (
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
                {/* Left: Social Neura heading with Brain icon */}
                <div className="flex items-center gap-3">
                  <Brain className="h-7 w-7 text-red-500" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Social Neura
                  </h1>
                </div>

                {/* Right: Cloud/Feed Toggle */}
                <div className="relative inline-flex items-center bg-white rounded-full p-1 border-2 border-gray-200 shadow-sm">
                  <button
                    onClick={() => setViewMode('cloud')}
                    className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      viewMode === 'cloud'
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Cloud className="h-4 w-4" />
                    Cloud
                  </button>
                  <button
                    onClick={() => setViewMode('feed')}
                    className={`relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      viewMode === 'feed'
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ListIcon className="h-4 w-4" />
                    Feed
                  </button>
                  {/* Animated background slider */}
                  <div
                    className={`absolute top-1 bottom-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300 ease-in-out ${
                      viewMode === 'cloud' ? 'left-1 w-[calc(50%-4px)]' : 'left-[calc(50%+2px)] w-[calc(50%-4px)]'
                    }`}
                  />
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

        {/* Feed List View - LinkedIn-style posts */}
        {!dotsLoading && viewMode === 'feed' && (
          <div className={`${isFullscreen ? 'h-full overflow-y-auto p-6' : ''}`}>
            <div className="max-w-2xl mx-auto space-y-4">
              {dots.map((dot) => {
                const channelConfig = getChannelConfig(dot.channel || 'write');
                const ChannelIcon = channelConfig.icon;
                
                return (
                  <Card 
                    key={dot.id}
                    className="bg-white hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                    onClick={() => setSelectedDot(dot)}
                  >
                    <CardContent className="p-5">
                      {/* Author Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-amber-100">
                            <AvatarImage src={dot.user?.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold">
                              {dot.user?.fullName?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-base text-gray-900">{dot.user?.fullName || 'Anonymous'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(dot.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Channel Badge */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className={`h-8 w-8 rounded-full ${channelConfig.badgeBg} flex items-center justify-center shadow-sm`}>
                                <ChannelIcon className="h-4 w-4 text-white" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">From {channelConfig.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      {/* Post Content */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-xl text-gray-900 leading-snug">
                          {dot.heading}
                        </h3>
                        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                          {dot.summary}
                        </p>
                      </div>
                      
                      {/* Image if present */}
                      {dot.imageUrl && (
                        <div className="mt-4 rounded-lg overflow-hidden">
                          <img 
                            src={dot.imageUrl} 
                            alt={dot.heading}
                            className="w-full max-h-96 object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      
                      {/* Engagement Footer */}
                      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          <span className="text-sm">Like</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          <span className="text-sm">Inspire</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Save to MyNeura functionality will be handled by existing mutation
                          }}
                        >
                          <Bookmark className="h-4 w-4 mr-2" />
                          <span className="text-sm">Save</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
      </div>
    </SharedAuthLayout>
  );
}
