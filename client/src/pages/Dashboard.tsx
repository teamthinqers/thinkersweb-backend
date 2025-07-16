// Dashboard component - Full functionality restored
import React, { useState, useEffect, useRef } from 'react';
import { Brain, ArrowLeft, Search, History, Info, Settings, X, Maximize2, Minimize2, RotateCcw, Mic, Type } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DotFullView from '@/components/DotFullView';
import WheelFullView from '@/components/WheelFullView';
import DotFlashCard from '@/components/DotFlashCard';
import WheelFlashCard from '@/components/WheelFlashCard';

interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId: string;
  timestamp: Date;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai';
  voiceData?: {
    summaryVoiceUrl?: string;
    anchorVoiceUrl?: string;
    pulseVoiceUrl?: string;
  } | null;
}

interface Wheel {
  id: string;
  name: string;
  heading?: string;
  purpose?: string;
  timeline?: string;
  category: string;
  color: string;
  dots: Dot[];
  connections: string[];
  position: { x: number; y: number };
  parentWheelId?: string;
  createdAt?: Date;
}

interface DashboardProps {
  wheels?: Wheel[];
  dots?: Dot[];
  setViewFullWheel?: (wheelId: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  wheels = [], 
  dots = [], 
  setViewFullWheel = () => {} 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
  const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
  const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
  const [showRecentFilter, setShowRecentFilter] = useState(false);
  const [recentDotsCount, setRecentDotsCount] = useState(4);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [onlyWheels, setOnlyWheels] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hoveredDot, setHoveredDot] = useState<string | null>(null);
  const [hoveredWheel, setHoveredWheel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if we're in PWA mode
  const [isPWA, setIsPWA] = useState(false);
  
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    };
    
    checkPWA();
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkPWA();
    mediaQuery.addListener(handleChange);
    
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const filteredDots = dots.filter(dot =>
    dot.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dot.anchor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dot.pulse.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dot.oneWordSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create preview data
  const previewDots: Dot[] = [
    {
      id: 'preview-1',
      oneWordSummary: 'Innovation',
      summary: 'Need to establish a culture of innovation within the company',
      anchor: 'Research shows that companies with innovation cultures outperform competitors by 30%',
      pulse: 'excited',
      wheelId: 'preview-wheel-1',
      timestamp: new Date('2024-01-15'),
      sourceType: 'text',
      captureMode: 'natural'
    },
    {
      id: 'preview-2',
      oneWordSummary: 'Leadership',
      summary: 'Strengthen leadership development programs',
      anchor: 'Current leadership pipeline needs reinforcement to handle growth',
      pulse: 'focused',
      wheelId: 'preview-wheel-2',
      timestamp: new Date('2024-01-20'),
      sourceType: 'voice',
      captureMode: 'natural'
    }
  ];

  const previewWheels: Wheel[] = [
    {
      id: 'preview-wheel-1',
      name: 'Innovation',
      heading: 'Innovation Strategy',
      purpose: 'Build sustainable innovation capabilities',
      timeline: '6 months',
      category: 'business',
      color: 'amber',
      dots: previewDots.slice(0, 1),
      connections: [],
      position: { x: 300, y: 200 }
    },
    {
      id: 'preview-wheel-2',
      name: 'Leadership',
      heading: 'Leadership Development',
      purpose: 'Strengthen organizational leadership',
      timeline: '3 months',
      category: 'business',
      color: 'blue',
      dots: previewDots.slice(1, 2),
      connections: [],
      position: { x: 600, y: 300 }
    }
  ];

  // Grid component with full functionality
  const DotWheelsGrid = () => {
    const actualDotsToDisplay = previewMode ? previewDots : dots;
    const actualWheelsToDisplay = previewMode ? previewWheels : wheels;
    
    // Mouse and touch handlers for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!isPWA) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging && dragStart && !isPWA) {
        const newOffset = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        };
        setOffset(newOffset);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    if (!previewMode && wheels.length === 0 && dots.length === 0) {
      return (
        <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
          {/* Preview toggle */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              Empty
            </span>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200">
              <label className="text-sm font-medium text-amber-800">Preview Mode</label>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  previewMode ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    previewMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <p className="text-lg font-semibold text-amber-800 mb-2">Start saving your Dots to get a similar map</p>
              <p className="text-sm text-amber-600">Your dots will appear here as an interactive map</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Preview Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 px-2 py-1">
            <label className="font-medium text-amber-800 text-xs">Preview Mode</label>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`relative inline-flex items-center rounded-full transition-colors h-4 w-7 ${
                previewMode ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block transform rounded-full bg-white transition-transform h-2 w-2 ${
                  previewMode ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Only Wheels Toggle */}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 px-2 py-1">
            <label className="font-medium text-amber-800 text-xs">Only Wheels</label>
            <button
              onClick={() => setOnlyWheels(!onlyWheels)}
              className={`relative inline-flex items-center rounded-full transition-colors h-4 w-7 ${
                onlyWheels ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block transform rounded-full bg-white transition-transform h-2 w-2 ${
                  onlyWheels ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Status and Controls - Top Right */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800">
            Total Dots: {actualDotsToDisplay.length}
          </button>
          <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800">
            Total Wheels: {actualWheelsToDisplay.length}
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Grid Container */}
        <div 
          ref={containerRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Dots */}
          {!onlyWheels && actualDotsToDisplay.map((dot, index) => {
            const gridSize = Math.ceil(Math.sqrt(actualDotsToDisplay.length));
            const x = (index % gridSize) * 120 + 100;
            const y = Math.floor(index / gridSize) * 120 + 100;

            return (
              <div
                key={dot.id}
                className="absolute cursor-pointer group"
                style={{ left: x, top: y }}
                onMouseEnter={() => setHoveredDot(dot.id)}
                onMouseLeave={() => setHoveredDot(null)}
                onClick={() => setViewFullDot(dot)}
              >
                {/* Dot */}
                <div className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg ${
                  dot.sourceType === 'voice' 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-600 text-white' 
                    : 'bg-gradient-to-br from-orange-400 to-amber-500 border-orange-600 text-white'
                }`}>
                  <div className="flex items-center justify-center mb-1">
                    {dot.sourceType === 'voice' ? (
                      <Mic className="w-3 h-3" />
                    ) : (
                      <Type className="w-3 h-3" />
                    )}
                  </div>
                  <div className="text-[8px] text-center leading-tight px-1">
                    {dot.oneWordSummary}
                  </div>
                </div>

                {/* Flash Card */}
                {hoveredDot === dot.id && (
                  <div className="absolute left-20 top-0 z-50">
                    <DotFlashCard dot={dot} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Wheels */}
          {actualWheelsToDisplay.map((wheel, index) => {
            const x = 300 + (index * 200);
            const y = 300;

            return (
              <div
                key={wheel.id}
                className="absolute cursor-pointer group"
                style={{ left: x, top: y }}
                onMouseEnter={() => setHoveredWheel(wheel.id)}
                onMouseLeave={() => setHoveredWheel(null)}
                onClick={() => setSelectedWheel && setSelectedWheel(wheel.id)}
              >
                {/* Wheel Circle */}
                <div className="w-24 h-24 rounded-full border-3 border-amber-600 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center relative group-hover:scale-110 transition-all duration-200">
                  <div className="text-center">
                    <div className="text-xs font-bold text-amber-800 mb-1">
                      {wheel.heading || wheel.name}
                    </div>
                    <div className="text-[8px] text-amber-600">
                      {wheel.dots.length} dots
                    </div>
                  </div>
                </div>

                {/* Flash Card */}
                {hoveredWheel === wheel.id && (
                  <div className="absolute left-28 top-0 z-50">
                    <WheelFlashCard wheel={wheel} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-600" />
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="/dotspark-logo-icon.jpeg" 
                alt="DotSpark" 
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Brain className="w-5 h-5 text-amber-500" />
                  My DotSpark Neura
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Enter keywords to search for a Dot"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2 border-amber-200 focus:border-amber-400 bg-white/90 backdrop-blur"
          />
        </div>

        {/* Recent Dots Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowRecentFilter(!showRecentFilter)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            <History className="w-4 h-4" />
            Recent Dots
          </button>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">
              Search Results ({filteredDots.length})
            </h3>
            {filteredDots.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-lg border-2 border-amber-200">
                <p className="text-amber-700">No dots found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDots.map((dot) => (
                  <div
                    key={dot.id}
                    onClick={() => setViewFullDot(dot)}
                    className="bg-white border-2 border-amber-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dot Wheels Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-amber-800">Dot Wheels Map</h3>
            <Popover>
              <PopoverTrigger>
                <Info className="w-4 h-4 text-amber-600 hover:text-amber-800 cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">How Dot Wheels Work</h4>
                  <p className="text-sm text-gray-600">
                    Your dots are displayed in an interactive grid. When you save 9 dots of the same category, 
                    DotSpark automatically organizes them into a Wheel (bigger dot) for better organization.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <DotWheelsGrid />
        </div>
      </div>

      {/* Modals */}
      {viewFullDot && (
        <DotFullView 
          dot={viewFullDot} 
          onClose={() => setViewFullDot(null)}
          onDelete={(dotId) => {
            setViewFullDot(null);
            window.location.reload();
          }}
        />
      )}

      {selectedWheel && (
        <WheelFullView 
          wheelId={selectedWheel}
          onClose={() => setSelectedWheel(null)}
          wheels={wheels}
          dots={dots}
        />
      )}
    </div>
  );
};

export default Dashboard;