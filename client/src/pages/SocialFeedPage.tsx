import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Brain, Users, Heart,
  Cloud, List as ListIcon, Loader2, Maximize, Minimize, RefreshCw,
  PenTool, Bookmark, Sparkles, Send, Zap, Lightbulb, MoreHorizontal,
  Pencil, Trash2, Search
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface PerspectiveMessage {
  id: number;
  messageBody: string;
  createdAt: string;
  user: {
    id: number;
    fullName: string | null;
    avatar: string | null;
  };
}

export default function SocialFeedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDot, setSelectedDot] = useState<ThoughtDot | null>(null);
  const [dots, setDots] = useState<ThoughtDot[]>([]);
  const [viewMode, setViewMode] = useState<'cloud' | 'feed'>('cloud');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [perspectiveInput, setPerspectiveInput] = useState('');
  const [sparkViewMode, setSparkViewMode] = useState<'text' | 'visual'>('text');
  const [sparkNote, setSparkNote] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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

  // Fetch collective stats (total thoughts, sparks, perspectives from all users)
  const { data: statsData } = useQuery<{ success: boolean; stats: { thoughtsCount: number; savedSparksCount: number; perspectivesCount: number } }>({
    queryKey: ['/api/thoughts/stats'],
    // No auth required - this is public collective data
  });

  // Fetch collective growth from dashboard (platform-wide metric - same as /mydotspark)
  const { data: dashboardData } = useQuery<{ success: boolean; data: { collectiveGrowth: { percentage: number } } }>({
    queryKey: ['/api/dashboard'],
    enabled: !!user, // Only fetch if user is authenticated
  });

  // Fetch user's circles
  const { data: circlesResponse } = useQuery<{
    circles: Array<{
      id: number;
      name: string;
      description?: string;
    }>;
  }>({
    queryKey: ['/api/thinq-circles/my-circles'],
    enabled: !!user,
  });

  const userCircles = circlesResponse?.circles || [];

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

  // Save thought to Circle
  const saveToCircleMutation = useMutation({
    mutationFn: async ({ thoughtId, circleId }: { thoughtId: number; circleId: number }) => {
      const response = await apiRequest('POST', `/api/thinq-circles/${circleId}/share-thought`, {
        thoughtId,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      const circle = userCircles.find(c => c.id === variables.circleId);
      toast({
        title: "Saved!",
        description: `Thought saved to ${circle?.name || 'circle'}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/thinq-circles/${variables.circleId}/thoughts`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch perspectives for selected thought
  const { data: perspectivesData } = useQuery<{ messages: PerspectiveMessage[] }>({
    queryKey: [`/api/thoughts/${selectedDot?.id}/perspectives`],
    enabled: !!selectedDot,
  });

  // Post perspective mutation
  const postPerspectiveMutation = useMutation({
    mutationFn: async (data: { thoughtId: number; messageBody: string }) => {
      const response = await apiRequest('POST', `/api/thoughts/${data.thoughtId}/perspectives`, {
        messageBody: data.messageBody,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${selectedDot?.id}/perspectives`] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/stats'] });
      setPerspectiveInput('');
      // Scroll to bottom after posting
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (perspectivesData?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [perspectivesData?.messages]);

  // Handle send perspective
  const handleSendPerspective = () => {
    if (!selectedDot || !perspectiveInput.trim()) return;
    
    postPerspectiveMutation.mutate({
      thoughtId: selectedDot.id,
      messageBody: perspectiveInput.trim(),
    });
  };

  // Fetch evolved thought summary for Sparks
  const { data: evolvedData, isLoading: evolvedLoading } = useQuery<{
    evolvedSummary: string;
    thoughtContext?: { perspectivesCount: number };
  }>({
    queryKey: [`/api/thoughts/${selectedDot?.id}/evolved-summary`],
    enabled: !!selectedDot,
  });

  // Fetch sparks for selected thought
  const { data: sparksData, isLoading: sparksLoading } = useQuery<{
    success: boolean;
    sparks: any[];
  }>({
    queryKey: [`/api/thoughts/${selectedDot?.id}/sparks`],
    enabled: !!selectedDot,
  });

  // Add spark mutation
  const addSparkMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/thoughts/${selectedDot?.id}/sparks`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${selectedDot?.id}/sparks`] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/user/sparks-count'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/stats'] });
      setSparkNote("");
      toast({
        title: "Spark saved!",
        description: "Your insight has been captured",
      });
    },
  });

  // Delete spark mutation
  const deleteSparkMutation = useMutation({
    mutationFn: async (sparkId: number) => {
      return apiRequest("DELETE", `/api/thoughts/${selectedDot?.id}/sparks/${sparkId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${selectedDot?.id}/sparks`] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/user/sparks-count'] });
    },
  });

  const handleSaveSpark = () => {
    if (!sparkNote.trim()) return;
    addSparkMutation.mutate(sparkNote);
  };

  const userSparks = sparksData?.sparks || [];

  // Get collective growth from dashboard (uses same platform-wide calculation as /mydotspark)
  const collectiveGrowth = useMemo(() => {
    const thoughtsCount = statsData?.stats?.thoughtsCount || 0;
    const sparksCount = statsData?.stats?.savedSparksCount || 0;
    const perspectivesCount = statsData?.stats?.perspectivesCount || 0;
    
    // Use dashboard's collective growth percentage (same metric as /mydotspark)
    const percentage = dashboardData?.data?.collectiveGrowth?.percentage || 0;
    
    return {
      percentage,
      thoughtsCount,
      sparksCount,
      perspectivesCount,
    };
  }, [statsData, dashboardData]);

  // Delete thought mutation
  const deleteThoughtMutation = useMutation({
    mutationFn: async (thoughtId: number) => {
      return apiRequest("DELETE", `/api/thoughts/${thoughtId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/stats'] });
      setSelectedDot(null);
      toast({
        title: "Thought deleted",
        description: "Your thought has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete perspective message mutation
  const deletePerspectiveMutation = useMutation({
    mutationFn: async ({ thoughtId, messageId }: { thoughtId: number; messageId: number }) => {
      return apiRequest("DELETE", `/api/thoughts/${thoughtId}/perspectives/${messageId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${selectedDot?.id}/perspectives`] });
      toast({
        title: "Perspective deleted",
        description: "Your message has been removed",
      });
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

  // Auto-open thought from notification
  useEffect(() => {
    const thoughtIdToOpen = sessionStorage.getItem('openThoughtId');
    if (thoughtIdToOpen && dots.length > 0) {
      const thoughtToOpen = dots.find(dot => dot.id === parseInt(thoughtIdToOpen));
      if (thoughtToOpen) {
        setSelectedDot(thoughtToOpen);
        sessionStorage.removeItem('openThoughtId'); // Clear after opening
      }
    }
  }, [dots]);

  // Refresh handler - only refreshes thought data, not entire page
  const handleRefreshThoughts = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/thoughts?limit=50'] });
    queryClient.invalidateQueries({ queryKey: ['/api/thoughts/stats'] });
    toast({
      title: "Refreshed!",
      description: "Thought cloud updated with latest data",
    });
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

                {/* Center-Left: Dots and Sparks Count + Collective Growth Meter */}
                <div className="flex items-center gap-6">
                  {/* Dots and Sparks */}
                  <div className="flex items-center gap-3">
                    {/* Dots - button and count */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-l-2 border-orange-500 transition-all duration-300 relative"
                        title="Dots"
                      >
                        <div className="relative">
                          <Lightbulb className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-sm font-medium text-orange-700">
                          Dots
                        </span>
                      </Button>
                      <div className="px-2.5 py-1 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50">
                        <span className="text-sm font-semibold text-orange-700">{collectiveGrowth.thoughtsCount}</span>
                      </div>
                    </div>

                    {/* Sparks - button and count */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border-l-2 border-yellow-500 transition-all duration-300 relative"
                        title="Sparks"
                      >
                        <div className="relative">
                          <Zap className="h-4 w-4 text-yellow-600 group-hover:scale-110 transition-transform" />
                          <Sparkles className="h-2.5 w-2.5 text-yellow-500 absolute -top-0.5 -right-0.5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium text-yellow-700">
                          Sparks
                        </span>
                      </Button>
                      <div className="px-2.5 py-1 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200/50">
                        <span className="text-sm font-semibold text-yellow-700">{collectiveGrowth.sparksCount}</span>
                      </div>
                    </div>

                    {/* Perspectives - button and count */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-l-2 border-orange-500 transition-all duration-300 relative"
                        title="Perspectives"
                      >
                        <div className="relative">
                          <Search className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-sm font-medium text-orange-700">
                          Perspectives
                        </span>
                      </Button>
                      <div className="px-2.5 py-1 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200/50">
                        <span className="text-sm font-semibold text-orange-700">{collectiveGrowth.perspectivesCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Collective Neural Growth Meter */}
                  <div className="relative group">
                    <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-xl border-2 border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      {/* Pulsing Brain Icon */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                        <Brain className="relative h-6 w-6 text-red-500 animate-pulse" style={{ animationDuration: '2s' }} />
                      </div>
                      
                      {/* Growth Info */}
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Collective Growth</span>
                        <div className="flex items-center gap-2">
                          <div className="relative h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                            {/* Animated gradient progress bar */}
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${collectiveGrowth.percentage}%` 
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                          <span className="text-sm font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            {collectiveGrowth.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Sparkles animation on hover */}
                      <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                    </div>
                  </div>
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
                onRefresh={handleRefreshThoughts}
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

          {/* Thought Detail Dialog - Three Column Layout */}
          {selectedDot && (
            <Dialog open={!!selectedDot} onOpenChange={() => setSelectedDot(null)}>
              <DialogContent className="max-w-7xl max-h-[90vh] h-auto p-0 gap-0">
                <div className="grid grid-cols-3 h-[80vh] max-h-[80vh]">
                  {/* Left Column: Thought Details */}
                  <div className="flex flex-col h-full min-h-0 border-r border-gray-200">
                    {/* Header */}
                    <div className="flex-shrink-0 p-6 border-b border-gray-200">
                      <DialogHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-12 w-12 border-2 border-amber-200">
                            <AvatarImage src={selectedDot.user?.avatar || undefined} />
                            <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                              {selectedDot.user?.fullName?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-gray-900">{selectedDot.user?.fullName || 'Anonymous'}</p>
                            <p className="text-sm text-gray-500">Posted {new Date(selectedDot.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <DialogTitle className="text-2xl font-bold text-gray-900 mt-4">
                          {selectedDot.heading}
                        </DialogTitle>
                        
                        {/* Edit and Delete Buttons - Only for thought owner */}
                        {user && selectedDot.user?.id === user.id && (
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-2"
                              onClick={() => {
                                setSelectedDot(null);
                                window.dispatchEvent(new CustomEvent('openFloatingDot', {
                                  detail: {
                                    thought: selectedDot,
                                    targetNeura: 'social'
                                  }
                                }));
                              }}
                              title="Edit thought"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this thought? This action cannot be undone.')) {
                                  deleteThoughtMutation.mutate(selectedDot.id);
                                }
                              }}
                              disabled={deleteThoughtMutation.isPending}
                              title={deleteThoughtMutation.isPending ? 'Deleting...' : 'Delete thought'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </DialogHeader>
                    </div>

                    {/* Main Content - Scrollable */}
                    <div className="flex-1 min-h-0 overflow-y-scroll px-6 pt-6 pb-8">
                      <div className="space-y-6">
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

                      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                        <CardContent className="pt-6">
                          <p className="text-gray-700 leading-relaxed">
                            {selectedDot.summary}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Additional Layers Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span className="text-amber-500">●</span>
                          Additional Layers
                        </h3>
                        
                        <div className="space-y-3">
                          {/* Emotions Tag Layer */}
                          <Card className="border-amber-200 bg-white/50">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-24">
                                  <p className="text-sm font-semibold text-gray-700">Emotions Tag</p>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-2">
                                  {selectedDot.emotions ? (() => {
                                    try {
                                      const emotionsArray = JSON.parse(selectedDot.emotions);
                                      return emotionsArray.length > 0 ? emotionsArray.map((emotion: string, idx: number) => (
                                        <Badge key={idx} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                          {emotion}
                                        </Badge>
                                      )) : <p className="text-sm text-gray-400 italic">No emotions added yet</p>;
                                    } catch {
                                      return <p className="text-sm text-gray-400 italic">No emotions added yet</p>;
                                    }
                                  })() : (
                                    <p className="text-sm text-gray-400 italic">No emotions added yet</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Anchor Layer */}
                          <Card className="border-amber-200 bg-white/50">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-24">
                                  <p className="text-sm font-semibold text-gray-700">Anchor</p>
                                </div>
                                <div className="flex-1">
                                  {selectedDot.anchor ? (
                                    <p className="text-sm text-gray-600">{selectedDot.anchor}</p>
                                  ) : (
                                    <p className="text-sm text-gray-400 italic">No anchor added yet</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Analogies Layer */}
                          <Card className="border-amber-200 bg-white/50">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-24">
                                  <p className="text-sm font-semibold text-gray-700">Analogies</p>
                                </div>
                                <div className="flex-1">
                                  {selectedDot.analogies ? (
                                    <p className="text-sm text-gray-600">{selectedDot.analogies}</p>
                                  ) : (
                                    <p className="text-sm text-gray-400 italic">No analogies added yet</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Keywords Layer */}
                          <Card className="border-amber-200 bg-white/50">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-24">
                                  <p className="text-sm font-semibold text-gray-700">Keywords</p>
                                </div>
                                <div className="flex-1">
                                  {selectedDot.keywords ? (
                                    <p className="text-sm text-gray-600">{selectedDot.keywords}</p>
                                  ) : (
                                    <p className="text-sm text-gray-400 italic">No keywords added yet</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      </div>
                    </div>

                    {/* Footer - Action Buttons */}
                    <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white space-y-3">
                      <Button
                        onClick={() => saveToMyNeuraMutation.mutate(selectedDot.id)}
                        disabled={saveToMyNeuraMutation.isPending}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-11"
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save to MyNeura
                      </Button>

                      {/* Save to MyCircle Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            disabled={saveToCircleMutation.isPending || userCircles.length === 0}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-11"
                          >
                            <Bookmark className="h-4 w-4 mr-2" />
                            {userCircles.length === 0 ? 'No Circles Available' : 'Save to MyCircle'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top" className="w-56">
                          {userCircles.map((circle) => (
                            <DropdownMenuItem
                              key={circle.id}
                              onClick={() => saveToCircleMutation.mutate({ thoughtId: selectedDot.id, circleId: circle.id })}
                            >
                              {circle.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Middle Column: Perspectives (Chat) */}
                  <div className="flex flex-col h-full min-h-0 border-r border-gray-200">
                    {/* Header */}
                    <div className="flex-shrink-0 p-6 border-b border-gray-200 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">Perspectives</h3>
                    </div>
                    
                    {/* Main Content - Messages Area (Scrollable) */}
                    <div className="flex-1 min-h-0 overflow-y-scroll p-4 bg-gray-50 space-y-3">
                      {perspectivesData?.messages && perspectivesData.messages.length > 0 ? (
                        <>
                          {perspectivesData.messages.map((message) => (
                            <div key={message.id} className="flex gap-3 group">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={message.user.avatar || undefined} />
                                <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                                  {message.user.fullName?.[0]?.toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {message.user.fullName || 'Anonymous'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.createdAt).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                                  {/* Delete button for own messages */}
                                  {user && message.user.id === user.id && (
                                    <button
                                      onClick={() => {
                                        if (confirm('Delete this perspective?')) {
                                          deletePerspectiveMutation.mutate({ 
                                            thoughtId: selectedDot.id, 
                                            messageId: message.id 
                                          });
                                        }
                                      }}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-red-500 hover:text-red-700"
                                      disabled={deletePerspectiveMutation.isPending}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                  {message.messageBody}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <p className="text-sm">No perspectives yet</p>
                          <p className="text-xs mt-2">Be the first to share your thoughts!</p>
                        </div>
                      )}
                    </div>

                    {/* Footer - Input Area */}
                    <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-white">
                      <div className="flex gap-2">
                        <Input
                          value={perspectiveInput}
                          onChange={(e) => setPerspectiveInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendPerspective();
                            }
                          }}
                          placeholder="Share your perspective..."
                          className="flex-1 h-11"
                          disabled={postPerspectiveMutation.isPending}
                        />
                        <Button
                          onClick={handleSendPerspective}
                          disabled={!perspectiveInput.trim() || postPerspectiveMutation.isPending}
                          size="icon"
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-11 w-11"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sparks */}
                  <div className="flex flex-col h-full min-h-0">
                    {/* Header */}
                    <div className="flex-shrink-0 p-6 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Zap className="h-5 w-5 text-yellow-500" />
                          <div className="absolute inset-0 animate-pulse">
                            <Zap className="h-5 w-5 text-yellow-400 opacity-50" />
                          </div>
                          <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-0.5 -right-0.5 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Sparks</h3>
                      </div>
                    </div>
                    
                    {/* Main Content - Scrollable */}
                    <div className="flex-1 min-h-0 overflow-y-scroll px-6 pt-6 pb-8 bg-gray-50 space-y-6">
                      
                      {/* Section 1: Smart Summary (Evolved Thought) */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Smart Summary (Evolved Thought)</h4>
                          <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                            <Button
                              variant={sparkViewMode === 'text' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setSparkViewMode('text')}
                              className="text-xs"
                            >
                              Text
                            </Button>
                            <Button
                              variant={sparkViewMode === 'visual' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setSparkViewMode('visual')}
                              className="text-xs"
                            >
                              Visual
                            </Button>
                          </div>
                        </div>

                        {evolvedLoading ? (
                          <div className="h-[220px] flex items-center justify-center">
                            <div className="text-center">
                              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-yellow-500" />
                              <p className="text-xs text-gray-500">Generating evolved insight...</p>
                            </div>
                          </div>
                        ) : sparkViewMode === 'text' ? (
                          <div className="h-[220px] flex flex-col justify-between">
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200 flex-1 flex items-center overflow-y-auto">
                              <p className="text-sm text-gray-800">{evolvedData?.evolvedSummary || 'No evolved thought yet. Add perspectives to generate insights!'}</p>
                            </div>
                            {evolvedData?.thoughtContext && (
                              <p className="text-xs text-gray-500 mt-2">
                                Based on {evolvedData.thoughtContext.perspectivesCount} perspective{evolvedData.thoughtContext.perspectivesCount !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-lg p-6 h-[220px] flex items-center justify-center">
                            <div className="text-center">
                              <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                              <p className="text-sm font-medium text-gray-800 mb-2">Visual Summary</p>
                              <p className="text-xs text-gray-600 max-w-[250px]">{evolvedData?.evolvedSummary || 'Infographic visualization coming soon!'}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Section 2: My Sparks (Note-taking) */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">My Sparks ({userSparks.length})</h4>
                        
                        {/* Sparks List */}
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {sparksLoading ? (
                            <div className="text-center py-4">
                              <RefreshCw className="h-4 w-4 animate-spin mx-auto text-gray-400" />
                            </div>
                          ) : userSparks.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-4">No sparks saved yet</p>
                          ) : (
                            userSparks.map((spark: any) => (
                              <div key={spark.id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 group relative">
                                <p className="text-sm text-gray-800 pr-6">{spark.content}</p>
                                {/* Delete button for own sparks */}
                                {user && spark.userId === user.id && (
                                  <button
                                    onClick={() => {
                                      if (confirm('Delete this spark?')) {
                                        deleteSparkMutation.mutate(spark.id);
                                      }
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                                    disabled={deleteSparkMutation.isPending}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                                <p className="text-xs text-gray-400 mt-1">{new Date(spark.createdAt).toLocaleString()}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer - Input Area */}
                    <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
                      <div className="flex gap-2">
                        <Input
                          value={sparkNote}
                          onChange={(e) => setSparkNote(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveSpark()}
                          placeholder="Capture your spark..."
                          className="flex-1 h-11"
                        />
                        <Button
                          onClick={handleSaveSpark}
                          disabled={!sparkNote.trim() || addSparkMutation.isPending}
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 h-11"
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
