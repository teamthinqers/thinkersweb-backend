import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Mic, Type, Eye, Brain, Network, Zap, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DotFullView } from "@/components/DotFullView";
import { SearchResultsList } from "@/components/SearchResultsList";

// Data structure for dots
interface Dot {
  id: number;
  summary: string; // 220 chars max
  anchor: string; // 300 chars max  
  pulse: string; // 1 word emotion
  sourceType: 'voice' | 'text'; // Only voice or text, no hybrid
  originalAudioBlob?: string;
  transcriptionText?: string;
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
  wheelId?: number;
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
  const [searchResults, setSearchResults] = useState<Dot[]>([]);

  // Fetch real dots from API
  const { data: dots = [], isLoading } = useQuery({
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
      id: 1001,
      summary: "Learned about microservices architecture patterns and their trade-offs in distributed systems",
      anchor: "Discussed with senior architect about breaking down monolith, focusing on domain boundaries and data consistency challenges",
      pulse: "curious",
      wheelId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      positionX: 0,
      positionY: 0,
      sourceType: 'text'
    },
    {
      id: 1002, 
      summary: "Completed advanced React patterns workshop covering render props, higher-order components",
      anchor: "Workshop by Kent C. Dodds, practiced compound components pattern with real examples from UI libraries",
      pulse: "focused",
      wheelId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      positionX: 0,
      positionY: 0,
      sourceType: 'voice'
    },
    {
      id: 1003,
      summary: "Started morning meditation routine, noticed improved focus and reduced anxiety levels",
      anchor: "Using Headspace app, 10-minute sessions before work, tracking mood changes and productivity correlations",
      pulse: "calm",
      wheelId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      positionX: 0,
      positionY: 0,
      sourceType: 'text'
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
      id: "1",
      name: 'Innovation Ideas',
      category: 'Technology',
      color: '#3B82F6',
      dots: [],
      connections: [],
      position: { x: 100, y: 100 }
    },
    {
      id: "2", 
      name: 'Business Strategies',
      category: 'Professional',
      color: '#10B981',
      dots: [],
      connections: [],
      position: { x: 300, y: 150 }
    },
    {
      id: "3",
      name: 'Learning Insights', 
      category: 'Personal Growth',
      color: '#F59E0B',
      dots: [],
      connections: [],
      position: { x: 200, y: 250 }
    }
  ]);

  const DotCard: React.FC<{ dot: Dot; isPreview?: boolean; onClick?: () => void }> = ({ dot, isPreview = false, onClick }) => (
    <Card className={`mb-4 hover:shadow-md transition-shadow border border-amber-200 bg-white/95 backdrop-blur cursor-pointer ${onClick ? 'hover:bg-amber-50/50' : ''}`} onClick={onClick}>
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
        <h3 className="font-medium text-sm mb-2 leading-relaxed text-gray-800">{dot.summary}</h3>
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{dot.anchor}</p>
        <div className="mt-2 text-xs text-amber-700">
          {new Date(dot.createdAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );

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

  const DotWheelsMap: React.FC<{ wheels: Wheel[] }> = ({ wheels }) => {
    const [selectedWheel, setSelectedWheel] = useState<string | null>(null);
    const [viewFullDot, setViewFullDot] = useState<Dot | null>(null);
    
    if (wheels.length === 0) {
      // Show preview for empty state
      return (
        <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              Preview
            </span>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800">
              Total Dots: 0
            </button>
            <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800">
              Total Wheels: 0
            </button>
          </div>
          
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-amber-500" />
              <p className="text-lg font-semibold text-amber-800 mb-2">Start saving your Dots to get a similar map</p>
              <p className="text-sm text-amber-600">Your thought wheels will appear here as interactive circles</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
        {/* Top right buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800 hover:bg-amber-50 transition-colors">
            Total Dots: {wheels.reduce((sum, wheel) => sum + wheel.dots.length, 0)}
          </button>
          <button className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 border-2 border-amber-200 text-sm font-semibold text-amber-800 hover:bg-amber-50 transition-colors">
            Total Wheels: {wheels.length}
          </button>
        </div>
        
        {/* Scrollable wheel map */}
        <div className="relative overflow-auto h-[450px] w-full" style={{ cursor: 'grab' }}>
          <div className="relative w-[800px] h-[600px]">
            {wheels.map((wheel, index) => (
              <div
                key={wheel.id}
                className={`absolute group cursor-pointer transition-all duration-300 hover:scale-110 ${selectedWheel === wheel.id ? 'ring-4 ring-amber-400 ring-opacity-50 rounded-full' : ''}`}
                style={{ 
                  left: `${50 + (index % 4) * 180}px`,
                  top: `${50 + Math.floor(index / 4) * 180}px`
                }}
                onClick={() => setSelectedWheel(selectedWheel === wheel.id ? null : wheel.id)}
              >
                {/* Wheel circle */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-xl border-4 border-white group-hover:shadow-2xl">
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">{wheel.name.split(' ')[0]}</div>
                    <div className="text-xs text-amber-100">{wheel.dots.length} dots</div>
                  </div>
                </div>
                
                {/* Highlight box when selected */}
                {selectedWheel === wheel.id && (
                  <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-48 border-2 border-amber-200 z-20">
                    <h4 className="font-semibold text-amber-800 mb-2">{wheel.name}</h4>
                    <p className="text-xs text-amber-600 mb-2">{wheel.category}</p>
                    <div className="space-y-1 mb-3">
                      {wheel.dots.slice(0, 2).map(dot => (
                        <div key={dot.id} className="text-xs p-1 bg-amber-50 rounded cursor-pointer hover:bg-amber-100" onClick={(e) => {
                          e.stopPropagation();
                          setViewFullDot(dot);
                        }}>
                          <span className="font-medium">{dot.summary.substring(0, 30)}...</span>
                          <span className="text-amber-600 ml-1">({dot.pulse})</span>
                        </div>
                      ))}
                      {wheel.dots.length > 2 && (
                        <div className="text-xs text-amber-500">+{wheel.dots.length - 2} more dots</div>
                      )}
                    </div>
                    <button 
                      className="w-full text-xs bg-amber-500 text-white py-1 px-2 rounded hover:bg-amber-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (wheel.dots.length > 0) setViewFullDot(wheel.dots[0]);
                      }}
                    >
                      Open dot full view
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                 refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#F59E0B" />
                </marker>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {wheels.length > 1 && (
                <>
                  <line x1="140" y1="90" x2="230" y2="90" stroke="url(#connectionGradient)" strokeWidth="2" 
                        strokeDasharray="8,4" markerEnd="url(#arrowhead)" className="animate-pulse" />
                  <line x1="320" y1="90" x2="410" y2="90" stroke="url(#connectionGradient)" strokeWidth="2" 
                        strokeDasharray="8,4" markerEnd="url(#arrowhead)" className="animate-pulse" />
                </>
              )}
            </svg>
          </div>
        </div>
        
        {/* Full Dot View Modal */}
        {viewFullDot && (
          <DotFullView dot={viewFullDot} onClose={() => setViewFullDot(null)} />
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
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-500" />
            <Input
              type="text"
              placeholder="Enter keywords to search for a Dot"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-2 border-amber-200 bg-white/90 backdrop-blur focus:border-amber-500 focus:ring-amber-500/20 rounded-xl placeholder:text-gray-500 text-gray-800 shadow-sm"
            />
          </div>
        </div>

        {/* Search Results Window - Separate from Recent Dots */}
        {searchTerm && searchResults.length > 0 && (
          <SearchResultsList 
            searchResults={searchResults}
            onDotClick={(dot: Dot) => setViewFullDot(dot)}
            searchTerm={searchTerm}
          />
        )}

        {/* Recent Dots Section - Horizontally Scrollable */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            </div>
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Recent Dots
            </span>
          </h2>
          <div className="bg-white/80 backdrop-blur border-2 border-amber-200 rounded-xl p-4 shadow-lg">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-amber-100">
              {dots.length > 0 ? (
                dots.slice(0, 8).map((dot: Dot) => (
                  <div key={dot.id} className="flex-shrink-0 w-72">
                    <DotCard 
                      dot={dot} 
                      onClick={() => setViewFullDot(dot)}
                    />
                  </div>
                ))
              ) : (
                <>
                  <div className="flex-shrink-0 w-full text-center mb-3">
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      Preview Examples
                    </Badge>
                  </div>
                  {exampleDots.map((dot: Dot) => (
                    <div key={dot.id} className="flex-shrink-0 w-72">
                      <DotCard 
                        dot={dot} 
                        isPreview={true}
                        onClick={() => setViewFullDot(dot)}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dot Wheels Map Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            </div>
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Dot Wheels Map
            </span>
          </h2>
          <p className="text-sm text-gray-600 mb-4">Saving your dots for sparking insights</p>
          
          <DotWheelsMap wheels={wheels} />
        </div>
      </div>
      
      {/* Full Dot View Modal */}
      {viewFullDot && (
        <DotFullView dot={viewFullDot} onClose={() => setViewFullDot(null)} />
      )}
    </div>
  );
};

export default Dashboard;