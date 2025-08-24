import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, Settings, RotateCcw, Mic, Type, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import UserContentCreation from './UserContentCreation';
import DotFullView from './DotFullView';
import DotFlashCard from './DotFlashCard';
import WheelFullView from './WheelFullView';

// Interfaces matching PreviewMapGrid exactly
interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId?: string | null;
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

interface UserMapGridProps {
  setViewFullWheel: (wheel: Wheel | null) => void;
  setViewFlashCard: (dot: Dot | null) => void;
  setViewFullDot: (dot: Dot | null) => void;
  dots: Dot[];
  wheels: Wheel[];
  chakras: Wheel[];
  isLoading: boolean;
}

// Dynamic sizing calculations exactly like PreviewMapGrid
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

// UserMapGrid component matching PreviewMapGrid exactly
const UserMapGrid: React.FC<UserMapGridProps> = ({
  setViewFullWheel,
  setViewFlashCard, 
  setViewFullDot,
  dots,
  wheels,
  chakras,
  isLoading
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.6);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<Dot | null>(null);
  const [hoveredWheel, setHoveredWheel] = useState<Wheel | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Fetch grid positions for proper positioning
  const { data: gridPositions } = useQuery({
    queryKey: ['/api/grid/positions'],
    queryFn: () => fetch('/api/grid/positions').then(res => res.json()).then(data => data.data)
  });

  // Reset view function
  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(0.6);
  };

  // Enhanced drag handlers exactly like PreviewMapGrid
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user content...</p>
        </div>
      </div>
    );
  }

  // Use user data directly
  const displayDots = dots;
  const displayWheels = wheels;

  return (
    <div className={`relative bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-xl border-2 border-amber-200 shadow-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[500px]'
    }`}>
      {/* User Mode Badge */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
        <Badge className="bg-amber-100 text-amber-800 px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm font-medium">
          User Mode
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
          {/* Individual Dots - well distributed grid for easy identification */}
          {displayDots.map((dot: any, index: number) => {
            let x, y;
            
            // Check if dot belongs to a wheel
            if (dot.wheelId && dot.wheelId !== '' && dot.wheelId !== 'general') {
              const wheel = displayWheels.find((w: any) => w.id === dot.wheelId);
              if (wheel) {
                // Position dots around their associated wheel in a circle
                const dotsInWheel = displayDots.filter((d: any) => d.wheelId === dot.wheelId);
                const dotIndexInWheel = dotsInWheel.findIndex((d: any) => d.id === dot.id);
                const wheelCenterX = wheel.position?.x || 300;
                const wheelCenterY = wheel.position?.y || 250;
                const dotRadius = 60; // Fixed radius for dots around wheels
                const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                
                x = wheelCenterX + Math.cos(angle) * dotRadius;
                y = wheelCenterY + Math.sin(angle) * dotRadius;
              } else {
                // Wheel not found, treat as unassociated
                const unassociatedDots = displayDots.filter((d: any) => !d.wheelId || d.wheelId === '' || d.wheelId === 'general');
                const unassociatedIndex = unassociatedDots.findIndex((d: any) => d.id === dot.id);
                const cols = Math.ceil(Math.sqrt(unassociatedDots.length));
                const row = Math.floor(unassociatedIndex / cols);
                const col = unassociatedIndex % cols;
                x = 80 + (col * 100);
                y = 80 + (row * 80);
              }
            } else {
              // Unassociated dots - create a clean grid in the top-left area
              const unassociatedDots = displayDots.filter((d: any) => !d.wheelId || d.wheelId === '' || d.wheelId === 'general');
              const unassociatedIndex = unassociatedDots.findIndex((d: any) => d.id === dot.id);
              const cols = Math.ceil(Math.sqrt(unassociatedDots.length));
              const row = Math.floor(unassociatedIndex / cols);
              const col = unassociatedIndex % cols;
              x = 80 + (col * 100);
              y = 80 + (row * 80);
            }
            
            return (
              <div key={dot.id} className="relative">
                {/* Dot element with exact styling from PreviewMapGrid */}
                <div
                  className="absolute w-8 h-8 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md dot-element group"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    background: dot.captureMode === 'ai' 
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                      : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    pointerEvents: 'auto',
                    zIndex: 10
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewFlashCard(dot);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoveredDot(dot)}
                  onMouseLeave={() => setHoveredDot(null)}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
                    {dot.oneWordSummary.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Source type indicator */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    {dot.sourceType === 'voice' ? (
                      <Mic className="w-2 h-2 text-amber-600" />
                    ) : (
                      <Type className="w-2 h-2 text-amber-600" />
                    )}
                  </div>
                </div>
                
                {/* Dot Hover Card - exact same styling as PreviewMapGrid */}
                {hoveredDot?.id === dot.id && (
                  <div 
                    className="absolute bg-white/95 backdrop-blur-sm border border-amber-200 rounded-lg p-3 shadow-lg z-[1000] cursor-pointer"
                    style={{
                      left: `${x + 35}px`,
                      top: `${Math.max(10, y - 20)}px`,
                      width: '240px',
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setViewFlashCard(dot);
                      setHoveredDot(null);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-amber-800 text-sm truncate">
                          {dot.oneWordSummary}
                        </h4>
                        <div className="flex gap-1">
                          <Badge className={`text-xs px-1.5 py-0.5 ${
                            dot.captureMode === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {dot.sourceType === 'voice' ? <Mic className="w-2 h-2" /> : <Type className="w-2 h-2" />}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                        {dot.summary}
                      </p>
                      <div className="flex justify-between items-center pt-1">
                        <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                          {dot.pulse}
                        </Badge>
                        <span className="text-amber-600 text-xs font-medium">
                          Click for flash card
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Render wheels with improved distribution */}
          {displayWheels.map((wheel: any, wheelIndex: number) => {
            const wheelDots = displayDots.filter((d: any) => d.wheelId === wheel.id);
            const wheelRadius = calculateDynamicSizing('real', wheelDots.length, 'wheels');
            
            // Determine wheel position
            let wheelX, wheelY;
            if (wheel.chakraId) {
              // Position wheel around its associated chakra
              const chakra = chakras.find((c: any) => c.id === wheel.chakraId);
              if (chakra) {
                const wheelsInChakra = displayWheels.filter((w: any) => w.chakraId === wheel.chakraId);
                const wheelIndexInChakra = wheelsInChakra.findIndex((w: any) => w.id === wheel.id);
                const chakraX = chakra.position?.x || 600;
                const chakraY = chakra.position?.y || 400;
                const orbitRadius = 150; // Fixed radius for wheels around chakras
                const angle = (wheelIndexInChakra * 2 * Math.PI) / wheelsInChakra.length;
                
                wheelX = chakraX + Math.cos(angle) * orbitRadius;
                wheelY = chakraY + Math.sin(angle) * orbitRadius;
              } else {
                // Chakra not found, treat as unassociated
                const unassociatedWheels = displayWheels.filter((w: any) => !w.chakraId);
                const unassociatedIndex = unassociatedWheels.findIndex((w: any) => w.id === wheel.id);
                const cols = Math.ceil(Math.sqrt(unassociatedWheels.length));
                const row = Math.floor(unassociatedIndex / cols);
                const col = unassociatedIndex % cols;
                wheelX = 400 + (col * 200);
                wheelY = 150 + (row * 150);
              }
            } else {
              // Unassociated wheels - create a clean grid in the center-right area
              const unassociatedWheels = displayWheels.filter((w: any) => !w.chakraId);
              const unassociatedIndex = unassociatedWheels.findIndex((w: any) => w.id === wheel.id);
              const cols = Math.ceil(Math.sqrt(unassociatedWheels.length));
              const row = Math.floor(unassociatedIndex / cols);
              const col = unassociatedIndex % cols;
              wheelX = 400 + (col * 200);
              wheelY = 150 + (row * 150);
            }
            
            // Update wheel position for dot calculations
            wheel.position = { x: wheelX, y: wheelY };
            
            return (
              <div key={wheel.id} className="relative">
                {/* Wheel circle */}
                <div
                  className="absolute rounded-full border-2 border-orange-400/60 bg-orange-50/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-orange-500"
                  style={{
                    left: `${wheelX - wheelRadius}px`,
                    top: `${wheelY - wheelRadius}px`,
                    width: `${wheelRadius * 2}px`,
                    height: `${wheelRadius * 2}px`,
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewFullWheel(wheel);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoveredWheel(wheel)}
                  onMouseLeave={() => setHoveredWheel(null)}
                >
                  {/* Wheel label */}
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <div className="text-center">
                      <div className="text-xs font-bold text-orange-800 line-clamp-2">
                        {wheel.name || wheel.heading}
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
                      left: `${wheelX + wheelRadius + 20}px`,
                      top: `${Math.max(0, wheelY - 50)}px`,
                      maxWidth: '280px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFullWheel(wheel);
                      setHoveredWheel(null);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-orange-800 text-sm line-clamp-1">{wheel.name || wheel.heading}</h4>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                          Wheel
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                        {wheel.goals || wheel.purpose || 'Goal-oriented project'}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <Badge className="bg-orange-100 text-orange-700">
                          {wheelDots.length} dots
                        </Badge>
                        <span className="text-orange-600 font-medium">
                          Click for full view
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Render chakras with clear positioning */}
          {chakras.map((chakra: any, chakraIndex: number) => {
            const chakraWheels = displayWheels.filter((w: any) => w.chakraId === chakra.id);
            const chakraRadius = getChakraSize('real', chakraWheels.length);
            
            // Position chakras in the bottom-right area with good spacing
            const cols = Math.ceil(Math.sqrt(chakras.length));
            const row = Math.floor(chakraIndex / cols);
            const col = chakraIndex % cols;
            const chakraX = 600 + (col * 300);
            const chakraY = 400 + (row * 300);
            
            // Update chakra position for wheel calculations
            chakra.position = { x: chakraX, y: chakraY };
            
            return (
              <div key={chakra.id} className="relative">
                {/* Chakra circle */}
                <div
                  className="absolute rounded-full border-4 border-amber-500/50 bg-gradient-to-br from-amber-100/40 to-orange-100/40 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-amber-600/70"
                  style={{
                    left: `${chakraX - chakraRadius/2}px`,
                    top: `${chakraY - chakraRadius/2}px`,
                    width: `${chakraRadius}px`,
                    height: `${chakraRadius}px`,
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewFullWheel(chakra);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {/* Chakra label */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-amber-800 line-clamp-2 mb-2">
                        {chakra.name || chakra.heading}
                      </div>
                      <div className="text-xs text-amber-700">
                        {chakraWheels.length} wheels
                      </div>
                    </div>
                  </div>
                  
                  {/* Rotating ring animation */}
                  <div 
                    className="absolute inset-2 rounded-full border-2 border-amber-400/30 animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Main UserGrid component exactly like PreviewMapGrid structure
interface UserGridProps {
  mode?: 'preview' | 'real';
  userId?: number;
  isDemoMode?: boolean;
  availableWheels?: any[];
  availableChakras?: any[];
}

const UserGrid: React.FC<UserGridProps> = ({ 
  mode = 'real', 
  userId,
  isDemoMode = false,
  availableWheels = [],
  availableChakras = []
}) => {
  const [showCreation, setShowCreation] = useState(false);
  const [viewFullWheel, setViewFullWheel] = useState<Wheel | null>(null);
  const [viewFlashCard, setViewFlashCard] = useState<Dot | null>(null);
  const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);

  // Fetch user dots
  const { data: userDots = [], isLoading: dotsLoading } = useQuery({
    queryKey: ['/api/user-content/dots'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user-content/dots', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-user-id': userId?.toString() || ''
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch (error) {
        console.error('UserGrid dots fetch error:', error);
        return [];
      }
    },
    enabled: mode === 'real' && !!userId,
    retry: 3,
    staleTime: 30000
  });

  // Fetch user wheels
  const { data: userWheels = [], isLoading: wheelsLoading } = useQuery({
    queryKey: ['/api/user-content/wheels'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user-content/wheels', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-user-id': userId?.toString() || ''
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch (error) {
        console.error('UserGrid wheels fetch error:', error);
        return [];
      }
    },
    enabled: mode === 'real' && !!userId,
    retry: 3,
    staleTime: 30000
  });

  // Fetch user chakras
  const { data: userChakras = [], isLoading: chakrasLoading } = useQuery({
    queryKey: ['/api/user-content/chakras'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user-content/chakras', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-user-id': userId?.toString() || ''
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        }
        return [];
      } catch (error) {
        console.error('UserGrid chakras fetch error:', error);
        return [];
      }
    },
    enabled: mode === 'real' && !!userId,
    retry: 3,
    staleTime: 30000
  });

  const isLoading = dotsLoading || wheelsLoading || chakrasLoading;

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
        availableWheels={userWheels}
        availableChakras={userChakras}
        onSuccess={() => setShowCreation(false)}
      />
    );
  }

  const regularWheels = Array.isArray(userWheels) ? userWheels : [];
  const chakras = Array.isArray(userChakras) ? userChakras : [];

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-amber-800">Your Neural Map</h2>
          <p className="text-gray-600">Visualize and explore your dots, wheels, and chakras</p>
        </div>
        <Button 
          onClick={() => setShowCreation(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-amber-800">Dots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{userDots.length}</div>
            <p className="text-xs text-gray-500 mt-1">Individual insights</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-800">Wheels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{regularWheels.length}</div>
            <p className="text-xs text-gray-500 mt-1">Goal-oriented projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-amber-800">Chakras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{chakras.length}</div>
            <p className="text-xs text-gray-500 mt-1">Life purposes</p>
          </CardContent>
        </Card>
      </div>

      {/* User Map Grid - exact same component structure as PreviewMapGrid */}
      <UserMapGrid
        setViewFullWheel={setViewFullWheel}
        setViewFlashCard={setViewFlashCard}
        setViewFullDot={setViewFullDot}
        dots={userDots}
        wheels={regularWheels}
        chakras={chakras}
        isLoading={isLoading}
      />

      {/* Flash Card Modal */}
      {viewFlashCard && (
        <DotFlashCard
          dot={viewFlashCard}
          onClose={() => setViewFlashCard(null)}
          onViewFull={() => {
            setViewFullDot(viewFlashCard);
            setViewFlashCard(null);
          }}
        />
      )}

      {/* Full Wheel View Modal */}
      {viewFullWheel && (
        <WheelFullView
          wheel={viewFullWheel}
          onClose={() => setViewFullWheel(null)}
        />
      )}

      {/* Full Dot View Modal */}
      {viewFullDot && (
        <DotFullView
          dot={viewFullDot}
          onClose={() => setViewFullDot(null)}
        />
      )}
    </div>
  );
};

export default UserGrid;