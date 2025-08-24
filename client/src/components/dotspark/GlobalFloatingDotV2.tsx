import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function GlobalFloatingDotV2() {
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('global-floating-dot-v2-position');
    return saved ? JSON.parse(saved) : { x: 20, y: 100 };
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dotRef.current) return;
    
    const rect = dotRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      // Check if we've moved enough to consider it a drag (threshold of 5 pixels)
      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + 
        Math.pow(e.clientY - dragStartPos.y, 2)
      );
      
      if (dragDistance > 5 && !hasDragged) {
        setIsDragging(true);
        setHasDragged(true);
      }
      
      if (hasDragged || dragDistance > 5) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        const clampedX = Math.max(0, Math.min(window.innerWidth - 200, newX));
        const clampedY = Math.max(0, Math.min(window.innerHeight - 100, newY));
        
        setPosition({ x: clampedX, y: clampedY });
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      
      // Save position if dragged
      if (hasDragged) {
        const currentPosition = { 
          x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - offsetX)),
          y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - offsetY))
        };
        localStorage.setItem('global-floating-dot-v2-position', JSON.stringify(currentPosition));
      }
      
      setIsDragging(false);
      setHasDragged(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dragStartPos, hasDragged]);

  if (!isOpen) {
    return (
      <div
        ref={dotRef}
        className="fixed z-[9999] select-none touch-none"
        style={{ 
          left: position.x, 
          top: position.y,
          pointerEvents: 'auto'
        }}
      >
        <div 
          className="relative cursor-move"
          onMouseDown={handleMouseDown}
        >
          {/* Enhanced pulsing rings - preserving original visual design */}
          {!isDragging && (
            <>
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-500/40 animate-ping pointer-events-none"></div>
              <div className="absolute inset-1 w-10 h-10 rounded-full bg-orange-500/50 animate-ping pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-2 w-8 h-8 rounded-full bg-yellow-500/60 animate-ping pointer-events-none" style={{ animationDelay: '1s' }}></div>
            </>
          )}
          
          {/* Main dot with original gradient and styling */}
          <Button
            onClick={(e) => {
              console.log('Floating dot clicked', { hasDragged, isDragging });
              if (!hasDragged && !isDragging) {
                e.stopPropagation();
                setIsSpinning(true);
                setTimeout(() => {
                  console.log('Opening floating dot modal');
                  setIsOpen(true);
                  setIsSpinning(false);
                }, 600);
              }
            }}
            className={cn(
              "w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl p-0 cursor-move",
              isDragging 
                ? "shadow-2xl ring-4 ring-amber-300/50 scale-110" 
                : isSpinning 
                ? "animate-spin scale-110" 
                : "hover:scale-110 animate-pulse"
            )}
          >
            {/* Inner white dot - preserving original design */}
            <div className={cn(
              "w-4 h-4 rounded-full bg-white transition-all duration-300",
              isDragging ? "scale-125" : "animate-pulse"
            )} style={{ animationDelay: isDragging ? '0s' : '0.3s' }} />
            
            {/* Attention-grabbing indicators - preserving original design */}
            {!isDragging && (
              <>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.7s' }}></div>
              </>
            )}
            
            {/* Dragging state indicator */}
            {isDragging && (
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-dashed border-amber-300 animate-spin"></div>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={() => setIsOpen(false)} />
      
      <div
        ref={dotRef}
        className="fixed z-[9999]"
        style={{ 
          left: Math.max(20, Math.min(position.x, window.innerWidth - 420)),
          top: Math.max(20, Math.min(position.y, window.innerHeight - 300)),
          pointerEvents: 'auto'
        }}
      >
        <Card className="w-96 bg-white border-2 border-amber-300 shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Test Modal Working!
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                ✅ Modal is working! Position: {position.x}, {position.y}
              </p>
              <p className="text-sm text-gray-600">
                ✅ Screen: {window.innerWidth}x{window.innerHeight}
              </p>
              <p className="text-sm text-green-600 font-medium">
                ✅ The floating dot modal is displaying correctly!
              </p>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-amber-600 text-white px-4 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Close Test Modal
              </button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export default GlobalFloatingDotV2;