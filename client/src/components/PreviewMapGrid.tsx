import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize, Minimize, Mic, Type, ZoomIn, ZoomOut } from "lucide-react";

// Same interfaces as Dashboard
interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId?: string;
  timestamp: Date;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai';
  voiceData?: {
    summaryVoiceUrl?: string;
    anchorVoiceUrl?: string;
    pulseVoiceUrl?: string;
  } | null;
  position?: { x: number; y: number };
}

interface Wheel {
  id: string;
  name: string;
  heading?: string;
  goals?: string;
  purpose?: string;
  timeline?: string;
  category: string;
  color: string;
  dots: Dot[];
  connections: string[];
  position: { x: number; y: number };
  radius?: number;
  chakraId?: string;
  createdAt?: Date;
}

interface PreviewMapGridProps {
  setViewFullWheel: (wheel: Wheel | null) => void;
  setViewFlashCard: (dot: Dot | null) => void;
}

export const PreviewMapGrid: React.FC<PreviewMapGridProps> = ({
  setViewFullWheel,
  setViewFlashCard
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.6);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<Dot | null>(null);
  const [hoveredWheel, setHoveredWheel] = useState<Wheel | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Fetch preview data
  const { data: previewDots = [], isLoading: dotsLoading } = useQuery({
    queryKey: ['/api/dots', { preview: true }],
    queryFn: () => fetch('/api/dots?preview=true').then(res => res.json())
  });

  const { data: previewWheels = [], isLoading: wheelsLoading } = useQuery({
    queryKey: ['/api/wheels', { preview: true }],
    queryFn: () => fetch('/api/wheels?preview=true').then(res => res.json())
  });

  // Fetch grid positions for proper positioning
  const { data: gridPositions } = useQuery({
    queryKey: ['/api/grid/positions'],
    queryFn: () => fetch('/api/grid/positions').then(res => res.json()).then(data => data.data)
  });

  // Dynamic sizing calculations (copied from Dashboard)
  const calculateDynamicSizing = (mode: 'preview' | 'real', itemCount: number, type: 'dots' | 'wheels') => {
    const baseSizes = {
      preview: { dots: 25, wheels: 80 },
      real: { dots: 35, wheels: 90 }
    };
    
    const baseSize = baseSizes[mode][type];
    
    if (type === 'dots') {
      if (itemCount <= 3) return baseSize;
      if (itemCount <= 6) return baseSize - 3;
      if (itemCount <= 9) return baseSize - 5;
      return Math.max(baseSize - 8, 20);
    } else {
      if (itemCount <= 3) return baseSize;
      if (itemCount <= 6) return baseSize - 5;
      if (itemCount <= 9) return baseSize - 10;
      return Math.max(baseSize - 15, 60);
    }
  };

  const getChakraSize = (mode: 'preview' | 'real', childWheelsCount: number) => {
    const baseSizes = { preview: 420, real: 370 };
    const baseSize = baseSizes[mode];
    
    if (childWheelsCount <= 3) return baseSize;
    if (childWheelsCount <= 5) return baseSize + 20;
    if (childWheelsCount <= 8) return baseSize + 35;
    return baseSize + 50;
  };

  // Reset view function
  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(0.6);
  };

  // Enhanced drag handlers (copied from Dashboard)
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-wheel-label]') || target.closest('.pointer-events-auto')) {
      return;
    }
    e.preventDefault();
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    e.preventDefault();
    e.stopPropagation();
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.dot-element')) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStart || !e.touches[0]) return;
    e.preventDefault();
    const touch = e.touches[0];
    
    const newOffset = {
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    };
    
    setOffset(newOffset);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
  };

  if (dotsLoading || wheelsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  // Use preview data directly (already has proper positioning from database)
  const displayDots = previewDots;
  const displayWheels = previewWheels;

  return (
    <div className={`relative bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-xl border-2 border-amber-200 shadow-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[500px]'
    }`}>
      {/* Preview Mode Badge */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
        <Badge className="bg-purple-100 text-purple-800 px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm font-medium">
          Preview Mode
        </Badge>
      </div>

      {/* Zoom Controls */}
      <div className={`${isFullscreen ? 'fixed' : 'absolute'} z-10 flex items-center bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 shadow-lg ${
        isFullscreen ? 'bottom-6 left-6 gap-2 p-2' : 'bottom-4 left-4 gap-2 p-2'
      }`}>
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors p-2"
          title="Zoom Out"
        >
          <ZoomOut className="w-3 h-3" />
        </button>
        <span className="text-xs text-amber-800 px-2 font-medium min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors p-2"
          title="Zoom In"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
        <div className="w-px h-6 bg-amber-200 mx-1"></div>
        <button
          onClick={resetView}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors p-2"
          title="Reset View"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Fullscreen Toggle */}
      {!isFullscreen && (
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-lg p-2"
            title="Enter Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Interactive grid - complete sophisticated system from Dashboard */}
      <div 
        ref={gridContainerRef}
        className={`relative ${
          isFullscreen 
            ? 'h-screen w-screen' 
            : 'h-[450px] w-full'
        } overflow-hidden cursor-grab active:cursor-grabbing`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        {/* Fullscreen exit button */}
        {isFullscreen && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFullscreen(false);
            }}
            className="fixed bottom-6 right-6 z-[100] bg-red-500 hover:bg-red-600 text-white rounded-full p-4 transition-colors shadow-2xl border-2 border-red-400"
            title="Exit Fullscreen (ESC)"
            style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
          >
            <Minimize className="w-4 h-4" />
          </button>
        )}

        <div 
          className="relative transition-transform duration-100 ease-out"
          style={{ 
            width: `${1200 * zoom}px`, 
            height: `${800 * zoom}px`,
            minWidth: 'auto',
            minHeight: 'auto',
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Individual Dots - using exact positioning logic from Dashboard */}
          {displayDots.map((dot: any, index: number) => {
            // Use algorithmic positioning from backend API when available, fallback to manual calculation
            let x, y;
            
            if (gridPositions?.dotPositions && gridPositions.dotPositions[dot.id]) {
              // Use backend algorithmic positioning
              const position = gridPositions.dotPositions[dot.id];
              x = position.x;
              y = position.y;
            } else {
              // Fallback to manual positioning logic for dots not in API response
              const dotId = String(dot.id || index);
              const seedX = dotId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              const seedY = dotId.split('').reverse().reduce((a, b) => a + b.charCodeAt(0), 0);
              
              // Preview mode positioning (always use preview mode in this component)
              if (dot.wheelId && dot.wheelId !== '') {
                // Find the wheel this dot belongs to
                const wheel = displayWheels.find((w: any) => w.id === dot.wheelId);
                if (wheel) {
                  // Find position within the wheel
                  const dotsInWheel = displayDots.filter((d: any) => d.wheelId === dot.wheelId);
                  const dotIndexInWheel = dotsInWheel.findIndex((d: any) => d.id === dot.id);
                  
                  // Position dots in a circle inside the wheel
                  const wheelCenterX = wheel.position.x;
                  const wheelCenterY = wheel.position.y;
                  const wheelRadius = 60;
                  const dotRadius = calculateDynamicSizing('preview', dotsInWheel.length, 'dots');
                  const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                  
                  x = wheelCenterX + Math.cos(angle) * dotRadius;
                  y = wheelCenterY + Math.sin(angle) * dotRadius;
                } else {
                  x = 100 + (seedX % 900) + (index * 67) % 400;
                  y = 100 + (seedY % 600) + (index * 83) % 300;
                }
              } else {
                // Individual scattered dots
                x = 80 + (seedX % 1000) + (index * 137) % 800;
                y = 80 + (seedY % 600) + (index * 97) % 500;
              }
            }
            
            return (
              <div key={dot.id} className="relative" style={{ zIndex: hoveredDot?.id === dot.id ? 99999998 : 10 }}>
                {/* Dot with enhanced hover area */}
                <div
                  className="absolute rounded-full cursor-pointer transition-all duration-300 hover:scale-125 hover:shadow-lg group dot-element"
                  style={{
                    left: `${x - 8}px`, // Expand hover area
                    top: `${y - 8}px`, // Expand hover area
                    width: '64px', // Larger hover area (was 48px)
                    height: '64px', // Larger hover area (was 48px)
                    pointerEvents: 'auto',
                    zIndex: hoveredDot?.id === dot.id ? 99999998 : 10 // Elevate hovered dot above all other dots
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setViewFlashCard(dot);
                    setHoveredDot(null);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setViewFlashCard(dot);
                    setHoveredDot(null);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation(); // Prevent chakra hover
                    setHoveredDot(dot);
                    setHoveredWheel(null); // Clear any wheel hover
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setHoveredDot(null);
                  }}
                >
                  {/* Actual dot visual (centered within hover area) */}
                  <div
                    className="absolute w-12 h-12 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)', // Light amber gradient for all dots
                    }}
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
                </div>
                
                {/* Summary hover card - positioned to overlay everything */}
                {hoveredDot?.id === dot.id && (
                  <div 
                    className="absolute bg-white/95 backdrop-blur border-2 border-amber-200 rounded-lg p-3 shadow-2xl w-72 cursor-pointer"
                    style={{
                      left: `${x + 70}px`, // Well positioned to side of dot
                      top: `${Math.max(10, y - 60)}px`, // Above dot with margin
                      maxWidth: '320px',
                      zIndex: 99999999, // Maximum z-index to override everything including chakras, wheels, and any other elements
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFlashCard(dot);
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
          
          {/* Wheel Flashcards */}
          {displayWheels.map((wheel: any, wheelIndex: number) => {
            // Use same positioning logic as wheels
            let wheelPosition;
            
            if (gridPositions?.wheelPositions && gridPositions.wheelPositions[wheel.id]) {
              wheelPosition = gridPositions.wheelPositions[wheel.id];
            } else if (gridPositions?.chakraPositions && gridPositions.chakraPositions[wheel.id]) {
              wheelPosition = gridPositions.chakraPositions[wheel.id];
            } else {
              wheelPosition = wheel.position;
            }
            
            const isChakra = wheel.chakraId === undefined;
            
            // Calculate wheel size for flashcard positioning
            let wheelSize;
            if (isChakra) {
              const childWheels = displayWheels.filter((w: any) => w.chakraId === wheel.id);
              wheelSize = getChakraSize('preview', childWheels.length);
            } else {
              const wheelDots = displayDots.filter((d: any) => d.wheelId === wheel.id);
              wheelSize = calculateDynamicSizing('preview', wheelDots.length, 'wheels') * 2;
            }
            
            // Calculate the actual wheel label position - closer to wheels
            const labelX = wheelPosition.x;
            const wheelRadius = wheelSize / 2;
            const labelY = isChakra 
              ? (wheelPosition.y - wheelRadius) - 60  // Closer to chakra (was -95)
              : wheelPosition.y - 45; // Closer to wheel (was -75)
            
            return (
              <div key={`flashcard-${wheel.id}`}>
                {/* Wheel Flash Card - positioned to overlay everything */}
                {hoveredWheel?.id === wheel.id && (
                  <div 
                    className="absolute bg-white border-2 border-amber-200 rounded-lg p-3 shadow-2xl w-72 cursor-pointer"
                    style={{
                      left: `${labelX + 80}px`, // Well positioned to side of label
                      top: `${Math.max(10, labelY - 20)}px`, // Above label with margin
                      maxWidth: '320px',
                      zIndex: 999998, // High z-index, but below dots
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFullWheel(wheel);
                      setHoveredWheel(null);
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${
                          isChakra ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isChakra ? 'Chakra' : 'Wheel'}
                        </Badge>
                        {wheel.timeline && (
                          <Badge className="bg-gray-100 text-gray-700 text-xs">
                            {wheel.timeline}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-lg text-amber-800 border-b border-amber-200 pb-2 mb-3">
                        {wheel.heading || wheel.name}
                      </h4>
                      {wheel.goals && (
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {wheel.goals}
                        </p>
                      )}
                      <div className="text-xs text-amber-600 mt-2 font-medium">
                        Click for full view
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Wheel Boundaries - Complete sophisticated wheel/chakra rendering */}
          {displayWheels.map((wheel: any, wheelIndex: number) => {
            // Use algorithmic positioning from backend API when available, fallback to manual positioning
            let wheelPosition;
            
            if (gridPositions?.wheelPositions && gridPositions.wheelPositions[wheel.id]) {
              wheelPosition = gridPositions.wheelPositions[wheel.id];
            } else if (gridPositions?.chakraPositions && gridPositions.chakraPositions[wheel.id]) {
              wheelPosition = gridPositions.chakraPositions[wheel.id];
            } else {
              wheelPosition = wheel.position;
            }
            
            // Determine wheel size based on type and hierarchy using dynamic sizing
            let wheelSize;
            let isChakra;
            
            // In preview mode, use dynamic sizing logic - chakras are identified by having no chakraId
            isChakra = wheel.chakraId === undefined;
            if (isChakra) {
              // Dynamic chakra sizing based on child wheels count
              const childWheels = displayWheels.filter((w: any) => w.chakraId === wheel.id);
              wheelSize = getChakraSize('preview', childWheels.length);
            } else {
              // Dynamic wheel sizing based on dots count
              const wheelDots = displayDots.filter((d: any) => d.wheelId === wheel.id);
              wheelSize = calculateDynamicSizing('preview', wheelDots.length, 'wheels') * 2;
            }
            
            const wheelRadius = wheelSize / 2;
            
            return (
              <div
                key={wheel.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${wheelPosition.x - wheelRadius}px`,
                  top: `${wheelPosition.y - wheelRadius}px`,
                  width: `${wheelSize}px`,
                  height: `${wheelSize}px`,
                  zIndex: 1 // Lower z-index so dots can appear above
                }}
              >
                {/* Enhanced Chakra/Wheel boundary - NO HOVER EVENTS */}
                {isChakra ? (
                  /* Advanced Chakra Effect with Multiple Energy Rings */
                  <div className="relative w-full h-full">
                    {/* Outer energy ring - rotating slowly */}
                    <div 
                      className="absolute inset-0 rounded-full opacity-30 animate-spin"
                      style={{ 
                        background: `conic-gradient(from 0deg, ${wheel.color}00, ${wheel.color}80, ${wheel.color}00, ${wheel.color}80, ${wheel.color}00)`,
                        animationDuration: '20s'
                      }}
                    />
                    
                    {/* Middle energy ring - pulsing */}
                    <div 
                      className="absolute inset-2 rounded-full opacity-40 animate-pulse"
                      style={{ 
                        background: `radial-gradient(circle, ${wheel.color}40, transparent 70%)`,
                        animationDuration: '3s'
                      }}
                    />
                    
                    {/* Inner core - steady glow */}
                    <div 
                      className="absolute inset-4 rounded-full opacity-50"
                      style={{ 
                        background: `radial-gradient(circle, ${wheel.color}60, transparent 60%)`,
                        boxShadow: `0 0 20px ${wheel.color}40`
                      }}
                    />
                    
                    {/* Chakra boundary circle - VISUAL ONLY, NO HOVER */}
                    <div 
                      className="absolute inset-0 rounded-full border-4 border-dashed pointer-events-none transition-all duration-300"
                      style={{ 
                        borderColor: wheel.color || '#B45309',
                        backgroundColor: 'rgba(180, 83, 9, 0.05)'
                      }}
                    />
                  </div>
                ) : (
                  /* Regular Wheel boundary - VISUAL ONLY, NO HOVER */
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-dashed transition-all duration-300 pointer-events-none"
                    style={{ borderColor: wheel.color || '#EA580C' }}
                  />
                )}
                
                {/* Wheel/Chakra Label - positioned closer with enhanced hover */}
                <div
                  className="absolute pointer-events-auto cursor-pointer z-50"
                  style={{
                    left: '50%',
                    top: isChakra ? '-60px' : '-45px', // Closer to wheels/chakras
                    transform: 'translateX(-50%)',
                    zIndex: 999
                  }}
                  data-wheel-label="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewFullWheel(wheel);
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setHoveredWheel(wheel);
                    setHoveredDot(null); // Clear any dot hover
                  }}
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    setHoveredWheel(null);
                  }}
                >
                  <div className={`px-4 py-2 rounded-lg text-center shadow-lg border-2 transition-all duration-300 hover:scale-105 ${
                    isChakra 
                      ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-orange-300 text-orange-800'
                      : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-800'
                  }`}>
                    <div className="font-bold text-sm whitespace-nowrap">
                      {wheel.heading || wheel.name}
                    </div>
                    {isChakra && (
                      <div className="text-xs opacity-75 font-medium mt-1">
                        CHAKRA
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10 flex gap-2">
        <Badge className="bg-white/90 backdrop-blur text-amber-800 border-amber-200">
          26 Dots
        </Badge>
        <Badge className="bg-white/90 backdrop-blur text-orange-800 border-orange-200">
          5 Wheels
        </Badge>
        <Badge className="bg-white/90 backdrop-blur text-amber-800 border-amber-200">
          2 Chakras
        </Badge>
      </div>
    </div>
  );
};