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
import WheelFlashCard from "@/components/WheelFlashCard";
import WheelFullView from "@/components/WheelFullView";
import { isRunningAsStandalone } from "@/lib/pwaUtils";
import { useLocation } from "wouter";


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
  heading?: string;
  goals?: string; // For regular wheels
  purpose?: string; // For Chakras (top-level)
  timeline?: string;
  category: string;
  color: string;
  dots: Dot[];
  connections: string[]; // IDs of connected wheels
  position: { x: number; y: number };
  chakraId?: string; // References the Chakra (larger wheel) this wheel belongs to
  createdAt?: Date;
}

const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
  const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
  const [viewFlashCard, setViewFlashCard] = useState<Dot | null>(null);
  const [viewFullWheel, setViewFullWheel] = useState<Wheel | null>(null);
  const [searchResults, setSearchResults] = useState<Dot[]>([]);
  const [showRecentFilter, setShowRecentFilter] = useState(false);
  const [recentDotsCount, setRecentDotsCount] = useState(4);
  const [showPreview, setShowPreview] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(true); // Enable preview mode by default to show demo wheels // Lifted up to prevent resets
  
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
  const [wheels] = useState<Wheel[]>([]);

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

  const WheelCard: React.FC<{ wheel: Wheel; isPreview?: boolean; onClick?: () => void }> = ({ wheel, isPreview = false, onClick }) => {
    const handleWheelClick = () => {
      if (onClick) {
        onClick();
      } else {
        // TODO: Implement wheel full view
        console.log('Wheel clicked:', wheel.heading);
      }
    };

    const isChakra = wheel.chakraId === undefined;
    const wheelType = isChakra ? "Chakra" : "Wheel";
    const description = isChakra ? wheel.purpose : wheel.goals;

    return (
      <Card className={`mb-4 hover:shadow-md transition-shadow border ${isChakra ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50'} backdrop-blur cursor-pointer ${isChakra ? 'hover:bg-amber-100/50' : 'hover:bg-indigo-100/50'}`} onClick={handleWheelClick}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${isChakra ? 'border-amber-300 text-amber-700 bg-amber-50/80' : 'border-indigo-300 text-indigo-700 bg-indigo-50/80'}`}>
                <div className={`w-3 h-3 rounded-full ${isChakra ? 'bg-amber-500' : 'bg-indigo-500'} mr-1`}></div>
                {wheelType}
              </Badge>
              {isPreview && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                  Preview
                </Badge>
              )}
            </div>
            <Badge className={`bg-gradient-to-r ${isChakra ? 'from-amber-100 to-orange-100 text-amber-800 border-amber-200' : 'from-indigo-100 to-purple-100 text-indigo-800 border-indigo-200'}`}>
              {wheel.timeline}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className={`font-bold text-lg mb-3 ${isChakra ? 'text-amber-800' : 'text-indigo-800'} border-b ${isChakra ? 'border-amber-200' : 'border-indigo-200'} pb-2`}>
            {wheel.heading}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-2">{description}</p>
          <div className="mt-2 text-xs text-indigo-700">
            {wheel.createdAt ? new Date(wheel.createdAt).toLocaleString() : 'Preview'}
          </div>
        </CardContent>
      </Card>
    );
  };

  const DotWheelsMap: React.FC<{ 
    wheels: Wheel[], 
    actualDots: Dot[], 
    showingRecentFilter?: boolean, 
    recentCount?: number,
    isFullscreen?: boolean,
    onFullscreenChange?: (isFullscreen: boolean) => void,
    setViewFullWheel: (wheel: Wheel | null) => void,
    previewMode: boolean,
    setPreviewMode: (previewMode: boolean) => void
  }> = ({ wheels, actualDots, showingRecentFilter = false, recentCount = 4, isFullscreen = false, onFullscreenChange, setViewFullWheel, previewMode, setPreviewMode }) => {
    const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
    const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
    const [selectedDot, setSelectedDot] = useState<Dot | null>(null);
    const [selectedDotPosition, setSelectedDotPosition] = useState<{ x: number; y: number } | null>(null);
    const [hoveredDot, setHoveredDot] = useState<Dot | null>(null);
    const [hoveredWheel, setHoveredWheel] = useState<Wheel | null>(null);
    // previewMode is now passed as props from parent component
    const [zoom, setZoom] = useState(0.6);
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

      // Chakra - top-level business theme that encompasses the three wheels
      const businessChakra: Wheel = {
        id: 'preview-chakra-business',
        name: 'Build an Enduring Company',
        heading: 'Build an Enduring Company',
        goals: 'Creating a sustainable, innovative business that delivers value to customers while maintaining long-term growth and meaningful impact in the market.',
        purpose: 'Creating a sustainable, innovative business that delivers value to customers while maintaining long-term growth and meaningful impact in the market.',
        timeline: 'Long-term (5+ years)',
        category: 'Business',
        color: '#8B5CF6', // Purple theme for Chakras
        dots: [],
        connections: ['preview-wheel-0', 'preview-wheel-1', 'preview-wheel-2'],
        position: { x: 400, y: 300 }, // Centered to encompass the three wheels below
        chakraId: undefined, // This makes it a Chakra (top-level)
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      };

      // First business wheel - GTM (inside Chakra)
      const firstSparkGroup: Wheel = {
        id: 'preview-wheel-0',
        name: 'GTM (Go-To-Market)',
        heading: 'GTM (Go-To-Market) Strategy',
        goals: 'Developing comprehensive go-to-market strategies including product positioning, customer acquisition, pricing models, and sales funnel optimization for successful product launches.',
        timeline: 'Quarterly',
        category: 'Business',
        color: '#F59E0B', // Consistent amber theme
        dots: [],
        connections: ['preview-wheel-1'],
        position: { x: 350, y: 260 }, // Position inside Chakra - left wheel
        chakraId: 'preview-chakra-business',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      };

      const firstSparkHeadings = [
        'Product-Market Fit', 'Customer Segments', 'Value Proposition', 'Sales Funnel', 'Pricing Strategy'
      ];

      const firstSparkSummaries = [
        'Validating product-market fit through customer interviews and usage metrics',
        'Identifying and targeting high-value customer segments for focused growth',
        'Crafting compelling value propositions that resonate with target markets',
        'Building efficient sales funnels that convert prospects to customers',
        'Developing competitive pricing strategies that maximize revenue and adoption'
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

      // Second business wheel - Leadership (inside Chakra)
      const secondSparkGroup: Wheel = {
        id: 'preview-wheel-1',
        name: 'Strengthen Leadership',
        heading: 'Leadership Development',
        goals: 'Building strong leadership capabilities through team management, strategic communication, decision-making frameworks, and vision alignment to drive organizational success.',
        timeline: 'Ongoing',
        category: 'Business',
        color: '#F59E0B', // Consistent amber theme
        dots: [],
        connections: ['preview-wheel-0', 'preview-wheel-2'],
        position: { x: 450, y: 260 }, // Position inside Chakra - right wheel
        chakraId: 'preview-chakra-business',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      };

      const secondSparkHeadings = [
        'Team Building', 'Communication', 'Decision Making', 'Vision Setting'
      ];

      const secondSparkSummaries = [
        'Building high-performing teams through trust and clear role definition',
        'Developing authentic communication styles that inspire and motivate teams',
        'Making strategic decisions under uncertainty with confidence and clarity',
        'Setting compelling visions that align team efforts toward common goals'
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

      // Third business wheel - Product Development (inside Chakra)
      const thirdBusinessWheel: Wheel = {
        id: 'preview-wheel-2',
        name: 'Product Innovation',
        heading: 'Product Innovation Excellence',
        goals: 'Driving continuous product innovation through user research, feature prioritization, technical excellence, and breakthrough development pipelines that deliver exceptional user value.',
        timeline: 'Monthly',
        category: 'Business',
        color: '#F59E0B', // Consistent amber theme
        dots: [],
        connections: ['preview-wheel-1'],
        position: { x: 400, y: 340 }, // Position inside Chakra - bottom wheel
        chakraId: 'preview-chakra-business',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      };

      const thirdSparkHeadings = [
        'User Research', 'Feature Priority', 'Tech Debt', 'Innovation Pipeline'
      ];

      const thirdSparkSummaries = [
        'Conducting deep user research to uncover unmet needs and pain points',
        'Prioritizing features based on user impact and technical complexity',
        'Managing technical debt while maintaining development velocity',
        'Building innovation pipelines that balance risk with breakthrough potential'
      ];

      for (let i = 0; i < 4; i++) {
        const dot: Dot = {
          id: `preview-dot-2-${i}`,
          oneWordSummary: thirdSparkHeadings[i],
          summary: thirdSparkSummaries[i],
          anchor: `Strategic insights about ${thirdSparkHeadings[i].toLowerCase()} and product excellence`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: thirdBusinessWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        thirdBusinessWheel.dots.push(dot);
      }
      previewWheels.push(thirdBusinessWheel);

      // Personal wheel - standalone (not part of business hierarchy)
      const personalWheel: Wheel = {
        id: 'preview-wheel-personal',
        name: 'Health & Wellness',
        heading: 'Health & Wellness Mastery',
        goals: 'Building sustainable health and wellness habits including consistent routines, regular exercise, balanced nutrition, quality sleep, and effective stress management for optimal life balance.',
        timeline: 'Daily',
        category: 'Personal',
        color: '#EC4899', // Pink theme
        dots: [],
        connections: [],
        position: { x: 750, y: 180 }, // Standalone position, separate from business hierarchy
        // No chakraId - this is a standalone wheel
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
      };

      const personalHeadings = [
        'Morning Routine', 'Exercise', 'Nutrition', 'Sleep Quality', 'Stress Management'
      ];

      const personalSummaries = [
        'Establishing consistent morning routines that set positive tone for entire day',
        'Finding exercise routines that balance challenge with enjoyment and sustainability',
        'Understanding nutrition patterns that boost energy and mental clarity',
        'Optimizing sleep quality through environment and pre-sleep habits',
        'Developing healthy stress management techniques for work-life balance'
      ];

      for (let i = 0; i < 5; i++) {
        const dot: Dot = {
          id: `preview-dot-personal-${i}`,
          oneWordSummary: personalHeadings[i],
          summary: personalSummaries[i],
          anchor: `Personal insights about ${personalHeadings[i].toLowerCase()} and well-being`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: personalWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        personalWheel.dots.push(dot);
      }
      previewWheels.push(personalWheel);

      // Add Chakra after all child wheels are defined
      previewWheels.push(businessChakra);

      // Add some individual scattered dots showing not all dots need grouping
      const individualHeadings = [
        'Coffee', 'Weather', 'Music', 'Reading', 'Travel', 'Technology', 'Art', 'Nature'
      ];
      const individualSummaries = [
        'Morning coffee ritual and its impact on daily productivity patterns',
        'Weather changes affecting mood and energy levels throughout day',
        'Music preferences enhancing focus and creative thinking processes',
        'Reading habits revealing learning patterns and knowledge retention',
        'Travel experiences broadening perspective and cultural understanding',
        'Technology tools streamlining daily workflows and communication',
        'Art appreciation inspiring creativity and aesthetic sensibilities',
        'Nature observations providing mental clarity and stress relief'
      ];

      for (let i = 0; i < 8; i++) {
        const dot: Dot = {
          id: `individual-${i + 1}`,
          oneWordSummary: individualHeadings[i],
          summary: individualSummaries[i],
          anchor: `Personal observation about ${individualHeadings[i].toLowerCase()} and its impact on daily life`,
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
    
    // Base wheels to display
    let baseWheelsToDisplay = previewMode ? previewWheels : wheels;
    
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
    
    // Base dots to display (no spark filtering)
    
    const displayDots = baseDotsToDisplay;
    const totalDots = displayDots.length;
    
    // Count Wheels and Chakras separately
    const totalWheels = previewMode ? previewWheels.filter(w => w.chakraId !== undefined).length : wheels.filter(w => w.chakraId !== undefined).length;
    const totalChakras = previewMode ? previewWheels.filter(w => w.chakraId === undefined).length : wheels.filter(w => w.chakraId === undefined).length;

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
            <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-purple-200 text-sm font-semibold text-purple-800">
              Total Chakras: {totalChakras}
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
      // Only start dragging if clicked on the grid background, not on interactive elements
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
        <div className={`${isFullscreen ? 'fixed' : 'absolute'} z-10 flex items-center bg-white/90 backdrop-blur rounded-lg border-2 border-amber-200 shadow-lg ${
          isFullscreen 
            ? (isPWA ? 'bottom-6 left-6 gap-1 p-1.5' : 'bottom-6 left-6 gap-2 p-2')
            : (isPWA ? 'bottom-4 left-4 gap-1 p-1.5' : 'bottom-4 left-4 gap-2 p-2')
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
            Wheels: {totalWheels}
          </button>
          <button className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 border-2 border-purple-200 text-xs font-semibold text-purple-800 hover:bg-purple-50 transition-colors whitespace-nowrap">
            Chakras: {totalChakras}
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
                // Real mode - intelligent positioning system
                if (dot.wheelId && dot.wheelId !== '') {
                  // Find the wheel this dot belongs to
                  const wheel = displayWheels.find(w => w.id === dot.wheelId);
                  if (wheel) {
                    // Position dots in a circle inside the wheel
                    const dotsInWheel = displayDots.filter(d => d.wheelId === dot.wheelId);
                    const dotIndexInWheel = dotsInWheel.findIndex(d => d.id === dot.id);
                    
                    // Use intelligent positioning for wheel center
                    let wheelCenterX, wheelCenterY;
                    if (!previewMode && (!wheel.position || (wheel.position.x === 0 && wheel.position.y === 0))) {
                      // Auto-position wheels in a grid layout for real data
                      const wheelIndex = displayWheels.findIndex(w => w.id === wheel.id);
                      const wheelGridCols = 3;
                      const wheelSpacing = 250;
                      const wheelBaseX = 200;
                      const wheelBaseY = 200;
                      
                      wheelCenterX = (wheelIndex % wheelGridCols) * wheelSpacing + wheelBaseX;
                      wheelCenterY = Math.floor(wheelIndex / wheelGridCols) * wheelSpacing + wheelBaseY;
                    } else {
                      wheelCenterX = wheel.position.x;
                      wheelCenterY = wheel.position.y;
                    }
                    const radius = 70; // Radius for dot positioning inside wheel
                    const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                    
                    x = wheelCenterX + Math.cos(angle) * radius;
                    y = wheelCenterY + Math.sin(angle) * radius;
                  } else {
                    // Fallback for wheel dots without wheel found - use grid positioning
                    const gridCols = 8;
                    const gridSpacing = 120;
                    const gridX = (index % gridCols) * gridSpacing + 100;
                    const gridY = Math.floor(index / gridCols) * gridSpacing + 100;
                    x = gridX + (seedX % 40) - 20; // Add small random offset
                    y = gridY + (seedY % 40) - 20;
                  }
                } else {
                  // Individual scattered dots - use intelligent grid system
                  const gridCols = 6;
                  const gridSpacing = 140;
                  const baseX = 100;
                  const baseY = 100;
                  
                  // Calculate grid position with some randomness for natural look
                  const gridX = (index % gridCols) * gridSpacing + baseX;
                  const gridY = Math.floor(index / gridCols) * gridSpacing + baseY;
                  
                  // Add controlled randomness while maintaining minimum spacing
                  x = gridX + (seedX % 60) - 30;
                  y = gridY + (seedY % 60) - 30;
                }
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
                      // Check if mobile (screen width < 768px) or PWA mode for flash card view
                      const isMobile = window.innerWidth < 768;
                      if (isPWA || isMobile) {
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
                      // Check if mobile (screen width < 768px) or PWA mode for flash card view
                      const isMobile = window.innerWidth < 768;
                      if (isPWA || isMobile) {
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
            
            {/* Wheel Boundaries - Only show when wheels exist */}
            {(previewMode ? displayWheels : displayWheels.filter(w => w.dots && w.dots.length > 0)).map((wheel, wheelIndex) => {
              // Determine wheel size and positioning
              let wheelPosition = wheel.position;
              
              // In real mode, auto-position wheels intelligently if no position is set
              if (!previewMode && (!wheel.position || (wheel.position.x === 0 && wheel.position.y === 0))) {
                // Auto-position wheels in a grid layout for real data
                const wheelGridCols = 3;
                const wheelSpacing = 250;
                const wheelBaseX = 200;
                const wheelBaseY = 200;
                
                const wheelGridX = (wheelIndex % wheelGridCols) * wheelSpacing + wheelBaseX;
                const wheelGridY = Math.floor(wheelIndex / wheelGridCols) * wheelSpacing + wheelBaseY;
                
                wheelPosition = { x: wheelGridX, y: wheelGridY };
              }
              
              // Determine wheel size based on type and hierarchy
              let wheelSize;
              let isChakra;
              
              if (previewMode) {
                // In preview mode, use specific sizing logic
                isChakra = wheel.id === 'preview-chakra-business';
                if (isChakra) {
                  wheelSize = 350; // Chakra circle that encompasses the three wheels
                } else {
                  wheelSize = 120; // Smaller child wheels that fit inside the Chakra
                }
              } else {
                // In real mode, use standard wheel sizes
                isChakra = wheel.chakraId === undefined;
                wheelSize = isChakra ? 300 : 150; // Smaller sizes for real mode
              }
              
              const wheelRadius = wheelSize / 2;
              
              return (
                <div
                  key={wheel.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${wheelPosition.x - wheelRadius}px`,
                    top: `${wheelPosition.y - wheelRadius}px`,
                    width: `${wheelSize}px`,
                    height: `${wheelSize}px`
                  }}
                >
                  {/* Dotted circle boundary */}
                  <div 
                    className={`w-full h-full rounded-full ${
                      isChakra ? 'border-6 border-solid opacity-60' : 'border-4 border-dashed opacity-60'
                    }`}
                    style={{ 
                      borderColor: wheel.color,
                      background: `linear-gradient(135deg, ${wheel.color}10, ${wheel.color}05)`
                    }}
                  />
                  
                  {/* Blinking Spark Symbol on top of wheel */}
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center ${
                      isChakra ? 'top-[-95px]' : 'top-[-75px]'
                    }`}
                  >
                    {/* Spark symbol with blinking animation */}
                    <div className="relative mb-2">
                      <div className="animate-pulse">
                        <svg className={`text-yellow-400 ${
                          isChakra ? 'w-10 h-10' : 'w-8 h-8'
                        }`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      {/* Blinking ring effect */}
                      <div className="absolute inset-0 animate-ping">
                        <svg className={`text-yellow-300 opacity-75 ${
                          isChakra ? 'w-10 h-10' : 'w-8 h-8'
                        }`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Wheel label */}
                    <div 
                      data-wheel-label
                      className={`relative font-bold rounded-full text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 pointer-events-auto ${
                        isChakra ? 'text-base px-4 py-2' : 'text-sm px-3 py-1'
                      }`}
                      style={{ backgroundColor: wheel.color }}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        // Don't show flash card if user is dragging
                        if (dragStart) return;
                        console.log('Wheel hover:', wheel.name, 'Position:', wheelPosition, 'Size:', wheelSize);
                        setHoveredWheel(wheel);
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        setHoveredWheel(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredWheel(null);
                        setViewFullWheel(wheel);
                      }}
                    >
                      {wheel.name}
                      
                      {/* Wheel Flash Card - positioned directly relative to the label */}
                      {hoveredWheel?.id === wheel.id && (
                        <div 
                          className="absolute bg-white border-2 border-amber-200 rounded-lg p-3 shadow-xl z-50 w-64 cursor-pointer"
                          style={{
                            // Position directly next to the wheel label in browser mode
                            left: isPWA ? '60px' : '100%',
                            top: isPWA ? '-20px' : '0px',
                            marginLeft: isPWA ? '0px' : '8px',
                            maxWidth: '280px'
                          }}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation();
                            setHoveredWheel(null);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewFullWheel(wheel);
                            setHoveredWheel(null);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            setViewFullWheel(wheel);
                            setHoveredWheel(null);
                          }}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-amber-100 text-amber-800 text-xs">
                                Wheel
                              </Badge>
                              {wheel.timeline && (
                                <Badge className="bg-gray-100 text-gray-700 text-xs">
                                  {wheel.timeline}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-bold text-lg text-amber-800 border-b border-amber-200 pb-2 mb-3">
                              {wheel.heading || wheel.name}
                            </h4>
                            {wheel.goals && (
                              <p className="text-xs text-gray-600 line-clamp-3">
                                {wheel.goals}
                              </p>
                            )}
                            <div className="text-xs text-amber-600 mt-2 font-medium">
                              Click for full view
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
        
        {/* Centered Flash Card Overlay for PWA */}
        {selectedDot && (isPWA || window.innerWidth < 768) && (
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
                        onClick={() => {
                          setViewFullDot(selectedDot);
                          setSelectedDot(null);
                        }}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium"
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



        {/* Dot Full View Modal */}
        {viewFullDot && (
          <DotFullView 
            dot={viewFullDot} 
            onClose={() => setViewFullDot(null)}
            onDelete={(dotId) => {
              setViewFullDot(null);
              // Trigger a refetch of dots data
              window.location.reload();
            }}
          />
        )}

        {/* Wheel Full View Modal */}
        {viewFullWheel && (
          <WheelFullView 
            wheel={viewFullWheel}
            isOpen={!!viewFullWheel}
            onClose={() => setViewFullWheel(null)}
            onDelete={async (wheelId) => {
              try {
                await fetch(`/api/wheels/${wheelId}`, { method: 'DELETE' });
                // Refresh wheels data if needed
              } catch (error) {
                console.error('Error deleting wheel:', error);
              }
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and title */}
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

          {/* Right side - Stats and controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                Total Dots: {previewMode ? 27 : dots.length}
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
                Total Wheels: {previewMode ? 4 : wheels.filter(w => w.chakraId !== null && w.chakraId !== undefined).length}
              </div>
              <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-medium">
                Total Chakras: {previewMode ? 1 : wheels.filter(w => w.chakraId === null || w.chakraId === undefined).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">


        {/* DotSpark Map Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
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
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                <Input
                  type="text"
                  placeholder="search for your dots or wheels"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 w-64 text-sm border-2 border-amber-200 bg-white/90 backdrop-blur focus:border-amber-500 focus:ring-amber-500/20 rounded-xl placeholder:text-gray-500 text-gray-800 shadow-sm"
                />
              </div>
              
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
              setViewFullWheel={setViewFullWheel}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
            />
          </div>
        </div>
      </div>

      {/* Full Dot View Dialog */}
      {viewFullDot && (
        <DotFullView 
          dot={viewFullDot} 
          onClose={() => setViewFullDot(null)}
          onDelete={async (dotId) => {
            try {
              await fetch(`/api/dots/${dotId}`, { method: 'DELETE' });
              refetch(); // Refresh the dots data
            } catch (error) {
              console.error('Error deleting dot:', error);
            }
          }}
        />
      )}

      {/* Full Wheel View Dialog */}
      {viewFullWheel && (
        <WheelFullView 
          wheel={viewFullWheel} 
          isOpen={!!viewFullWheel} 
          onClose={() => setViewFullWheel(null)}
          onDelete={async (wheelId) => {
            try {
              await fetch(`/api/wheels/${wheelId}`, { method: 'DELETE' });
              // Refresh wheels data if needed
            } catch (error) {
              console.error('Error deleting wheel:', error);
            }
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
