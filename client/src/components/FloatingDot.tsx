import { useState, useRef, useEffect } from 'react';

interface FloatingDotProps {
  onClick?: () => void;
}

export default function FloatingDot({ onClick }: FloatingDotProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingDotPosition');
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition);
      setPosition(parsed);
    } else {
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight / 2
      });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dotRef.current) return;
    
    const rect = dotRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setHasMoved(false);
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setHasMoved(true);
      setIsDragging(true);
      
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      const clampedX = Math.max(0, Math.min(maxX, newX));
      const clampedY = Math.max(0, Math.min(maxY, newY));
      
      setPosition({ x: clampedX, y: clampedY });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      
      if (hasMoved || isDragging) {
        const currentPosition = { 
          x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - offsetX)),
          y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - offsetY))
        };
        localStorage.setItem('floatingDotPosition', JSON.stringify(currentPosition));
      }
      
      setIsDragging(false);
      setTimeout(() => setHasMoved(false), 100);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!hasMoved && !isDragging && onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={dotRef}
      className="fixed z-50 cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="relative cursor-move">
        {/* Brand-aligned pulsing rings that enhance the logo's dot concept - only show when NOT dragging */}
        {!isDragging && (
          <>
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-25 animate-ping pointer-events-none"></div>
            <div className="absolute inset-1 w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-500 opacity-35 animate-ping pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
            <div className="absolute inset-2 w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 opacity-45 animate-ping pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
            <div className="absolute inset-3 w-8 h-8 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 opacity-55 animate-ping pointer-events-none" style={{ animationDelay: '1.2s' }}></div>
          </>
        )}
        
        {/* DotSpark logo - spins fast when dragging, pulses when idle */}
        <img 
          src="/dotspark-logo-transparent.png?v=1" 
          alt="DotSpark" 
          className={`w-14 h-14 transition-all duration-300 ${
            isDragging ? 'animate-spin' : 'animate-pulse drop-shadow-lg'
          }`}
          style={{ 
            animationDuration: isDragging ? '0.15s' : '2s',
            animationDelay: isDragging ? '0s' : '0.3s',
            filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))'
          }}
        />
        
        {/* Tooltip on hover - only show when not dragging */}
        {!isDragging && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl group">
            Click to create
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
