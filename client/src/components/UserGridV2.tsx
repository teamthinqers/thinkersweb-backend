/**
 * UserGridV2 - Complete Rebuild of User Grid System
 * 
 * Features:
 * - Clean state management with separate queries
 * - Safe drag-and-drop with collision detection
 * - Real-time updates via Server-Sent Events
 * - Built-in deduplication and validation
 * - Comprehensive mapping/unmapping functionality
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Eye, 
  Settings, 
  RotateCcw, 
  Mic, 
  Type, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  ZoomOut,
  Unlink,
  Link,
  Move,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Import our new Grid V2 hooks
import { 
  useGridData,
  useMapDotToWheel,
  useMapWheelToChakra,
  useMapDotToChakra,
  useSavePosition,
  type Dot,
  type Wheel,
  type Chakra
} from '@/hooks/useGridV2';

// Component interfaces
interface UserGridV2Props {
  setViewFullWheel?: (wheel: Wheel | null) => void;
  setViewFlashCard?: (dot: Dot | null) => void;
  setViewFullDot?: (dot: Dot | null) => void;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  elementType: 'dot' | 'wheel' | 'chakra';
  elementId: number;
  elementData: Dot | Wheel | Chakra;
  offset: Position;
  currentPosition: Position;
  startPosition: Position;
}

interface MappingDialog {
  isOpen: boolean;
  sourceType: 'dot' | 'wheel';
  sourceId: number;
  sourceName: string;
  targetType: 'wheel' | 'chakra';
  targetId: number;
  targetName: string;
  action: 'map' | 'unmap';
  currentParent?: string;
}

// Constants for grid layout and sizing
const GRID_CONFIG = {
  TOTAL_WIDTH: 1600,
  TOTAL_HEIGHT: 1000,
  MARGIN_X: 100,
  MARGIN_Y: 100,
  
  // Element sizes
  DOT_RADIUS: 35,
  WHEEL_RADIUS: 90,
  CHAKRA_RADIUS: 210,
  
  // Collision detection
  MIN_DISTANCE: 20,
  
  // Animation
  SNAP_THRESHOLD: 50,
  ANIMATION_DURATION: 200
};

// Helper functions
const calculateElementSize = (type: 'dot' | 'wheel' | 'chakra', childCount = 0) => {
  switch (type) {
    case 'dot':
      return GRID_CONFIG.DOT_RADIUS;
    case 'wheel':
      return Math.max(GRID_CONFIG.WHEEL_RADIUS, GRID_CONFIG.WHEEL_RADIUS + (childCount * 8));
    case 'chakra':
      return Math.max(GRID_CONFIG.CHAKRA_RADIUS, GRID_CONFIG.CHAKRA_RADIUS + (childCount * 15));
    default:
      return 50;
  }
};

const checkCollision = (
  pos1: Position & { radius: number },
  pos2: Position & { radius: number },
  minDistance = GRID_CONFIG.MIN_DISTANCE
): boolean => {
  const distance = Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
  return distance < (pos1.radius + pos2.radius + minDistance);
};

const getDropTarget = (
  position: Position,
  elements: Array<{ id: number; x: number; y: number; type: 'dot' | 'wheel' | 'chakra'; radius: number }>,
  draggedElementId: number
) => {
  return elements.find(element => {
    if (element.id === draggedElementId) return false;
    
    const distance = Math.sqrt(
      Math.pow(position.x - element.x, 2) + Math.pow(position.y - element.y, 2)
    );
    return distance < element.radius;
  });
};

export function UserGridV2({
  setViewFullWheel,
  setViewFlashCard,
  setViewFullDot,
  className,
  isFullscreen = false,
  onToggleFullscreen
}: UserGridV2Props) {
  // State management
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.6);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [mappingDialog, setMappingDialog] = useState<MappingDialog | null>(null);
  const [hoveredElement, setHoveredElement] = useState<{ type: 'dot' | 'wheel' | 'chakra'; id: number } | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ type: 'dot' | 'wheel' | 'chakra'; id: number } | null>(null);
  
  // Refs
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const dragOverlayRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { toast } = useToast();
  const gridData = useGridData();
  const mapDotToWheel = useMapDotToWheel();
  const mapWheelToChakra = useMapWheelToChakra();
  const mapDotToChakra = useMapDotToChakra();
  const savePosition = useSavePosition();

  // Extract data from hook
  const { 
    dots, 
    wheels, 
    chakras, 
    stats, 
    isLoading, 
    isError, 
    errors, 
    realTime, 
    refetch 
  } = gridData;
  
  // Debug logging removed - duplicates fixed

  // Create combined elements array for collision detection
  const allElements = React.useMemo(() => {
    const elements: Array<{ id: number; x: number; y: number; type: 'dot' | 'wheel' | 'chakra'; radius: number; data: any }> = [];
    
    dots.forEach(dot => {
      if (dot.positionX !== undefined && dot.positionY !== undefined) {
        elements.push({
          id: dot.id,
          x: dot.positionX,
          y: dot.positionY,
          type: 'dot',
          radius: calculateElementSize('dot'),
          data: dot
        });
      }
    });
    
    wheels.forEach(wheel => {
      if (wheel.positionX !== undefined && wheel.positionY !== undefined) {
        const childDots = dots.filter(d => d.wheelId === wheel.id);
        elements.push({
          id: wheel.id,
          x: wheel.positionX,
          y: wheel.positionY,
          type: 'wheel',
          radius: calculateElementSize('wheel', childDots.length),
          data: wheel
        });
      }
    });
    
    chakras.forEach(chakra => {
      if (chakra.positionX !== undefined && chakra.positionY !== undefined) {
        const childWheels = wheels.filter(w => w.chakraId === chakra.id);
        elements.push({
          id: chakra.id,
          x: chakra.positionX,
          y: chakra.positionY,
          type: 'chakra',
          radius: calculateElementSize('chakra', childWheels.length),
          data: chakra
        });
      }
    });
    
    return elements;
  }, [dots, wheels, chakras]);

  // Event handlers
  const handleMouseDown = useCallback((
    event: React.MouseEvent,
    elementType: 'dot' | 'wheel' | 'chakra',
    elementId: number,
    elementData: Dot | Wheel | Chakra
  ) => {
    event.preventDefault();
    event.stopPropagation();
    
    const container = gridContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom - offset.x;
    const y = (event.clientY - rect.top) / zoom - offset.y;
    
    const elementPos = {
      x: (elementData as any).positionX || 0,
      y: (elementData as any).positionY || 0
    };
    
    setDragState({
      isDragging: true,
      elementType,
      elementId,
      elementData,
      offset: { x: x - elementPos.x, y: y - elementPos.y },
      currentPosition: elementPos,
      startPosition: elementPos
    });
    
    setSelectedElement({ type: elementType, id: elementId });
  }, [zoom, offset]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragState || !gridContainerRef.current) return;
    
    const container = gridContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom - offset.x - dragState.offset.x;
    const y = (event.clientY - rect.top) / zoom - offset.y - dragState.offset.y;
    
    setDragState(prev => prev ? {
      ...prev,
      currentPosition: { x, y }
    } : null);
  }, [dragState, zoom, offset]);

  const handleMouseUp = useCallback(async () => {
    if (!dragState) return;
    
    const { elementType, elementId, currentPosition, startPosition } = dragState;
    
    // Check if element was actually moved
    const moved = Math.abs(currentPosition.x - startPosition.x) > 5 || 
                  Math.abs(currentPosition.y - startPosition.y) > 5;
    
    if (moved) {
      // Check for drop targets
      const dropTarget = getDropTarget(currentPosition, allElements, elementId);
      
      if (dropTarget && dropTarget.type !== elementType) {
        // Handle mapping
        await handleElementMapping(elementType, elementId, dropTarget.type, dropTarget.id, dropTarget.data);
      } else {
        // Save position
        try {
          await savePosition.mutateAsync({
            elementType,
            elementId,
            position: currentPosition,
            validateCollision: true
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to save position",
            variant: "destructive",
          });
        }
      }
    }
    
    setDragState(null);
  }, [dragState, allElements, savePosition, toast]);

  // Setup mouse event listeners
  useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  // Handle element mapping when dropped
  const handleElementMapping = useCallback(async (
    sourceType: 'dot' | 'wheel' | 'chakra',
    sourceId: number,
    targetType: 'dot' | 'wheel' | 'chakra',
    targetId: number,
    targetData: any
  ) => {
    const sourceData = allElements.find(el => el.id === sourceId && el.type === sourceType)?.data;
    if (!sourceData) return;
    
    const sourceName = sourceType === 'dot' 
      ? sourceData.oneWordSummary 
      : sourceData.heading || sourceData.name;
    const targetName = targetType === 'dot'
      ? targetData.oneWordSummary
      : targetData.heading || targetData.name;
    
    // Validate mapping rules
    if (sourceType === 'dot' && targetType === 'wheel') {
      setMappingDialog({
        isOpen: true,
        sourceType: 'dot',
        sourceId,
        sourceName,
        targetType: 'wheel',
        targetId,
        targetName,
        action: 'map',
        currentParent: sourceData.wheelId ? 'wheel' : sourceData.chakraId ? 'chakra' : undefined
      });
    } else if (sourceType === 'dot' && targetType === 'chakra') {
      setMappingDialog({
        isOpen: true,
        sourceType: 'dot',
        sourceId,
        sourceName,
        targetType: 'chakra',
        targetId,
        targetName,
        action: 'map',
        currentParent: sourceData.wheelId ? 'wheel' : sourceData.chakraId ? 'chakra' : undefined
      });
    } else if (sourceType === 'wheel' && targetType === 'chakra') {
      setMappingDialog({
        isOpen: true,
        sourceType: 'wheel',
        sourceId,
        sourceName,
        targetType: 'chakra',
        targetId,
        targetName,
        action: 'map',
        currentParent: sourceData.chakraId ? 'chakra' : undefined
      });
    } else {
      toast({
        title: "Invalid Mapping",
        description: "This mapping combination is not supported.",
        variant: "destructive",
      });
    }
  }, [allElements, toast]);

  // Handle mapping confirmation
  const handleMappingConfirm = useCallback(async () => {
    if (!mappingDialog) return;
    
    try {
      if (mappingDialog.sourceType === 'dot' && mappingDialog.targetType === 'wheel') {
        await mapDotToWheel.mutateAsync({
          dotId: mappingDialog.sourceId,
          wheelId: mappingDialog.targetId
        });
      } else if (mappingDialog.sourceType === 'dot' && mappingDialog.targetType === 'chakra') {
        await mapDotToChakra.mutateAsync({
          dotId: mappingDialog.sourceId,
          chakraId: mappingDialog.targetId
        });
      } else if (mappingDialog.sourceType === 'wheel' && mappingDialog.targetType === 'chakra') {
        await mapWheelToChakra.mutateAsync({
          wheelId: mappingDialog.sourceId,
          chakraId: mappingDialog.targetId
        });
      }
      
      setMappingDialog(null);
    } catch (error) {
      // Error handled by mutation hooks
    }
  }, [mappingDialog, mapDotToWheel, mapDotToChakra, mapWheelToChakra]);

  // Handle unlinking
  const handleUnlink = useCallback(async (
    elementType: 'dot' | 'wheel',
    elementId: number
  ) => {
    try {
      if (elementType === 'dot') {
        await mapDotToWheel.mutateAsync({ dotId: elementId }); // No wheelId = unmap
      } else if (elementType === 'wheel') {
        await mapWheelToChakra.mutateAsync({ wheelId: elementId }); // No chakraId = unmap
      }
    } catch (error) {
      // Error handled by mutation hooks
    }
  }, [mapDotToWheel, mapWheelToChakra]);

  // Grid controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const handleResetView = () => {
    setZoom(0.6);
    setOffset({ x: 0, y: 0 });
  };

  // Render element functions
  const renderDot = useCallback((dot: Dot) => {
    const x = dot.positionX || 0;
    const y = dot.positionY || 0;
    const size = calculateElementSize('dot');
    const isSelected = selectedElement?.type === 'dot' && selectedElement.id === dot.id;
    const isHovered = hoveredElement?.type === 'dot' && hoveredElement.id === dot.id;
    const isDragging = dragState?.elementType === 'dot' && dragState.elementId === dot.id;
    
    // Use drag position if being dragged
    const displayX = isDragging ? dragState.currentPosition.x : x;
    const displayY = isDragging ? dragState.currentPosition.y : y;
    
    return (
      <div
        key={`dot-${dot.id}`}
        className={cn(
          "absolute cursor-grab active:cursor-grabbing transition-all duration-200",
          isSelected && "ring-2 ring-blue-500 ring-offset-2",
          isHovered && "scale-110",
          isDragging && "z-50 cursor-grabbing scale-110 shadow-lg"
        )}
        style={{
          left: displayX - size,
          top: displayY - size,
          width: size * 2,
          height: size * 2,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'dot', dot.id, dot)}
        onMouseEnter={() => setHoveredElement({ type: 'dot', id: dot.id })}
        onMouseLeave={() => setHoveredElement(null)}
      >
        <div 
          className="w-full h-full rounded-full bg-blue-500 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-medium"
          title={dot.summary}
        >
          {dot.sourceType === 'voice' ? <Mic className="w-4 h-4" /> : <Type className="w-4 h-4" />}
        </div>
        
        {/* Quick actions */}
        {isSelected && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setViewFlashCard?.(dot);
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
            {(dot.wheelId || dot.chakraId) && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnlink('dot', dot.id);
                }}
              >
                <Unlink className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }, [selectedElement, hoveredElement, dragState, handleMouseDown, setViewFlashCard, handleUnlink]);

  const renderWheel = useCallback((wheel: Wheel) => {
    const x = wheel.positionX || 0;
    const y = wheel.positionY || 0;
    const wheelDots = dots.filter(d => d.wheelId === wheel.id);
    const size = calculateElementSize('wheel', wheelDots.length);
    const isSelected = selectedElement?.type === 'wheel' && selectedElement.id === wheel.id;
    const isHovered = hoveredElement?.type === 'wheel' && hoveredElement.id === wheel.id;
    const isDragging = dragState?.elementType === 'wheel' && dragState.elementId === wheel.id;
    
    const displayX = isDragging ? dragState.currentPosition.x : x;
    const displayY = isDragging ? dragState.currentPosition.y : y;
    
    return (
      <div
        key={`wheel-${wheel.id}`}
        className={cn(
          "absolute cursor-grab active:cursor-grabbing transition-all duration-200",
          isSelected && "ring-2 ring-orange-500 ring-offset-2",
          isHovered && "scale-105",
          isDragging && "z-50 cursor-grabbing scale-105 shadow-xl"
        )}
        style={{
          left: displayX - size,
          top: displayY - size,
          width: size * 2,
          height: size * 2,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'wheel', wheel.id, wheel)}
        onMouseEnter={() => setHoveredElement({ type: 'wheel', id: wheel.id })}
        onMouseLeave={() => setHoveredElement(null)}
      >
        <div 
          className="w-full h-full rounded-full border-4 border-orange-500 bg-orange-100 flex items-center justify-center text-orange-700 text-sm font-semibold shadow-lg"
          style={{ backgroundColor: wheel.color || '#fed7aa' }}
          title={wheel.heading}
        >
          <div className="text-center">
            <div className="font-bold">{wheel.heading.slice(0, 12)}</div>
            <div className="text-xs">{wheelDots.length} dots</div>
          </div>
        </div>
        
        {/* Render dots inside wheel */}
        {wheelDots.map((dot, index) => {
          const angle = (index / wheelDots.length) * 2 * Math.PI;
          const dotRadius = size * 0.6;
          const dotX = Math.cos(angle) * dotRadius;
          const dotY = Math.sin(angle) * dotRadius;
          
          return (
            <div
              key={`wheel-dot-${dot.id}`}
              className="absolute w-6 h-6 rounded-full bg-blue-500 border border-white cursor-pointer"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(${dotX - 12}px, ${dotY - 12}px)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setViewFlashCard?.(dot);
              }}
              title={dot.oneWordSummary}
            >
              {dot.sourceType === 'voice' ? <Mic className="w-3 h-3 text-white m-1.5" /> : <Type className="w-3 h-3 text-white m-1.5" />}
            </div>
          );
        })}
        
        {/* Quick actions */}
        {isSelected && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setViewFullWheel?.(wheel);
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
            {wheel.chakraId && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnlink('wheel', wheel.id);
                }}
              >
                <Unlink className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }, [dots, selectedElement, hoveredElement, dragState, handleMouseDown, setViewFullWheel, setViewFlashCard, handleUnlink]);

  const renderChakra = useCallback((chakra: Chakra) => {
    const x = chakra.positionX || 0;
    const y = chakra.positionY || 0;
    const chakraWheels = wheels.filter(w => w.chakraId === chakra.id);
    const size = calculateElementSize('chakra', chakraWheels.length);
    const isSelected = selectedElement?.type === 'chakra' && selectedElement.id === chakra.id;
    const isHovered = hoveredElement?.type === 'chakra' && hoveredElement.id === chakra.id;
    const isDragging = dragState?.elementType === 'chakra' && dragState.elementId === chakra.id;
    
    const displayX = isDragging ? dragState.currentPosition.x : x;
    const displayY = isDragging ? dragState.currentPosition.y : y;
    
    return (
      <div
        key={`chakra-${chakra.id}`}
        className={cn(
          "absolute cursor-grab active:cursor-grabbing transition-all duration-200",
          isSelected && "ring-2 ring-amber-500 ring-offset-2",
          isHovered && "scale-102",
          isDragging && "z-50 cursor-grabbing scale-102 shadow-2xl"
        )}
        style={{
          left: displayX - size,
          top: displayY - size,
          width: size * 2,
          height: size * 2,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'chakra', chakra.id, chakra)}
        onMouseEnter={() => setHoveredElement({ type: 'chakra', id: chakra.id })}
        onMouseLeave={() => setHoveredElement(null)}
      >
        <div 
          className="w-full h-full rounded-full border-4 border-amber-600 bg-amber-200 flex items-center justify-center text-amber-800 text-lg font-bold shadow-xl"
          style={{ backgroundColor: chakra.color || '#fbbf24' }}
          title={chakra.heading}
        >
          <div className="text-center">
            <div className="font-bold">{chakra.heading.slice(0, 15)}</div>
            <div className="text-sm">{chakraWheels.length} wheels</div>
          </div>
        </div>
        
        {/* Render wheels inside chakra */}
        {chakraWheels.map((wheel, index) => {
          const angle = (index / chakraWheels.length) * 2 * Math.PI;
          const wheelRadius = size * 0.7;
          const wheelX = Math.cos(angle) * wheelRadius;
          const wheelY = Math.sin(angle) * wheelRadius;
          const wheelDots = dots.filter(d => d.wheelId === wheel.id);
          
          return (
            <div
              key={`chakra-wheel-${wheel.id}`}
              className="absolute w-16 h-16 rounded-full bg-orange-500 border-2 border-white cursor-pointer shadow-md"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(${wheelX - 32}px, ${wheelY - 32}px)`,
                backgroundColor: wheel.color || '#f97316'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setViewFullWheel?.(wheel);
              }}
              title={wheel.heading}
            >
              <div className="text-center text-white text-xs pt-2">
                <div className="font-bold">{wheel.heading.slice(0, 8)}</div>
                <div>{wheelDots.length}</div>
              </div>
            </div>
          );
        })}
        
        {/* Quick actions */}
        {isSelected && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // Could open chakra detail view
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }, [wheels, dots, selectedElement, hoveredElement, dragState, handleMouseDown, setViewFullWheel]);

  // Loading and error states
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grid data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load grid data</p>
          <Button onClick={refetch} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full border rounded-lg bg-gray-50", className)}>
      {/* Grid Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* Real-time connection status */}
        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-md shadow-sm">
          {realTime?.isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-xs">
            {realTime?.isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex gap-1 bg-white rounded-md shadow-sm">
          <Button size="sm" variant="ghost" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleResetView}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Fullscreen Toggle */}
        {onToggleFullscreen && (
          <Button size="sm" variant="outline" onClick={onToggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Grid Statistics */}
      {stats && (
        <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-md shadow-sm">
          <div className="text-xs space-y-1">
            <div>Dots: {stats.totals.dots} ({stats.mappings.mappedDots} mapped)</div>
            <div>Wheels: {stats.totals.wheels} ({stats.mappings.mappedWheels} mapped)</div>
            <div>Chakras: {stats.totals.chakras}</div>
          </div>
        </div>
      )}

      {/* Main Grid Container */}
      <div
        ref={gridContainerRef}
        className="w-full h-full overflow-hidden cursor-move relative"
        style={{
          transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
          transformOrigin: '0 0'
        }}
        onClick={() => setSelectedElement(null)}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            opacity: 0.5
          }}
        />
        
        {/* Render all elements */}
        <div className="relative w-full h-full">
          {/* Render chakras first (lowest layer) */}
          {chakras.map(renderChakra)}
          
          {/* Render wheels second */}
          {wheels.filter(w => !w.chakraId).map(renderWheel)}
          
          {/* Render unlinked dots last (highest layer) */}
          {dots.filter(d => !d.wheelId && !d.chakraId).map(renderDot)}
        </div>
      </div>

      {/* Mapping Confirmation Dialog */}
      <AlertDialog open={mappingDialog?.isOpen} onOpenChange={(open) => !open && setMappingDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              {mappingDialog && (
                <>
                  <p>
                    Map <strong>{mappingDialog.sourceName}</strong> ({mappingDialog.sourceType}) 
                    to <strong>{mappingDialog.targetName}</strong> ({mappingDialog.targetType})?
                  </p>
                  {mappingDialog.currentParent && (
                    <p className="mt-2 text-amber-600">
                      Note: This will unmap it from its current {mappingDialog.currentParent}.
                    </p>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMappingConfirm}>
              {mappingDialog?.currentParent ? 'Transfer' : 'Map'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}