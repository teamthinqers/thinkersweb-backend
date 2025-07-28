import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize, Minimize } from "lucide-react";

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

  // Fetch preview data
  const { data: previewDots = [], isLoading: dotsLoading } = useQuery({
    queryKey: ['/api/dots', { preview: true }],
    queryFn: () => fetch('/api/dots?preview=true').then(res => res.json())
  });

  const { data: previewWheels = [], isLoading: wheelsLoading } = useQuery({
    queryKey: ['/api/wheels', { preview: true }],
    queryFn: () => fetch('/api/wheels?preview=true').then(res => res.json())
  });

  // Reset view function
  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(0.6);
  };

  // Drag handlers
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
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setDragStart(null);
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

  // Create dots with positions
  const dotsWithPositions = previewDots.map((dot: any) => ({
    ...dot,
    position: dot.position || { x: Math.random() * 800 + 100, y: Math.random() * 600 + 100 }
  }));

  // Create wheels with positions
  const wheelsWithPositions = previewWheels.map((wheel: any) => ({
    ...wheel,
    position: wheel.position || { x: Math.random() * 800 + 200, y: Math.random() * 600 + 200 },
    radius: wheel.radius || 80
  }));

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

      {/* Controls */}
      <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 flex gap-2">
        <Button
          onClick={resetView}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur border-amber-200"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => setIsFullscreen(!isFullscreen)}
          size="sm"
          variant="outline"
          className="bg-white/90 backdrop-blur border-amber-200"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>

      {/* Grid Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ minHeight: isFullscreen ? '100vh' : '500px' }}
      >
        <div
          className="absolute inset-0 transition-transform duration-200"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Render Wheels */}
          {wheelsWithPositions.map((wheel) => (
            <div
              key={wheel.id}
              className="absolute cursor-pointer hover:scale-105 transition-transform"
              style={{
                left: wheel.position.x,
                top: wheel.position.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => setViewFullWheel(wheel)}
            >
              {/* Wheel Circle */}
              <div
                className={`border-2 border-dashed rounded-full flex items-center justify-center ${wheel.color || 'border-orange-400'}`}
                style={{
                  width: wheel.radius * 2,
                  height: wheel.radius * 2
                }}
              >
                <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-lg border">
                  <h4 className="font-bold text-sm text-gray-800">{wheel.heading || wheel.name}</h4>
                  <p className="text-xs text-gray-600">{wheel.goals || wheel.purpose}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Render Dots */}
          {dotsWithPositions.map((dot) => (
            <div
              key={dot.id}
              className="absolute cursor-pointer hover:scale-110 transition-transform"
              style={{
                left: dot.position.x,
                top: dot.position.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => setViewFlashCard(dot)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10 flex gap-2">
        <Badge className="bg-white/90 backdrop-blur text-amber-800 border-amber-200">
          {previewDots.length} Dots
        </Badge>
        <Badge className="bg-white/90 backdrop-blur text-orange-800 border-orange-200">
          {previewWheels.length} Wheels
        </Badge>
      </div>
    </div>
  );
};