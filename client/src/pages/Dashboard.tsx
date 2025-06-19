import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mic, Type, Eye, Brain, Network, Zap, Search, Clock, Info, Database, Cpu, Sparkles, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DotFullView from "@/components/DotFullView";
import DotFlashCard from "@/components/DotFlashCard";

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

  // Fetch real dots from API
  const { data: dots = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/dots'],
    queryFn: async () => {
      const response = await fetch('/api/dots');
      if (!response.ok) throw new Error('Failed to fetch dots');
      return response.json();
    }
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
  recentCount?: number 
}> = ({ wheels, actualDots, showingRecentFilter = false, recentCount = 4 }) => {
    const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
    const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
    const [hoveredDot, setHoveredDot] = useState<Dot | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [zoom, setZoom] = useState(1);
    const gridContainerRef = useRef<HTMLDivElement>(null);

    // Generate preview data when preview mode is enabled
    const generatePreviewData = () => {
      const emotions = ['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'];
      
      const previewDots: Dot[] = [];
      const previewWheels: Wheel[] = [];

      // Innovation wheel
      const innovationWheel: Wheel = {
        id: 'preview-wheel-0',
        name: 'Innovation',
        category: 'Innovation',
        color: '#F59E0B',
        dots: [],
        connections: ['preview-wheel-1'],
        position: { x: 200, y: 200 }
      };

      const innovationHeadings = [
        'AI Ethics', 'Blockchain', 'Quantum', 'Sustainability', 'Automation',
        'Biotech', 'AR/VR', 'IoT', 'Robotics'
      ];

      const innovationSummaries = [
        'Exploring ethical frameworks for AI decision-making in healthcare applications',
        'Decentralized identity solutions using blockchain for privacy protection',
        'Quantum computing breakthrough in cryptography and security protocols',
        'Sustainable technology design principles for reducing carbon footprint',
        'Process automation using low-code platforms for small businesses',
        'CRISPR gene editing applications in personalized medicine',
        'Immersive AR experiences for remote collaboration and training',
        'Smart city IoT infrastructure for traffic optimization',
        'Autonomous robotics in warehouse logistics and inventory management'
      ];

      for (let i = 0; i < 9; i++) {
        const dot: Dot = {
          id: `preview-dot-0-${i}`,
          oneWordSummary: innovationHeadings[i],
          summary: innovationSummaries[i],
          anchor: `Research context and implementation strategy for ${innovationHeadings[i].toLowerCase()} initiative`,
          pulse: emotions[Math.floor(Math.random() * emotions.length)],
          wheelId: innovationWheel.id,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceType: Math.random() > 0.5 ? 'voice' : 'text',
          captureMode: Math.random() > 0.7 ? 'ai' : 'natural'
        };
        previewDots.push(dot);
        innovationWheel.dots.push(dot);
      }
      previewWheels.push(innovationWheel);

      // Learning wheel
      const learningWheel: Wheel = {
        id: 'preview-wheel-1',
        name: 'Learning',
        category: 'Learning',
        color: '#D97706',
        dots: [],
        connections: ['preview-wheel-0'],
        position: { x: 550, y: 250 }
      };

      const learningHeadings = [
        'TypeScript', 'Leadership', 'Psychology', 'Design', 'Finance',
        'Negotiation', 'Systems', 'Mindfulness', 'Strategy'
      ];

      const learningSummaries = [
        'Advanced TypeScript patterns for building scalable frontend applications',
        'Transformational leadership principles and team motivation techniques',
        'Cognitive biases in decision-making and behavioral economics insights',
        'Design thinking methodology for user-centered product development',
        'Personal finance strategies and investment portfolio diversification',
        'Negotiation tactics for win-win outcomes in business partnerships',
        'Systems thinking approach to complex problem-solving frameworks',
        'Mindfulness meditation practices for stress reduction and focus',
        'Strategic planning frameworks for competitive advantage analysis'
      ];

      for (let i = 0; i < 9; i++) {
        const dot: Dot = {
          id: `preview-dot-1-${i}`,
          oneWordSummary: learningHeadings[i],
          summary: learningSummaries[i],
          anchor: `Learning context and practical application notes for ${learningHeadings[i].toLowerCase()} mastery`,
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

      return { previewDots, previewWheels };
    };

    const { previewDots, previewWheels } = generatePreviewData();
    const displayWheels = previewMode ? previewWheels : wheels;
    
    // Filter dots based on recent filter setting
    let filteredDots = actualDots;
    if (showingRecentFilter && !previewMode) {
      // Sort by timestamp (most recent first) and take the specified number
      filteredDots = [...actualDots]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, recentCount);
    }
    
    const displayDots = previewMode ? previewDots : filteredDots;
    const totalDots = displayDots.length;
    
    // Count actual formed wheels - only wheels with 9+ dots of same category
    const actualFormedWheels = previewMode ? previewWheels.length : 0; // Real users haven't formed complete wheels yet
    const totalWheels = actualFormedWheels;

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
    
    // Reset view function for scroll-based navigation
    const resetView = () => {
      if (gridContainerRef.current) {
        gridContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
      setZoom(1);
    };

    // Mouse wheel zoom for browser
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomChange = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(Math.max(0.5, Math.min(2, zoom + zoomChange)));
    };

    const renderDotConnections = () => {
      const connections: JSX.Element[] = [];
      
      displayDots.forEach((dot, index) => {
        // Calculate this dot's position
        const dotId1 = String(dot.id || index);
        const seedX1 = dotId1.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const seedY1 = dotId1.split('').reverse().reduce((a, b) => a + b.charCodeAt(0), 0);
        
        let x1, y1;
        if (previewMode) {
          // Calculate wheel-based position for preview mode
          const wheelIndex1 = Math.floor(index / 9);
          const dotInWheelIndex1 = index % 9;
          const wheel1 = displayWheels[wheelIndex1];
          
          if (wheel1) {
            const radius = 60;
            const angle = (dotInWheelIndex1 * 2 * Math.PI) / 9;
            x1 = wheel1.position.x + Math.cos(angle) * radius + 24;
            y1 = wheel1.position.y + Math.sin(angle) * radius + 24;
          } else {
            x1 = 80 + (seedX1 % 700) + (index * 73) % 300 + 24;
            y1 = 80 + (seedY1 % 500) + (index * 89) % 250 + 24;
          }
        } else {
          x1 = 60 + (seedX1 % 800) + (index * 47) % 200 + 24; // +24 for dot center
          y1 = 60 + (seedY1 % 600) + (index * 73) % 180 + 24;
        }
        
        displayDots.slice(index + 1).forEach((otherDot, otherIndex) => {
          // Calculate other dot's position
          const realOtherIndex = index + 1 + otherIndex;
          const dotId2 = String(otherDot.id || realOtherIndex);
          const seedX2 = dotId2.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const seedY2 = dotId2.split('').reverse().reduce((a, b) => a + b.charCodeAt(0), 0);
          
          let x2, y2;
          if (previewMode) {
            // Calculate wheel-based position for preview mode
            const wheelIndex2 = Math.floor(realOtherIndex / 9);
            const dotInWheelIndex2 = realOtherIndex % 9;
            const wheel2 = displayWheels[wheelIndex2];
            
            if (wheel2) {
              const radius = 60;
              const angle = (dotInWheelIndex2 * 2 * Math.PI) / 9;
              x2 = wheel2.position.x + Math.cos(angle) * radius + 24;
              y2 = wheel2.position.y + Math.sin(angle) * radius + 24;
            } else {
              x2 = 80 + (seedX2 % 700) + (realOtherIndex * 73) % 300 + 24;
              y2 = 80 + (seedY2 % 500) + (realOtherIndex * 89) % 250 + 24;
            }
          } else {
            x2 = 60 + (seedX2 % 800) + (realOtherIndex * 47) % 200 + 24;
            y2 = 60 + (seedY2 % 600) + (realOtherIndex * 73) % 180 + 24;
          }
          
          // Create consistent connection logic based on dot IDs
          const connectionSeed = (seedX1 + seedY1 + seedX2 + seedY2) % 100;
          if (connectionSeed < 25) { // 25% chance of connection for organic feel
            connections.push(
              <line
                key={`${dot.id}-${otherDot.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#dotConnectionGradient)"
                strokeWidth="1.5"
                strokeDasharray="6,3"
                opacity="0.5"
                filter="url(#glow)"
                className="animate-pulse"
              />
            );
          }
        });
      });
      
      return connections;
    };

    return (
      <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
        {/* Preview toggle and Recent Filter Indicator */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {(previewMode || displayDots.length > 0) && (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg px-2 py-1 border-2 border-amber-200">
              <label className="text-xs font-medium text-amber-800 hidden sm:block">Preview Mode</label>
              <label className="text-xs font-medium text-amber-800 sm:hidden">Preview</label>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  previewMode ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                    previewMode ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
          
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
        
        {/* Zoom and Navigation Controls - Positioned to avoid overlap */}
        <div className="absolute top-16 sm:top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1 sm:gap-2 bg-white/90 backdrop-blur rounded-lg p-1 sm:p-2 border-2 border-amber-200 shadow-lg">
          {/* Zoom Out */}
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded p-1 transition-colors"
            title="Zoom Out"
          >
            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          {/* Zoom Level Display */}
          <span className="text-xs font-semibold text-amber-800 min-w-[35px] sm:min-w-[45px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          {/* Zoom In */}
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded p-1 transition-colors"
            title="Zoom In"
          >
            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          {/* Reset View */}
          <button
            onClick={() => {
              setOffset({ x: 0, y: 0 });
              setZoom(1);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded p-1 transition-colors ml-1 sm:ml-2"
            title="Reset View"
          >
            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        <div className="absolute top-4 right-4 z-10 flex flex-col sm:flex-row gap-1 sm:gap-2">
          <button className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 border-2 border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-50 transition-colors whitespace-nowrap">
            Dots: {totalDots}
          </button>
          <button className="bg-white/90 backdrop-blur rounded-lg px-2 py-1 border-2 border-amber-200 text-xs font-semibold text-amber-800 hover:bg-amber-50 transition-colors whitespace-nowrap">
            Wheels: {totalWheels}
          </button>
        </div>


        
        {/* Interactive scrollable grid */}
        <div 
          ref={gridContainerRef}
          className="relative overflow-auto h-[450px] w-full"
          onWheel={handleWheel}
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          <div 
            className="relative"
            style={{ 
              width: `${1200 * zoom}px`, 
              height: `${800 * zoom}px`,
              minWidth: '100%',
              minHeight: '100%'
            }}
          >
            {/* Individual Dots Random Grid */}
            {displayDots.map((dot, index) => {
              // Generate consistent random positions based on dot ID for stability
              const dotId = String(dot.id || index); // Ensure string conversion
              const seedX = dotId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              const seedY = dotId.split('').reverse().reduce((a, b) => a + b.charCodeAt(0), 0);
              
              // Position dots inside wheels for preview mode
              let x, y;
              if (previewMode) {
                // Find which wheel this dot belongs to
                const wheelIndex = Math.floor(index / 9);
                const dotInWheelIndex = index % 9;
                const wheel = displayWheels[wheelIndex];
                
                if (wheel) {
                  // Position dots in a circle inside the wheel
                  const wheelCenterX = wheel.position.x;
                  const wheelCenterY = wheel.position.y;
                  const radius = 60; // Radius for dot positioning inside wheel
                  const angle = (dotInWheelIndex * 2 * Math.PI) / 9; // 9 dots in circle
                  
                  x = wheelCenterX + Math.cos(angle) * radius;
                  y = wheelCenterY + Math.sin(angle) * radius;
                } else {
                  x = 80 + (seedX % 700) + (index * 73) % 300;
                  y = 80 + (seedY % 500) + (index * 89) % 250;
                }
              } else {
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
                      setViewFullDot(dot);
                      setHoveredDot(null);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('Dot touched:', dot.id);
                      // Immediate response for PWA - show full view
                      setViewFullDot(dot);
                      setHoveredDot(null);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseEnter={() => setHoveredDot(dot)}
                    onMouseLeave={() => {
                      // Only clear if not clicked
                      if (hoveredDot?.id !== dot.id) {
                        setHoveredDot(null);
                      }
                    }}
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
                    
                    {/* Emotion indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-xs">
                      {dot.pulse.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Summary hover card */}
                  {hoveredDot?.id === dot.id && (
                    <div 
                      className="absolute bg-white border-2 border-amber-200 rounded-lg p-3 shadow-xl z-50 w-64 cursor-pointer"
                      style={{
                        // Position next to the dot with smart placement
                        left: `${x + 60}px`,
                        top: `${Math.max(0, y - 20)}px`,
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
                
                {/* Wheel label */}
                <div 
                  className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 text-center"
                >
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
              {displayDots.length > 1 && renderDotConnections()}
            </svg>
          </div>
        </div>
        
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
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Brain className="w-8 h-8 text-amber-600" />
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              My DotSpark Neura
            </span>
          </h1>

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
              placeholder="Enter keywords to search for your dots or sparks"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-2 border-amber-200 bg-white/90 backdrop-blur focus:border-amber-500 focus:ring-amber-500/20 rounded-xl placeholder:text-gray-500 text-gray-800 shadow-sm"
            />
          </div>
        </div>

        {/* Dot Wheels Map Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Network className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                  Dot Wheels Map
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="ml-2 p-1 rounded-full hover:bg-amber-100 transition-colors">
                      <Info className="w-4 h-4 text-amber-600" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-amber-600" />
                        About Dot Wheels Map
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>You can see the dots you saved in this grid.</p>
                      <div>
                        <p className="font-semibold text-amber-700 mb-1">What are Wheels?</p>
                        <p>Dots of the same category form a Dot Wheel which is nothing but a bigger dot. Keep adding your dots and let DotSpark fix it into relevant Wheels.</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </h2>
              
              {/* Recent Dots Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setShowRecentFilter(!showRecentFilter)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                    showRecentFilter 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
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
                
                {showRecentFilter && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-gray-600 whitespace-nowrap">Show:</span>
                    <select
                      value={recentDotsCount}
                      onChange={(e) => setRecentDotsCount(parseInt(e.target.value))}
                      className="px-2 py-1 text-xs sm:text-sm border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white min-w-[60px] sm:min-w-[80px]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    <span className="text-gray-600 whitespace-nowrap">dots</span>
                  </div>
                )}
              </div>
            </div>
            

          </div>
          
          <DotWheelsMap 
            wheels={wheels} 
            actualDots={showRecentFilter ? dots.slice(0, recentDotsCount) : dots} 
            showingRecentFilter={showRecentFilter}
            recentCount={recentDotsCount}
          />
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