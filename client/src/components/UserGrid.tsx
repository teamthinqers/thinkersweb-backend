import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Eye, Settings, RotateCcw, Mic, Type, Maximize, Minimize, ZoomIn, ZoomOut, AlertCircle, Save } from 'lucide-react';
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
  chakraId?: string;
  createdAt?: Date;
}

interface Chakra {
  id: string;
  name: string;
  heading?: string;
  purpose?: string;
  timeline?: string;
  category: string;
  color: string;
  wheels: Wheel[];
  position: { x: number; y: number };
  createdAt?: Date;
}

interface UserMapGridProps {
  setViewFullWheel: (wheel: Wheel | null) => void;
  setViewFlashCard: (dot: Dot | null) => void;
  setViewFullDot: (dot: Dot | null) => void;
  dots: Dot[];
  wheels: Wheel[];
  chakras: Chakra[];
  isLoading: boolean;
}

// Get chakra size based on child wheels and dots
const getChakraSize = (mode: 'preview' | 'real', childWheelsCount: number, childDotsCount: number) => {
  const baseSizes = { preview: 120, real: 150 };
  const baseSize = baseSizes[mode];
  
  const totalChildren = childWheelsCount + childDotsCount;
  if (totalChildren === 0) return baseSize;
  if (totalChildren <= 2) return baseSize + 30;
  if (totalChildren <= 5) return baseSize + 60;
  if (totalChildren <= 8) return baseSize + 90;
  return baseSize + 120;
};

// Get wheel size based on child dots count
const getWheelSize = (mode: 'preview' | 'real', childDotsCount: number, childDots: any[] = []) => {
  // Calculate minimum size needed to contain all dots
  if (childDotsCount === 0) {
    return mode === 'preview' ? 60 : 70; // Smaller standalone wheels
  }
  
  // Calculate size needed for dots in circular arrangement
  const dotSize = 40; // Size of each dot
  const padding = 25; // Space between dots and wheel border
  const dotSpacing = 10; // Space between dots
  
  // For circular arrangement, calculate radius needed
  const circumference = childDotsCount * (dotSize + dotSpacing);
  const radiusForDots = circumference / (2 * Math.PI);
  const totalRadius = radiusForDots + dotSize + padding;
  
  // Ensure minimum size
  const baseSizes = { preview: 80, real: 90 };
  const baseSize = baseSizes[mode];
  
  if (childDotsCount <= 3) return Math.max(baseSize, totalRadius);
  if (childDotsCount <= 6) return Math.max(baseSize + 20, totalRadius);
  if (childDotsCount <= 9) return Math.max(baseSize + 40, totalRadius);
  return Math.max(baseSize + 60, totalRadius);
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
  const [hoveredChakra, setHoveredChakra] = useState<any>(null);
  const [draggedElement, setDraggedElement] = useState<{type: 'dot' | 'wheel' | 'chakra', id: string, startPos: {x: number, y: number}, initialPos: {x: number, y: number}} | null>(null);
  const [elementPositions, setElementPositions] = useState<{[key: string]: {x: number, y: number}}>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false); 
  const [confirmMapping, setConfirmMapping] = useState<{
    sourceType: 'dot' | 'wheel';
    sourceId: string;
    sourceName: string;
    targetType: 'wheel' | 'chakra';
    targetId: string;
    targetName: string;
  } | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mapping functions for drag and drop
  const handleConfirmMapping = async () => {
    if (!confirmMapping) return;
    
    try {
      const endpoint = confirmMapping.sourceType === 'dot' 
        ? '/api/mapping/dot-to-wheel' 
        : '/api/mapping/wheel-to-chakra';
      
      const payload = confirmMapping.sourceType === 'dot'
        ? { dotId: confirmMapping.sourceId, wheelId: confirmMapping.targetId }
        : { wheelId: confirmMapping.sourceId, chakraId: confirmMapping.targetId };
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Mapping Successful!",
          description: result.message,
          variant: "default"
        });
        
        // Refresh the data to show new mapping
        window.location.reload();
      } else {
        const error = await response.json();
        toast({
          title: "Mapping Failed",
          description: error.error || "Failed to map elements",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Mapping error:', error);
      toast({
        title: "Error",
        description: "Network error during mapping",
        variant: "destructive"
      });
    }
    
    setConfirmMapping(null);
  };

  // Fetch grid positions for proper positioning
  const { data: gridPositions } = useQuery({
    queryKey: ['/api/grid/positions'],
    queryFn: () => fetch('/api/grid/positions').then(res => res.json()).then(data => data.data)
  });

  // Reset view function
  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(0.6);
    // Load saved positions when resetting view
    loadSavedPositions();
  };

  // Save current layout positions
  const handleSaveLayout = () => {
    const layoutData = {
      elementPositions: elementPositions,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('dotspark-saved-layout', JSON.stringify(layoutData));
    
    setShowSaveDialog(false);
    
    // Show success feedback
    console.log('Layout saved successfully!');
  };

  // Load saved positions
  const loadSavedPositions = () => {
    try {
      const savedLayout = localStorage.getItem('dotspark-saved-layout');
      if (savedLayout) {
        const layoutData = JSON.parse(savedLayout);
        setElementPositions(layoutData.elementPositions || {});
        console.log('Layout restored from saved positions');
      }
    } catch (error) {
      console.error('Error loading saved positions:', error);
    }
  };

  // Load saved positions on component mount
  useEffect(() => {
    loadSavedPositions();
  }, []);

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
    if (draggedElement) {
      // Element dragging mode - update element position and all grouped elements
      const rect = gridContainerRef.current?.getBoundingClientRect();
      if (rect) {
        // Fix cursor tracking: calculate position based on mouse delta from start position
        const mouseDeltaX = e.clientX - draggedElement.startPos.x;
        const mouseDeltaY = e.clientY - draggedElement.startPos.y;
        const newX = (draggedElement.initialPos.x + mouseDeltaX / zoom);
        const newY = (draggedElement.initialPos.y + mouseDeltaY / zoom);
        
        // Calculate movement delta
        const currentPos = elementPositions[`${draggedElement.type}-${draggedElement.id}`];
        if (currentPos) {
          const deltaX = newX - currentPos.x;
          const deltaY = newY - currentPos.y;
          
          setElementPositions(prev => {
            const newPositions = { ...prev };
            
            // Update the dragged element position
            newPositions[`${draggedElement.type}-${draggedElement.id}`] = { x: newX, y: newY };
            
            // Move all grouped elements
            if (draggedElement.type === 'chakra') {
              // Move all wheels belonging to this chakra
              const chakraWheels = wheels.filter(w => w.chakraId === draggedElement.id);
              chakraWheels.forEach(wheel => {
                const wheelKey = `wheel-${wheel.id}`;
                if (prev[wheelKey]) {
                  newPositions[wheelKey] = {
                    x: prev[wheelKey].x + deltaX,
                    y: prev[wheelKey].y + deltaY
                  };
                }
                
                // Move all dots belonging to this wheel
                const wheelDots = dots.filter(d => d.wheelId === wheel.id);
                wheelDots.forEach(dot => {
                  const dotKey = `dot-${dot.id}`;
                  if (prev[dotKey]) {
                    newPositions[dotKey] = {
                      x: prev[dotKey].x + deltaX,
                      y: prev[dotKey].y + deltaY
                    };
                  }
                });
              });
            } else if (draggedElement.type === 'wheel') {
              // Move all dots belonging to this wheel
              const wheelDots = dots.filter(d => d.wheelId === draggedElement.id);
              wheelDots.forEach(dot => {
                const dotKey = `dot-${dot.id}`;
                if (prev[dotKey]) {
                  newPositions[dotKey] = {
                    x: prev[dotKey].x + deltaX,
                    y: prev[dotKey].y + deltaY
                  };
                }
              });
            }
            
            return newPositions;
          });
        }
      }
    } else if (!dragStart) return;
    
    if (dragStart) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setOffset(newOffset);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (draggedElement) {
      // Check for collision with valid drop targets
      const dropTargets = document.elementsFromPoint(e.clientX, e.clientY);
      
      for (const target of dropTargets) {
        const element = target as HTMLElement;
        const wheelElement = element.closest('[data-wheel-id]');
        const chakraElement = element.closest('[data-chakra-id]');
        
        if (draggedElement.type === 'dot' && wheelElement) {
          const targetWheelId = wheelElement.getAttribute('data-wheel-id');
          const targetWheel = wheels.find(w => w.id === targetWheelId);
          const sourceDot = dots.find(d => d.id === draggedElement.id);
          
          if (targetWheel && sourceDot && targetWheelId !== sourceDot.wheelId) {
            setConfirmMapping({
              sourceType: 'dot',
              sourceId: draggedElement.id,
              sourceName: sourceDot.oneWordSummary || sourceDot.summary || 'Dot',
              targetType: 'wheel',
              targetId: targetWheelId,
              targetName: targetWheel.heading || targetWheel.name || 'Wheel'
            });
            break;
          }
        } else if (draggedElement.type === 'wheel' && chakraElement) {
          const targetChakraId = chakraElement.getAttribute('data-chakra-id');
          const targetChakra = chakras.find(c => c.id === targetChakraId);
          const sourceWheel = wheels.find(w => w.id === draggedElement.id);
          
          if (targetChakra && sourceWheel && targetChakraId !== sourceWheel.chakraId) {
            setConfirmMapping({
              sourceType: 'wheel',
              sourceId: draggedElement.id,
              sourceName: sourceWheel.heading || sourceWheel.name || 'Wheel',
              targetType: 'chakra',
              targetId: targetChakraId,
              targetName: targetChakra.heading || targetChakra.name || 'Chakra'
            });
            break;
          }
        }
      }
      setDraggedElement(null);
    }
    setDragStart(null);
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

  return (
    <div className={`relative bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-xl border-2 border-amber-200 shadow-lg overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[500px]'
    }`}>
      {/* Stats badges - top left exactly like preview mode */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-100 text-amber-800 px-2 py-1 text-xs font-medium">
            {dots.length} Dots
          </Badge>
          <Badge className="bg-orange-100 text-orange-800 px-2 py-1 text-xs font-medium">
            {wheels.length} Wheels
          </Badge>
          <Badge className="bg-amber-200 text-amber-900 px-2 py-1 text-xs font-medium">
            {chakras.length} Chakras
          </Badge>
        </div>
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
        <button
          onClick={() => setShowSaveDialog(true)}
          className="bg-green-500 hover:bg-green-600 text-white rounded transition-colors p-2"
          title="Save Layout"
        >
          <Save className="w-3 h-3" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors p-2"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
        </button>
      </div>

      {/* Interactive Grid Container */}
      <div 
        ref={gridContainerRef}
        className="absolute inset-0 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: dragStart ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        <div className="w-full h-full relative" style={{ minWidth: '2000px', minHeight: '1500px' }}>
          {/* Use user data directly */}
          {dots.map((dot: any, index: number) => {
            // Use algorithmic positioning from backend API when available
            let dotPosition;
            
            if (gridPositions?.dotPositions && gridPositions.dotPositions[dot.id]) {
              dotPosition = gridPositions.dotPositions[dot.id];
            } else {
              // Fallback to manual positioning
              dotPosition = dot.position || { 
                x: 300 + (index % 6) * 120, 
                y: 200 + Math.floor(index / 6) * 120 
              };
            }
            
            const currentPosition = elementPositions[`dot-${dot.id}`] || dotPosition;
            const dotSize = 50;
            
            return (
              <div
                key={dot.id}
                className="absolute cursor-pointer pointer-events-auto"
                data-dot-id={dot.id}
                style={{
                  left: `${currentPosition.x - dotSize/2}px`,
                  top: `${currentPosition.y - dotSize/2}px`,
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedElement({
                    type: 'dot',
                    id: dot.id,
                    startPos: { x: e.clientX, y: e.clientY },
                    initialPos: currentPosition
                  });
                }}
                onMouseEnter={() => setHoveredDot(dot)}
                onMouseLeave={() => setHoveredDot(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!draggedElement) {
                    setViewFlashCard(dot);
                  }
                }}
              >
                {/* Dot Visual */}
                <div className={`w-full h-full rounded-full transition-all duration-300 ${
                  hoveredDot?.id === dot.id ? 'scale-110' : ''
                } bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg border-2 border-amber-300`}>
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-300/50 to-transparent animate-pulse" />
                </div>
                
                {/* Dot Label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center">
                  <div className="bg-white/90 backdrop-blur px-2 py-1 rounded border shadow-sm">
                    <span className="font-medium text-amber-800">
                      {dot.oneWordSummary || dot.summary?.slice(0, 10) + '...' || 'Dot'}
                    </span>
                  </div>
                </div>
                
                {/* Hover Card */}
                {hoveredDot?.id === dot.id && (
                  <div 
                    className="absolute bg-white/95 backdrop-blur border-2 border-amber-200 rounded-lg p-3 shadow-2xl w-64 cursor-pointer z-[99999999]"
                    style={{
                      left: `${dotSize + 10}px`,
                      top: `${Math.max(-50, -50)}px`,
                      maxWidth: '280px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFullDot(dot);
                      setHoveredDot(null);
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-amber-800 text-sm">{dot.oneWordSummary || 'Insight'}</h4>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                          Dot
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {dot.summary || 'A moment of insight or learning'}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <Badge className="bg-amber-100 text-amber-700">
                          {dot.sourceType || 'insight'}
                        </Badge>
                        <span className="text-amber-600 font-medium">
                          Click for full view
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Render Wheels */}
          {wheels.map((wheel: any, index: number) => {
            // Use algorithmic positioning from backend API when available
            let wheelPosition;
            
            if (gridPositions?.wheelPositions && gridPositions.wheelPositions[wheel.id]) {
              wheelPosition = gridPositions.wheelPositions[wheel.id];
            } else {
              wheelPosition = wheel.position || { 
                x: 600 + (index % 4) * 200, 
                y: 300 + Math.floor(index / 4) * 200 
              };
            }
            
            const currentPosition = elementPositions[`wheel-${wheel.id}`] || wheelPosition;
            const wheelDots = dots.filter((d: any) => d.wheelId === wheel.id);
            const wheelSize = getWheelSize('real', wheelDots.length);
            const wheelRadius = wheelSize / 2;
            
            return (
              <div
                key={wheel.id}
                className="absolute pointer-events-auto cursor-pointer"
                data-wheel-id={wheel.id}
                style={{
                  left: `${currentPosition.x - wheelRadius}px`,
                  top: `${currentPosition.y - wheelRadius}px`,
                  width: `${wheelSize}px`,
                  height: `${wheelSize}px`,
                  zIndex: 5
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedElement({
                    type: 'wheel',
                    id: wheel.id,
                    startPos: { x: e.clientX, y: e.clientY },
                    initialPos: currentPosition
                  });
                }}
                onMouseEnter={() => setHoveredWheel(wheel)}
                onMouseLeave={() => setHoveredWheel(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!draggedElement) {
                    setViewFullWheel(wheel);
                  }
                }}
              >
                {/* Wheel Visual */}
                <div className={`w-full h-full rounded-full border-4 border-dashed border-orange-400 bg-orange-50/30 transition-all duration-300 ${
                  hoveredWheel?.id === wheel.id ? 'scale-105 border-orange-500' : ''
                }`}>
                  {/* Inner content */}
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100/50 to-transparent flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-orange-700 font-bold text-sm">
                        {wheel.heading || wheel.name}
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        {wheelDots.length} dots
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Wheel Hover Card */}
                {hoveredWheel?.id === wheel.id && (
                  <div 
                    className="absolute bg-white/95 backdrop-blur border-2 border-orange-200 rounded-lg p-3 shadow-2xl w-64 cursor-pointer z-[99999998]"
                    style={{
                      left: `${wheelRadius + 20}px`,
                      top: `${Math.max(0, -50)}px`,
                      maxWidth: '280px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewFullWheel(wheel);
                      setHoveredWheel(null);
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-orange-800 text-sm">{wheel.name || wheel.heading}</h4>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                          Wheel
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">
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
          
          {/* Render Chakras */}
          {chakras.map((chakra: any, index: number) => {
            // Use algorithmic positioning from backend API when available
            let chakraPosition;
            
            if (gridPositions?.chakraPositions && gridPositions.chakraPositions[chakra.id]) {
              chakraPosition = gridPositions.chakraPositions[chakra.id];
            } else {
              chakraPosition = chakra.position || { 
                x: 900 + (index % 3) * 300, 
                y: 400 + Math.floor(index / 3) * 300 
              };
            }
            
            const currentPosition = elementPositions[`chakra-${chakra.id}`] || chakraPosition;
            const chakraWheels = wheels.filter((w: any) => w.chakraId === chakra.id);
            const chakraSize = getChakraSize('real', chakraWheels.length, 0);
            const chakraRadius = chakraSize / 2;
            
            return (
              <div
                key={chakra.id}
                className="absolute pointer-events-auto cursor-pointer"
                data-chakra-id={chakra.id}
                style={{
                  left: `${currentPosition.x - chakraRadius}px`,
                  top: `${currentPosition.y - chakraRadius}px`,
                  width: `${chakraSize}px`,
                  height: `${chakraSize}px`,
                  zIndex: 1
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedElement({
                    type: 'chakra',
                    id: chakra.id,
                    startPos: { x: e.clientX, y: e.clientY },
                    initialPos: currentPosition
                  });
                }}
                onMouseEnter={() => setHoveredChakra(chakra)}
                onMouseLeave={() => setHoveredChakra(null)}
              >
                {/* Chakra Visual with Energy Rings */}
                <div className="relative w-full h-full">
                  {/* Outer energy ring */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-30 animate-spin"
                    style={{ 
                      background: `conic-gradient(from 0deg, #B4530900, #B4530980, #B4530900, #B4530980, #B4530900)`,
                      animationDuration: '20s'
                    }}
                  />
                  
                  {/* Middle energy ring */}
                  <div 
                    className="absolute inset-2 rounded-full opacity-40 animate-pulse"
                    style={{ 
                      background: `radial-gradient(circle, #B4530940, transparent 70%)`,
                      animationDuration: '3s'
                    }}
                  />
                  
                  {/* Inner core */}
                  <div 
                    className="absolute inset-4 rounded-full opacity-50"
                    style={{ 
                      background: `radial-gradient(circle, #B4530960, transparent 60%)`,
                      boxShadow: `0 0 20px #B4530940`
                    }}
                  />
                  
                  {/* Chakra boundary */}
                  <div 
                    className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-300 ${
                      hoveredChakra?.id === chakra.id ? 'border-amber-600 scale-105' : 'border-amber-500'
                    }`}
                    style={{ backgroundColor: 'rgba(180, 83, 9, 0.05)' }}
                  />
                  
                  {/* Center Label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/80 backdrop-blur rounded-lg px-4 py-2 border border-amber-300">
                      <div className="font-bold text-amber-800 text-lg">
                        {chakra.heading || chakra.name}
                      </div>
                      <div className="text-xs text-amber-600 uppercase tracking-wide">
                        CHAKRA
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        {chakraWheels.length} wheels
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Position Confirmation Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl border-2 border-amber-200 p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">Save Layout</h3>
            <p className="text-gray-700 text-sm mb-6 leading-relaxed">
              Are you sure? Once saved this will be the default position of your dots, wheels & chakras.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLayout}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mapping Confirmation Dialog */}
      <Dialog open={!!confirmMapping} onOpenChange={() => setConfirmMapping(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Confirm Mapping
            </DialogTitle>
          </DialogHeader>
          
          {confirmMapping && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to map <strong>"{confirmMapping.sourceName}"</strong> to{' '}
                <strong>"{confirmMapping.targetName}"</strong>?
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  {confirmMapping.sourceType === 'dot' 
                    ? "This dot will become part of the selected wheel and move to its location."
                    : "This wheel will become part of the selected chakra and all its dots will move with it."
                  }
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmMapping(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMapping}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Confirm Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main UserGrid component that receives data from parent
interface UserGridProps {
  dots: Dot[];
  wheels: Wheel[];
  chakras: Chakra[];
  isLoading?: boolean;
}

const UserGrid: React.FC<UserGridProps> = ({ 
  dots = [],
  wheels = [],
  chakras = [],
  isLoading = false
}) => {
  const [showCreation, setShowCreation] = useState(false);
  const [viewFullWheel, setViewFullWheel] = useState<Wheel | null>(null);
  const [viewFlashCard, setViewFlashCard] = useState<Dot | null>(null);
  const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);

  // Use the data passed from parent Dashboard component
  const userDots = dots;
  const regularWheels = wheels.filter((wheel: any) => !wheel.chakraId);
  const userChakras = chakras;

  return (
    <div className="space-y-4">
      {/* Content Creation Modal */}
      {showCreation && (
        <UserContentCreation 
          onClose={() => setShowCreation(false)}
        />
      )}

      {/* User Map Grid - exact same component structure as PreviewMapGrid */}
      <UserMapGrid
        setViewFullWheel={setViewFullWheel}
        setViewFlashCard={setViewFlashCard}
        setViewFullDot={setViewFullDot}
        dots={userDots}
        wheels={regularWheels}
        chakras={userChakras}
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
          onDotClick={setViewFullDot}
          onWheelClick={setViewFullWheel}
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