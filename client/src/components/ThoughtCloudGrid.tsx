import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, Maximize, Minimize } from 'lucide-react';
import { GRID_CONSTANTS, getFixedPosition, getChannelConfig } from '@/lib/gridConstants';

export interface ThoughtDot {
  id: number;
  heading: string;
  summary: string;
  emotions?: string; // JSON string array of emotions like '["Joy", "Curiosity"]'
  imageUrl?: string;
  channel?: string;
  userId?: number;
  visibility?: string;
  sharedToSocial?: boolean;
  createdAt: string;
  username?: string;
  user?: {
    id: number;
    fullName: string | null;
    avatar?: string | null;
    email?: string;
  };
  contributors?: {
    id: number;
    fullName: string | null;
    avatar?: string | null;
  }[];
  contributorCount?: number;
  isSaved?: boolean;
  savedAt?: string;
  keywords?: string | null;
  anchor?: string | null;
  analogies?: string | null;
  x?: number;
  y?: number;
  size?: number;
  rotation?: number;
}

interface ThoughtCloudGridProps {
  thoughts: ThoughtDot[];
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  onDotClick: (dot: ThoughtDot) => void;
  patternId?: string;
  onRefresh?: () => void;
}

const DOTS_PER_PAGE = 8;

export default function ThoughtCloudGrid({
  thoughts: allThoughts,
  isFullscreen,
  onFullscreenToggle,
  onDotClick,
  patternId = 'thought-pattern',
  onRefresh,
}: ThoughtCloudGridProps) {
  const [dots, setDots] = useState<ThoughtDot[]>([]);
  const [page, setPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Position thoughts using fixed grid (no collision detection needed)
  useEffect(() => {
    // Show all thoughts loaded so far (load in batches of 8)
    const startIdx = 0;
    const endIdx = (page + 1) * DOTS_PER_PAGE;
    const currentPageThoughts = allThoughts.slice(startIdx, endIdx);

    const positioned = currentPageThoughts.map((thought, index) => {
      // Use fixed position from pre-calculated grid
      const position = getFixedPosition(index);
      
      return { 
        ...thought, 
        x: position.x,
        y: position.y, 
        size: position.size,
        rotation: position.rotation
      };
    }).filter(Boolean) as ThoughtDot[];

    setDots(positioned);
  }, [allThoughts, page]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const sentinel = entries[0];
        if (sentinel.isIntersecting && (page + 1) * DOTS_PER_PAGE < allThoughts.length) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [page, allThoughts.length]);

  const handleRefresh = () => {
    // Reset scroll to top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setPage(0);
    
    // Always call refresh to reload data
    if (onRefresh) {
      onRefresh();
    } else {
      // Fallback: reload the page if no refresh handler provided
      window.location.reload();
    }
  };

  return (
    <div className={`relative w-full max-w-[1200px] mx-auto bg-gradient-to-br from-amber-50/70 to-orange-50/50 shadow-2xl border border-amber-200 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'h-[600px] rounded-3xl'}`}>
      
      {/* Cloud background pattern */}
      <div className="absolute inset-0 opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={patternId} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="2" fill="#F59E0B" opacity="0.4"/>
              <circle cx="75" cy="75" r="2" fill="#EA580C" opacity="0.4"/>
              <circle cx="50" cy="50" r="1.5" fill="#F97316" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`}/>
        </svg>
      </div>

      {/* Fixed position buttons - outside draggable container */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        className="absolute top-4 right-4 z-30 bg-white/95 hover:bg-white hover:shadow-lg active:bg-white/90 shadow-md text-gray-700 hover:text-gray-900 transition-all"
        title="Refresh thought cloud"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onFullscreenToggle}
        className="absolute bottom-4 right-4 z-30 bg-white/95 hover:bg-white hover:shadow-lg active:bg-white/90 shadow-md text-gray-700 hover:text-gray-900 transition-all"
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

      {/* Scrollable Cloud Container - Native mobile-like scrolling */}
      <div 
        ref={scrollContainerRef}
        className="relative w-full h-full overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
          scrollBehavior: 'smooth',
        }}
      >
        {/* Virtual canvas for dot positioning */}
        <div 
          className="relative w-full p-8"
          style={{
            height: '10000px', // Large virtual canvas for infinite scrolling
            minHeight: '100%'
          }}
        >
        {dots.map((dot) => {
          const channelConfig = getChannelConfig(dot.channel || 'write');
          const ChannelIcon = channelConfig.icon;
          
          // Scale positions to actual container width (positions are generated for 1200px)
          const containerWidth = scrollContainerRef.current?.offsetWidth || 1200;
          const scaleFactor = containerWidth / 1200;
          const scaledX = (dot.x || 0) * scaleFactor;
          
          // Clamp positions to prevent overflow (with dot radius buffer)
          const dotRadius = (dot.size || 120) / 2;
          const identityCardOffset = 60; // Distance of identity card above dot center
          const identityCardHeight = 50; // Approximate height of identity card
          const paddingBuffer = 32; // Extra padding for safety
          
          // X-axis clamping
          const minX = dotRadius + paddingBuffer;
          const maxX = containerWidth - dotRadius - paddingBuffer;
          const clampedX = Math.max(minX, Math.min(maxX, scaledX));
          
          // Y-axis clamping (prevent cutoff at top and bottom)
          // Top: identity card offset + identity card height + padding
          const minY = identityCardOffset + identityCardHeight + paddingBuffer;
          // Bottom: leave space for dot radius + padding
          const containerHeight = scrollContainerRef.current?.offsetHeight || 600;
          const maxY = containerHeight - dotRadius - paddingBuffer;
          const clampedY = Math.max(minY, Math.min(maxY, dot.y || 0));
          
          return (
            <div
              key={dot.id}
              className="absolute transition-all duration-300 hover:z-50 group"
              style={{
                left: `${clampedX}px`,
                top: `${clampedY}px`,
                transform: `translate(-50%, -50%)`,
              }}
            >
              {/* Identity Card - Avatar(s) only */}
              <div 
                className="absolute z-50 thought-dot-clickable"
                style={{ 
                  top: '-60px',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="flex items-center justify-center gap-0">
                  {/* Author avatar */}
                  <Avatar className="h-10 w-10 border-2 border-amber-300 shadow-lg">
                    {dot.user?.avatar ? (
                      <AvatarImage src={dot.user.avatar} alt={dot.user.fullName || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm">
                        {dot.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Contributor avatars (up to 2) - only show on /social */}
                  {dot.contributors && dot.contributors.length > 0 && (
                    <>
                      {dot.contributors.slice(0, 2).map((contributor) => (
                        <Avatar 
                          key={contributor.id} 
                          className="h-8 w-8 border-2 border-red-400 shadow-lg -ml-3"
                        >
                          {contributor.avatar ? (
                            <AvatarImage src={contributor.avatar} alt={contributor.fullName || 'Contributor'} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs">
                              {contributor.fullName?.charAt(0).toUpperCase() || 'C'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      ))}

                      {/* +X indicator if more than 2 contributors - slight gap */}
                      {dot.contributorCount && dot.contributorCount > 2 && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 border-2 border-red-400 flex items-center justify-center -ml-1 shadow-lg">
                          <p className="text-white text-[10px] font-bold">+{dot.contributorCount - 2}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Main Dot Container */}
              <div
                className="cursor-pointer transition-all duration-300 hover:scale-110 thought-dot-clickable"
                style={{
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  animation: `float-${dot.id % 3} ${6 + (dot.id % 4)}s ease-in-out infinite`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDotClick(dot);
                }}
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
        
        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
