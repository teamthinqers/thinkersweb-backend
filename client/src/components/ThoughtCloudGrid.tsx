import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize, Minimize, User } from 'lucide-react';
import { GRID_CONSTANTS, dotsCollide, getDotSize, getIdentityCardTop, getChannelConfig } from '@/lib/gridConstants';

export interface ThoughtDot {
  id: number;
  content: string;
  channel: string;
  createdAt: string;
  username?: string;
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

const DOTS_PER_PAGE = 10;

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
  
  // Cache for thought positions to prevent teleporting on refetch
  const [positionCache] = useState(() => new Map<number, { x: number; y: number; size: number; rotation: number }>());

  // Position thoughts in cloud formation
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    // Get thoughts for current page
    const startIdx = 0;
    const endIdx = (page + 1) * DOTS_PER_PAGE;
    const currentPageThoughts = allThoughts.slice(startIdx, endIdx);

    const positionedDots: { x: number; y: number; size: number; rotation: number }[] = [];

    const positioned = currentPageThoughts.map((thought, index) => {
      // Check cache first
      const cached = positionCache.get(thought.id);
      if (cached) {
        positionedDots.push(cached);
        return { ...thought, ...cached };
      }

      const marginX = GRID_CONSTANTS.MARGIN_X;
      const marginY = GRID_CONSTANTS.MARGIN_Y;
      const safeZoneX = 100 - (marginX * 2);
      const safeZoneY = 100 - (marginY * 2);

      // Pseudo-random position based on thought ID
      const seed = thought.id * 7919;
      let pseudoRandom1 = (Math.sin(seed) * 10000) % 1;
      let pseudoRandom2 = (Math.cos(seed * 1.5) * 10000) % 1;

      // Create clusters/layers for depth
      const dotsPerLayer = isMobile 
        ? GRID_CONSTANTS.LAYOUT.DOTS_PER_LAYER_MOBILE 
        : GRID_CONSTANTS.LAYOUT.DOTS_PER_LAYER_DESKTOP;
      const layer = Math.floor(index / dotsPerLayer);
      const layerOffset = layer * (isMobile 
        ? GRID_CONSTANTS.LAYOUT.LAYER_OFFSET_MOBILE 
        : GRID_CONSTANTS.LAYOUT.LAYER_OFFSET_DESKTOP);

      // Use standardized size calculation
      const size = getDotSize(thought.id, isMobile);

      // Try to find a non-overlapping position
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = GRID_CONSTANTS.COLLISION.MAX_ATTEMPTS;

      do {
        // Position within safe zone with organic distribution
        x = marginX + (Math.abs(pseudoRandom1) * safeZoneX);
        y = marginY + (Math.abs(pseudoRandom2) * (safeZoneY * 0.7)) + layerOffset;

        // Check for collisions with existing dots
        const hasCollision = positionedDots.some(existing => 
          dotsCollide(x, y, size, existing.x, existing.y, existing.size)
        );

        if (!hasCollision || attempts >= maxAttempts) {
          break;
        }

        // Generate new random position for next attempt
        attempts++;
        pseudoRandom1 = (Math.sin(seed * (attempts + 1)) * 10000) % 1;
        pseudoRandom2 = (Math.cos(seed * (attempts + 1) * 1.5) * 10000) % 1;
      } while (attempts < maxAttempts);

      const rotation = (thought.id * 13) % 360;

      const position = { x, y, size, rotation };
      positionCache.set(thought.id, position);
      positionedDots.push(position);

      return { ...thought, ...position };
    }).filter(Boolean) as ThoughtDot[];

    setDots(positioned);
  }, [allThoughts, page, positionCache]);

  // Drag handlers for panning the grid
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaY = e.clientY - dragStart.y;
    setPanOffset(prev => {
      const newY = prev.y + deltaY;

      // Load more dots if dragged up beyond 200px and more exist
      if (newY < -200 && (page + 1) * DOTS_PER_PAGE < allThoughts.length) {
        setPage(prev => prev + 1);
        return { x: 0, y: 0 }; // Reset after loading
      }

      return { x: 0, y: newY };
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
        className="absolute top-4 right-4 z-30 bg-white/80 hover:bg-amber-100 shadow-md"
        title="Refresh thought cloud"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onFullscreenToggle}
        className="absolute bottom-4 right-4 z-30 bg-white/80 hover:bg-amber-100 shadow-md"
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
        className={`relative min-h-[600px] h-[calc(100vh-200px)] max-h-[1200px] p-8 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translateY(${panOffset.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {dots.map((dot) => {
          const channelConfig = getChannelConfig(dot.channel);
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
              {/* Identity Card - Always Visible */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200 whitespace-nowrap z-10 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
                style={{
                  top: getIdentityCardTop(dot.size || 100)
                }}
              >
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-xs font-medium text-gray-800">
                    {dot.username || 'Anonymous'}
                  </span>
                </div>
              </div>

              {/* Thought Dot */}
              <div
                onClick={() => onDotClick(dot)}
                className={`relative cursor-pointer transition-all duration-500 hover:scale-110 group-hover:shadow-2xl`}
                style={{
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  animation: `float ${GRID_CONSTANTS.ANIMATION.DURATION_MIN + (dot.id % GRID_CONSTANTS.ANIMATION.DURATION_VARIATION)}s ease-in-out infinite`,
                  animationDelay: `${(dot.id % 3) * 0.5}s`
                }}
              >
                {/* Pulsing outer ring */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${channelConfig.color} opacity-20 animate-ping`} 
                     style={{ animationDuration: '3s' }} />
                
                {/* Main dot */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${channelConfig.bgGradient} border-2 ${channelConfig.borderColor} group-hover:${channelConfig.hoverBorderColor} shadow-lg flex items-center justify-center overflow-hidden backdrop-blur-sm transition-all duration-300`}>
                  {/* Content preview */}
                  <div className="absolute inset-0 p-3 flex items-center justify-center">
                    <p className="text-xs text-center text-gray-800 font-medium line-clamp-3 leading-tight">
                      {dot.content.slice(0, 60)}...
                    </p>
                  </div>
                </div>

                {/* Channel indicator badge */}
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${channelConfig.badgeBg} flex items-center justify-center shadow-md border-2 border-white`}
                  style={{
                    bottom: `${GRID_CONSTANTS.CHANNEL_BADGE.BOTTOM_OFFSET}px`
                  }}
                >
                  <ChannelIcon className="h-3 w-3 text-white" />
                </div>

                {/* Sparkle effects on hover */}
                <div className="absolute top-1 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-0 group-hover:opacity-75" />
                <div className="absolute bottom-2 left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse opacity-0 group-hover:opacity-60" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
