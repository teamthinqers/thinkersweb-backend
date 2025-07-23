/**
 * DraggableGrid Component
 * 
 * Complete replacement for algorithmic grid system with manual drag-and-drop
 * positioning of dots, wheels, and chakras with real-time collision detection.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Maximize2, Minimize2, Circle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DragPosition {
  x: number;
  y: number;
  id: string;
  type: 'dot' | 'wheel' | 'chakra';
  radius: number;
  lastModified: Date;
}

interface DragElement extends DragPosition {
  isDragging?: boolean;
  data?: any; // Additional element data (dot/wheel/chakra details)
}

interface CanvasConfig {
  width: number;
  height: number;
  marginX: number;
  marginY: number;
}

interface DraggableGridProps {
  isFullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
  showingRecentFilter?: boolean;
  recentCount?: number;
  className?: string;
}

export function DraggableGrid({ 
  isFullscreen = false, 
  onFullscreenChange,
  showingRecentFilter = false,
  recentCount = 0,
  className = ''
}: DraggableGridProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Grid state
  const [zoom, setZoom] = useState(0.6);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previewMode, setPreviewMode] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Fetch draggable positions
  const { data: dragData, isLoading } = useQuery({
    queryKey: ['/api/drag/positions', previewMode],
    queryFn: () => 
      fetch(`/api/drag/positions?preview=${previewMode}`)
        .then(res => res.json())
        .then(data => data.success ? data.data : null),
    refetchOnWindowFocus: false,
  });
  
  // Position validation mutation
  const validatePositionMutation = useMutation({
    mutationFn: async (params: {
      elementId: string;
      position: { x: number; y: number };
      elementType: string;
      radius: number;
      parentId?: string;
    }) => {
      const response = await fetch('/api/drag/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return response.json();
    }
  });
  
  // Position update mutation
  const updatePositionMutation = useMutation({
    mutationFn: async (params: {
      elementId: string;
      position: { x: number; y: number };
      elementType: string;
    }) => {
      const response = await fetch('/api/drag/position', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drag/positions'] });
    }
  });
  
  // Auto-arrange mutation
  const autoArrangeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/drag/auto-arrange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drag/positions'] });
      toast({
        title: "Auto-arrange Complete",
        description: "All elements have been repositioned optimally.",
      });
    }
  });
  
  // PWA detection
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
  
  // Get elements array from drag data
  const elements: DragElement[] = dragData?.elements || [];
  const canvasConfig: CanvasConfig = dragData?.canvasConfig || {
    width: 2800,
    height: 1800,
    marginX: 200,
    marginY: 200
  };
  
  // Mouse/touch event handlers for canvas panning
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.grid-canvas')) {
      setIsDraggingCanvas(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);
  
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isDraggingCanvas, lastPanPoint]);
  
  const handleCanvasMouseUp = useCallback(() => {
    setIsDraggingCanvas(false);
  }, []);
  
  // Element dragging handlers
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const canvasX = (e.clientX - rect.left - offset.x) / zoom;
    const canvasY = (e.clientY - rect.top - offset.y) / zoom;
    
    setDraggedElement(elementId);
    setDragOffset({
      x: canvasX - element.x,
      y: canvasY - element.y
    });
  }, [elements, offset, zoom]);
  
  const handleElementMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedElement) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const canvasX = (e.clientX - rect.left - offset.x) / zoom;
    const canvasY = (e.clientY - rect.top - offset.y) / zoom;
    
    const newPosition = {
      x: canvasX - dragOffset.x,
      y: canvasY - dragOffset.y
    };
    
    // Update element position locally for smooth dragging
    const element = elements.find(el => el.id === draggedElement);
    if (element) {
      element.x = newPosition.x;
      element.y = newPosition.y;
      element.isDragging = true;
    }
  }, [draggedElement, offset, zoom, dragOffset, elements]);
  
  const handleElementMouseUp = useCallback(async () => {
    if (!draggedElement) return;
    
    const element = elements.find(el => el.id === draggedElement);
    if (!element) return;
    
    // Validate and update position
    try {
      const validationResult = await validatePositionMutation.mutateAsync({
        elementId: element.id,
        position: { x: element.x, y: element.y },
        elementType: element.type,
        radius: element.radius,
        parentId: element.type === 'dot' ? element.data?.wheelId : 
                  element.type === 'wheel' ? element.data?.chakraId : undefined
      });
      
      if (validationResult.success) {
        const finalPosition = validationResult.position || { x: element.x, y: element.y };
        
        // Update in database
        await updatePositionMutation.mutateAsync({
          elementId: element.id,
          position: finalPosition,
          elementType: element.type
        });
        
        if (validationResult.snapped) {
          toast({
            title: "Position Snapped",
            description: "Element position was adjusted to the grid.",
          });
        }
        
        if (validationResult.corrected) {
          toast({
            title: "Position Corrected",
            description: "Element was moved to avoid collisions.",
          });
        }
      } else {
        toast({
          title: "Invalid Position",
          description: validationResult.error || "Position could not be validated.",
          variant: "destructive"
        });
        
        // Revert to original position
        queryClient.invalidateQueries({ queryKey: ['/api/drag/positions'] });
      }
    } catch (error) {
      console.error('Position update failed:', error);
      toast({
        title: "Update Failed",
        description: "Could not update element position.",
        variant: "destructive"
      });
      
      // Revert to original position
      queryClient.invalidateQueries({ queryKey: ['/api/drag/positions'] });
    }
    
    element.isDragging = false;
    setDraggedElement(null);
  }, [draggedElement, elements, validatePositionMutation, updatePositionMutation, toast, queryClient]);
  
  // Reset view function
  const resetView = useCallback(() => {
    setZoom(0.6);
    setOffset({ x: 0, y: 0 });
  }, []);
  
  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (onFullscreenChange) {
      onFullscreenChange(!isFullscreen);
    }
  }, [isFullscreen, onFullscreenChange]);
  
  // Render individual element
  const renderElement = useCallback((element: DragElement) => {
    const style = {
      left: element.x - element.radius,
      top: element.y - element.radius,
      width: element.radius * 2,
      height: element.radius * 2,
      cursor: element.isDragging ? 'grabbing' : 'grab',
      zIndex: element.isDragging ? 1000 : element.type === 'chakra' ? 1 : element.type === 'wheel' ? 2 : 3
    };
    
    const className = `absolute rounded-full transition-all duration-200 border-2 ${
      element.isDragging ? 'shadow-2xl scale-110' : 'hover:shadow-lg hover:scale-105'
    } ${
      element.type === 'dot' ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300' :
      element.type === 'wheel' ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400' :
      'bg-gradient-to-br from-amber-600 to-amber-800 border-amber-500'
    }`;
    
    return (
      <div
        key={element.id}
        style={style}
        className={className}
        onMouseDown={(e) => handleElementMouseDown(e, element.id)}
        title={`${element.type}: ${element.id}`}
      >
        {/* Element content/icon */}
        <div className="w-full h-full flex items-center justify-center text-white">
          {element.type === 'dot' && <Circle className="w-4 h-4" />}
          {element.type === 'wheel' && <Settings className="w-6 h-6" />}
          {element.type === 'chakra' && <Settings className="w-8 h-8" />}
        </div>
      </div>
    );
  }, [handleElementMouseDown]);
  
  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-[500px] bg-amber-50 rounded-xl border-2 border-amber-200`}>
        <div className="text-amber-600 text-lg font-medium">Loading draggable grid...</div>
      </div>
    );
  }
  
  return (
    <div 
      className={`${className} ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-amber-50' 
          : 'rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg'
      } overflow-hidden`}
    >
      {/* Preview Mode Toggle */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className={`flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 ${
          isPWA ? 'px-1.5 py-0.5' : 'px-2 py-1'
        }`}>
          <label className={`font-medium text-amber-800 hidden sm:block ${
            isPWA ? 'text-[10px]' : 'text-xs'
          }`}>Preview Mode</label>
          <label className={`font-medium text-amber-800 sm:hidden ${
            isPWA ? 'text-[10px]' : 'text-xs'
          }`}>Preview</label>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`relative inline-flex items-center rounded-full transition-colors ${
              isPWA ? 'h-3 w-5' : 'h-4 w-7'
            } ${previewMode ? 'bg-amber-500' : 'bg-gray-300'}`}
          >
            <span
              className={`inline-block transform rounded-full bg-white transition-transform ${
                isPWA ? 'h-1.5 w-1.5' : 'h-2 w-2'
              } ${previewMode ? (isPWA ? 'translate-x-2.5' : 'translate-x-4') : 'translate-x-1'}`}
            />
          </button>
        </div>
        
        {/* Recent Filter Indicator */}
        {showingRecentFilter && !previewMode && (
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg px-3 py-2 border-2 border-amber-400 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Showing {recentCount} Recent Dots</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Zoom Controls */}
      <div className={`${isFullscreen ? 'fixed' : 'absolute'} z-10 flex items-center bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 shadow-lg ${
        isFullscreen 
          ? (isPWA ? 'bottom-6 left-6 gap-1 p-1.5' : 'bottom-6 left-6 gap-2 p-2')
          : (isPWA ? 'bottom-4 left-4 gap-1 p-1.5' : 'bottom-4 left-4 gap-2 p-2')
      }`}>
        <Button
          size="sm"
          onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          -
        </Button>
        
        <span className="font-semibold text-amber-800 text-xs min-w-[45px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        
        <Button
          size="sm"
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          +
        </Button>
      </div>
      
      {/* Reset View */}
      <div className={`absolute z-10 ${
        isPWA 
          ? 'top-4 left-1/2 transform -translate-x-1/2'
          : 'top-16 sm:top-4 left-1/2 transform -translate-x-1/2'
      }`}>
        <button
          onClick={resetView}
          className="cursor-pointer hover:scale-110 transition-transform"
          title="Reset View"
        >
          <RotateCcw className="w-6 h-6 text-amber-600 hover:text-amber-700 drop-shadow-lg" />
        </button>
      </div>
      
      {/* Auto-arrange Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={() => autoArrangeMutation.mutate()}
          disabled={autoArrangeMutation.isPending}
          className="bg-purple-500 hover:bg-purple-600 text-white"
          size="sm"
        >
          {autoArrangeMutation.isPending ? 'Arranging...' : 'Auto-arrange'}
        </Button>
      </div>
      
      {/* Fullscreen Toggle */}
      {!isFullscreen && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button 
            onClick={toggleFullscreen}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {isFullscreen && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <Button 
            onClick={toggleFullscreen}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4"
          >
            <Minimize2 className="w-6 h-6" />
          </Button>
        </div>
      )}
      
      {/* Main Grid Canvas */}
      <div 
        ref={containerRef}
        className="grid-canvas w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={draggedElement ? handleElementMouseMove : handleCanvasMouseMove}
        onMouseUp={draggedElement ? handleElementMouseUp : handleCanvasMouseUp}
        onMouseLeave={() => {
          setIsDraggingCanvas(false);
          if (draggedElement) {
            handleElementMouseUp();
          }
        }}
      >
        <div 
          className="relative"
          style={{
            width: canvasConfig.width,
            height: canvasConfig.height,
            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            transformOrigin: '0 0'
          }}
        >
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #d97706 1px, transparent 1px),
                linear-gradient(to bottom, #d97706 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Render all elements */}
          {elements.map(renderElement)}
          
          {/* Canvas boundaries visualization */}
          <div 
            className="absolute border-2 border-dashed border-amber-400 pointer-events-none"
            style={{
              left: canvasConfig.marginX,
              top: canvasConfig.marginY,
              width: canvasConfig.width - 2 * canvasConfig.marginX,
              height: canvasConfig.height - 2 * canvasConfig.marginY
            }}
          />
        </div>
      </div>
      
      {/* Stats Display */}
      <div className="absolute top-4 right-20 z-10 bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 px-3 py-2">
        <div className="text-xs text-amber-800 font-medium">
          Elements: {elements.length} | 
          Dots: {elements.filter(e => e.type === 'dot').length} | 
          Wheels: {elements.filter(e => e.type === 'wheel').length} | 
          Chakras: {elements.filter(e => e.type === 'chakra').length}
        </div>
      </div>
    </div>
  );
}

export default DraggableGrid;