import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, Settings, RotateCcw, Mic, Type, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import UserContentCreation from './UserContentCreation';


// Types will be inferred from API responses

// Import DotWheelsMap type to match Dashboard usage
interface DotWheelsMapProps {
  wheels: any[];
  dots: any[];
  showingRecentFilter?: boolean;
  recentCount?: number;
  isFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  setViewFullWheel: (wheel: any | null) => void;
  previewMode: boolean;
  setPreviewMode: (previewMode: boolean) => void;
  setViewFullDot: (dot: any | null) => void;

}

// Dynamic sizing functions exactly like Dashboard
const calculateDynamicSizing = (mode: 'preview' | 'real', count: number, type: 'dots' | 'wheels'): number => {
  const baseConfig = {
    preview: {
      dots: { base: 85, min: 65, max: 110, scaleFactor: 3.5 },
      wheels: { base: 110, min: 90, max: 140, scaleFactor: 5 }
    },
    real: {
      dots: { base: 75, min: 55, max: 95, scaleFactor: 3 },
      wheels: { base: 95, min: 75, max: 115, scaleFactor: 4 }
    }
  };
  
  const config = baseConfig[mode][type];
  const scaledSize = Math.max(config.min, config.base - Math.floor(count / config.scaleFactor) * 5);
  return Math.min(config.max, scaledSize);
};

const getChakraSize = (mode: 'preview' | 'real', wheelsCount: number) => {
  const baseConfig = {
    preview: { base: 420, min: 380, max: 480 },
    real: { base: 370, min: 320, max: 420 }
  };
  
  const config = baseConfig[mode];
  
  if (wheelsCount <= 3) {
    return config.base;
  } else if (wheelsCount <= 5) {
    return Math.min(config.max, config.base + 20);
  } else if (wheelsCount <= 8) {
    return Math.min(config.max, config.base + 35);
  } else {
    return config.max;
  }
};

// Complete UserGrid DotWheelsMap exactly like PreviewMapGrid
const DotWheelsMap: React.FC<DotWheelsMapProps> = ({ 
  wheels, 
  dots, 
  showingRecentFilter = false, 
  recentCount = 4,
  isFullscreen = false,
  onFullscreenChange,
  setViewFullWheel,
  previewMode,
  setPreviewMode,
  setViewFullDot,

}) => {
  const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
  const [selectedDot, setSelectedDot] = useState<any | null>(null);
  const [hoveredDot, setHoveredDot] = useState<any | null>(null);
  const [hoveredWheel, setHoveredWheel] = useState<any | null>(null);
  const [zoom, setZoom] = useState(0.6);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPWA, setIsPWA] = useState(false);

  // Detect PWA mode
  useEffect(() => {
    const checkPWA = () => {
      setIsPWA(window.matchMedia('(display-mode: standalone)').matches || 
               (window.navigator as any).standalone === true);
    };
    checkPWA();
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener(checkPWA);
    
    return () => mediaQuery.removeListener(checkPWA);
  }, []);

  // Add keyboard escape for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && onFullscreenChange) {
        onFullscreenChange(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  // Stats data
  const totalDots = dots.length;
  const totalWheels = wheels.length;
  const totalChakras = 0; // wheels.filter((w: any) => w.chakraId).length;
  
  const displayDots = dots;
  const displayWheels = wheels;

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-xl border-2 border-amber-200 shadow-lg overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-4 z-50' : 'h-[700px] min-h-[700px]'
        }`}
      >
        {/* Stats badges - top left exactly like preview mode */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            {totalDots} Dots
          </Badge>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            {totalWheels} Wheels
          </Badge>
          <Badge variant="secondary" className="bg-amber-200 text-amber-900 text-xs">
            {totalChakras} Chakras
          </Badge>
        </div>

        {/* Maximize button - top right exactly like preview mode */}
        <div className="absolute top-4 right-4 z-20">
          <Button 
            onClick={() => onFullscreenChange && onFullscreenChange(!isFullscreen)}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/80 backdrop-blur border-amber-200 hover:bg-amber-50"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>

        {/* Zoom and navigation controls - bottom left exactly like preview mode */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg p-2 border border-amber-200">
          <Button 
            onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-xs"
          >
            -
          </Button>
          <span className="text-xs font-medium min-w-[50px] text-center px-2">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-xs"
          >
            +
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <Button 
            onClick={() => setOffset({ x: 0, y: 0 })}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            title="Reset Position"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>

        {/* Interactive grid container with drag support and proper padding */}
        <div 
          ref={gridContainerRef}
          className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ 
            transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: 'center center',
            minHeight: '800px', // Ensure enough space for all content
            paddingBottom: '100px' // Add bottom padding to prevent cutoff
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Render dots exactly like PreviewMapGrid */}
          {displayDots.map((dot: any, index: number) => {
            // Position dots in grid pattern
            let x, y;
            
            if (dot.wheelId && dot.wheelId !== '' && dot.wheelId !== 'general') {
              const wheel = displayWheels.find((w: any) => w.id === dot.wheelId);
              if (wheel) {
                const dotsInWheel = displayDots.filter((d: any) => d.wheelId === dot.wheelId);
                const dotIndexInWheel = dotsInWheel.findIndex((d: any) => d.id === dot.id);
                
                const wheelCenterX = wheel.position?.x || (300 + (index % 3) * 200);
                const wheelCenterY = wheel.position?.y || (250 + Math.floor(index / 3) * 180);
                const dotRadius = calculateDynamicSizing('real', dotsInWheel.length, 'dots');
                const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                
                x = wheelCenterX + Math.cos(angle) * dotRadius;
                y = wheelCenterY + Math.sin(angle) * dotRadius;
              } else {
                // Fallback positioning with better spacing
                const gridCols = Math.ceil(Math.sqrt(displayDots.length));
                const row = Math.floor(index / gridCols);
                const col = index % gridCols;
                x = 120 + (col * 150);
                y = 120 + (row * 120); // Reduced vertical spacing
              }
            } else {
              // Individual scattered dots or general wheel dots with better spacing
              const gridCols = Math.ceil(Math.sqrt(displayDots.length));
              const row = Math.floor(index / gridCols);
              const col = index % gridCols;
              x = 120 + (col * 150);
              y = 120 + (row * 120); // Reduced vertical spacing to fit more dots
            }
            
            return (
              <div key={dot.id} className="relative">
                {/* Dot with exact styling from preview mode */}
                <div
                  className="absolute w-12 h-12 rounded-full cursor-pointer transition-all duration-300 hover:scale-125 hover:shadow-lg group dot-element z-[5]"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    background: dot.captureMode === 'ai' 
                      ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' // Purple for AI mode
                      : 'linear-gradient(135deg, #F59E0B, #D97706)', // Amber for natural mode
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const isMobile = window.innerWidth < 768;
                    if (isPWA || isMobile) {
                      setSelectedDot(dot);
                    } else {
                      setViewFullDot(dot);
                    }
                    setHoveredDot(null);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoveredDot(dot)}
                  onMouseLeave={() => setHoveredDot(null)}
                >
                  {/* Pulse animation for voice dots */}
                  {dot.sourceType === 'voice' && (
                    <div className="absolute inset-0 rounded-full bg-amber-400 opacity-50 animate-ping" />
                  )}
                  
                  {/* Dot content */}
                  <div className="relative w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      {dot.sourceType === 'voice' ? (
                        <Mic className="w-4 h-4 text-white" />
                      ) : (
                        <Type className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Hover card exactly like preview mode */}
                {hoveredDot?.id === dot.id && (
                  <div 
                    className="absolute bg-white/95 backdrop-blur border-2 border-amber-200 rounded-lg p-3 shadow-2xl w-64 cursor-pointer"
                    style={{
                      left: isPWA ? '60px' : `${x + 60}px`,
                      top: isPWA ? '-20px' : `${Math.max(0, y - 20)}px`,
                      maxWidth: '280px',
                      zIndex: 99999999,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFullDot(dot);
                      setHoveredDot(null);
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${
                          dot.sourceType === 'voice' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {dot.sourceType}
                        </Badge>
                        {dot.captureMode === 'ai' && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>
                        )}
                        <Badge className="bg-gray-100 text-gray-700 text-xs">
                          {dot.pulse}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-lg text-amber-800 border-b border-amber-200 pb-2 mb-3">
                        {dot.oneWordSummary}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {dot.summary}
                      </p>
                      <div className="text-xs text-amber-600 mt-2 font-medium">
                        Click for full view
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Render wheels exactly like preview mode */}
          {displayWheels.map((wheel: any) => {
            const wheelDots = displayDots.filter((d: any) => d.wheelId === wheel.id);
            const wheelRadius = calculateDynamicSizing('real', wheelDots.length, 'wheels');
            
            return (
              <div key={wheel.id} className="relative">
                {/* Wheel circle */}
                <div
                  className="absolute rounded-full border-2 border-orange-400/60 bg-orange-50/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-orange-500"
                  style={{
                    left: `${(wheel.position?.x || 300) - wheelRadius}px`,
                    top: `${(wheel.position?.y || 250) - wheelRadius}px`,
                    width: `${wheelRadius * 2}px`,
                    height: `${wheelRadius * 2}px`,
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewFullWheel && setViewFullWheel(wheel);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoveredWheel(wheel)}
                  onMouseLeave={() => setHoveredWheel(null)}
                >
                  {/* Wheel label */}
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <div className="text-center">
                      <div className="text-xs font-bold text-orange-800 line-clamp-2">
                        {wheel.name}
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        {wheelDots.length} dots
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Wheel hover card */}
                {hoveredWheel?.id === wheel.id && (
                  <div 
                    className="absolute bg-white/95 backdrop-blur border-2 border-orange-200 rounded-lg p-3 shadow-2xl w-64 cursor-pointer z-[99999998]"
                    style={{
                      left: `${(wheel.position?.x || 300) + wheelRadius + 20}px`,
                      top: `${Math.max(0, (wheel.position?.y || 250) - 50)}px`,
                      maxWidth: '280px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFullWheel && setViewFullWheel(wheel);
                      setHoveredWheel(null);
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          Wheel
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700 text-xs">
                          {wheelDots.length} dots
                        </Badge>
                      </div>
                      <h4 className="font-bold text-lg text-orange-800 border-b border-orange-200 pb-2 mb-3">
                        {wheel.name}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {wheel.goals || wheel.purpose}
                      </p>
                      <div className="text-xs text-orange-600 mt-2 font-medium">
                        Click for full view
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
        {/* Flash card view for mobile/PWA exactly like preview mode */}
        {selectedDot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <Badge className={`${
                  selectedDot.sourceType === 'voice' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {selectedDot.sourceType}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDot(null)}
                  className="h-6 w-6 p-0"
                >
                  ✕
                </Button>
              </div>
              <h3 className="text-xl font-bold text-amber-800 mb-3">{selectedDot.oneWordSummary}</h3>
              <p className="text-gray-700 mb-4">{selectedDot.summary}</p>
              <div className="text-sm text-gray-500">
                {selectedDot.anchor && <p className="mb-2"><strong>Context:</strong> {selectedDot.anchor}</p>}
                <p><strong>Pulse:</strong> {selectedDot.pulse}</p>
              </div>
            </div>
          </div>
        )}


      </div>
    );
  };

interface UserGridProps {
  userId?: number;
  mode: 'real' | 'preview';
  wheels?: any[];
  dots?: any[];
  setViewFullWheel?: (wheel: any | null) => void;
  setViewFullDot?: (dot: any | null) => void;
  previewMode?: boolean;
  setPreviewMode?: (previewMode: boolean) => void;
}

const UserGrid: React.FC<UserGridProps> = ({ 
  userId, 
  mode, 
  wheels: propsWheels, 
  dots: propsDots, 
  setViewFullWheel = () => {}, 
  setViewFullDot = () => {}, 
  previewMode = false, 
  setPreviewMode = () => {} 
}) => {
  const [showCreation, setShowCreation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showFloatingDot, setShowFloatingDot] = useState(false);

  
  // Add refs for grid controls
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Enhanced user dots fetching with backend session support
  const { data: userDots = [], isLoading: dotsLoading } = useQuery({
    queryKey: ['/api/user-content/dots', userId, mode],
    queryFn: async () => {
      try {
        console.log('🔍 UserGrid fetching dots for user:', userId, 'mode:', mode);
        
        if (mode === 'preview') {
          // Preview mode - use preview endpoint
          const previewResponse = await fetch('/api/dots?preview=true', {
            credentials: 'include'
          });
          if (previewResponse.ok) {
            return await previewResponse.json();
          }
          return [];
        }
        
        // Real mode - fetch user-specific dots
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
        
        // Add user ID header for user-specific filtering
        if (userId) {
          headers['x-user-id'] = userId.toString();
        }
        
        const response = await fetch('/api/user-content/dots', {
          credentials: 'include',
          headers
        });
        
        console.log('📊 UserGrid dots response:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ UserGrid dots fetched for user', userId, ':', data.length, 'dots');
          return data;
        }
        
        return [];
      } catch (error) {
        console.error('UserGrid dots fetch error:', error);
        return [];
      }
    },
    enabled: true, // Always try to fetch
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component mount if we have cached data
    refetchOnReconnect: false, // Don't refetch on network reconnection
  }) as { data: any[], isLoading: boolean };

  // Fetch user's wheels and chakras with aggressive caching  
  const { data: userWheels = [], isLoading: wheelsLoading } = useQuery({
    queryKey: ['/api/user-content/wheels', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const response = await fetch('/api/user-content/wheels', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'x-user-id': userId.toString()
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ UserGrid wheels fetched for user', userId, ':', data.length, 'wheels');
          return data;
        }
        return [];
      } catch (error) {
        console.error('UserGrid wheels fetch error:', error);
        return [];
      }
    },
    enabled: mode === 'real' && !!userId, // Only fetch when authenticated
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnWindowFocus: false, 
    refetchOnMount: false, // Don't refetch on component mount if we have cached data
    refetchOnReconnect: false,
  }) as { data: any[], isLoading: boolean };

  // Fetch user's statistics with retry logic
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user-content/stats', userId],
    queryFn: async () => {
      if (!userId) return {};
      
      try {
        const response = await fetch('/api/user-content/stats', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'x-user-id': userId.toString()
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ UserGrid stats fetched for user', userId, ':', data);
          return data;
        }
        return {};
      } catch (error) {
        console.error('UserGrid stats fetch error:', error);
        return {};
      }
    },
    enabled: mode === 'real' && !!userId, // Only fetch when authenticated
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  const isLoading = dotsLoading || wheelsLoading || statsLoading;

  // Separate wheels and chakras
  const regularWheels = Array.isArray(userWheels) ? userWheels.filter((w: any) => w.chakraId !== null) : [];
  const chakras = Array.isArray(userWheels) ? userWheels.filter((w: any) => w.chakraId === null) : [];

  if (mode === 'preview') {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Preview Mode Active</h3>
        <p className="text-gray-600">
          This is demonstration data. Sign in and activate DotSpark to create your own content.
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">Authentication Required</h3>
        <p className="text-gray-600">
          Please sign in to create and view your personal dots, wheels, and chakras.
        </p>
      </div>
    );
  }

  if (showCreation) {
    return (
      <UserContentCreation
        availableWheels={regularWheels}
        availableChakras={chakras}
        onSuccess={() => setShowCreation(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="ml-2 text-amber-800">Loading your content...</span>
      </div>
    );
  }

  // Debug logging for dots display issue
  console.log('UserGrid dots debugging:', {
    userDotsLength: userDots.length,
    userWheelsLength: userWheels.length,
    userDots: userDots.map(d => ({ id: d.id, summary: d.oneWordSummary })),
    isLoading,
    userId
  });

  const isEmpty = Array.isArray(userDots) && Array.isArray(userWheels) && userDots.length === 0 && userWheels.length === 0;

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-amber-800 mb-2">Start Your DotSpark Journey</h3>
          <p className="text-gray-600 mb-6">
            Create your first dot, wheel, or chakra to begin organizing your thoughts and insights.
          </p>
          <Button 
            onClick={() => setShowCreation(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Thought
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Use exact DotWheelsMap component from Dashboard with user data */}
      <DotWheelsMap 
        wheels={userWheels}
        dots={userDots}
        showingRecentFilter={false}
        recentCount={4}
        isFullscreen={false}
        onFullscreenChange={() => {}}
        setViewFullWheel={setViewFullWheel}
        previewMode={false}
        setPreviewMode={() => {}}
        setViewFullDot={setViewFullDot}
      />
      
      {/* Debug: Show raw dots count */}
      <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
        Debug: UserGrid has {userDots.length} dots fetched from API
      </div>

      {/* Keep detail modal for individual items */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{selectedItem.name || selectedItem.summary}</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Floating Dot Interface - Directly open expanded mode */}
      {showFloatingDot && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-amber-800">Create New Dot</h2>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFloatingDot(false)}
                  >
                    ✕
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}


    </div>
  );
};

export default UserGrid;