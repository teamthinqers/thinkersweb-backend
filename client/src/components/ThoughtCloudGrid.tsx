import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, Maximize, Minimize } from 'lucide-react';
import { GRID_CONSTANTS, dotsCollide, getDotSize, getChannelConfig } from '@/lib/gridConstants';

export interface ThoughtDot {
  id: number;
  heading: string;
  summary: string;
  emotion?: string;
  imageUrl?: string;
  channel?: string;
  userId?: number;
  visibility?: string;
  createdAt: string;
  username?: string;
  user?: {
    id: number;
    fullName: string | null;
    avatar?: string | null;
    email?: string;
  };
  isSaved?: boolean;
  savedAt?: string;
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 1000, height: 600 });
  
  // Cache for thought positions to prevent teleporting on refetch
  const [positionCache] = useState(() => new Map<number, { x: number; y: number; size: number; rotation: number }>());

  // Track container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  // Position thoughts in cloud formation with vertical layering
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    // Show all thoughts loaded so far (load in batches of 8)
    const startIdx = 0;
    const endIdx = (page + 1) * DOTS_PER_PAGE;
    const currentPageThoughts = allThoughts.slice(startIdx, endIdx);

    const positionedDots: { x: number; y: number; size: number; rotation: number }[] = [];

    // Calculate safe zone with margins from grid constants
    const minX = GRID_CONSTANTS.MARGIN_X;
    const maxX = 100 - GRID_CONSTANTS.MARGIN_X;
    const minY = GRID_CONSTANTS.MARGIN_Y;
    const maxY = 100 - GRID_CONSTANTS.MARGIN_Y;

    const positioned = currentPageThoughts.map((thought, index) => {
      // Check cache first
      const cached = positionCache.get(thought.id);
      if (cached) {
        positionedDots.push(cached);
        return { ...thought, ...cached };
      }

      // Use standardized size calculation
      const size = getDotSize(thought.id, isMobile);

      // Calculate which layer this dot belongs to (0 = first 8, 1 = next 8, etc.)
      const layer = Math.floor(index / DOTS_PER_PAGE);
      const indexInLayer = index % DOTS_PER_PAGE;

      // Y offset for each layer - older dots appear below
      const layerOffset = layer * 100; // Each layer is 100% height apart

      let x = 0;
      let y = 0;
      let attempts = 0;
      const maxAttempts = GRID_CONSTANTS.COLLISION.MAX_ATTEMPTS;

      // Find a non-overlapping position within this layer
      while (attempts < maxAttempts) {
        // Generate random position within safe zone for this layer
        const seed = thought.id * 7919 + attempts * 1337;
        x = minX + (Math.abs(Math.sin(seed)) * (maxX - minX));
        y = minY + (Math.abs(Math.cos(seed * 1.5)) * (maxY - minY)) + layerOffset;

        // Check if this position collides with any dots in the same layer
        let collides = false;
        for (const existingDot of positionedDots) {
          // Only check collision within same layer (within 100% height range)
          if (Math.abs(existingDot.y - y) < 100) {
            if (dotsCollide(
              x, y, size,
              existingDot.x, existingDot.y, existingDot.size,
              containerDimensions.width,
              containerDimensions.height
            )) {
              collides = true;
              break;
            }
          }
        }

        if (!collides) {
          break; // Found a good position
        }

        attempts++;
      }
      
      const rotation = (thought.id * 13) % 360;

      const position = { x, y, size, rotation };
      positionCache.set(thought.id, position);
      positionedDots.push(position);

      return { ...thought, ...position };
    }).filter(Boolean) as ThoughtDot[];

    setDots(positioned);
  }, [allThoughts, page, positionCache, containerDimensions]);

  // Smooth drag handlers using pointer events and RAF
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaY = e.clientY - dragStart.y;
    
    requestAnimationFrame(() => {
      setPanOffset(prev => {
        const newY = prev.y + deltaY;

        // Load more dots if dragged up beyond 200px and more exist
        if (newY < -200 && (page + 1) * DOTS_PER_PAGE < allThoughts.length) {
          setPage(prev => prev + 1);
          // Keep the offset instead of resetting
          return { x: 0, y: newY };
        }

        // Clamp offset for smooth boundaries
        const maxOffset = 200;
        const minOffset = -((page + 1) * 100 * containerDimensions.height / 100);
        const clampedY = Math.max(minOffset, Math.min(maxOffset, newY));

        return { x: 0, y: clampedY };
      });
    });
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleRefresh = () => {
    positionCache.clear();
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`relative w-full bg-gradient-to-br from-amber-50/70 to-orange-50/50 shadow-2xl border border-amber-200 overflow-hidden backdrop-blur-sm ${isFullscreen ? 'h-full rounded-none' : 'rounded-3xl'}`}>
      
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

      {/* Floating Thoughts Container - Draggable */}
      <div 
        ref={containerRef}
        className={`relative min-h-[600px] h-[calc(100vh-200px)] max-h-[1200px] p-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          transform: `translateY(${panOffset.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {dots.map((dot) => {
          const channelConfig = getChannelConfig(dot.channel || 'write');
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
              {/* Identity Card - Anchored above dot's outer edge */}
              <div 
                className="absolute z-50"
                style={{ 
                  bottom: `calc(100% + ${GRID_CONSTANTS.IDENTITY_CARD.CLEARANCE}px)`,
                  left: '50%',
                  transform: 'translateX(-50%)',
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
                onClick={() => onDotClick(dot)}
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
  );
}
