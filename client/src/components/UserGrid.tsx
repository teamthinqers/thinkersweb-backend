import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, Settings, RotateCcw, Mic, Type, Maximize, Minimize } from 'lucide-react';
import UserContentCreation from './UserContentCreation';
import { GlobalFloatingDot } from '@/components/dotspark/GlobalFloatingDot';
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

// Exact DotWheelsMap component from Dashboard
const DotWheelsMap: React.FC<DotWheelsMapProps> = ({ 
  wheels, 
  dots, 
  showingRecentFilter = false, 
  recentCount = 4,
  isFullscreen = false,
  onFullscreenChange,
  setViewFullWheel,
  previewMode,
  setPreviewMode
}) => {
  const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
  const [viewFullDot, setViewFullDot] = useState<any | null>(null);
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

  // Stats data
  const totalDots = dots.length;
  const totalWheels = wheels.length;
  const totalChakras = wheels.filter((w: any) => !w.chakraId).length;
  
  const displayDots = dots;
  const displayWheels = wheels;

  return (
    <div className="space-y-4">
      <div 
        className={`relative bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-xl border-2 border-amber-200 shadow-lg overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'fixed inset-4 z-50' : 'h-[600px]'
        }`}
      >
        {/* Stats badges - positioned like preview mode */}
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

        {/* Controls - positioned like preview mode */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Fullscreen toggle */}
          <Button 
            onClick={() => onFullscreenChange && onFullscreenChange(!isFullscreen)}
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
          >
            {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
          </Button>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-white/80 rounded-lg p-2">
          <Button 
            onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
          >
            -
          </Button>
          <span className="text-xs font-medium min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
          >
            +
          </Button>
        </div>

        {/* Interactive grid container */}
        <div 
          ref={gridContainerRef}
          className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ 
            transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Render dots exactly like Dashboard */}
          {displayDots.map((dot: any, index: number) => {
            // Position dots in grid pattern for real mode
            let x, y;
            
            if (dot.wheelId && dot.wheelId !== '') {
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
                const gridCols = Math.ceil(Math.sqrt(displayDots.length));
                const row = Math.floor(index / gridCols);
                const col = index % gridCols;
                x = 120 + (col * 150);
                y = 120 + (row * 150);
              }
            } else {
              // Individual scattered dots
              const gridCols = Math.ceil(Math.sqrt(displayDots.length));
              const row = Math.floor(index / gridCols);
              const col = index % gridCols;
              x = 120 + (col * 150);
              y = 120 + (row * 150);
            }
            
            return (
              <div key={dot.id} className="relative">
                {/* Dot */}
                <div
                  className="absolute w-12 h-12 rounded-full cursor-pointer transition-all duration-300 hover:scale-125 hover:shadow-lg group dot-element z-[5]"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
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
                
                {/* Summary hover card */}
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
        </div>

        {/* Flash card view for mobile/PWA */}
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

        {/* Full dot view modal */}
        {viewFullDot && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{viewFullDot.oneWordSummary}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewFullDot(null)}
                  className="absolute top-4 right-4"
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge className={`${
                      viewFullDot.sourceType === 'voice' ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {viewFullDot.sourceType}
                    </Badge>
                    <Badge variant="outline">{viewFullDot.pulse}</Badge>
                  </div>
                  <p className="text-gray-700">{viewFullDot.summary}</p>
                  {viewFullDot.anchor && (
                    <div>
                      <h4 className="font-semibold mb-2">Context:</h4>
                      <p className="text-gray-600">{viewFullDot.anchor}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

interface UserGridProps {
  userId?: number;
  mode: 'real' | 'preview';
}

const UserGrid: React.FC<UserGridProps> = ({ userId, mode }) => {
  const [showCreation, setShowCreation] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showFloatingDot, setShowFloatingDot] = useState(false);
  
  // Add refs for grid controls
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user's dots
  const { data: userDots = [], isLoading: dotsLoading } = useQuery({
    queryKey: ['/api/user-content/dots'],
    enabled: mode === 'real' && !!userId
  });

  // Fetch user's wheels and chakras
  const { data: userWheels = [], isLoading: wheelsLoading } = useQuery({
    queryKey: ['/api/user-content/wheels'],
    enabled: mode === 'real' && !!userId
  });

  // Fetch user's statistics
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user-content/stats'],
    enabled: mode === 'real' && !!userId
  });

  const isLoading = dotsLoading || wheelsLoading || statsLoading;

  // Separate wheels and chakras
  const regularWheels = userWheels.filter((w: any) => w.chakraId !== null);
  const chakras = userWheels.filter((w: any) => w.chakraId === null);

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

  const isEmpty = userDots.length === 0 && userWheels.length === 0;

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
            Create Your First Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create button above the grid */}
      <div className="flex justify-between items-center">
        <div></div>
        <Button 
          onClick={() => setShowFloatingDot(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      {/* Use exact DotWheelsMap component from Dashboard */}
      <DotWheelsMap 
        wheels={regularWheels}
        dots={userDots}
        showingRecentFilter={false}
        recentCount={4}
        isFullscreen={false}
        onFullscreenChange={() => {}}
        setViewFullWheel={() => {}}
        previewMode={false}
        setPreviewMode={() => {}}
      />

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
                <GlobalFloatingDot isActive={true} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserGrid;