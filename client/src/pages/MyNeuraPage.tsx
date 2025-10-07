import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Brain, Users, Sparkles, MessageSquare, Plus,
  Menu, User, LogOut, Settings, TrendingUp, Heart,
  Share2, Eye, MoreHorizontal, Maximize, Minimize, Clock,
  Grid3x3, List, Bookmark, Fingerprint, Hash, Lightbulb, MessageCircle, Zap, Info, Cog,
  PenTool, Linkedin, MessageCircleMore, RefreshCw
} from "lucide-react";
import { SiWhatsapp, SiLinkedin, SiOpenai } from 'react-icons/si';
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { GRID_CONSTANTS, dotsCollide, getDotSize, getIdentityCardTop, getChannelConfig } from "@/lib/gridConstants";
import ThoughtCloudGrid from "@/components/ThoughtCloudGrid";

// Import ThoughtDot type from shared component
import { ThoughtDot } from "@/components/ThoughtCloudGrid";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Channel-specific visual configurations now in gridConstants

// Type for neural strength data
type NeuralStrengthData = {
  percentage: number;
  milestones: {
    cognitiveIdentityCompleted: boolean;
    learningEngineCompleted: boolean;
    hasActivity: boolean;
  };
  stats: {
    thoughtsCount: number;
    savedSparksCount: number;
  };
};

// Personal Perspectives Component (Self-Reflection Chat)
function PersonalPerspectives({ thoughtId }: { thoughtId: number }) {
  const [personalMessage, setPersonalMessage] = useState("");
  const [showSocialModal, setShowSocialModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch personal perspectives
  const { data: personalData, isLoading: personalLoading } = useQuery<{
    success: boolean;
    threadId: number;
    messages: any[];
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/perspectives/personal`],
  });

  // Fetch social thread status
  const { data: socialStatus } = useQuery<{
    success: boolean;
    hasSocialThread: boolean;
    isSharedOrImported: boolean;
    shouldShowSocialButton: boolean;
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/social-thread-status`],
  });

  // Add personal perspective mutation
  const addPersonalPerspectiveMutation = useMutation({
    mutationFn: async (messageBody: string) => {
      return apiRequest("POST", `/api/thoughts/${thoughtId}/perspectives/personal`, { messageBody });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${thoughtId}/perspectives/personal`] });
      setPersonalMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add perspective",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!personalMessage.trim()) return;
    addPersonalPerspectiveMutation.mutate(personalMessage);
  };

  const messages = personalData?.messages || [];

  return (
    <>
      <div className="flex flex-col h-full min-h-0 border-r border-gray-200">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">My Reflections</h3>
            </div>
            {socialStatus?.shouldShowSocialButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSocialModal(true)}
                className="border-red-400 text-red-500 hover:bg-red-50"
              >
                <Users className="h-4 w-4 mr-1 text-red-500" />
                Social
              </Button>
            )}
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {personalLoading ? (
            <div className="text-center text-gray-500 py-8">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading reflections...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No reflections yet</p>
              <p className="text-xs mt-2">Start writing your thoughts and perspectives</p>
            </div>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className="bg-white rounded-lg p-3 shadow-sm border border-amber-100">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.user?.avatar} />
                    <AvatarFallback className="bg-amber-500 text-white text-xs">
                      {msg.user?.fullName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{msg.messageBody}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input - Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <Input
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Write your reflection..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!personalMessage.trim() || addPersonalPerspectiveMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Social Perspectives Modal */}
      {showSocialModal && (
        <SocialPerspectivesModal
          thoughtId={thoughtId}
          open={showSocialModal}
          onOpenChange={setShowSocialModal}
        />
      )}
    </>
  );
}

// Sparks Section Component
function SparksSection({ thoughtId, thought }: { thoughtId: number; thought: ThoughtDot }) {
  const [viewMode, setViewMode] = useState<'text' | 'visual'>('text');
  const [sparkNote, setSparkNote] = useState('');
  const [showSocialSparks, setShowSocialSparks] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch evolved summary
  const { data: evolvedData, isLoading: evolvedLoading } = useQuery<{
    success: boolean;
    evolvedSummary: string;
    thoughtContext: any;
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/evolved-summary`],
  });

  // Fetch user sparks
  const { data: sparksData, isLoading: sparksLoading } = useQuery<{
    success: boolean;
    sparks: any[];
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/sparks`],
    enabled: !!thoughtId, // Only fetch when we have a valid thoughtId
  });

  // Add spark mutation
  const addSparkMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/thoughts/${thoughtId}/sparks`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${thoughtId}/sparks`] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/user/sparks-count'] });
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
      return apiRequest("DELETE", `/api/thoughts/${thoughtId}/sparks/${sparkId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/thoughts/${thoughtId}/sparks`] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/user/sparks-count'] });
    },
  });

  const handleSaveSpark = () => {
    if (!sparkNote.trim()) return;
    addSparkMutation.mutate(sparkNote);
  };

  const userSparks = sparksData?.sparks || [];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-gray-50 space-y-6">
        
        {/* Section 1: Smart Summary (Evolved Thought) */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900">Smart Summary (Evolved Thought)</h4>
            <div className="flex gap-1 bg-gray-100 rounded-md p-1">
              <Button
                variant={viewMode === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('text')}
                className="text-xs"
              >
                Text
              </Button>
              <Button
                variant={viewMode === 'visual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('visual')}
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
          ) : viewMode === 'text' ? (
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
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">My Sparks ({userSparks.length})</h4>
            {thought?.sharedToSocial && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSocialSparks(true)}
                className="text-xs text-red-600 border-red-300 hover:bg-red-50"
              >
                <Users className="h-3 w-3 mr-1" />
                Social Sparks
              </Button>
            )}
          </div>
          
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
                  <button
                    onClick={() => deleteSparkMutation.mutate(spark.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </button>
                  <p className="text-xs text-gray-400 mt-1">{new Date(spark.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Social Sparks Modal */}
        <Dialog open={showSocialSparks} onOpenChange={setShowSocialSparks}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Users className="h-5 w-5" />
                Social Sparks - Community Insights
              </DialogTitle>
            </DialogHeader>
            <SocialSparksContent thoughtId={thoughtId} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Input - Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={sparkNote}
            onChange={(e) => setSparkNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveSpark()}
            placeholder="Capture your spark..."
            className="flex-1"
          />
          <Button
            onClick={handleSaveSpark}
            disabled={!sparkNote.trim() || addSparkMutation.isPending}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Social Sparks Content Component
function SocialSparksContent({ thoughtId }: { thoughtId: number }) {
  // Fetch all social sparks for this thought
  const { data: socialSparksData, isLoading: socialSparksLoading } = useQuery<{
    success: boolean;
    sparks: Array<{
      id: number;
      content: string;
      createdAt: string;
      user: {
        id: number;
        fullName: string | null;
        avatar: string | null;
      };
    }>;
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/social-sparks`],
  });

  const socialSparks = socialSparksData?.sparks || [];

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {socialSparksLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-red-500" />
            <p className="text-sm text-gray-500">Loading social sparks...</p>
          </div>
        ) : socialSparks.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No community sparks yet</p>
            <p className="text-xs text-gray-400 mt-2">Be the first to add a spark!</p>
          </div>
        ) : (
          socialSparks.map((spark) => (
            <div key={spark.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-start gap-3 mb-2">
                <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-red-200">
                  <AvatarImage src={spark.user.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs">
                    {spark.user.fullName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{spark.user.fullName || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(spark.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-800 ml-11">{spark.content}</p>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}

// Social Perspectives Modal Component
function SocialPerspectivesModal({
  thoughtId,
  open,
  onOpenChange,
}: {
  thoughtId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Fetch social perspectives
  const { data: socialData, isLoading: socialLoading } = useQuery<{
    success: boolean;
    threadId: number;
    messages: any[];
  }>({
    queryKey: [`/api/thoughts/${thoughtId}/perspectives`],
    enabled: open,
  });

  const messages = socialData?.messages || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-500" />
            Social Perspectives
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-3">
            {socialLoading ? (
              <div className="text-center text-gray-500 py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading social perspectives...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No social perspectives yet</p>
                <p className="text-xs mt-2">Be the first to share in /social!</p>
              </div>
            ) : (
              messages.map((msg: any) => (
                <div key={msg.id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.user?.avatar} />
                      <AvatarFallback className="bg-gray-500 text-white text-xs">
                        {msg.user?.fullName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">{msg.user?.fullName || 'Anonymous'}</p>
                      <p className="text-sm text-gray-700 mt-1">{msg.messageBody}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function MyNeuraPage() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedThought, setSelectedThought] = useState<ThoughtDot | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtDot[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'cloud' | 'feed'>('cloud');
  const [showStrengthInfo, setShowStrengthInfo] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's personal thoughts from MyNeura
  const { data: myNeuraThoughts, isLoading } = useQuery({
    queryKey: ['/api/thoughts/myneura'],
    enabled: !!user,
  });

  // Fetch neural strength
  const { data: neuralStrength } = useQuery<NeuralStrengthData>({
    queryKey: ['/api/thoughts/neural-strength'],
    enabled: !!user,
  });

  // Fetch sparks count
  const { data: sparksCountData } = useQuery<{ success: boolean; count: number }>({
    queryKey: ['/api/thoughts/user/sparks-count'],
    enabled: !!user,
  });

  // Share thought to social feed
  const shareToSocialMutation = useMutation({
    mutationFn: async (thoughtId: number) => {
      const response = await apiRequest('POST', `/api/thoughts/${thoughtId}/share-to-social`, {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.error || "Shared!",
        description: data.error === 'Thought already shared' ? "This thought is already visible in Social feed" : "Thought shared to Social feed",
        variant: data.error ? "destructive" : "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
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

      setThoughts(filtered);
    }
  }, [myNeuraThoughts, showRecentOnly]);

  return (
    <SharedAuthLayout>
      <div className={`flex-1 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          {/* Thought Cloud Canvas */}
          <div className={`relative w-full bg-gradient-to-br from-amber-50/70 to-orange-50/50 shadow-2xl border border-amber-200 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
            {/* Toolbar - Neura Navigation - hide in fullscreen */}
            {!isFullscreen && (
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
              {/* Left: Navigation sections */}
              <div className="flex items-center gap-4">
              
              {/* 1. Cognitive Identity - button and icon in one line */}
              <Link href="/cognitive-identity" className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border-l-2 border-purple-400 transition-all duration-300 relative"
                  title="Cognitive Identity"
                >
                  <span className="text-sm font-medium text-purple-700">
                    Cognitive Identity
                  </span>
                </Button>
                <div className="relative px-2.5 py-2.5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200/50 transition-all duration-300 hover:border-purple-300 hover:shadow-md cursor-pointer">
                  {!neuralStrength?.milestones?.cognitiveIdentityCompleted && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                  )}
                  <Fingerprint className="h-5 w-5 text-purple-600" />
                </div>
              </Link>

              {/* 2. Learning Engine - button and icon in one line */}
              <Link href="/learning-engine" className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="group flex items-center gap-2 rounded-lg px-3 py-2 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-l-2 border-amber-500 transition-all duration-300 relative"
                  title="Learning Engine"
                >
                  <span className="text-sm font-medium text-amber-800">
                    Learning Engine
                  </span>
                </Button>
                <div className="relative px-2.5 py-2.5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200/50 transition-all duration-300 hover:border-amber-300 hover:shadow-md cursor-pointer">
                  {!neuralStrength?.milestones?.learningEngineCompleted && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                  )}
                  <Cog 
                    className={`h-5 w-5 text-amber-700 ${
                      neuralStrength?.milestones?.learningEngineCompleted 
                        ? 'animate-spin' 
                        : ''
                    }`}
                    style={neuralStrength?.milestones?.learningEngineCompleted ? { animationDuration: '2s' } : {}}
                  />
                </div>
              </Link>

              {/* 3. Dots - button and count in one line */}
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
                  <span className="text-xs font-semibold text-orange-800">{thoughts.length}</span>
                </div>
              </div>

              {/* 4. Sparks - button and count in one line */}
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
                  <span className="text-xs font-semibold text-yellow-800">{sparksCountData?.count || 0}</span>
                </div>
              </div>
              
              </div>

              {/* Right: Neural Strength Meter */}
              <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-amber-300 shadow-sm relative">
                {/* Info button that opens dialog */}
                <button 
                  onClick={() => setShowStrengthInfo(true)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center transition-colors shadow-md z-10"
                >
                  <Info className="h-3 w-3 text-white" />
                </button>

                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs font-semibold text-amber-900">Neural Strength</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {neuralStrength?.percentage || 10}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-1000 ease-out"
                    style={{ width: `${neuralStrength?.percentage || 10}%` }}
                  />
                </div>
              </div>
            </div>
            )}
            
            {/* Cloud View */}
            {viewMode === 'cloud' && (
              <>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="text-center space-y-4">
                      <Sparkles className="h-12 w-12 text-amber-500 animate-pulse mx-auto" />
                      <p className="text-gray-500">Loading your thought cloud...</p>
                    </div>
                  </div>
                ) : thoughts.length === 0 ? (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="text-center space-y-4 max-w-md">
                      <Brain className="h-16 w-16 text-amber-500 mx-auto" />
                      <h3 className="text-xl font-semibold text-gray-700">Your Thought Cloud awaits</h3>
                      <p className="text-gray-500">
                        Start capturing your thoughts or save inspiring ideas from others
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('openFloatingDot', {
                              detail: { targetNeura: 'myneura' }
                            }));
                          }}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Save Thought/Dot
                        </Button>
                        <Button
                          onClick={() => setLocation("/social")}
                          className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600"
                        >
                          <Brain className="mr-2 h-4 w-4 animate-pulse" />
                          Explore Social Neura
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ThoughtCloudGrid
                    thoughts={thoughts}
                    isFullscreen={isFullscreen}
                    onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                    onDotClick={(dot) => setSelectedThought(dot)}
                    patternId="myneura-pattern"
                  />
                )}
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
                            {thought.emotions && (() => {
                              try {
                                const emotionsArray = JSON.parse(thought.emotions);
                                return emotionsArray.map((emotion: string, idx: number) => (
                                  <Badge key={idx} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                    {emotion}
                                  </Badge>
                                ));
                              } catch {
                                return null;
                              }
                            })()}
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

      {/* Expanded Thought Modal - Three Column Layout */}
      <Dialog open={!!selectedThought} onOpenChange={(open) => !open && setSelectedThought(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          {selectedThought && (
            <div className="grid grid-cols-3 flex-1 min-h-0 overflow-hidden">
              {/* Left Column: Thought Details */}
              <div className="flex flex-col h-full min-h-0 border-r border-gray-200">
                {/* Header */}
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
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
                  
                    <DialogTitle className="text-2xl font-bold text-gray-900 mt-4">
                      {selectedThought.heading}
                    </DialogTitle>
                  </DialogHeader>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                  <div className="space-y-6">
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
                              {selectedThought.emotions ? (() => {
                                try {
                                  const emotionsArray = JSON.parse(selectedThought.emotions);
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
                              {selectedThought.anchor ? (
                                <p className="text-sm text-gray-600">{selectedThought.anchor}</p>
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
                              {selectedThought.analogies ? (
                                <p className="text-sm text-gray-600">{selectedThought.analogies}</p>
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
                              {selectedThought.keywords ? (
                                <p className="text-sm text-gray-600">{selectedThought.keywords}</p>
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

                {/* Footer - Action Button */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                  {!selectedThought.isSaved && (
                    <Button
                      onClick={() => shareToSocialMutation.mutate(selectedThought.id)}
                      disabled={shareToSocialMutation.isPending || selectedThought.sharedToSocial}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {selectedThought.sharedToSocial ? 'Already Shared to Social' : 'Share to Social'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Middle Column: Personal Perspectives (Self-Reflection) */}
              <PersonalPerspectives thoughtId={selectedThought.id} />

              {/* Right Column: Sparks */}
              <SparksSection thoughtId={selectedThought.id} thought={selectedThought} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Neural Strength Info Dialog */}
      <Dialog open={showStrengthInfo} onOpenChange={setShowStrengthInfo}>
        <DialogContent className="max-w-md bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Boost Your Neural Strength
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600 mb-4">
              Complete these milestones to unlock your full cognitive potential:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-amber-200">
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="text-lg font-bold text-amber-700">10%</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Starting strength</p>
                  <p className="text-xs text-gray-600">Your baseline neural capacity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-amber-200">
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="text-lg font-bold text-amber-700">+30%</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Complete Cognitive Identity</p>
                  <p className="text-xs text-gray-600">Define your thinking patterns</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-amber-200">
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="text-lg font-bold text-amber-700">+20%</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Set up Learning Engine</p>
                  <p className="text-xs text-gray-600">Configure personalized learning</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-amber-200">
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="text-lg font-bold text-amber-700">+10%</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Create your first thought</p>
                  <p className="text-xs text-gray-600">Begin your neural journey</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-amber-200">
              <p className="text-xs text-gray-600 mb-2 font-medium">Continuous Growth:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <span className="font-bold text-amber-600">+0.5%</span>
                  <span>per thought</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <span className="font-bold text-amber-600">+0.3%</span>
                  <span>per saved spark</span>
                </div>
              </div>
            </div>
          </div>
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
