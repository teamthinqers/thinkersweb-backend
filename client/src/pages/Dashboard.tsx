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

  // Enhanced search functionality with keyword-based searching
  const [searchResults, setSearchResults] = useState<{
    dots: Dot[];
    wheels: Wheel[];
    chakras: Wheel[];
  }>({ dots: [], wheels: [], chakras: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Function to perform comprehensive keyword search including preview data
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults({ dots: [], wheels: [], chakras: [] });
      setShowSearchResults(false);
      return;
    }

    const keywords = query.toLowerCase().split(' ').filter(k => k.length > 0);
    
    // Get current data source based on preview mode
    let searchDots = dots;
    let searchWheels = wheels;
    
    // If preview mode is enabled, include preview data
    if (previewMode) {
      const previewData = generatePreviewData();
      searchDots = [...dots, ...previewData.previewDots];
      searchWheels = [...wheels, ...previewData.previewWheels];
    }
    
    // Search dots
    const filteredDots = searchDots.filter((dot: Dot) => {
      const searchText = [
        dot.summary,
        dot.anchor,
        dot.pulse,
        dot.oneWordSummary
      ].join(' ').toLowerCase();
      
      return keywords.some(keyword => searchText.includes(keyword));
    });

    // Search wheels and chakras
    const filteredWheels = searchWheels.filter(wheel => {
      const searchText = [
        wheel.name,
        wheel.heading || '',
        wheel.goals || '',
        wheel.purpose || '',
        wheel.timeline || '',
        wheel.category
      ].join(' ').toLowerCase();
      
      return keywords.some(keyword => searchText.includes(keyword));
    });

    // Separate wheels from chakras
    const regularWheels = filteredWheels.filter(w => w.chakraId !== null && w.chakraId !== undefined);
    const chakras = filteredWheels.filter(w => w.chakraId === null || w.chakraId === undefined);

    setSearchResults({
      dots: filteredDots,
      wheels: regularWheels,
      chakras: chakras
    });
    setShowSearchResults(true);
  };

  // Mock wheels data for visualization - moved before search function
  const [wheels] = useState<Wheel[]>([]);

  // Generate preview data function moved to Dashboard level
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
      color: '#B45309', // Dark amber theme for Chakras
      dots: [],
      connections: ['preview-wheel-0', 'preview-wheel-1', 'preview-wheel-2'],
      position: { x: 400, y: 300 },
      chakraId: undefined,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };

    // GTM wheel
    const gtmWheel: Wheel = {
      id: 'preview-wheel-0',
      name: 'GTM (Go-To-Market)',
      heading: 'GTM (Go-To-Market) Strategy',
      goals: 'Developing comprehensive go-to-market strategies including product positioning, customer acquisition, pricing models, and sales funnel optimization for successful product launches.',
      timeline: 'Quarterly',
      category: 'Business',
      color: '#EA580C',
      dots: [],
      connections: ['preview-wheel-1'],
      position: { x: 300, y: 240 },
      chakraId: 'preview-chakra-business',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    };

    // Leadership wheel
    const leadershipWheel: Wheel = {
      id: 'preview-wheel-1',
      name: 'Leadership Development',
      heading: 'Leadership Development',
      goals: 'Building effective leadership skills including team management, strategic thinking, communication excellence, and organizational culture development for sustainable business growth.',
      timeline: 'Ongoing',
      category: 'Business',
      color: '#EA580C',
      dots: [],
      connections: ['preview-wheel-0', 'preview-wheel-2'],
      position: { x: 400, y: 180 },
      chakraId: 'preview-chakra-business',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    };

    // Product Innovation wheel
    const productWheel: Wheel = {
      id: 'preview-wheel-2',
      name: 'Product Innovation',
      heading: 'Product Innovation',
      goals: 'Driving continuous innovation in product development through user research, emerging technology adoption, design thinking methodologies, and iterative development processes.',
      timeline: 'Monthly',
      category: 'Business',
      color: '#EA580C',
      dots: [],
      connections: ['preview-wheel-1'],
      position: { x: 500, y: 240 },
      chakraId: 'preview-chakra-business',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    };

    // Health & Wellness wheel (standalone)
    const healthWheel: Wheel = {
      id: 'preview-wheel-personal',
      name: 'Health & Wellness',
      heading: 'Health & Wellness Mastery',
      goals: 'Building sustainable health and wellness habits including consistent routines, regular exercise, balanced nutrition, quality sleep, and effective stress management for optimal life balance.',
      timeline: 'Daily',
      category: 'Personal',
      color: '#EA580C',
      dots: [],
      connections: [],
      position: { x: 750, y: 180 },
      chakraId: undefined,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
    };

    // Generate dots for each wheel
    const gtmHeadings = ['Product-Market Fit', 'Customer Segments', 'Value Proposition', 'Sales Funnel', 'Pricing Strategy'];
    const leadershipHeadings = ['Team Building', 'Strategic Vision', 'Communication', 'Decision Making'];
    const productHeadings = ['User Research', 'Design Thinking', 'Technology', 'Iteration', 'Innovation'];
    const healthHeadings = ['Morning Routine', 'Exercise', 'Nutrition', 'Sleep Quality', 'Stress Management'];

    // Add dots to GTM wheel
    gtmHeadings.forEach((heading, i) => {
      const dot: Dot = {
        id: `preview-dot-gtm-${i}`,
        oneWordSummary: heading,
        summary: `Strategic insights about ${heading.toLowerCase()} and business growth`,
        anchor: `Key learnings about ${heading.toLowerCase()} implementation`,
        pulse: emotions[Math.floor(Math.random() * emotions.length)],
        wheelId: gtmWheel.id,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        sourceType: Math.random() > 0.5 ? 'voice' : 'text',
        captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
      };
      previewDots.push(dot);
      gtmWheel.dots.push(dot);
    });

    // Add dots to Leadership wheel
    leadershipHeadings.forEach((heading, i) => {
      const dot: Dot = {
        id: `preview-dot-leadership-${i}`,
        oneWordSummary: heading,
        summary: `Leadership insights about ${heading.toLowerCase()} and team excellence`,
        anchor: `Key strategies for ${heading.toLowerCase()} development`,
        pulse: emotions[Math.floor(Math.random() * emotions.length)],
        wheelId: leadershipWheel.id,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        sourceType: Math.random() > 0.5 ? 'voice' : 'text',
        captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
      };
      previewDots.push(dot);
      leadershipWheel.dots.push(dot);
    });

    // Add dots to Product wheel
    productHeadings.forEach((heading, i) => {
      const dot: Dot = {
        id: `preview-dot-product-${i}`,
        oneWordSummary: heading,
        summary: `Product insights about ${heading.toLowerCase()} and innovation excellence`,
        anchor: `Strategic approaches to ${heading.toLowerCase()} implementation`,
        pulse: emotions[Math.floor(Math.random() * emotions.length)],
        wheelId: productWheel.id,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        sourceType: Math.random() > 0.5 ? 'voice' : 'text',
        captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
      };
      previewDots.push(dot);
      productWheel.dots.push(dot);
    });

    // Add dots to Health wheel
    healthHeadings.forEach((heading, i) => {
      const dot: Dot = {
        id: `preview-dot-health-${i}`,
        oneWordSummary: heading,
        summary: `Health insights about ${heading.toLowerCase()} and wellness optimization`,
        anchor: `Personal strategies for ${heading.toLowerCase()} improvement`,
        pulse: emotions[Math.floor(Math.random() * emotions.length)],
        wheelId: healthWheel.id,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        sourceType: Math.random() > 0.5 ? 'voice' : 'text',
        captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
      };
      previewDots.push(dot);
      healthWheel.dots.push(dot);
    });

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

    individualHeadings.forEach((heading, i) => {
      const dot: Dot = {
        id: `individual-${i + 1}`,
        oneWordSummary: heading,
        summary: individualSummaries[i],
        anchor: `Personal observation about ${heading.toLowerCase()} and its impact on daily life`,
        pulse: emotions[Math.floor(Math.random() * emotions.length)],
        wheelId: '', // No wheel - individual dot
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        sourceType: Math.random() > 0.5 ? 'voice' : 'text',
        captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
      };
      previewDots.push(dot);
    });

    previewWheels.push(businessChakra, gtmWheel, leadershipWheel, productWheel, healthWheel);

    return { previewDots, previewWheels };
  };

  // Handle search functionality
  React.useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, dots, wheels, previewMode]);

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

  // Dynamic Grid Configuration - Adapts based on content
  const calculateDynamicSizing = (mode: 'preview' | 'real', contentCount: number, contentType: 'dots' | 'wheels') => {
    const baseConfig = {
      preview: {
        wheelRadius: { base: 60, min: 45, max: 90 }, // Adaptive wheel size
        dotRadius: { base: 25, min: 20, max: 35 }, // Standard documented optimal dot radius
        chakraRadius: { base: 420, min: 380, max: 480 }, // Standard documented optimal chakra size
        safetyBuffer: 35
      },
      real: {
        wheelRadius: { base: 75, min: 60, max: 110 }, // Adaptive wheel size
        dotRadius: { base: 35, min: 28, max: 45 }, // Standard documented optimal dot radius
        chakraRadius: { base: 370, min: 320, max: 420 }, // Standard documented optimal chakra size  
        safetyBuffer: 40
      }
    };

    const config = baseConfig[mode];
    
    if (contentType === 'dots') {
      // Dynamic dot sizing based on dots per wheel
      if (contentCount <= 3) {
        return config.dotRadius.base;
      } else if (contentCount <= 6) {
        return Math.max(config.dotRadius.min, config.dotRadius.base - 3);
      } else if (contentCount <= 9) {
        return Math.max(config.dotRadius.min, config.dotRadius.base - 5);
      } else {
        return Math.max(config.dotRadius.min, config.dotRadius.base - Math.floor(contentCount / 2));
      }
    } else if (contentType === 'wheels') {
      // Dynamic wheel sizing based on wheels per chakra
      if (contentCount <= 3) {
        return config.wheelRadius.base;
      } else if (contentCount <= 5) {
        return Math.max(config.wheelRadius.min, config.wheelRadius.base - 8);
      } else if (contentCount <= 8) {
        return Math.max(config.wheelRadius.min, config.wheelRadius.base - 12);
      } else {
        return Math.max(config.wheelRadius.min, config.wheelRadius.base - 15);
      }
    }
    
    return config.wheelRadius.base;
  };

  // Get dynamic chakra sizing based on wheels count
  const getChakraSize = (mode: 'preview' | 'real', wheelsCount: number) => {
    const baseConfig = {
      preview: { base: 420, min: 380, max: 480 }, // Standard documented sizes for optimal wheel enclosure
      real: { base: 370, min: 320, max: 420 } // Standard documented sizes for optimal wheel enclosure
    };
    
    const config = baseConfig[mode];
    
    if (wheelsCount <= 3) {
      return config.base;
    } else if (wheelsCount <= 5) {
      return Math.min(config.max, config.base + 20);
    } else if (wheelsCount <= 8) {
      return Math.min(config.max, config.base + 35);
    } else {
      return config.max;
    }
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
        color: '#B45309', // Dark amber theme for Chakras
        dots: [],
        connections: ['preview-wheel-0', 'preview-wheel-1', 'preview-wheel-2'],
        position: { x: 400, y: 300 }, // Top-left chakra
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
        color: '#EA580C', // Orange theme for wheels
        dots: [],
        connections: ['preview-wheel-1'],
        position: { x: 300, y: 240 }, // Position inside Chakra - left wheel with wider spacing
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
        color: '#EA580C', // Orange theme for wheels
        dots: [],
        connections: ['preview-wheel-0', 'preview-wheel-2'],
        position: { x: 500, y: 240 }, // Position inside Chakra - right wheel with wider spacing
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
        color: '#EA580C', // Orange theme for wheels
        dots: [],
        connections: ['preview-wheel-1'],
        position: { x: 400, y: 400 }, // Position inside Chakra - bottom wheel with wider spacing
        chakraId: 'preview-chakra-business',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      };

      const thirdSparkHeadings = [
        'User Research', 'Feature Priority', 'Tech Excellence'
      ];

      const thirdSparkSummaries = [
        'Conducting deep user research to uncover unmet needs and pain points',
        'Prioritizing features based on user impact and technical complexity',
        'Managing technical debt while maintaining development velocity and innovation'
      ];

      for (let i = 0; i < 3; i++) {
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

      // HEALTH & WELLNESS CHAKRA with 3 wheels
      const healthChakra: Wheel = {
        id: 'preview-chakra-health',
        name: 'Leading a Healthier Life',
        heading: 'Leading a Healthier Life',
        purpose: 'Creating a balanced and sustainable approach to physical, mental, and emotional wellness through mindful practices, nutrition, and lifestyle choices.',
        timeline: 'Daily',
        category: 'Health',
        color: '#B45309', // Dark amber for Chakras
        dots: [],
        connections: [],
        position: { x: 1100, y: 300 }, // Top-right chakra, well-spaced from business
        chakraId: undefined, // This marks it as a chakra (top-level container)
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      };
      previewWheels.push(healthChakra);

      // First health wheel - Physical Fitness
      const fitnessWheel: Wheel = {
        id: 'preview-wheel-health-1',
        name: 'Physical Fitness',
        heading: 'Physical Fitness Journey',
        goals: 'Building strength, endurance, and flexibility through consistent exercise routines, proper form, and progressive training methods.',
        timeline: 'Daily',
        category: 'Health',
        color: '#EA580C', // Orange theme for wheels
        dots: [],
        connections: ['preview-wheel-health-2'],
        position: { x: 1050, y: 220 }, // Top-left in health chakra
        chakraId: 'preview-chakra-health',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      };

      const fitnessHeadings = ['Morning Workout', 'Strength Training', 'Cardio Sessions', 'Recovery'];
      const fitnessSummaries = [
        'Established consistent morning workout routine with bodyweight exercises',
        'Progressive strength training focusing on compound movements and proper form',
        'High-intensity cardio sessions alternating with steady-state endurance work',
        'Active recovery with stretching, mobility work, and adequate sleep'
      ];

      for (let i = 0; i < 4; i++) {
        const dot: Dot = {
          id: `preview-dot-health-1-${i}`,
          oneWordSummary: fitnessHeadings[i],
          summary: fitnessSummaries[i],
          anchor: `Personal observations about ${fitnessHeadings[i].toLowerCase()} and physical wellness`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: fitnessWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        fitnessWheel.dots.push(dot);
      }
      previewWheels.push(fitnessWheel);

      // Second health wheel - Nutrition & Diet
      const nutritionWheel: Wheel = {
        id: 'preview-wheel-health-2',
        name: 'Nutrition & Diet',
        heading: 'Mindful Nutrition',
        goals: 'Developing sustainable eating habits focused on whole foods, proper hydration, and mindful consumption for optimal energy and health.',
        timeline: 'Daily',
        category: 'Health',
        color: '#EA580C',
        dots: [],
        connections: ['preview-wheel-health-3'],
        position: { x: 1150, y: 220 }, // Top-right in health chakra
        chakraId: 'preview-chakra-health',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      };

      const nutritionHeadings = ['Meal Prep', 'Hydration', 'Mindful Eating'];
      const nutritionSummaries = [
        'Weekly meal preparation with balanced macronutrients and fresh ingredients',
        'Consistent hydration tracking with filtered water and electrolyte balance',
        'Practicing mindful eating habits and listening to hunger/satiety cues'
      ];

      for (let i = 0; i < 3; i++) {
        const dot: Dot = {
          id: `preview-dot-health-2-${i}`,
          oneWordSummary: nutritionHeadings[i],
          summary: nutritionSummaries[i],
          anchor: `Insights about ${nutritionHeadings[i].toLowerCase()} and nutritional wellness`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: nutritionWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        nutritionWheel.dots.push(dot);
      }
      previewWheels.push(nutritionWheel);

      // Third health wheel - Mental Wellness
      const mentalWellnessWheel: Wheel = {
        id: 'preview-wheel-health-3',
        name: 'Mental Wellness',
        heading: 'Mental & Emotional Balance',
        goals: 'Cultivating mental resilience through meditation, stress management, and emotional intelligence practices for overall wellbeing.',
        timeline: 'Daily',
        category: 'Health',
        color: '#EA580C',
        dots: [],
        connections: [],
        position: { x: 1100, y: 380 }, // Bottom center in health chakra
        chakraId: 'preview-chakra-health',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      };

      const mentalHeadings = ['Meditation Practice', 'Stress Management', 'Emotional Intelligence', 'Sleep Quality'];
      const mentalSummaries = [
        'Daily meditation practice with breathing exercises and mindfulness techniques',
        'Stress management through time blocking, boundaries, and relaxation methods',
        'Developing emotional intelligence and empathy in personal relationships',
        'Optimizing sleep quality with consistent schedule and sleep hygiene'
      ];

      for (let i = 0; i < 4; i++) {
        const dot: Dot = {
          id: `preview-dot-health-3-${i}`,
          oneWordSummary: mentalHeadings[i],
          summary: mentalSummaries[i],
          anchor: `Personal reflections on ${mentalHeadings[i].toLowerCase()} and mental health`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: mentalWellnessWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        mentalWellnessWheel.dots.push(dot);
      }
      previewWheels.push(mentalWellnessWheel);

      // PERSONAL GROWTH CHAKRA with 4 wheels
      const growthChakra: Wheel = {
        id: 'preview-chakra-growth',
        name: 'Personal Growth & Learning',
        heading: 'Personal Growth & Learning',
        purpose: 'Continuous self-improvement through skill development, knowledge acquisition, and personal reflection for lifelong growth.',
        timeline: 'Monthly',
        category: 'Personal',
        color: '#B45309', // Dark amber for Chakras
        dots: [],
        connections: [],
        position: { x: 400, y: 800 }, // Bottom-left chakra
        chakraId: undefined, // This marks it as a chakra (top-level container)
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      };
      previewWheels.push(growthChakra);

      // First growth wheel - Learning & Skills
      const learningWheel: Wheel = {
        id: 'preview-wheel-growth-1',
        name: 'Learning & Skills',
        heading: 'Continuous Learning',
        goals: 'Acquiring new skills and knowledge through courses, books, and practical application in areas of personal and professional interest.',
        timeline: 'Weekly',
        category: 'Personal',
        color: '#EA580C',
        dots: [],
        connections: ['preview-wheel-growth-2'],
        position: { x: 320, y: 720 }, // Top-left in growth chakra
        chakraId: 'preview-chakra-growth',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      };

      const learningHeadings = ['Online Courses', 'Reading Books', 'Skill Practice'];
      const learningSummaries = [
        'Completing online courses in data science and machine learning fundamentals',
        'Reading personal development and technical books for knowledge expansion',
        'Practicing new programming languages and frameworks through projects'
      ];

      for (let i = 0; i < 3; i++) {
        const dot: Dot = {
          id: `preview-dot-growth-1-${i}`,
          oneWordSummary: learningHeadings[i],
          summary: learningSummaries[i],
          anchor: `Learning experiences with ${learningHeadings[i].toLowerCase()} and knowledge building`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: learningWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        learningWheel.dots.push(dot);
      }
      previewWheels.push(learningWheel);

      // Second growth wheel - Self-Reflection
      const reflectionWheel: Wheel = {
        id: 'preview-wheel-growth-2',
        name: 'Self-Reflection',
        heading: 'Self-Reflection & Awareness',
        goals: 'Regular self-reflection through journaling, goal setting, and mindfulness to increase self-awareness and personal growth.',
        timeline: 'Daily',
        category: 'Personal',
        color: '#EA580C',
        dots: [],
        connections: ['preview-wheel-growth-3'],
        position: { x: 480, y: 720 }, // Top-right in growth chakra
        chakraId: 'preview-chakra-growth',
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
      };

      const reflectionHeadings = ['Daily Journaling', 'Goal Review', 'Values Alignment', 'Gratitude Practice'];
      const reflectionSummaries = [
        'Daily journaling to process thoughts, emotions, and daily experiences',
        'Weekly goal review and progress tracking for personal objectives',
        'Reflecting on personal values and ensuring actions align with principles',
        'Daily gratitude practice to cultivate positive mindset and appreciation'
      ];

      for (let i = 0; i < 4; i++) {
        const dot: Dot = {
          id: `preview-dot-growth-2-${i}`,
          oneWordSummary: reflectionHeadings[i],
          summary: reflectionSummaries[i],
          anchor: `Personal insights about ${reflectionHeadings[i].toLowerCase()} and self-awareness`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: reflectionWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        reflectionWheel.dots.push(dot);
      }
      previewWheels.push(reflectionWheel);

      // Third growth wheel - Creativity & Hobbies
      const creativityWheel: Wheel = {
        id: 'preview-wheel-growth-3',
        name: 'Creativity & Hobbies',
        heading: 'Creative Expression',
        goals: 'Exploring creative outlets and hobbies for personal fulfillment, stress relief, and artistic expression.',
        timeline: 'Weekly',
        category: 'Personal',
        color: '#EA580C',
        dots: [],
        connections: ['preview-wheel-growth-4'],
        position: { x: 350, y: 880 }, // Bottom-left in growth chakra
        chakraId: 'preview-chakra-growth',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
      };

      const creativityHeadings = ['Music Practice', 'Photography', 'Writing'];
      const creativitySummaries = [
        'Learning guitar and practicing music composition for emotional expression',
        'Exploring photography techniques and capturing meaningful moments',
        'Creative writing and storytelling as forms of artistic expression'
      ];

      for (let i = 0; i < 3; i++) {
        const dot: Dot = {
          id: `preview-dot-growth-3-${i}`,
          oneWordSummary: creativityHeadings[i],
          summary: creativitySummaries[i],
          anchor: `Creative experiences with ${creativityHeadings[i].toLowerCase()} and artistic development`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: creativityWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        creativityWheel.dots.push(dot);
      }
      previewWheels.push(creativityWheel);

      // Fourth growth wheel - Relationships & Social
      const relationshipsWheel: Wheel = {
        id: 'preview-wheel-growth-4',
        name: 'Relationships & Social',
        heading: 'Building Meaningful Connections',
        goals: 'Nurturing meaningful relationships, improving communication skills, and building a supportive social network.',
        timeline: 'Weekly',
        category: 'Personal',
        color: '#EA580C',
        dots: [],
        connections: [],
        position: { x: 450, y: 880 }, // Bottom-right in growth chakra
        chakraId: 'preview-chakra-growth',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      };

      const relationshipHeadings = ['Family Time', 'Friend Connections', 'Community Involvement'];
      const relationshipSummaries = [
        'Quality time with family members through shared activities and conversations',
        'Maintaining and deepening friendships through regular communication and support',
        'Active involvement in community events and volunteer opportunities'
      ];

      for (let i = 0; i < 3; i++) {
        const dot: Dot = {
          id: `preview-dot-growth-4-${i}`,
          oneWordSummary: relationshipHeadings[i],
          summary: relationshipSummaries[i],
          anchor: `Social experiences with ${relationshipHeadings[i].toLowerCase()} and relationship building`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: relationshipsWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        relationshipsWheel.dots.push(dot);
      }
      previewWheels.push(relationshipsWheel);

      // FINANCIAL WISDOM CHAKRA with 3 wheels
      const financeChakra: Wheel = {
        id: 'preview-chakra-finance',
        name: 'Financial Wisdom & Security',
        heading: 'Financial Wisdom & Security',
        purpose: 'Building long-term financial security through smart investments, budgeting, and financial literacy for peace of mind.',
        timeline: 'Monthly',
        category: 'Finance',
        color: '#B45309', // Dark amber for Chakras
        dots: [],
        connections: [],
        position: { x: 1100, y: 800 }, // Bottom-right chakra
        chakraId: undefined, // This marks it as a chakra (top-level container)
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      };
      previewWheels.push(financeChakra);

      // First finance wheel - Budgeting & Savings
      const budgetingWheel: Wheel = {
        id: 'preview-wheel-finance-1',
        name: 'Budgeting & Savings',
        heading: 'Smart Budgeting',
        goals: 'Creating and maintaining a comprehensive budget with automated savings and expense tracking for financial discipline.',
        timeline: 'Monthly',
        category: 'Finance',
        color: '#EA580C',
        dots: [],
        connections: ['preview-wheel-finance-2'],
        position: { x: 1020, y: 720 }, // Top-left in finance chakra
        chakraId: 'preview-chakra-finance',
        createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
      };

      const budgetHeadings = ['Monthly Budget', 'Emergency Fund', 'Expense Tracking', 'Automated Savings'];
      const budgetSummaries = [
        'Creating detailed monthly budget with income allocation and spending limits',
        'Building emergency fund covering 6 months of essential expenses',
        'Daily expense tracking using apps and spreadsheets for financial awareness',
        'Setting up automated savings transfers for consistent wealth building'
      ];

      for (let i = 0; i < 4; i++) {
        const dot: Dot = {
          id: `preview-dot-finance-1-${i}`,
          oneWordSummary: budgetHeadings[i],
          summary: budgetSummaries[i],
          anchor: `Financial insights about ${budgetHeadings[i].toLowerCase()} and money management`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: budgetingWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        budgetingWheel.dots.push(dot);
      }
      previewWheels.push(budgetingWheel);

      // Second finance wheel - Investments
      const investmentWheel: Wheel = {
        id: 'preview-wheel-finance-2',
        name: 'Investments',
        heading: 'Investment Strategy',
        goals: 'Building diversified investment portfolio through index funds, stocks, and retirement accounts for long-term wealth creation.',
        timeline: 'Quarterly',
        category: 'Finance',
        color: '#EA580C',
        dots: [],
        connections: ['preview-wheel-finance-3'],
        position: { x: 1180, y: 720 }, // Top-right in finance chakra
        chakraId: 'preview-chakra-finance',
        createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
      };

      const investmentHeadings = ['Index Funds', 'Stock Research', 'Retirement Planning'];
      const investmentSummaries = [
        'Regular investments in low-cost index funds for market diversification',
        'Research and analysis of individual stocks for potential investments',
        'Maximizing 401k contributions and IRA investments for retirement security'
      ];

      for (let i = 0; i < 3; i++) {
        const dot: Dot = {
          id: `preview-dot-finance-2-${i}`,
          oneWordSummary: investmentHeadings[i],
          summary: investmentSummaries[i],
          anchor: `Investment insights about ${investmentHeadings[i].toLowerCase()} and wealth building`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: investmentWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        investmentWheel.dots.push(dot);
      }
      previewWheels.push(investmentWheel);

      // Third finance wheel - Financial Education
      const educationWheel: Wheel = {
        id: 'preview-wheel-finance-3',
        name: 'Financial Education',
        heading: 'Financial Literacy',
        goals: 'Continuous learning about personal finance, taxes, and economic trends to make informed financial decisions.',
        timeline: 'Weekly',
        category: 'Finance',
        color: '#EA580C',
        dots: [],
        connections: [],
        position: { x: 1100, y: 880 }, // Bottom center in finance chakra
        chakraId: 'preview-chakra-finance',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      };

      const finEduHeadings = ['Finance Books', 'Tax Planning', 'Market Analysis'];
      const finEduSummaries = [
        'Reading personal finance books and following financial education podcasts',
        'Learning tax optimization strategies and deduction opportunities',
        'Following market trends and economic indicators for investment decisions'
      ];

      for (let i = 0; i < 3; i++) {
        const dot: Dot = {
          id: `preview-dot-finance-3-${i}`,
          oneWordSummary: finEduHeadings[i],
          summary: finEduSummaries[i],
          anchor: `Educational insights about ${finEduHeadings[i].toLowerCase()} and financial knowledge`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: educationWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        educationWheel.dots.push(dot);
      }
      previewWheels.push(educationWheel);

      // Add Chakra after all child wheels are defined
      previewWheels.push(businessChakra);

      // Add scattered unorganized dots across the grid to show diverse thinking
      const scatteredHeadings = [
        'Coffee Ritual', 'Weather Impact', 'Music Flow', 'Reading Pattern', 
        'Dream Insight', 'Walk Reflection', 'Art Inspiration', 'Code Solution',
        'Nature Connection', 'Social Moment'
      ];
      const scatteredSummaries = [
        'Morning coffee ritual and its profound impact on daily productivity patterns',
        'Weather changes affecting mood and energy levels throughout the day',
        'Music preferences enhancing focus and creative thinking processes',
        'Reading habits revealing deep learning patterns and knowledge retention',
        'Vivid dream that provided unexpected solution to ongoing life challenge',
        'Reflective walk that sparked clarity about personal relationships',
        'Art piece that inspired new perspective on creative problem-solving',
        'Coding breakthrough that emerged during focused deep work session',
        'Time in nature that restored mental clarity and emotional balance',
        'Meaningful social interaction that shifted perspective on communication'
      ];

      // Scatter 10 dots across different areas of the grid, avoiding chakra zones
      // Chakra positions: Business (400,300), Health (1100,300), Personal Growth (400,800), Financial (1100,800)
      // Each chakra is ~420px diameter, so avoid 210px radius around each center
      const scatteredPositions = [
        { x: 150, y: 150 },   // Top-left clear area
        { x: 750, y: 120 },   // Between business and health chakras
        { x: 100, y: 400 },   // Left side clear area
        { x: 1350, y: 200 },  // Right of health chakra
        { x: 650, y: 180 },   // Safe zone between chakras
        { x: 200, y: 950 },   // Below personal growth chakra
        { x: 1400, y: 450 },  // Far right clear area
        { x: 750, y: 950 },   // Between bottom chakras
        { x: 120, y: 650 },   // Left of personal growth chakra
        { x: 1350, y: 950 }   // Right of financial chakra
      ];

      for (let i = 0; i < 10; i++) {
        const dot: Dot = {
          id: `scattered-${i + 1}`,
          oneWordSummary: scatteredHeadings[i],
          summary: scatteredSummaries[i],
          anchor: `Personal insight about ${scatteredHeadings[i].toLowerCase()} and individual growth`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: null, // No wheel - scattered/unorganized dot
          timestamp: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural',
          position: scatteredPositions[i] // Direct position for scattered dots
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
    // Wheels: items with chakraId (belonging to a chakra) OR chakraId === null (standalone wheels)
    // Chakras: items with chakraId === undefined (top-level containers)
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
            <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800">
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
      setZoom(0.6); // Default zoom to 60%
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
          setZoom(0.6); // Default zoom to 60%
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
                    
                    // Position dots in a circle inside the wheel (ensure they stay within wheel boundaries)
                    const wheelCenterX = wheel.position.x;
                    const wheelCenterY = wheel.position.y;
                    const wheelRadius = 60; // Wheel radius (120px diameter / 2)
                    // Use dynamic sizing for consistent user experience
                    const dotRadius = calculateDynamicSizing('preview', dotsInWheel.length, 'dots');
                    const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                    
                    x = wheelCenterX + Math.cos(angle) * dotRadius;
                    y = wheelCenterY + Math.sin(angle) * dotRadius;
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
                    // Use dynamic sizing for consistent user experience in real mode
                    const dotRadius = calculateDynamicSizing('real', dotsInWheel.length, 'dots');
                    const angle = (dotIndexInWheel * 2 * Math.PI) / dotsInWheel.length;
                    
                    x = wheelCenterX + Math.cos(angle) * dotRadius;
                    y = wheelCenterY + Math.sin(angle) * dotRadius;
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
                  // Individual scattered dots - use position if available, otherwise grid system
                  if (dot.position) {
                    x = dot.position.x;
                    y = dot.position.y;
                  } else {
                    // Fallback to intelligent grid system for dots without specific positions
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
              }
              
              return (
                <div key={dot.id} className="relative">
                  {/* Dot */}
                  <div
                    className="absolute w-12 h-12 rounded-full cursor-pointer transition-all duration-300 hover:scale-125 hover:shadow-lg group dot-element"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)', // Light amber gradient for all dots
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
                // Auto-position wheels in a grid layout for real data with dynamic spacing
                const wheelGridCols = 3;
                // Dynamic spacing based on content - more content = tighter spacing
                const totalWheelsCount = displayWheels.length;
                const baseSpacing = 250;
                const wheelSpacing = totalWheelsCount <= 6 ? baseSpacing : Math.max(200, baseSpacing - (totalWheelsCount - 6) * 10);
                const wheelBaseX = 200;
                const wheelBaseY = 200;
                
                const wheelGridX = (wheelIndex % wheelGridCols) * wheelSpacing + wheelBaseX;
                const wheelGridY = Math.floor(wheelIndex / wheelGridCols) * wheelSpacing + wheelBaseY;
                
                wheelPosition = { x: wheelGridX, y: wheelGridY };
              }
              
              // Determine wheel size based on type and hierarchy using dynamic sizing
              let wheelSize;
              let isChakra;
              
              if (previewMode) {
                // In preview mode, use dynamic sizing logic - chakras are identified by having no chakraId
                isChakra = wheel.chakraId === undefined;
                if (isChakra) {
                  // Dynamic chakra sizing based on child wheels count
                  const childWheels = displayWheels.filter(w => w.chakraId === wheel.id);
                  wheelSize = getChakraSize('preview', childWheels.length);

                } else {
                  // Dynamic wheel sizing based on dots count
                  const wheelDots = displayDots.filter(d => d.wheelId === wheel.id);
                  wheelSize = calculateDynamicSizing('preview', wheelDots.length, 'wheels') * 2; // Convert radius to diameter
                }
              } else {
                // In real mode, use dynamic sizing system
                isChakra = wheel.chakraId === undefined;
                if (isChakra) {
                  // Dynamic chakra sizing based on child wheels count
                  const childWheels = displayWheels.filter(w => w.chakraId === wheel.id);
                  wheelSize = getChakraSize('real', childWheels.length);

                } else {
                  // Dynamic wheel sizing based on dots count
                  const wheelDots = displayDots.filter(d => d.wheelId === wheel.id);
                  wheelSize = calculateDynamicSizing('real', wheelDots.length, 'wheels') * 2; // Convert radius to diameter
                }
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
                  {/* Enhanced Chakra/Wheel boundary */}
                  {isChakra ? (
                    /* Advanced Chakra Effect with Multiple Energy Rings */
                    <div className="relative w-full h-full">
                      {/* Outer energy ring - rotating slowly */}
                      <div 
                        className="absolute inset-0 rounded-full opacity-30 animate-spin"
                        style={{ 
                          background: `conic-gradient(from 0deg, ${wheel.color}00, ${wheel.color}80, ${wheel.color}00, ${wheel.color}80, ${wheel.color}00)`,
                          animationDuration: '20s'
                        }}
                      />
                      
                      {/* Middle energy ring - pulsing */}
                      <div 
                        className="absolute inset-4 rounded-full opacity-40 animate-pulse"
                        style={{ 
                          background: `radial-gradient(circle, ${wheel.color}20, ${wheel.color}60, ${wheel.color}20)`,
                          boxShadow: `0 0 60px ${wheel.color}60, inset 0 0 40px ${wheel.color}30`
                        }}
                      />
                      
                      {/* Inner core ring - steady glow */}
                      <div 
                        className="absolute inset-8 rounded-full opacity-60"
                        style={{ 
                          background: `linear-gradient(45deg, ${wheel.color}40, ${wheel.color}20, ${wheel.color}40)`,
                          boxShadow: `0 0 30px ${wheel.color}80`
                        }}
                      />
                      

                    </div>
                  ) : (
                    /* Regular wheel boundary */
                    <div 
                      className="w-full h-full rounded-full border-4 border-dashed opacity-60"
                      style={{ 
                        borderColor: wheel.color,
                        background: `linear-gradient(135deg, ${wheel.color}10, ${wheel.color}05)`
                      }}
                    />
                  )}
                  
                  {/* Chakra label and enhancement with high z-index */}
                  {isChakra && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 pointer-events-auto z-[999]" style={{ zIndex: 999 }}>
                      <div 
                        className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg border-2 border-amber-400"
                        style={{
                          background: `linear-gradient(135deg, ${wheel.color}, ${wheel.color}CC)`
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          <span className="text-sm font-bold">CHAKRA</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Blinking Spark Symbol on top of wheel with high z-index */}
                  <div 
                    className={`absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-[999] ${
                      isChakra ? 'top-[-95px]' : 'top-[-75px]'
                    }`}
                    style={{ zIndex: 999 }}
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
                    
                    {/* Wheel label with high z-index to override chakra effects */}
                    <div 
                      data-wheel-label
                      className={`relative font-bold rounded-full text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 pointer-events-auto text-center whitespace-nowrap z-[999] ${
                        isChakra ? 'text-base px-4 py-2' : 'text-sm px-3 py-1'
                      }`}
                      style={{ 
                        backgroundColor: wheel.color,
                        position: 'relative',
                        zIndex: 999
                      }}
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
              
              {/* Enhanced Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
                <Input
                  type="text"
                  placeholder="Search dots, wheels, or chakras by keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 w-80 text-sm border-2 border-amber-200 bg-white/90 backdrop-blur focus:border-amber-500 focus:ring-amber-500/20 rounded-xl placeholder:text-gray-500 text-gray-800 shadow-sm"
                />
                {showSearchResults && searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
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
          

          {/* Search Results Section */}
          {showSearchResults && searchTerm && (
            <div className="mb-6 bg-white/95 backdrop-blur border-2 border-amber-200 rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-800">
                  Search Results for "{searchTerm}"
                </h3>
                <div className="text-sm text-gray-600">
                  {searchResults.dots.length + searchResults.wheels.length + searchResults.chakras.length} results found
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Chakras Results */}
                {searchResults.chakras.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-amber-700 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                      Chakras ({searchResults.chakras.length})
                    </h4>
                    <div className="grid gap-2">
                      {searchResults.chakras.map((chakra) => (
                        <Card key={chakra.id} className="cursor-pointer hover:shadow-md transition-shadow border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50" onClick={() => setViewFullWheel(chakra)}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-amber-100 text-amber-800 text-xs">Chakra</Badge>
                                </div>
                                <h5 className="font-bold text-amber-800">{chakra.heading || chakra.name}</h5>
                                <p className="text-sm text-gray-600 line-clamp-2">{chakra.purpose}</p>
                              </div>
                              <Badge className="bg-amber-100 text-amber-700">{chakra.timeline}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Wheels Results */}
                {searchResults.wheels.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                      Wheels ({searchResults.wheels.length})
                    </h4>
                    <div className="grid gap-2">
                      {searchResults.wheels.map((wheel) => (
                        <Card key={wheel.id} className="cursor-pointer hover:shadow-md transition-shadow border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50" onClick={() => setViewFullWheel(wheel)}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-orange-100 text-orange-800 text-xs">Wheel</Badge>
                                </div>
                                <h5 className="font-bold text-orange-800">{wheel.heading || wheel.name}</h5>
                                <p className="text-sm text-gray-600 line-clamp-2">{wheel.goals}</p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-700">{wheel.timeline}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dots Results */}
                {searchResults.dots.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-amber-700 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      Dots ({searchResults.dots.length})
                    </h4>
                    <div className="grid gap-2">
                      {searchResults.dots.map((dot) => (
                        <Card key={dot.id} className="cursor-pointer hover:shadow-md transition-shadow border border-amber-200 bg-white/95" onClick={() => setViewFullDot(dot)}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50/80">
                                    {dot.sourceType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : <Type className="h-3 w-3 mr-1" />}
                                    {dot.sourceType}
                                  </Badge>
                                  {dot.captureMode === 'ai' && (
                                    <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>
                                  )}
                                </div>
                                <h5 className="font-bold text-amber-800 mb-1">{dot.oneWordSummary}</h5>
                                <p className="text-sm text-gray-700 line-clamp-2 mb-1">{dot.summary}</p>
                                <p className="text-xs text-gray-600 line-clamp-1">{dot.anchor}</p>
                              </div>
                              <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 ml-2">
                                {dot.pulse}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results Message */}
                {searchResults.dots.length === 0 && searchResults.wheels.length === 0 && searchResults.chakras.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No results found</p>
                    <p className="text-sm">Try different keywords or check your spelling</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
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
