import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mic, Type, Eye, Brain, Network, Zap, Search, Clock, Info, Database, Cpu, Sparkles, Users, Maximize, Minimize, RotateCcw, X, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DotFullView from "@/components/DotFullView";
import DotFlashCard from "@/components/DotFlashCard";
import { isRunningAsStandalone } from "@/lib/pwaUtils";


// Data structure for dots
interface Dot {
  id: string;
  oneWordSummary: string; // Auto-generated one-word summary for flash card heading
  summary: string; // 220 chars max
  anchor: string; // 300 chars max  
  pulse: string; // 1 word emotion
  wheelId: string;
  timestamp: Date;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai'; // Natural mode vs AI mode
  voiceData?: {
    summaryVoiceUrl?: string;
    anchorVoiceUrl?: string;
    pulseVoiceUrl?: string;
  } | null;
}

interface Wheel {
  id: string;
  name: string;
  category: string;
  color: string;
  dots: Dot[];
  connections: string[]; // IDs of connected wheels
  position: { x: number; y: number };
}

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
  const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
  const [viewFlashCard, setViewFlashCard] = useState<Dot | null>(null);
  const [searchResults, setSearchResults] = useState<Dot[]>([]);
  const [showRecentFilter, setShowRecentFilter] = useState(false);
  const [recentDotsCount, setRecentDotsCount] = useState(4);
  const [showPreview, setShowPreview] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [onlySparks, setOnlySparks] = useState(false);
  
  // PWA detection for smaller button sizing
  const isPWA = isRunningAsStandalone();

  // Fetch real dots from API with graceful error handling
  const { data: dots = [], isLoading, refetch, error } = useQuery({
    queryKey: ['/api/dots'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/dots');
        if (!response.ok) {
          return [];
        }
        return response.json();
      } catch (error) {
        return [];
      }
    },
    retry: false,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component mount if cached
    enabled: true, // Always enabled but with aggressive caching
    refetchInterval: false, // Disable automatic refetching
    gcTime: 5 * 60 * 1000 // Keep data in cache for 5 minutes
  });

  // Example data for preview mode when no dots exist
  const exampleDots: Dot[] = [
    {
      id: "example-1",
      oneWordSummary: "Microservices",
      summary: "Learned about microservices architecture patterns and their trade-offs in distributed systems",
      anchor: "Discussed with senior architect about breaking down monolith, focusing on domain boundaries and data consistency challenges",
      pulse: "curious",
      wheelId: "example-wheel-1",
      timestamp: new Date(),
      sourceType: 'text',
      captureMode: 'natural'
    },
    {
      id: "example-2", 
      oneWordSummary: "Patterns",
      summary: "Completed advanced React patterns workshop covering render props, higher-order components",
      anchor: "Workshop by Kent C. Dodds, practiced compound components pattern with real examples from UI libraries",
      pulse: "focused",
      wheelId: "example-wheel-1",
      timestamp: new Date(),
      sourceType: 'voice',
      captureMode: 'natural'
    },
    {
      id: "example-3",
      oneWordSummary: "Meditation",
      summary: "Started morning meditation routine, noticed improved focus and reduced anxiety levels",
      anchor: "Using Headspace app, 10-minute sessions before work, tracking mood changes and productivity correlations",
      pulse: "calm",
      wheelId: "example-wheel-2", 
      timestamp: new Date(),
      sourceType: 'text',
      captureMode: 'ai'
    }
  ];

  // Search functionality
  React.useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = dots.filter((dot: Dot) => 
        dot.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dot.anchor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dot.pulse.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, dots]);

  // Mock wheels data for visualization
  const [wheels] = useState<Wheel[]>([
    {
      id: '1',
      name: 'Innovation Ideas',
      category: 'Technology',
      color: '#3B82F6',
      dots: [
        {
          id: '1',
          oneWordSummary: 'PlantCare',
          summary: 'AI-powered plant care system that learns from user behavior and environmental data',
          anchor: 'Inspired by struggling to keep houseplants alive. Combines IoT sensors with machine learning for personalized care recommendations.',
          pulse: 'excited',
          wheelId: '1',
          timestamp: new Date(),
          sourceType: 'text',
          captureMode: 'natural'
        }
      ],
      connections: ['2'],
      position: { x: 100, y: 100 }
    },
    {
      id: '2', 
      name: 'Business Strategies',
      category: 'Professional',
      color: '#10B981',
      dots: [
        {
          id: '2',
          oneWordSummary: 'MicroSaaS',
          summary: 'Focus on micro-SaaS products targeting specific professional niches instead of broad markets',
          anchor: 'Research shows specialized tools have higher retention rates and customer lifetime value than generic solutions.',
          pulse: 'confident',
          wheelId: '2',
          timestamp: new Date(),
          sourceType: 'voice',
          captureMode: 'natural'
        }
      ],
      connections: ['1', '3'],
      position: { x: 300, y: 150 }
    },
    {
      id: '3',
      name: 'Learning Insights', 
      category: 'Personal Growth',
      color: '#F59E0B',
      dots: [
        {
          id: '3',
          oneWordSummary: 'Teaching',
          summary: 'Active recall through teaching others is the most effective way to solidify new knowledge',
          anchor: 'Feynman technique in practice - explaining complex concepts in simple terms reveals knowledge gaps and strengthens understanding.',
          pulse: 'enlightened',
          wheelId: '3',
          timestamp: new Date(),
          sourceType: 'voice',
          captureMode: 'ai'
        }
      ],
      connections: ['2'],
      position: { x: 200, y: 280 }
    }
  ]);

  const DotCard: React.FC<{ dot: Dot; isPreview?: boolean; onClick?: () => void }> = ({ dot, isPreview = false, onClick }) => {
    const handleDotClick = () => {
      if (onClick) {
        onClick();
      } else {
        // Card already shows flash card format, go directly to full view
        setViewFullDot(dot);
      }
    };

    return (
      <Card className={`mb-4 hover:shadow-md transition-shadow border border-amber-200 bg-white/95 backdrop-blur cursor-pointer hover:bg-amber-50/50`} onClick={handleDotClick}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50/80">
                {dot.sourceType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : 
                 dot.sourceType === 'text' ? <Type className="h-3 w-3 mr-1" /> : 
                 <div className="flex gap-1"><Mic className="h-2 w-2" /><Type className="h-2 w-2" /></div>}
                {dot.sourceType}
              </Badge>
              {isPreview && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                  Preview
                </Badge>
              )}
            </div>
            <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200">
              {dot.pulse}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-bold text-lg mb-3 text-amber-800 border-b border-amber-200 pb-2">
            {dot.oneWordSummary}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-2">{dot.summary}</p>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{dot.anchor}</p>
          <div className="mt-2 text-xs text-amber-700">
            {dot.timestamp.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  const WheelCard: React.FC<{ wheel: Wheel }> = ({ wheel }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
            {wheel.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
            {wheel.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {wheel.dots.map(dot => (
            <div key={dot.id} className="p-2 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-md border border-amber-200">
              <p className="text-sm font-medium mb-1 text-gray-800">{dot.summary}</p>
              <div className="flex justify-between items-center">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                  {dot.pulse}
                </Badge>
                <span className="text-xs text-amber-600">{dot.sourceType}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-amber-600">
          Connected to: {wheel.connections.length} wheels
        </div>
      </CardContent>
    </Card>
  );

  const DotWheelsMap: React.FC<{ 
  wheels: Wheel[], 
  actualDots: Dot[], 
  showingRecentFilter?: boolean, 
  recentCount?: number,
  isFullscreen?: boolean,
  onFullscreenChange?: (isFullscreen: boolean) => void
}> = ({ wheels, actualDots, showingRecentFilter = false, recentCount = 4, isFullscreen = false, onFullscreenChange }) => {
    const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
    const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
    const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
    const [selectedDotPosition, setSelectedDotPosition] = useState<{ x: number; y: number } | null>(null);
    const [hoveredDot, setHoveredDot] = useState<Dot | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [onlySparks, setOnlySparks] = useState(false);
    const [zoom, setZoom] = useState(1);
    const gridContainerRef = useRef<HTMLDivElement>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPWA, setIsPWA] = useState(false);

    // Detect PWA mode
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

    // Add keyboard escape to exit fullscreen
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isFullscreen && onFullscreenChange) {
          onFullscreenChange(false);
        }
      };

      if (isFullscreen) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden'; // Prevent body scroll in fullscreen
      } else {
        document.body.style.overflow = 'auto';
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
      };
    }, [isFullscreen]);

    // Generate preview data when preview mode is enabled
    const generatePreviewData = () => {
      const emotions = ['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'];
      
      const previewDots: Dot[] = [];
      const previewWheels: Wheel[] = [];

      // First spark group with random theme
      const firstSparkGroup: Wheel = {
        id: 'preview-wheel-0',
        name: 'Morning Clarity',
        category: 'Random',
        color: '#F59E0B', // Amber theme
        dots: [],
        connections: ['preview-wheel-1'],
        position: { x: 200, y: 200 }
      };

      const firstSparkHeadings = [
        'Coffee', 'Meditation', 'Rain', 'Exercise', 'Books'
      ];

      const firstSparkSummaries = [
        'Morning coffee ritual and its impact on daily productivity patterns',
        'Five-minute meditation practice creating mental clarity throughout day',
        'Sound of rain helping focus during work sessions',
        'Quick morning stretches boosting energy levels significantly', 
        'Reading fiction before bed improving sleep quality'
      ];

      for (let i = 0; i < 5; i++) {
        const dot: Dot = {
          id: `preview-dot-0-${i}`,
          oneWordSummary: firstSparkHeadings[i],
          summary: firstSparkSummaries[i],
          anchor: `Personal insights about ${firstSparkHeadings[i].toLowerCase()} and daily routines`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: firstSparkGroup.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        firstSparkGroup.dots.push(dot);
      }
      previewWheels.push(firstSparkGroup);

      // Second spark group with random theme
      const secondSparkGroup: Wheel = {
        id: 'preview-wheel-1',
        name: 'Flow State',
        category: 'Random',
        color: '#F59E0B', // Same amber theme as first spark
        dots: [],
        connections: ['preview-wheel-0'],
        position: { x: 550, y: 250 }
      };

      const secondSparkHeadings = [
        'Colors', 'Numbers', 'Dreams', 'Music'
      ];

      const secondSparkSummaries = [
        'Blue and green colors creating calming workspace environments',
        'Number patterns noticed in daily scheduling and time management',
        'Recurring dream themes providing creative inspiration for projects',
        'Jazz music enhancing problem-solving and analytical thinking'
      ];

      for (let i = 0; i < 4; i++) {
        const dot: Dot = {
          id: `preview-dot-1-${i}`,
          oneWordSummary: secondSparkHeadings[i],
          summary: secondSparkSummaries[i],
          anchor: `Random observations about ${secondSparkHeadings[i].toLowerCase()} in everyday experiences`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: secondSparkGroup.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        secondSparkGroup.dots.push(dot);
      }
      previewWheels.push(secondSparkGroup);

      // Third spark group demonstrating duplicate dots - reuses dots from other groups


      // Add many more individual scattered dots showing not all dots need grouping
      const individualHeadings = [
        'Sunset', 'Phone', 'Garden', 'Grocery', 'Parking', 'Weather', 'Sleep', 'Traffic', 'Cooking',
        'Mirror', 'Shoes', 'Keys', 'Water', 'Light', 'Sound', 'Paper', 'Window', 'Clock', 'Door'
      ];
      const individualSummaries = [
        'Beautiful sunset moments creating unexpected moments of gratitude',
        'Phone notifications disrupting focus and productivity patterns',
        'Backyard gardening teaching patience and natural growth cycles',
        'Grocery shopping revealing decision fatigue and choice overwhelm',
        'Parking challenges in city leading to arrival stress management',
        'Weather changes affecting mood and energy levels throughout day',
        'Sleep quality patterns correlating with next-day performance',
        'Traffic patterns teaching patience and alternative route planning',
        'Cooking experiments sparking creativity and mindful preparation',
        'Mirror reflections prompting self-awareness and appearance thoughts',
        'Shoe choices affecting comfort and confidence throughout day',
        'Key placement habits revealing organizational patterns and stress',
        'Water consumption awareness and hydration impact on energy',
        'Natural light exposure influencing mood and productivity cycles',
        'Background sounds affecting concentration and creative flow',
        'Paper texture preferences in note-taking and writing experiences',
        'Window views providing mental breaks and perspective shifts',
        'Clock watching patterns revealing time anxiety and productivity pressure',
        'Door sounds indicating home activity patterns and privacy needs'
      ];

      for (let i = 0; i < 19; i++) {
        const dot: Dot = {
          id: `individual-${i + 1}`,
          oneWordSummary: individualHeadings[i],
          summary: individualSummaries[i],
          anchor: `Random daily observation about ${individualHeadings[i].toLowerCase()} and life patterns`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: '', // No wheel - individual dot
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
      }

      return { previewDots, previewWheels };
    };

    const { previewDots, previewWheels } = generatePreviewData();
    
    // Apply "Only Sparks" filter to wheels if enabled
    let baseWheelsToDisplay = previewMode ? previewWheels : wheels;
    if (onlySparks) {
      // In preview mode, show all preview wheels (they are all spark wheels)
      // In normal mode, show only wheels that have dots (actual spark wheels)
      if (!previewMode) {
        baseWheelsToDisplay = wheels.filter(wheel => wheel.dots && wheel.dots.length > 0);
      }
    }
    
    const displayWheels = baseWheelsToDisplay;
    
    // Start with the appropriate base data source
    let baseDotsToDisplay = previewMode ? previewDots : actualDots;
    
    // Apply recent filter if enabled (only in normal mode)
    if (showingRecentFilter && !previewMode) {
      // Sort by timestamp (most recent first) and take the specified number
      baseDotsToDisplay = [...baseDotsToDisplay]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, recentCount);
    }
    
    // Apply "Only Sparks" filter if enabled (works in both modes)
    if (onlySparks) {
      // Show only dots that belong to spark wheels (have wheelId)
      baseDotsToDisplay = baseDotsToDisplay.filter(dot => dot.wheelId && dot.wheelId !== '');
    }
    
    const displayDots = baseDotsToDisplay;
    const totalDots = displayDots.length;
    
    // Count actual formed sparks - user-grouped dots via spark interface
    const actualFormedSparks = previewMode ? previewWheels.length : 0; // Real users will create sparks via spark interface
    const totalWheels = actualFormedSparks;

    if (!previewMode && wheels.length === 0 && actualDots.length === 0) {
      // Show empty state with preview toggle
      return (
        <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
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
          
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800">
              Total Dots: {totalDots}
            </button>
            <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800">
              Total Wheels: {totalWheels}
            </button>
          </div>
          
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <p className="text-lg font-semibold text-amber-800 mb-2">Start saving your Dots to get a similar map</p>
              <p className="text-sm text-amber-600">Your thought wheels will appear here as interactive circles</p>
              <p className="text-xs text-amber-500 mt-2">Toggle Preview Mode to see how it works!</p>
            </div>
          </div>
        </div>
      );
    }
    
    // Reset view function for unified transform-based navigation
    const resetView = () => {
      setOffset({ x: 0, y: 0 });
      setZoom(1);
    };

    // Unified drag handlers for both browser and PWA
    const handleMouseDown = (e: React.MouseEvent) => {
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragStart) return;
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

    // Fullscreen handler
    const toggleFullscreen = () => {
      if (onFullscreenChange) {
        onFullscreenChange(!isFullscreen);
        if (!isFullscreen) {
          // Reset zoom and position when entering fullscreen
          setZoom(1);
          setOffset({ x: 0, y: 0 });
        }
      }
    };

    // Disabled mouse wheel zoom - using only button-based zooming
    const handleWheel = (e: React.WheelEvent) => {
      // Prevent default scroll behavior but don't zoom
      if (!isPWA) {
        e.preventDefault();
      }
    };

    const renderDotConnections = () => {
      const connections: JSX.Element[] = [];
      
      // Simple connection rendering - skip complex logic to fix "Only Sparks" toggle
      for (let i = 0; i < displayDots.length; i++) {
        for (let j = i + 1; j < displayDots.length; j++) {
          const dot1 = displayDots[i];
          const dot2 = displayDots[j];
          
          // Simple connection probability based on dot IDs
          const seed1 = String(dot1.id || i).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const seed2 = String(dot2.id || j).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const connectionSeed = (seed1 + seed2) % 100;
          
          // Show connections based on toggle - higher probability in preview mode
          const threshold = previewMode ? 30 : 15;
          
          if (connectionSeed < threshold) {
            // Calculate basic positions (will be overridden by SVG positioning)
            const x1 = 100 + (seed1 % 800);
            const y1 = 100 + (seed1 % 500);
            const x2 = 100 + (seed2 % 800);
            const y2 = 100 + (seed2 % 500);
            
            connections.push(
              <line
                key={`${dot1.id}-${dot2.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="6,3"
                opacity="0.6"
                filter="url(#glow)"
              />
            );
          }
        }
      }
      
      return connections;
    };

    return (
      <div className={`relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 p-8' 
          : 'rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg'
      } overflow-hidden`}>
        {/* Preview toggle and Only Sparks toggle */}
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
            
            {/* Info icon for preview mode */}
            <Popover>
              <PopoverTrigger asChild>
                <button className={`rounded-full hover:bg-amber-100 transition-colors ${
                  isPWA ? 'p-0.5' : 'p-1'
                }`}>
                  <Info className={`text-amber-600 ${
                    isPWA ? 'w-2.5 h-2.5' : 'w-3 h-3'
                  }`} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 text-xs" side="bottom" align="start">
                <p className="text-gray-700">
                  This is a demo mode for you to visualize how Dots and Sparks work.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Only Sparks toggle */}
          <div className={`flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 ${
            isPWA ? 'px-1.5 py-0.5' : 'px-2 py-1'
          }`}>
            <label className={`font-medium text-amber-800 hidden sm:block ${
              isPWA ? 'text-[10px]' : 'text-xs'
            }`}>Only Sparks</label>
            <label className={`font-medium text-amber-800 sm:hidden ${
              isPWA ? 'text-[10px]' : 'text-xs'
            }`}>Sparks</label>
            <button
              onClick={() => setOnlySparks(!onlySparks)}
              className={`relative inline-flex items-center rounded-full transition-colors ${
                isPWA ? 'h-3 w-5' : 'h-4 w-7'
              } ${onlySparks ? 'bg-amber-500' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block transform rounded-full bg-white transition-transform ${
                  isPWA ? 'h-1.5 w-1.5' : 'h-2 w-2'
                } ${onlySparks ? (isPWA ? 'translate-x-2.5' : 'translate-x-4') : 'translate-x-1'}`}
              />
            </button>
          </div>
          
          {/* Recent Filter Indicator */}
          {showingRecentFilter && !previewMode && (
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg px-3 py-2 border-2 border-amber-400 shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">Showing {recentCount} Recent Dots</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Zoom Controls */}
        <div className={`absolute z-10 flex items-center bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 shadow-lg ${
          isPWA ? 'bottom-4 left-4 gap-1 p-1.5' : 'bottom-4 left-4 gap-2 p-2'
        }`}>
          {/* Zoom Out */}
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className={`bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors touch-manipulation ${
              isPWA ? 'p-1.5' : 'p-2'
            }`}
            title="Zoom Out"
          >
            <svg className={`fill="none" stroke="currentColor" viewBox="0 0 24 24" ${
              isPWA ? 'w-3 h-3' : 'w-3 h-3'
            }`}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          {/* Zoom Level Display */}
          <span className={`font-semibold text-amber-800 text-center ${
            isPWA ? 'text-[10px] min-w-[35px]' : 'text-xs min-w-[45px]'
          }`}>
            {Math.round(zoom * 100)}%
          </span>
          
          {/* Zoom In */}
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className={`bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors touch-manipulation ${
              isPWA ? 'p-1.5' : 'p-2'
            }`}
            title="Zoom In"
          >
            <svg className={`fill="none" stroke="currentColor" viewBox="0 0 24 24" ${
              isPWA ? 'w-3 h-3' : 'w-3 h-3'
            }`}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Navigation Icon - Clean arrow without button styling */}
        <div className={`absolute z-10 ${
          isPWA 
            ? 'top-4 left-1/2 transform -translate-x-1/2' // PWA: Top center
            : 'top-16 sm:top-4 left-1/2 transform -translate-x-1/2' // Browser: Original position
        }`}>
          {/* Reset View Arrow Icon */}
          <div
            onClick={resetView}
            className="cursor-pointer hover:scale-110 transition-transform"
            title={isPWA ? "Reset Scroll Position" : "Reset Drag Position"}
          >
            <RotateCcw className="w-6 h-6 text-amber-600 hover:text-amber-700 drop-shadow-lg" />
          </div>
        </div>
        
        {/* Stats Buttons */}
        <div className="absolute top-4 right-4 z-10 flex flex-col sm:flex-row gap-1 sm:gap-2">
          <button className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 border-2 border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-50 transition-colors whitespace-nowrap">
            Dots: {totalDots}
          </button>
          <button className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 border-2 border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-50 transition-colors whitespace-nowrap">
            Sparks: {totalWheels}
          </button>
        </div>

        {/* Fullscreen Toggle - Bottom right for both modes when not fullscreen */}
        {!isFullscreen && (
          <div className="absolute bottom-4 right-4 z-10">
            <button 
              onClick={toggleFullscreen}
              className={`bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-lg ${
                isPWA ? 'p-3 touch-manipulation' : 'p-2'
              }`}
              title="Enter Fullscreen"
            >
              <Maximize className={isPWA ? "w-7 h-7" : "w-5 h-5"} />
            </button>
          </div>
        )}


        
        {/* Interactive grid */}
        <div 
          ref={gridContainerRef}
          className={`relative ${
            isFullscreen 
              ? 'h-screen w-screen' 
              : 'h-[450px] w-full'
          } overflow-hidden ${isPWA ? 'cursor-grab active:cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
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
          {/* Fullscreen exit button - bottom right */}
          {isFullscreen && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFullscreen();
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
              width: isPWA ? '1200px' : `${1200 * zoom}px`, 
              height: isPWA ? '800px' : `${800 * zoom}px`,
              minWidth: isPWA ? '1200px' : 'auto',
              minHeight: isPWA ? '800px' : 'auto',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: 'center center'
            }}
          >
            {/* Individual Dots Random Grid */}
            {displayDots.map((dot, index) => {
              // Generate consistent random positions based on dot ID for stability
              const dotId = String(dot.id || index); // Ensure string conversion
              const seedX = dotId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              const seedY = dotId.split('').reverse().reduce((a, b) => a + b.charCodeAt(0), 0);
              
              // Position dots based on whether they belong to a wheel or are individual
              let x, y;
              if (previewMode) {
                // Check if this dot belongs to a wheel
                if (dot.wheelId && dot.wheelId !== '') {
                  // Find the wheel this dot belongs to
                  const wheel = displayWheels.find(w => w.id === dot.wheelId);
                  if (wheel) {
                    // Find position within the wheel
                    const dotsInWheel = displayDots.filter(d => d.wheelId === dot.wheelId);
                    const dotIndexInWheel = dotsInWheel.findIndex(d => d.id === dot.id);
                    
                    // Position dots in a circle inside the wheel
                    const wheelCenterX = wheel.position.x;
                    const wheelCenterY = wheel.position.y;
                    const radius = 60; // Radius for dot positioning inside wheel
                    const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                    
                    x = wheelCenterX + Math.cos(angle) * radius;
                    y = wheelCenterY + Math.sin(angle) * radius;
                  } else {
                    // Fallback for wheel dots without wheel found
                    x = 100 + (seedX % 900) + (index * 67) % 400;
                    y = 100 + (seedY % 600) + (index * 83) % 300;
                  }
                } else {
                  // Individual scattered dots - spread across full grid
                  x = 80 + (seedX % 1000) + (index * 137) % 800;
                  y = 80 + (seedY % 600) + (index * 97) % 500;
                }
              } else {
                // Real mode positioning
                x = 60 + (seedX % 800) + (index * 47) % 200;
                y = 60 + (seedY % 600) + (index * 73) % 180;
              }
              
              return (
                <div key={dot.id} className="relative">
                  {/* Dot */}
                  <div
                    className="absolute w-12 h-12 rounded-full cursor-pointer transition-all duration-300 hover:scale-125 hover:shadow-lg group dot-element"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      background: `linear-gradient(135deg, ${
                        dot.captureMode === 'ai' 
                          ? '#A855F7, #7C3AED' // Purple gradient for AI mode
                          : dot.sourceType === 'voice' 
                            ? '#F59E0B, #EA580C' // Amber gradient for voice
                            : '#D97706, #92400E' // Orange gradient for text
                      })`,
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('Dot clicked:', dot.id);
                      // For PWA mode, show centered flash card overlay
                      if (isPWA) {
                        setSelectedDot(dot);
                      } else {
                        setViewFullDot(dot);
                      }
                      setHoveredDot(null);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('Dot touched:', dot.id);
                      // For PWA mode, show centered flash card overlay
                      if (isPWA) {
                        setSelectedDot(dot);
                      } else {
                        setViewFullDot(dot);
                      }
                      setHoveredDot(null);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseEnter={() => setHoveredDot(dot)}
                    onMouseLeave={() => setHoveredDot(null)}
                  >
                    {/* Pulse animation for voice dots */}
                    {dot.sourceType === 'voice' && (
                      <div className="absolute inset-0 rounded-full bg-amber-400 opacity-50 animate-ping" />
                    )}
                    
                    {/* Dot content */}
                    <div className="relative w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        {dot.sourceType === 'voice' ? (
                          <Mic className="w-4 h-4 text-white" />
                        ) : (
                          <Type className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                  </div>
                  
                  {/* Summary hover card - different positioning for PWA vs Browser */}
                  {hoveredDot?.id === dot.id && (
                    <div 
                      className="absolute bg-white border-2 border-amber-200 rounded-lg p-3 shadow-xl z-50 w-64 cursor-pointer"
                      style={{
                        // PWA: Position relative to dot to scroll with grid
                        // Browser: Position in grid coordinates for mouse hover
                        left: isPWA ? '60px' : `${x + 60}px`,
                        top: isPWA ? '-20px' : `${Math.max(0, y - 20)}px`,
                        maxWidth: '280px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewFullDot(dot);
                        setHoveredDot(null);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setViewFullDot(dot);
                        setHoveredDot(null);
                      }}
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
                  )}
                </div>
              );
            })}
            
            {/* Wheel Boundaries for Preview Mode */}
            {previewMode && displayWheels.map((wheel, wheelIndex) => (
              <div
                key={wheel.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${wheel.position.x - 90}px`,
                  top: `${wheel.position.y - 90}px`,
                  width: '180px',
                  height: '180px'
                }}
              >
                {/* Dotted circle boundary */}
                <div 
                  className="w-full h-full rounded-full border-4 border-dashed opacity-60"
                  style={{ 
                    borderColor: wheel.color,
                    background: `linear-gradient(135deg, ${wheel.color}10, ${wheel.color}05)`
                  }}
                />
                
                {/* Blinking Spark Symbol on top of wheel */}
                <div 
                  className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                >
                  {/* Spark symbol with blinking animation */}
                  <div className="relative mb-2">
                    <div className="animate-pulse">
                      <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    {/* Blinking ring effect */}
                    <div className="absolute inset-0 animate-ping">
                      <svg className="w-8 h-8 text-yellow-300 opacity-75" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Wheel label */}
                  <div 
                    className="text-sm font-bold px-3 py-1 rounded-full text-white shadow-lg"
                    style={{ backgroundColor: wheel.color }}
                  >
                    {wheel.name}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Stunning Connection Lines Between Dots */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="dotArrowhead" markerWidth="8" markerHeight="6" 
                 refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" opacity="0.7" />
                </marker>
                <linearGradient id="dotConnectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {!previewMode && displayDots.length > 1 && renderDotConnections()}
              {/* Strategic preview connections - connecting actual dots */}
              {previewMode && displayDots.length > 1 && (
                <>
                  {(() => {
                    const maxDots = displayDots.length;
                    
                    // Calculate dot position helper function
                    const calculateDotPosition = (dot: any, index: number) => {
                      const dotId = String(dot.id || index);
                      const seedX = dotId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                      const seedY = dotId.split('').reverse().reduce((a, b) => a + b.charCodeAt(0), 0);
                      
                      if (dot.wheelId && dot.wheelId !== '') {
                        const wheel = displayWheels.find(w => w.id === dot.wheelId);
                        if (wheel) {
                          const dotsInWheel = displayDots.filter(d => d.wheelId === dot.wheelId);
                          const dotIndexInWheel = dotsInWheel.findIndex(d => d.id === dot.id);
                          const radius = 60;
                          const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                          return {
                            x: wheel.position.x + Math.cos(angle) * radius + 24,
                            y: wheel.position.y + Math.sin(angle) * radius + 24
                          };
                        }
                        return {
                          x: 100 + (seedX % 900) + (index * 67) % 400 + 24,
                          y: 100 + (seedY % 600) + (index * 83) % 300 + 24
                        };
                      }
                      return {
                        x: 80 + (seedX % 1000) + (index * 137) % 800 + 24,
                        y: 80 + (seedY % 600) + (index * 97) % 500 + 24
                      };
                    };
                    
                    // Separate wheel dots from scattered dots
                    const wheelDots = displayDots.filter(dot => dot.wheelId && dot.wheelId !== '');
                    const scatteredDots = displayDots.filter(dot => !dot.wheelId || dot.wheelId === '');
                    
                    const connections = [];
                    
                    // 1) 3 connections between spark wheels (wheel-to-wheel)
                    let wheelConnections = 0;
                    for (let i = 0; i < wheelDots.length && wheelConnections < 3; i++) {
                      for (let j = i + 1; j < wheelDots.length && wheelConnections < 3; j++) {
                        // Only connect dots from different wheels
                        if (wheelDots[i].wheelId !== wheelDots[j].wheelId) {
                          const dot1Index = displayDots.findIndex(d => d.id === wheelDots[i].id);
                          const dot2Index = displayDots.findIndex(d => d.id === wheelDots[j].id);
                          
                          if (dot1Index !== -1 && dot2Index !== -1) {
                            const pos1 = calculateDotPosition(wheelDots[i], dot1Index);
                            const pos2 = calculateDotPosition(wheelDots[j], dot2Index);
                            
                            connections.push(
                              <line 
                                key={`wheel-connection-${wheelConnections}`}
                                x1={pos1.x} y1={pos1.y} 
                                x2={pos2.x} y2={pos2.y} 
                                stroke="#F59E0B" 
                                strokeWidth="1.5" 
                                strokeDasharray="6,3" 
                                opacity="0.6" 
                              />
                            );
                            wheelConnections++;
                          }
                        }
                      }
                    }
                    
                    // 2) 4 connections from spark wheel dots to scattered dots
                    // Use different wheel dots as starting points to distribute connections
                    let scatteredConnections = 0;
                    const wheelDotIndices = [0, 2, 4, 6]; // Use different dots from wheels
                    
                    for (let i = 0; i < wheelDotIndices.length && scatteredConnections < 4; i++) {
                      const wheelDotIdx = wheelDotIndices[i];
                      if (wheelDotIdx < wheelDots.length) {
                        // Use different scattered dots too
                        const scatteredDotIdx = i % scatteredDots.length;
                        if (scatteredDotIdx < scatteredDots.length) {
                          const wheelDotIndex = displayDots.findIndex(d => d.id === wheelDots[wheelDotIdx].id);
                          const scatteredDotIndex = displayDots.findIndex(d => d.id === scatteredDots[scatteredDotIdx].id);
                          
                          if (wheelDotIndex !== -1 && scatteredDotIndex !== -1) {
                            const pos1 = calculateDotPosition(wheelDots[wheelDotIdx], wheelDotIndex);
                            const pos2 = calculateDotPosition(scatteredDots[scatteredDotIdx], scatteredDotIndex);
                            
                            connections.push(
                              <line 
                                key={`scattered-connection-${scatteredConnections}`}
                                x1={pos1.x} y1={pos1.y} 
                                x2={pos2.x} y2={pos2.y} 
                                stroke="#F59E0B" 
                                strokeWidth="1.5" 
                                strokeDasharray="6,3" 
                                opacity="0.6" 
                              />
                            );
                            scatteredConnections++;
                          }
                        }
                      }
                    }
                    
                    return connections;
                  })()}
                </>
              )}
            </svg>
          </div>
        </div>
        
        {/* Centered Flash Card Overlay for PWA */}
        {selectedDot && isPWA && (
          <>
            {/* Backdrop to close flash card when clicking outside */}
            <div 
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => {
                setSelectedDot(null);
              }}
            />
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div 
                className="pointer-events-auto transform transition-all duration-200 ease-out"
                style={{ transform: 'scale(1)' }}
              >
                <div className="bg-white border-2 border-amber-300 rounded-xl p-4 shadow-2xl max-w-xs min-w-[280px] relative">
                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDot(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    ✕
                  </button>
                  
                  {/* Flash card content */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <h3 className="font-bold text-lg text-gray-800">{selectedDot.oneWordSummary}</h3>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedDot.summary}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        {selectedDot.sourceType === 'voice' ? (
                          <><Mic className="w-3 h-3" /> Voice</>
                        ) : (
                          <><Type className="w-3 h-3" /> Text</>
                        )}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewFullDot(selectedDot);
                          setSelectedDot(null);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Full
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Full Dot View Modal */}
        {viewFullDot && (
          <DotFullView 
            dot={viewFullDot} 
            onClose={() => setViewFullDot(null)}
            onDelete={(dotId) => {
              // Refetch dots after deletion
              refetch();
              setViewFullDot(null);
            }}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 to-orange-50/30">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
              className="p-2 hover:bg-amber-100 text-amber-600 hover:text-amber-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-amber-600" />
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                My DotSpark Neura
              </span>
            </h1>
          </div>

          {/* Capacity Box */}
          <Card className="bg-gradient-to-br from-white to-amber-50/30 border-2 border-amber-200 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-center bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                My Neural Capacity
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Memory */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 rounded-full bg-gradient-to-br from-amber-600 to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group">
                    <Database className="w-6 h-6 text-white animate-pulse group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-700 text-sm">Memory</h3>
                    <p className="text-amber-600 text-xs">Storage & Recall</p>
                  </div>
                </div>

                {/* Learning Engine */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group">
                    <Cpu className="w-6 h-6 text-white animate-spin group-hover:animate-pulse" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-700 text-sm">Learning Engine</h3>
                    <p className="text-amber-600 text-xs">Learning Rituals</p>
                  </div>
                </div>

                {/* Sparks */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group">
                    <Sparkles className="w-6 h-6 text-white animate-ping group-hover:animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-700 text-sm">Sparks</h3>
                    <p className="text-yellow-600 text-xs">Insights & Ideas</p>
                  </div>
                </div>

                {/* Social */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group">
                    <Brain className="w-6 h-6 text-white animate-pulse group-hover:animate-ping" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-700 text-sm">Social</h3>
                    <p className="text-red-600 text-xs">Connections</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>





        {/* Spark Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            {/* Spark Button */}
            <button className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0 w-fit">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="w-6 h-6 opacity-30" />
                  </div>
                </div>
                <span className="text-lg font-bold tracking-wide">SPARK</span>
              </div>
              
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
            
            {/* Content Box - matching button width approximately */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 w-full md:w-80 text-left shadow-lg">
              <p className="text-gray-800 font-medium leading-relaxed">
                This isn't magic. It's you, thinking sharper.
              </p>
              <p className="text-amber-700 font-semibold mt-2">
                Let's connect the dots.
              </p>
            </div>
          </div>
        </div>

        {/* Search Results Section - only show when searching */}
        {searchTerm.trim() && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-500" />
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                Search Results ({searchResults.length})
              </span>
            </h2>
            <div className="bg-white/80 backdrop-blur border-2 border-amber-200 rounded-xl p-4 max-h-96 overflow-y-auto shadow-lg">
              <div className="space-y-4">
                {searchResults.length > 0 ? (
                  searchResults.map((dot: Dot) => (
                    <DotCard 
                      key={dot.id} 
                      dot={dot} 
                      onClick={() => setViewFullDot(dot)}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-amber-600">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No dots found matching "{searchTerm}"</p>
                    <p className="text-sm text-amber-500">Try different keywords or check your spelling</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
            <Input
              type="text"
              placeholder="Search for your dot or spark"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-2 border-amber-200 bg-white/90 backdrop-blur focus:border-amber-500 focus:ring-amber-500/20 rounded-xl placeholder:text-gray-500 text-gray-800 shadow-sm"
            />
          </div>
        </div>

        {/* DotSpark Map Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Network className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                  DotSpark Map
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="ml-2 p-1 rounded-full hover:bg-amber-100 transition-colors">
                      <Info className="w-4 h-4 text-amber-600" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3 text-sm" side="bottom" align="start">
                    <p className="text-gray-700">
                      You can see the dots and sparks you saved in this grid. The dots saved in Natural mode will have orange and amber color codes while the ones saved using AI mode will have a purple color code.
                    </p>
                  </PopoverContent>
                </Popover>
              </h2>
              
              {/* Recent Dots Filter and Social Button */}
              <div className="relative">
                <div className={`flex gap-2 ${isPWA ? 'flex-col' : 'flex-row items-center'}`}>
                  {/* Recent Dots Button with Dropdown Container */}
                  <div className="relative">
                    <button
                      onClick={() => setShowRecentFilter(!showRecentFilter)}
                      className={`flex items-center gap-2 ${isPWA ? 'px-2 py-1.5 text-xs' : 'px-3 sm:px-4 py-2 text-sm sm:text-base'} rounded-lg font-medium transition-all duration-200 ${
                        showRecentFilter 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      <Clock className={`${isPWA ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4'}`} />
                      <span className="font-semibold whitespace-nowrap">Recent Dots</span>
                      {dots.length > 0 && (
                        <Badge className={`border-0 ml-1 text-xs ${
                          showRecentFilter 
                            ? 'bg-white/30 text-white' 
                            : 'bg-white/20 text-white'
                        }`}>
                          {Math.min(dots.length, recentDotsCount)}
                        </Badge>
                      )}
                    </button>
                    
                    {/* Recent Dots Count Dropdown - positioned relative to Recent Dots button */}
                    {showRecentFilter && (
                      <div className={`${isPWA ? 'mt-2' : 'absolute left-0 mt-2'} p-2 bg-white/90 backdrop-blur border-2 border-amber-200 rounded-lg shadow-lg z-10`}>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-600 whitespace-nowrap">Show:</span>
                          <select
                            value={recentDotsCount}
                            onChange={(e) => setRecentDotsCount(parseInt(e.target.value))}
                            className="px-2 py-1 text-xs border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white min-w-[60px]"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                          <span className="text-gray-600 whitespace-nowrap">dots</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Social Button */}
                  <button
                    onClick={() => window.open('/social-neura', '_blank')}
                    className={`flex items-center gap-2 ${isPWA ? 'px-2 py-1.5 text-xs' : 'px-3 sm:px-4 py-2 text-sm sm:text-base'} rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105 ${showRecentFilter && isPWA ? 'mt-6' : ''}`}
                  >
                    <Brain className={`${isPWA ? 'w-3 h-3' : 'w-3 h-3 sm:w-4 sm:h-4'} animate-pulse`} />
                    <span className="font-semibold whitespace-nowrap">Social</span>
                  </button>
                </div>
              </div>
            </div>
            

          </div>
          
          <div className={`transition-all duration-200 ${showRecentFilter ? 'mt-4' : 'mt-0'}`}>
            <DotWheelsMap 
              wheels={wheels} 
              actualDots={showRecentFilter ? dots.slice(0, recentDotsCount) : dots} 
              showingRecentFilter={showRecentFilter}
              recentCount={recentDotsCount}
              isFullscreen={isMapFullscreen}
              onFullscreenChange={setIsMapFullscreen}
            />
          </div>
        </div>
      </div>
      


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

      {/* Full Dot View Modal */}
      {viewFullDot && (
        <DotFullView 
          dot={viewFullDot} 
          onClose={() => setViewFullDot(null)}
          onDelete={async () => {
            // Refetch dots after deletion
            await refetch();
            setViewFullDot(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;