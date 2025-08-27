import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Eye, Settings, RotateCcw, Mic, Type, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
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

const getChakraSize = (mode: 'preview' | 'real', childWheelsCount: number, childWheels: any[] = []) => {
  // Calculate minimum size needed to contain all wheels
  if (childWheelsCount === 0) {
    return mode === 'preview' ? 280 : 250; // Smaller standalone chakras
  }
  
  // Calculate size needed for each wheel plus padding
  let totalWheelArea = 0;
  childWheels.forEach(wheel => {
    const wheelDots = wheel.dots || [];
    const wheelRadius = getWheelSize(mode, wheelDots.length, wheelDots);
    totalWheelArea += (wheelRadius * 2) * (wheelRadius * 2); // Wheel area
  });
  
  // Calculate chakra radius to contain wheels in circular arrangement with padding
  const padding = 80; // Space between wheels and chakra border
  const wheelSpacing = 40; // Space between wheels
  const minRadius = Math.sqrt(totalWheelArea / Math.PI) + padding;
  
  // Ensure minimum size based on wheel count
  const baseSizes = { preview: 420, real: 380 };
  const baseSize = baseSizes[mode];
  
  if (childWheelsCount <= 2) return Math.max(baseSize, minRadius);
  if (childWheelsCount <= 4) return Math.max(baseSize + 60, minRadius);
  if (childWheelsCount <= 6) return Math.max(baseSize + 120, minRadius);
  return Math.max(baseSize + 180, minRadius);
};

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
  // Removed draggedElement state - using floating dot approach with document listeners
  const [elementPositions, setElementPositions] = useState<{[key: string]: {x: number, y: number}}>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false); 
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Drag-and-drop mapping states
  const [mappingDialog, setMappingDialog] = useState<{
    open: boolean;
    sourceType: 'dot' | 'wheel';
    sourceId: string;
    sourceName: string;
    targetType: 'wheel' | 'chakra';
    targetId: string;
    targetName: string;
  } | null>(null);

  const [delinkDialog, setDelinkDialog] = useState<{
    open: boolean;
    sourceType: 'dot' | 'wheel';
    sourceId: string;
    sourceName: string;
    parentType: 'wheel' | 'chakra';
    parentName: string;
  } | null>(null);

  const { toast } = useToast();

  // Collision detection helper
  const checkCollision = (draggedElement: {x: number, y: number, size: number}, targetElement: {x: number, y: number, size: number}) => {
    const distance = Math.sqrt(
      Math.pow(draggedElement.x - targetElement.x, 2) + 
      Math.pow(draggedElement.y - targetElement.y, 2)
    );
    return distance < (draggedElement.size + targetElement.size) / 2;
  };

  // Handle mapping confirmation
  const handleMapConfirm = async () => {
    if (!mappingDialog) return;
    
    console.log('🔄 Starting mapping process:', mappingDialog);
    
    try {
      let endpoint, payload;
      
      if (mappingDialog.sourceType === 'dot' && mappingDialog.targetType === 'wheel') {
        // Dot to Wheel mapping
        endpoint = `/api/mapping/dot-to-wheel`;
        payload = { 
          dotId: mappingDialog.sourceId,
          wheelId: mappingDialog.targetId 
        };
      } else if (mappingDialog.sourceType === 'wheel' && mappingDialog.targetType === 'chakra') {
        // Wheel to Chakra mapping
        endpoint = `/api/mapping/wheel-to-chakra`;
        payload = { 
          wheelId: mappingDialog.sourceId,
          chakraId: mappingDialog.targetId 
        };
      } else {
        throw new Error('Invalid mapping type');
      }

      console.log('🌐 Making API call:', { endpoint, payload });

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log('📡 API response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });

      const responseData = await response.text();
      console.log('📄 Response data:', responseData);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText} - ${responseData}`);
      }

      console.log('✅ Mapping successful!');
      
      toast({
        title: "Mapping Updated",
        description: `${mappingDialog.sourceName} has been mapped to ${mappingDialog.targetName}`,
      });

      // Refresh the data
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Mapping save error:', error);
      toast({
        title: "Error", 
        description: `Failed to update mapping: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setMappingDialog(null);
    }
  };

  // Handle delinking confirmation  
  const handleDelinkConfirm = async () => {
    if (!delinkDialog) return;
    
    console.log('🔄 Starting delink process:', delinkDialog);
    
    try {
      let endpoint, payload;
      
      if (delinkDialog.sourceType === 'dot') {
        // Remove dot from wheel
        endpoint = `/api/mapping/dot-to-wheel`;
        payload = { 
          dotId: delinkDialog.sourceId,
          wheelId: null // Remove mapping
        };
      } else if (delinkDialog.sourceType === 'wheel') {
        // Remove wheel from chakra
        endpoint = `/api/mapping/wheel-to-chakra`;
        payload = { 
          wheelId: delinkDialog.sourceId,
          chakraId: null // Remove mapping
        };
      } else {
        throw new Error('Invalid delink type');
      }

      console.log('🌐 Making delink API call:', { endpoint, payload });

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log('📡 Delink API response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      });

      const responseData = await response.text();
      console.log('📄 Delink response data:', responseData);

      if (!response.ok) {
        throw new Error(`Delink API call failed: ${response.status} ${response.statusText} - ${responseData}`);
      }

      console.log('✅ Delink successful!');

      toast({
        title: "Successfully Delinked",
        description: `${delinkDialog.sourceName} has been removed from ${delinkDialog.parentName}`,
      });

      // Refresh the data
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Delink save error:', error);
      toast({
        title: "Error",
        description: `Failed to delink: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDelinkDialog(null);
    }
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
    
    // Could also save to backend API here
    // fetch('/api/save-layout', { method: 'POST', body: JSON.stringify(layoutData) });
    
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
      </div>

      {/* Save Positions Button - Top Right */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg p-2"
          title="Save Current Layout"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>
      </div>

      {/* Fullscreen Toggle - Moved to Bottom Right */}
      {!isFullscreen && (
        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10">
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
          className="relative transition-transform duration-150 ease-out"
          style={{ 
            width: `${1200 * zoom}px`, 
            height: `${800 * zoom}px`,
            minWidth: 'auto',
            minHeight: 'auto',
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            willChange: dragStart ? 'transform' : 'auto'
          }}
        >
          {/* Render chakras first (bottom layer) */}
          {chakras.map((chakra: any, chakraIndex: number) => {
            const chakraWheels = displayWheels.filter((w: any) => w.chakraId === chakra.id);
            // Add dots to wheels for proper sizing calculation
            const chakraWheelsWithDots = chakraWheels.map(w => ({
              ...w,
              dots: displayDots.filter((d: any) => d.wheelId == w.id || d.wheelId === String(w.id))
            }));
            const chakraRadius = getChakraSize('real', chakraWheels.length, chakraWheelsWithDots);
            
            // Position chakras with proper spacing to avoid overlaps
            let chakraX, chakraY;
            if (elementPositions[`chakra-${chakra.id}`]) {
              chakraX = elementPositions[`chakra-${chakra.id}`].x;
              chakraY = elementPositions[`chakra-${chakra.id}`].y;
            } else {
              // Collision-aware positioning for chakras
              const chakraSpacing = 600; // Large spacing for chakras
              chakraX = 300 + (chakraIndex % 2) * chakraSpacing;
              chakraY = 300 + Math.floor(chakraIndex / 2) * chakraSpacing;
              
              // Check for collisions with other chakras
              let attempts = 0;
              while (attempts < 5) {
                let collision = false;
                
                for (let i = 0; i < chakraIndex; i++) {
                  const otherChakra = chakras[i];
                  const otherPos = elementPositions[`chakra-${otherChakra.id}`] || { x: 300, y: 300 };
                  const distance = Math.sqrt((chakraX - otherPos.x) ** 2 + (chakraY - otherPos.y) ** 2);
                  const minDistance = chakraRadius + 200; // 200px buffer between chakras
                  
                  if (distance < minDistance) {
                    collision = true;
                    break;
                  }
                }
                
                if (!collision) break;
                
                chakraX += chakraSpacing / 3;
                chakraY += chakraSpacing / 4;
                attempts++;
              }
            }
            
            // Update chakra position for wheel calculations
            chakra.position = { x: chakraX, y: chakraY };
            
            return (
              <div key={chakra.id} className="relative">
                {/* Chakra circle */}
                <div
                  className="absolute rounded-full border-4 border-amber-500/50 bg-gradient-to-br from-amber-100/40 to-orange-100/40 cursor-move transition-all duration-200 hover:scale-105 hover:border-amber-600/70"
                  style={{
                    left: `${chakraX - chakraRadius/2}px`,
                    top: `${chakraY - chakraRadius/2}px`,
                    width: `${chakraRadius}px`,
                    height: `${chakraRadius}px`,
                    pointerEvents: 'auto',
                    zIndex: 1, // Lowest z-index for chakras
                    willChange: 'auto',
                    transform: 'scale(1)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewFullWheel(chakra);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Calculate offset from cursor to element's top-left corner
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    
                    // Start drag tracking
                    let hasDragged = false;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      e.preventDefault();
                      hasDragged = true;
                      
                      // Perfect floating dot behavior - element follows cursor exactly where clicked
                      const gridRect = gridContainerRef.current?.getBoundingClientRect();
                      if (gridRect) {
                        // Calculate the exact position so the click point follows the cursor
                        const newX = (e.clientX - gridRect.left - offset.x) / zoom - offsetX / zoom;
                        const newY = (e.clientY - gridRect.top - offset.y) / zoom - offsetY / zoom;
                        
                        setElementPositions(prev => ({
                          ...prev,
                          [`chakra-${chakra.id}`]: { x: newX, y: newY }
                        }));
                      }
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onMouseEnter={() => setHoveredChakra(chakra)}
                  onMouseLeave={() => setHoveredChakra(null)}
                >
                  {/* Chakra label */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 text-amber-800 font-bold text-sm whitespace-nowrap shadow-lg">
                      {chakra.name}
                    </div>
                  </div>
                  
                  {/* Chakra content */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center">
                      {/* Content removed - no category text needed */}
                    </div>
                  </div>
                </div>
                
                {/* Chakra hover card */}
                {hoveredChakra?.id === chakra.id && (
                  <div 
                    className="absolute bg-white/95 backdrop-blur border-2 border-amber-200 rounded-lg p-3 shadow-2xl w-64 cursor-pointer"
                    style={{
                      left: `${chakraX - 140}px`,
                      top: `${chakraY - 120}px`,
                      maxWidth: '280px',
                      zIndex: 1000,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setHoveredChakra(null);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-amber-800 text-sm line-clamp-1">{chakra.name}</h4>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                          Chakra
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                        {chakra.purpose || 'Life area focus'}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <Badge className="bg-amber-100 text-amber-700">
                          {chakraWheels.length} wheels
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

          {/* Render wheels second (middle layer) */}
          {displayWheels.map((wheel: any, wheelIndex: number) => {
            const wheelDots = displayDots.filter((d: any) => d.wheelId == wheel.id || d.wheelId === String(wheel.id));
            const wheelRadius = getWheelSize('real', wheelDots.length, wheelDots);
            
            // Determine wheel position
            let wheelX, wheelY;
            if (wheel.chakraId && wheel.chakraId !== 'standalone') {
              // Use saved position if exists, otherwise position around chakra
              if (elementPositions[`wheel-${wheel.id}`]) {
                wheelX = elementPositions[`wheel-${wheel.id}`].x;
                wheelY = elementPositions[`wheel-${wheel.id}`].y;
              } else {
                // Position wheel inside/around its associated chakra like preview mode  
                const chakra = chakras.find((c: any) => c.id === wheel.chakraId);
                if (chakra) {
                  const wheelsInChakra = displayWheels.filter((w: any) => w.chakraId === wheel.chakraId && w.chakraId !== 'standalone');
                  const wheelIndexInChakra = wheelsInChakra.findIndex((w: any) => w.id === wheel.id);
                  
                  // Get chakra position (either saved position or calculated position)
                  let chakraX, chakraY;
                  if (elementPositions[`chakra-${chakra.id}`]) {
                    chakraX = elementPositions[`chakra-${chakra.id}`].x;
                    chakraY = elementPositions[`chakra-${chakra.id}`].y;
                  } else {
                    chakraX = chakra.position?.x || 600;
                    chakraY = chakra.position?.y || 400;
                  }
                  
                  // Calculate orbit radius to ensure wheels stay inside chakra boundary
                  const chakraRadius = getChakraSize('real', wheelsInChakra.length, wheelsInChakra) / 2;
                  const orbitRadius = Math.max(40, chakraRadius - wheelRadius - 30); // 30px padding from chakra edge
                  const angle = (wheelIndexInChakra * 2 * Math.PI) / wheelsInChakra.length;
                  
                  wheelX = chakraX + Math.cos(angle) * orbitRadius;
                  wheelY = chakraY + Math.sin(angle) * orbitRadius;
                } else {
                  // Chakra not found, treat as standalone
                  const standaloneWheels = displayWheels.filter((w: any) => !w.chakraId || w.chakraId === 'standalone');
                  const standaloneIndex = standaloneWheels.findIndex((w: any) => w.id === wheel.id);
                  
                  if (elementPositions[`wheel-${wheel.id}`]) {
                    wheelX = elementPositions[`wheel-${wheel.id}`].x;
                    wheelY = elementPositions[`wheel-${wheel.id}`].y;
                  } else {
                    const cols = Math.max(2, Math.ceil(Math.sqrt(standaloneWheels.length)));
                    const row = Math.floor(standaloneIndex / cols);
                    const col = standaloneIndex % cols;
                    wheelX = 600 + (col * 280);
                    wheelY = 250 + (row * 220);
                  }
                }
              }
            } else {
              // Standalone wheels - well distributed grid separate from chakras  
              const standaloneWheels = displayWheels.filter((w: any) => !w.chakraId || w.chakraId === 'standalone');
              const standaloneIndex = standaloneWheels.findIndex((w: any) => w.id === wheel.id);
              
              if (elementPositions[`wheel-${wheel.id}`]) {
                wheelX = elementPositions[`wheel-${wheel.id}`].x;
                wheelY = elementPositions[`wheel-${wheel.id}`].y;
              } else {
                // Collision-aware positioning for standalone wheels
                const cols = Math.max(2, Math.ceil(Math.sqrt(standaloneWheels.length)));
                const row = Math.floor(standaloneIndex / cols);
                const col = standaloneIndex % cols;
                const wheelSpacing = 300; // Increased spacing for wheels
                wheelX = 200 + (col * wheelSpacing);
                wheelY = 200 + (row * 260);
                
                // Check for collisions with chakras and other wheels
                let attempts = 0;
                while (attempts < 8) {
                  let collision = false;
                  
                  // Check collision with chakras
                  for (const chakra of chakras) {
                    const chakraPos = elementPositions[`chakra-${chakra.id}`] || chakra.position || { x: 600, y: 400 };
                    const chakraRadius = getChakraSize('real', displayWheels.filter(w => w.chakraId === chakra.id).length) / 2;
                    const distance = Math.sqrt((wheelX - chakraPos.x) ** 2 + (wheelY - chakraPos.y) ** 2);
                    if (distance < chakraRadius + wheelRadius + 100) { // 100px buffer
                      collision = true;
                      break;
                    }
                  }
                  
                  if (!collision) break;
                  
                  wheelX += wheelSpacing / 3;
                  wheelY += 80;
                  attempts++;
                }
              }
            }
            
            // Update wheel position for dot calculations
            wheel.position = { x: wheelX, y: wheelY };
            
            return (
              <div key={wheel.id} className="relative">
                {/* Wheel circle */}
                <div
                  className="absolute rounded-full border-2 border-dashed border-orange-400/60 bg-orange-50/30 cursor-move transition-all duration-200 hover:scale-105 hover:border-orange-500"
                  style={{
                    left: `${wheelX - wheelRadius}px`,
                    top: `${wheelY - wheelRadius}px`,
                    width: `${wheelRadius * 2}px`,
                    height: `${wheelRadius * 2}px`,
                    pointerEvents: 'auto',
                    zIndex: 5, // Middle z-index for wheels
                    willChange: 'auto',
                    transform: 'scale(1)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewFullWheel(wheel);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Calculate offset from cursor to element's top-left corner
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      e.preventDefault();
                      
                      // Perfect floating dot behavior - element follows cursor exactly where clicked
                      const gridRect = gridContainerRef.current?.getBoundingClientRect();
                      if (gridRect) {
                        // Calculate the exact position so the click point follows the cursor
                        const newX = (e.clientX - gridRect.left - offset.x) / zoom - offsetX / zoom;
                        const newY = (e.clientY - gridRect.top - offset.y) / zoom - offsetY / zoom;
                        
                        setElementPositions(prev => ({
                          ...prev,
                          [`wheel-${wheel.id}`]: { x: newX, y: newY }
                        }));
                      }
                    };
                    
                    const handleMouseUp = (e: MouseEvent) => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      
                      // Calculate final position for collision detection
                      const gridRect = gridContainerRef.current?.getBoundingClientRect();
                      if (gridRect) {
                        const finalX = (e.clientX - gridRect.left - offset.x) / zoom - offsetX / zoom;
                        const finalY = (e.clientY - gridRect.top - offset.y) / zoom - offsetY / zoom;
                        
                        console.log(`🎯 Checking collision for wheel ${wheel.id} at position:`, { x: finalX, y: finalY });
                        
                        // If wheel is currently mapped to a chakra, check if dragged outside (delink)
                        if (wheel.chakraId) {
                          const currentChakra = chakras.find(c => c.id === wheel.chakraId);
                          if (currentChakra) {
                            // Get current chakra position
                            let chakraX, chakraY;
                            const savedChakraPos = elementPositions[`chakra-${currentChakra.id}`];
                            
                            if (savedChakraPos) {
                              chakraX = savedChakraPos.x;
                              chakraY = savedChakraPos.y;
                            } else if (currentChakra.position) {
                              chakraX = currentChakra.position.x;
                              chakraY = currentChakra.position.y;
                            } else {
                              const chakraIndex = chakras.findIndex(c => c.id === currentChakra.id);
                              chakraX = 100 + (chakraIndex * 500);
                              chakraY = 200;
                            }
                            
                            const chakraRadius = currentChakra.radius || 420;
                            const distance = Math.sqrt(Math.pow(finalX - chakraX, 2) + Math.pow(finalY - chakraY, 2));
                            
                            // Check if wheel is dragged outside its current chakra
                            if (distance > chakraRadius / 2 + 50) {
                              console.log(`🔗 Delink detected! Wheel dragged outside chakra`);
                              setDelinkDialog({
                                open: true,
                                sourceType: 'wheel',
                                sourceId: wheel.id,
                                sourceName: wheel.heading || wheel.name,
                                parentType: 'chakra',
                                parentName: currentChakra.heading || currentChakra.name
                              });
                              return; // Don't check for new mappings if delinking
                            }
                          }
                        }
                        
                        // Check collision with all chakras for new mappings (only if not currently mapped)
                        if (!wheel.chakraId) {
                          for (const chakra of chakras) {
                            // Get chakra position - try multiple sources
                            let chakraX, chakraY;
                            const savedChakraPos = elementPositions[`chakra-${chakra.id}`];
                            
                            if (savedChakraPos) {
                              chakraX = savedChakraPos.x;
                              chakraY = savedChakraPos.y;
                            } else if (chakra.position) {
                              chakraX = chakra.position.x;
                              chakraY = chakra.position.y;
                            } else {
                              // Calculate chakra position based on index like the rendering code
                              const chakraIndex = chakras.findIndex(c => c.id === chakra.id);
                              chakraX = 100 + (chakraIndex * 500);
                              chakraY = 200;
                            }
                            
                            const chakraRadius = chakra.radius || 420;
                            const wheelRadius = getWheelSize('real', displayDots.filter((d: any) => d.wheelId == wheel.id).length, []);
                            const distance = Math.sqrt(Math.pow(finalX - chakraX, 2) + Math.pow(finalY - chakraY, 2));
                            
                            console.log(`🔍 Checking chakra ${chakra.id}:`, {
                              chakraPos: { x: chakraX, y: chakraY },
                              chakraRadius,
                              distance,
                              threshold: chakraRadius / 2
                            });
                            
                            // More generous collision detection - check if wheel is inside chakra
                            if (distance < chakraRadius / 2) {
                              console.log(`✅ Collision detected! Showing mapping dialog`);
                              setMappingDialog({
                                open: true,
                                sourceType: 'wheel',
                                sourceId: wheel.id,
                                sourceName: wheel.heading || wheel.name,
                                targetType: 'chakra',
                                targetId: chakra.id,
                                targetName: chakra.heading || chakra.name
                              });
                              break;
                            }
                          }
                        }
                      }
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onMouseEnter={() => setHoveredWheel(wheel)}
                  onMouseLeave={() => setHoveredWheel(null)}
                >
                  {/* Wheel heading on top like preview mode */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="px-4 py-2 rounded-lg text-center shadow-lg border-2 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-800">
                      <div className="font-bold text-sm whitespace-nowrap">
                        {wheel.heading || wheel.name}
                      </div>
                    </div>
                  </div>
                  
                  {/* Wheel content */}
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <div className="text-center">
                      {/* Content removed - no category text needed */}
                    </div>
                  </div>
                </div>
                
                {/* Wheel hover card */}
                {hoveredWheel?.id === wheel.id && (
                  <div 
                    className="absolute bg-white/95 backdrop-blur border-2 border-orange-200 rounded-lg p-3 shadow-2xl w-64 cursor-pointer"
                    style={{
                      left: `${wheelX + wheelRadius + 20}px`,
                      top: `${Math.max(0, wheelY - 50)}px`,
                      maxWidth: '280px',
                      zIndex: 1001,
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

          {/* Render dots last (top layer) */}
          {displayDots.map((dot: any, index: number) => {
            let x, y;
            
            // Check if dot belongs to a wheel (now wheels are positioned first!)
            if (dot.wheelId && dot.wheelId !== '' && dot.wheelId !== 'general' && dot.wheelId !== 'standalone') {
              const wheel = displayWheels.find((w: any) => w.id == dot.wheelId || w.id === String(dot.wheelId));
              if (wheel && wheel.position) {
                // Use saved position if exists, otherwise position around wheel
                if (elementPositions[`dot-${dot.id}`]) {
                  x = elementPositions[`dot-${dot.id}`].x;
                  y = elementPositions[`dot-${dot.id}`].y;
                } else {
                  // Position dots inside their associated wheel in a circle
                  const dotsInWheel = displayDots.filter((d: any) => d.wheelId == dot.wheelId || d.wheelId === String(dot.wheelId));
                  const dotIndexInWheel = dotsInWheel.findIndex((d: any) => d.id === dot.id);
                  const wheelCenterX = wheel.position.x;
                  const wheelCenterY = wheel.position.y;
                  
                  // Calculate dot radius to ensure dots are well inside wheel boundary
                  const wheelRadius = getWheelSize('real', dotsInWheel.length, dotsInWheel);
                  const dotOrbitRadius = Math.max(15, wheelRadius - 60); // 60px padding from wheel edge for better interior placement
                  const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                  
                  x = wheelCenterX + Math.cos(angle) * dotOrbitRadius;
                  y = wheelCenterY + Math.sin(angle) * dotOrbitRadius;
                }
              } else {
                // Wheel not found, treat as standalone
                const standaloneDots = displayDots.filter((d: any) => !d.wheelId || d.wheelId === '' || d.wheelId === 'general' || d.wheelId === 'standalone');
                const standaloneIndex = standaloneDots.findIndex((d: any) => d.id === dot.id);
                
                if (elementPositions[`dot-${dot.id}`]) {
                  x = elementPositions[`dot-${dot.id}`].x;
                  y = elementPositions[`dot-${dot.id}`].y;
                } else {
                  const cols = Math.ceil(Math.sqrt(standaloneDots.length * 1.2));
                  const row = Math.floor(standaloneIndex / cols);
                  const col = standaloneIndex % cols;
                  const baseSpacing = 180;
                  x = baseSpacing + (col * baseSpacing);
                  y = baseSpacing + (row * baseSpacing);
                }
              }
            } else {
              // Standalone dots - use proper grid distribution to avoid overlaps
              const standaloneDots = displayDots.filter((d: any) => !d.wheelId || d.wheelId === '' || d.wheelId === 'general' || d.wheelId === 'standalone');
              const standaloneIndex = standaloneDots.findIndex((d: any) => d.id === dot.id);
              
              // Use saved position if exists, otherwise calculate new position with proper spacing
              if (elementPositions[`dot-${dot.id}`]) {
                x = elementPositions[`dot-${dot.id}`].x;
                y = elementPositions[`dot-${dot.id}`].y;
              } else {
                // Grid-based positioning with collision-aware spacing
                const cols = Math.ceil(Math.sqrt(standaloneDots.length * 1.2));
                const row = Math.floor(standaloneIndex / cols);
                const col = standaloneIndex % cols;
                
                // Use larger spacing to account for wheels and chakras
                const baseSpacing = 180;
                x = baseSpacing + (col * baseSpacing);
                y = baseSpacing + (row * baseSpacing);
                
                // Check for collisions with wheels and chakras
                let attempts = 0;
                while (attempts < 10) {
                  let collision = false;
                  
                  // Check collision with wheels
                  for (const wheel of displayWheels) {
                    const wheelPos = wheel.position || { x: 300, y: 250 };
                    const wheelDots = displayDots.filter((d: any) => d.wheelId == wheel.id || d.wheelId === String(wheel.id));
                    const wheelRadius = getWheelSize('real', wheelDots.length, wheelDots);
                    const distance = Math.sqrt((x - wheelPos.x) ** 2 + (y - wheelPos.y) ** 2);
                    if (distance < wheelRadius + 60) { // 60px buffer
                      collision = true;
                      break;
                    }
                  }
                  
                  // Check collision with chakras
                  if (!collision) {
                    for (const chakra of chakras) {
                      const chakraPos = elementPositions[`chakra-${chakra.id}`] || chakra.position || { x: 600, y: 400 };
                      const chakraRadius = getChakraSize('real', displayWheels.filter(w => w.chakraId === chakra.id).length) / 2;
                      const distance = Math.sqrt((x - chakraPos.x) ** 2 + (y - chakraPos.y) ** 2);
                      if (distance < chakraRadius + 80) { // 80px buffer
                        collision = true;
                        break;
                      }
                    }
                  }
                  
                  if (!collision) break;
                  
                  // Move to next position
                  x += baseSpacing / 2;
                  y += baseSpacing / 4;
                  attempts++;
                }
              }
            }
            
            return (
              <div key={dot.id} className="relative">
                {/* Dot element with exact styling from PreviewMapGrid */}
                <div
                  className="absolute w-10 h-10 rounded-full cursor-move transition-all duration-200 hover:scale-110 hover:shadow-md dot-element group"
                  style={{
                    left: `${x - 5}px`, // Adjust for larger size
                    top: `${y - 5}px`,
                    background: dot.captureMode === 'ai' 
                      ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                      : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    pointerEvents: 'auto',
                    zIndex: 10, // Highest z-index for dots
                    willChange: 'auto'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setViewFullDot(dot);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Calculate offset from cursor to element's top-left corner
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      e.preventDefault();
                      
                      // Perfect floating dot behavior - element follows cursor exactly where clicked
                      const gridRect = gridContainerRef.current?.getBoundingClientRect();
                      if (gridRect) {
                        // Calculate the exact position so the click point follows the cursor
                        const newX = (e.clientX - gridRect.left - offset.x) / zoom - offsetX / zoom;
                        const newY = (e.clientY - gridRect.top - offset.y) / zoom - offsetY / zoom;
                        
                        setElementPositions(prev => ({
                          ...prev,
                          [`dot-${dot.id}`]: { x: newX, y: newY }
                        }));
                      }
                    };
                    
                    const handleMouseUp = (e: MouseEvent) => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      
                      // Calculate final position for collision detection
                      const gridRect = gridContainerRef.current?.getBoundingClientRect();
                      if (gridRect) {
                        const finalX = (e.clientX - gridRect.left - offset.x) / zoom - offsetX / zoom;
                        const finalY = (e.clientY - gridRect.top - offset.y) / zoom - offsetY / zoom;
                        
                        console.log(`🎯 Checking collision for dot ${dot.id} at position:`, { x: finalX, y: finalY });
                        
                        // If dot is currently mapped to a wheel, check if dragged outside (delink)
                        if (dot.wheelId) {
                          const currentWheel = displayWheels.find(w => w.id === dot.wheelId);
                          if (currentWheel) {
                            // Get current wheel position
                            let wheelX, wheelY;
                            const savedWheelPos = elementPositions[`wheel-${currentWheel.id}`];
                            
                            if (savedWheelPos) {
                              wheelX = savedWheelPos.x;
                              wheelY = savedWheelPos.y;
                            } else if (currentWheel.position) {
                              wheelX = currentWheel.position.x;
                              wheelY = currentWheel.position.y;
                            } else {
                              const wheelIndex = displayWheels.findIndex(w => w.id === currentWheel.id);
                              const angle = (wheelIndex * 120) * (Math.PI / 180);
                              const radius = 250;
                              wheelX = 400 + Math.cos(angle) * radius;
                              wheelY = 300 + Math.sin(angle) * radius;
                            }
                            
                            const wheelRadius = getWheelSize('real', displayDots.filter((d: any) => d.wheelId == currentWheel.id).length, []);
                            const distance = Math.sqrt(Math.pow(finalX - wheelX, 2) + Math.pow(finalY - wheelY, 2));
                            
                            // Check if dot is dragged outside its current wheel
                            if (distance > wheelRadius + 70) {
                              console.log(`🔗 Delink detected! Dot dragged outside wheel`);
                              setDelinkDialog({
                                open: true,
                                sourceType: 'dot',
                                sourceId: dot.id,
                                sourceName: dot.oneWordSummary,
                                parentType: 'wheel',
                                parentName: currentWheel.heading || currentWheel.name
                              });
                              return; // Don't check for new mappings if delinking
                            }
                          }
                        }
                        
                        // Check collision with all wheels for new mappings (only if not currently mapped)
                        if (!dot.wheelId) {
                          for (const wheel of displayWheels) {
                            // Get wheel position - try multiple sources
                            let wheelX, wheelY;
                            const savedWheelPos = elementPositions[`wheel-${wheel.id}`];
                            
                            if (savedWheelPos) {
                              wheelX = savedWheelPos.x;
                              wheelY = savedWheelPos.y;
                            } else if (wheel.position) {
                              wheelX = wheel.position.x;
                              wheelY = wheel.position.y;
                            } else {
                              // Calculate wheel position based on index like the rendering code
                              const wheelIndex = displayWheels.findIndex(w => w.id === wheel.id);
                              const angle = (wheelIndex * 120) * (Math.PI / 180);
                              const radius = 250;
                              wheelX = 400 + Math.cos(angle) * radius;
                              wheelY = 300 + Math.sin(angle) * radius;
                            }
                            
                            const wheelRadius = getWheelSize('real', displayDots.filter((d: any) => d.wheelId == wheel.id).length, []);
                            const distance = Math.sqrt(Math.pow(finalX - wheelX, 2) + Math.pow(finalY - wheelY, 2));
                            
                            console.log(`🔍 Checking wheel ${wheel.id}:`, {
                              wheelPos: { x: wheelX, y: wheelY },
                              wheelRadius,
                              distance,
                              threshold: (30 + wheelRadius) / 2
                            });
                            
                            // More generous collision detection
                            if (distance < wheelRadius + 50) {
                              console.log(`✅ Collision detected! Showing mapping dialog`);
                              setMappingDialog({
                                open: true,
                                sourceType: 'dot',
                                sourceId: dot.id,
                                sourceName: dot.oneWordSummary,
                                targetType: 'wheel',
                                targetId: wheel.id,
                                targetName: wheel.heading || wheel.name
                              });
                              break;
                            }
                          }
                        }
                      }
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onMouseEnter={() => setHoveredDot(dot)}
                  onMouseLeave={() => setHoveredDot(null)}
                >
                  {/* Pulse animation for voice dots exactly like PreviewMapGrid */}
                  {dot.sourceType === 'voice' && (
                    <div className="absolute inset-0 rounded-full bg-amber-400 opacity-50 animate-ping" />
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                    {dot.sourceType === 'voice' ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      <span className="text-base font-bold">T</span>
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
                      setViewFullDot(dot);
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
                            {dot.sourceType === 'voice' ? <Mic className="w-2 h-2" /> : 'T'}
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Render wheels with improved distribution */}
          {displayWheels.map((wheel: any, wheelIndex: number) => {
            const wheelDots = displayDots.filter((d: any) => d.wheelId == wheel.id || d.wheelId === String(wheel.id));
            const wheelRadius = getWheelSize('real', wheelDots.length, wheelDots);
            
            // Determine wheel position
            let wheelX, wheelY;
            if (wheel.chakraId && wheel.chakraId !== 'standalone') {
              // Use saved position if exists, otherwise position around chakra
              if (elementPositions[`wheel-${wheel.id}`]) {
                wheelX = elementPositions[`wheel-${wheel.id}`].x;
                wheelY = elementPositions[`wheel-${wheel.id}`].y;
              } else {
                // Position wheel inside/around its associated chakra like preview mode  
                const chakra = chakras.find((c: any) => c.id === wheel.chakraId);
                if (chakra) {
                  const wheelsInChakra = displayWheels.filter((w: any) => w.chakraId === wheel.chakraId && w.chakraId !== 'standalone');
                  const wheelIndexInChakra = wheelsInChakra.findIndex((w: any) => w.id === wheel.id);
                  
                  // Get chakra position (either saved position or calculated position)
                  let chakraX, chakraY;
                  if (elementPositions[`chakra-${chakra.id}`]) {
                    chakraX = elementPositions[`chakra-${chakra.id}`].x;
                    chakraY = elementPositions[`chakra-${chakra.id}`].y;
                  } else {
                    const chakraIndex = chakras.findIndex((c: any) => c.id === chakra.id);
                    const cols = Math.max(1, Math.ceil(Math.sqrt(chakras.length)));
                    const row = Math.floor(chakraIndex / cols);
                    const col = chakraIndex % cols;
                    chakraX = 700 + (col * 400);
                    chakraY = 600 + (row * 350);
                  }
                  
                  // Calculate orbit radius to ensure wheels stay inside chakra boundary
                  const chakraRadius = getChakraSize('real', wheelsInChakra.length, wheelsInChakra) / 2;
                  const orbitRadius = Math.max(40, chakraRadius - wheelRadius - 30); // 30px padding from chakra edge
                  const angle = (wheelIndexInChakra * 2 * Math.PI) / wheelsInChakra.length;
                  
                  wheelX = chakraX + Math.cos(angle) * orbitRadius;
                  wheelY = chakraY + Math.sin(angle) * orbitRadius;
                } else {
                  // Chakra not found, treat as standalone
                  const standaloneWheels = displayWheels.filter((w: any) => !w.chakraId || w.chakraId === 'standalone');
                  const standaloneIndex = standaloneWheels.findIndex((w: any) => w.id === wheel.id);
                  
                  if (elementPositions[`wheel-${wheel.id}`]) {
                    wheelX = elementPositions[`wheel-${wheel.id}`].x;
                    wheelY = elementPositions[`wheel-${wheel.id}`].y;
                  } else {
                    const cols = Math.max(2, Math.ceil(Math.sqrt(standaloneWheels.length)));
                    const row = Math.floor(standaloneIndex / cols);
                    const col = standaloneIndex % cols;
                    wheelX = 600 + (col * 280);
                    wheelY = 250 + (row * 220);
                  }
                }
              }
            } else {
              // Standalone wheels - well distributed grid separate from chakras  
              const standaloneWheels = displayWheels.filter((w: any) => !w.chakraId || w.chakraId === 'standalone');
              const standaloneIndex = standaloneWheels.findIndex((w: any) => w.id === wheel.id);
              
              if (elementPositions[`wheel-${wheel.id}`]) {
                wheelX = elementPositions[`wheel-${wheel.id}`].x;
                wheelY = elementPositions[`wheel-${wheel.id}`].y;
              } else {
                // Collision-aware positioning for standalone wheels
                const cols = Math.max(2, Math.ceil(Math.sqrt(standaloneWheels.length)));
                const row = Math.floor(standaloneIndex / cols);
                const col = standaloneIndex % cols;
                const wheelSpacing = 300; // Increased spacing for wheels
                wheelX = 200 + (col * wheelSpacing);
                wheelY = 200 + (row * 260);
                
                // Check for collisions with chakras and other wheels
                let attempts = 0;
                while (attempts < 8) {
                  let collision = false;
                  
                  // Check collision with chakras
                  for (const chakra of chakras) {
                    const chakraPos = elementPositions[`chakra-${chakra.id}`] || { x: 600, y: 400 };
                    const chakraRadius = getChakraSize('real', displayWheels.filter(w => w.chakraId === chakra.id).length) / 2;
                    const distance = Math.sqrt((wheelX - chakraPos.x) ** 2 + (wheelY - chakraPos.y) ** 2);
                    if (distance < chakraRadius + wheelRadius + 100) { // 100px buffer
                      collision = true;
                      break;
                    }
                  }
                  
                  if (!collision) break;
                  
                  wheelX += wheelSpacing / 3;
                  wheelY += 80;
                  attempts++;
                }
              }
            }
            
            // Update wheel position for dot calculations
            wheel.position = { x: wheelX, y: wheelY };
            
            return (
              <div key={wheel.id} className="relative">
                {/* Wheel circle */}
                <div
                  className="absolute rounded-full border-2 border-dashed border-orange-400/60 bg-orange-50/30 cursor-move transition-all duration-200 hover:scale-105 hover:border-orange-500"
                  style={{
                    left: `${wheelX - wheelRadius}px`,
                    top: `${wheelY - wheelRadius}px`,
                    width: `${wheelRadius * 2}px`,
                    height: `${wheelRadius * 2}px`,
                    pointerEvents: 'auto',
                    willChange: 'auto',
                    transform: 'scale(1)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewFullWheel(wheel);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Calculate offset from cursor to element's top-left corner
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left;
                    const offsetY = e.clientY - rect.top;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      e.preventDefault();
                      
                      // Perfect floating dot behavior - element follows cursor exactly where clicked
                      const gridRect = gridContainerRef.current?.getBoundingClientRect();
                      if (gridRect) {
                        // Calculate the exact position so the click point follows the cursor
                        const newX = (e.clientX - gridRect.left - offset.x) / zoom - offsetX / zoom;
                        const newY = (e.clientY - gridRect.top - offset.y) / zoom - offsetY / zoom;
                        
                        setElementPositions(prev => ({
                          ...prev,
                          [`wheel-${wheel.id}`]: { x: newX, y: newY }
                        }));
                      }
                    };
                    
                    const handleMouseUp = (e: MouseEvent) => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      
                      // Calculate final position for collision detection
                      const gridRect = gridContainerRef.current?.getBoundingClientRect();
                      if (gridRect) {
                        const finalX = (e.clientX - gridRect.left - offset.x) / zoom - offsetX / zoom;
                        const finalY = (e.clientY - gridRect.top - offset.y) / zoom - offsetY / zoom;
                        
                        console.log(`🎯 Checking collision for wheel ${wheel.id} at position:`, { x: finalX, y: finalY });
                        
                        // If wheel is currently mapped to a chakra, check if dragged outside (delink)
                        if (wheel.chakraId) {
                          const currentChakra = chakras.find(c => c.id === wheel.chakraId);
                          if (currentChakra) {
                            // Get current chakra position
                            let chakraX, chakraY;
                            const savedChakraPos = elementPositions[`chakra-${currentChakra.id}`];
                            
                            if (savedChakraPos) {
                              chakraX = savedChakraPos.x;
                              chakraY = savedChakraPos.y;
                            } else if (currentChakra.position) {
                              chakraX = currentChakra.position.x;
                              chakraY = currentChakra.position.y;
                            } else {
                              const chakraIndex = chakras.findIndex(c => c.id === currentChakra.id);
                              chakraX = 100 + (chakraIndex * 500);
                              chakraY = 200;
                            }
                            
                            const chakraRadius = currentChakra.radius || 420;
                            const distance = Math.sqrt(Math.pow(finalX - chakraX, 2) + Math.pow(finalY - chakraY, 2));
                            
                            // Check if wheel is dragged outside its current chakra
                            if (distance > chakraRadius / 2 + 50) {
                              console.log(`🔗 Delink detected! Wheel dragged outside chakra`);
                              setDelinkDialog({
                                open: true,
                                sourceType: 'wheel',
                                sourceId: wheel.id,
                                sourceName: wheel.heading || wheel.name,
                                parentType: 'chakra',
                                parentName: currentChakra.heading || currentChakra.name
                              });
                              return; // Don't check for new mappings if delinking
                            }
                          }
                        }
                        
                        // Check collision with all chakras for new mappings (only if not currently mapped)
                        if (!wheel.chakraId) {
                          for (const chakra of chakras) {
                            // Get chakra position - try multiple sources
                            let chakraX, chakraY;
                            const savedChakraPos = elementPositions[`chakra-${chakra.id}`];
                            
                            if (savedChakraPos) {
                              chakraX = savedChakraPos.x;
                              chakraY = savedChakraPos.y;
                            } else if (chakra.position) {
                              chakraX = chakra.position.x;
                              chakraY = chakra.position.y;
                            } else {
                              // Calculate chakra position based on index like the rendering code
                              const chakraIndex = chakras.findIndex(c => c.id === chakra.id);
                              chakraX = 100 + (chakraIndex * 500);
                              chakraY = 200;
                            }
                            
                            const chakraRadius = chakra.radius || 420;
                            const wheelRadius = getWheelSize('real', displayDots.filter((d: any) => d.wheelId == wheel.id).length, []);
                            const distance = Math.sqrt(Math.pow(finalX - chakraX, 2) + Math.pow(finalY - chakraY, 2));
                            
                            console.log(`🔍 Checking chakra ${chakra.id}:`, {
                              chakraPos: { x: chakraX, y: chakraY },
                              chakraRadius,
                              distance,
                              threshold: chakraRadius / 2
                            });
                            
                            // More generous collision detection - check if wheel is inside chakra
                            if (distance < chakraRadius / 2) {
                              console.log(`✅ Collision detected! Showing mapping dialog`);
                              setMappingDialog({
                                open: true,
                                sourceType: 'wheel',
                                sourceId: wheel.id,
                                sourceName: wheel.heading || wheel.name,
                                targetType: 'chakra',
                                targetId: chakra.id,
                                targetName: chakra.heading || chakra.name
                              });
                              break;
                            }
                          }
                        }
                      }
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onMouseEnter={() => setHoveredWheel(wheel)}
                  onMouseLeave={() => setHoveredWheel(null)}
                >
                  {/* Wheel heading on top like preview mode */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="px-4 py-2 rounded-lg text-center shadow-lg border-2 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-800">
                      <div className="font-bold text-sm whitespace-nowrap">
                        {wheel.heading || wheel.name}
                      </div>
                    </div>
                  </div>
                  
                  {/* Wheel content */}
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    <div className="text-center">
                      {/* Content removed - no category text needed */}
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

      {/* Drag-and-Drop Mapping Confirmation Dialog */}
      <AlertDialog open={mappingDialog?.open || false} onOpenChange={() => setMappingDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to map <strong>{mappingDialog?.sourceName}</strong> to <strong>{mappingDialog?.targetName}</strong>?
              {mappingDialog?.sourceType === 'wheel' && " All dots associated with this wheel will also move to the new chakra."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMapConfirm}>
              Yes, Map {mappingDialog?.sourceType === 'dot' ? 'Dot' : 'Wheel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Drag-and-Drop Delink Confirmation Dialog */}
      <AlertDialog open={delinkDialog?.open || false} onOpenChange={() => setDelinkDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delinking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delink <strong>{delinkDialog?.sourceName}</strong> from <strong>{delinkDialog?.parentName}</strong>?
              {delinkDialog?.sourceType === 'wheel' && " All dots in this wheel will also be removed from the chakra."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelinkConfirm} className="bg-red-600 hover:bg-red-700">
              Yes, Delink {delinkDialog?.sourceType === 'dot' ? 'Dot' : 'Wheel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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