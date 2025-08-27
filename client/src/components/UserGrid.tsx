import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Eye, Settings, RotateCcw, Mic, Type, Maximize, Minimize, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import UserContentCreation from './UserContentCreation';
import DotFullView from './DotFullView';
import DotFlashCard from './DotFlashCard';
import WheelFullView from './WheelFullView';

// Types for the data structures
interface Dot {
  id: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId?: string;
  position?: { x: number; y: number };
  oneWordSummary?: string;
}

interface Wheel {
  id: string;
  heading: string;
  goals: string;
  timeline: string;
  chakraId?: string;
  position?: { x: number; y: number };
  name?: string;
  purpose?: string;
}

interface Chakra {
  id: string;
  heading: string;
  purpose: string;
  timeline: string;
  position?: { x: number; y: number };
  name?: string;
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
        {/* Content will be rendered here */}
        <div className="w-full h-full">
          <p className="text-center text-gray-500 mt-20">Interactive grid content will be rendered here</p>
        </div>
      </div>

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
          return data.data || [];
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch user dots:', error);
        return [];
      }
    },
    enabled: !isDemoMode
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
          return data.data || [];
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch user wheels:', error);
        return [];
      }
    },
    enabled: !isDemoMode
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
          return data.data || [];
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch user chakras:', error);
        return [];
      }
    },
    enabled: !isDemoMode
  });

  const isLoading = dotsLoading || wheelsLoading || chakrasLoading;

  // Filter to regular wheels (non-chakra wheels)
  const regularWheels = userWheels.filter((wheel: any) => !wheel.chakraId);
  const chakras = userChakras;

  return (
    <div className="space-y-4">
      {/* Content Creation Modal */}
      {showCreation && (
        <UserContentCreation 
          onClose={() => setShowCreation(false)}
          userId={userId}
        />
      )}

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