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
import { useQuery } from "@tanstack/react-query";
import SharedAuthLayout from "@/components/layout/SharedAuthLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

// Type for a thought with user info
type ThoughtDot = {
  id: number;
  heading: string;
  summary: string;
  emotion?: string;
  imageUrl?: string;
  channel?: string;
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

export default function MyNeuraPage() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [selectedThought, setSelectedThought] = useState<ThoughtDot | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtDot[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'cloud' | 'feed'>('cloud');
  const [showStrengthInfo, setShowStrengthInfo] = useState(false);
  
  // Cache for thought positions to prevent teleporting on refetch
  const positionCacheRef = useState(() => new Map<number, { x: number; y: number; size: number; rotation: number }>())[0];

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

      // Calculate cloud/universe positions with organic spacing
      const positioned = filtered.map((thought: ThoughtDot, index: number) => {
        // Check cache first
        const cached = positionCacheRef.get(thought.id);
        if (cached) {
          return { ...thought, ...cached };
        }

        // Calculate new position with cloud-like distribution
        const isMobile = window.innerWidth < 768;
        
        // Safe margins to prevent cut-off (in percentage)
        const marginX = 10; // 10% margin on each side
        const marginY = 15; // 15% margin top and bottom (more for heading card)
        const safeZoneX = 100 - (marginX * 2);
        const safeZoneY = 100 - (marginY * 2);
        
        // Generate pseudo-random but consistent position based on thought ID
        const seed = thought.id * 9876543;
        const pseudoRandom1 = (Math.sin(seed) * 10000) % 1;
        const pseudoRandom2 = (Math.cos(seed * 1.5) * 10000) % 1;
        const pseudoRandom3 = (Math.sin(seed * 2.3) * 10000) % 1;
        
        // Create clusters/layers for depth (recent thoughts more spread, older more clustered)
        const layer = Math.floor(index / (isMobile ? 6 : 10));
        const layerOffset = layer * (isMobile ? 60 : 40); // Push older thoughts down
        
        // Position within safe zone with organic distribution
        const x = marginX + (Math.abs(pseudoRandom1) * safeZoneX);
        const y = marginY + (Math.abs(pseudoRandom2) * (safeZoneY * 0.7)) + layerOffset;
        
        // Varied sizes for visual interest
        const sizes = isMobile ? [70, 80, 90] : [90, 110, 130];
        const size = sizes[Math.floor(Math.abs(pseudoRandom3) * sizes.length)];
        const rotation = (thought.id * 13) % 360;
        
        const position = { x, y, size, rotation };
        positionCacheRef.set(thought.id, position);
        
        return { ...thought, ...position };
      }).filter(Boolean) as ThoughtDot[];

      setThoughts(positioned);
    }
  }, [myNeuraThoughts, showRecentOnly, positionCacheRef]);

  return (
    <SharedAuthLayout>
      <div className={`flex-1 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50' : ''}`}>
        <div className={`${isFullscreen ? 'h-full' : 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          {/* Thought Cloud Canvas */}
          <div className={`relative w-full bg-gradient-to-br from-amber-50/70 to-orange-50/50 shadow-2xl border border-amber-200 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
            {/* Toolbar - Neura Navigation */}
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
                  <span className="text-xs font-semibold text-yellow-800">0</span>
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
            
            {/* Cloud View */}
            {viewMode === 'cloud' && (
              <>
                {/* Cloud background pattern */}
                <div className="absolute inset-0 opacity-25">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="myneura-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="25" cy="25" r="2" fill="#F59E0B" opacity="0.4"/>
                        <circle cx="75" cy="75" r="2" fill="#EA580C" opacity="0.4"/>
                        <circle cx="50" cy="50" r="1.5" fill="#F97316" opacity="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#myneura-pattern)"/>
                  </svg>
                </div>

                {/* Floating Thoughts Container */}
                <div className="relative min-h-[600px] h-[calc(100vh-300px)] max-h-[900px] p-8">
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
                thoughts.map((thought) => {
                  const channelConfig = getChannelConfig(thought.channel);
                  const ChannelIcon = channelConfig.icon;
                  
                  return (
                  <div
                    key={thought.id}
                    className="absolute transition-all duration-300 hover:z-50 group"
                    style={{
                      left: `${thought.x}%`,
                      top: `${thought.y}%`,
                      transform: `translate(-50%, -50%)`,
                    }}
                  >
                    {/* Smart Heading Card */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50">
                      <Card className="bg-white/95 backdrop-blur-md shadow-lg border-2 border-amber-200">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Avatar className="h-8 w-8 border-2 border-amber-300 cursor-pointer hover:scale-110 transition-transform">
                                    {thought.user?.avatar ? (
                                      <AvatarImage src={thought.user.avatar} alt={thought.user.fullName || 'User'} />
                                    ) : (
                                      <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                                        {thought.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <div className="space-y-1">
                                    <p className="font-semibold">{thought.user?.fullName || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{thought.user?.email || ''}</p>
                                    <p className="text-xs text-amber-600 cursor-pointer hover:underline">View Profile →</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{thought.heading}</p>
                              <p className="text-[10px] text-gray-500">{new Date(thought.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Main Dot Container */}
                    <div
                      className="cursor-pointer transition-all duration-300 hover:scale-110"
                      style={{
                        width: `${thought.size}px`,
                        height: `${thought.size}px`,
                        animation: `float-${thought.id % 3} ${6 + (thought.id % 4)}s ease-in-out infinite`,
                      }}
                      onClick={() => setSelectedThought(thought)}
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
                      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                      
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
                          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
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
                      <h3 className="text-xs font-bold text-gray-900 text-center line-clamp-3 leading-tight mb-2">
                        {thought.heading}
                      </h3>

                      {/* Summary preview - bottom */}
                      <p className="text-[10px] text-gray-600 text-center line-clamp-2 mt-auto">
                        {thought.summary}
                      </p>
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
                  );})
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
