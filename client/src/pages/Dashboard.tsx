import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Mic, Type, Eye, Brain, Network, Zap, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Data structure for dots
interface Dot {
  id: string;
  summary: string; // 220 chars max
  anchor: string; // 300 chars max  
  pulse: string; // 1 word emotion
  wheelId: string;
  timestamp: Date;
  sourceType: 'voice' | 'text' | 'hybrid';
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

  // Fetch real dots from API
  const { data: dots = [], isLoading } = useQuery({
    queryKey: ['/api/dots'],
    queryFn: async () => {
      const response = await fetch('/api/dots');
      if (!response.ok) throw new Error('Failed to fetch dots');
      return response.json();
    }
  });

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
          summary: 'AI-powered plant care system that learns from user behavior and environmental data',
          anchor: 'Inspired by struggling to keep houseplants alive. Combines IoT sensors with machine learning for personalized care recommendations.',
          pulse: 'excited',
          wheelId: '1',
          timestamp: new Date(),
          sourceType: 'text'
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
          summary: 'Focus on micro-SaaS products targeting specific professional niches instead of broad markets',
          anchor: 'Research shows specialized tools have higher retention rates and customer lifetime value than generic solutions.',
          pulse: 'confident',
          wheelId: '2',
          timestamp: new Date(),
          sourceType: 'voice'
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
          summary: 'Active recall through teaching others is the most effective way to solidify new knowledge',
          anchor: 'Feynman technique in practice - explaining complex concepts in simple terms reveals knowledge gaps and strengthens understanding.',
          pulse: 'enlightened',
          wheelId: '3',
          timestamp: new Date(),
          sourceType: 'hybrid'
        }
      ],
      connections: ['2'],
      position: { x: 200, y: 280 }
    }
  ]);

  const DotCard: React.FC<{ dot: Dot }> = ({ dot }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
            {dot.sourceType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : 
             dot.sourceType === 'text' ? <Type className="h-3 w-3 mr-1" /> : 
             <div className="flex gap-1"><Mic className="h-2 w-2" /><Type className="h-2 w-2" /></div>}
            {dot.sourceType}
          </Badge>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            {dot.pulse}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium text-sm mb-2 leading-relaxed text-gray-800">{dot.summary}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">{dot.anchor}</p>
        <div className="mt-2 text-xs text-amber-600">
          {dot.timestamp.toLocaleString()}
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

  const DotWheelsMap: React.FC<{ wheels: Wheel[] }> = ({ wheels }) => (
    <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-8 min-h-[500px] border-2 border-amber-200 shadow-lg">
      <div className="text-center mb-6">
        <Brain className="w-12 h-12 mx-auto mb-2 text-amber-500" />
        <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">Neural Constellation</h3>
        <p className="text-sm text-amber-600">Interactive map of your thought wheels and their connections</p>
      </div>
      
      {/* Enhanced visual wheel map */}
      <div className="relative min-h-80">
        {wheels.map((wheel, index) => (
          <div
            key={wheel.id}
            className="absolute group cursor-pointer transition-all duration-300 hover:scale-110"
            style={{ 
              left: `${15 + index * 25}%`,
              top: `${20 + (index % 3) * 30}%`
            }}
          >
            {/* Wheel circle */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-xl border-4 border-white group-hover:shadow-2xl">
              <div className="text-center">
                <div className="text-xs font-bold text-white">{wheel.name.split(' ')[0]}</div>
                <div className="text-xs text-amber-100">{wheel.dots.length} dots</div>
              </div>
            </div>
            
            {/* Hover card */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border-2 border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">{wheel.name}</h4>
              <p className="text-xs text-amber-600 mb-2">{wheel.category}</p>
              <div className="space-y-1">
                {wheel.dots.slice(0, 2).map(dot => (
                  <div key={dot.id} className="text-xs p-1 bg-amber-50 rounded">
                    <span className="font-medium">{dot.summary.substring(0, 30)}...</span>
                    <span className="text-amber-600 ml-1">({dot.pulse})</span>
                  </div>
                ))}
                {wheel.dots.length > 2 && (
                  <div className="text-xs text-amber-500">+{wheel.dots.length - 2} more dots</div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Enhanced connection lines */}
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
          <line x1="25%" y1="35%" x2="40%" y2="40%" stroke="url(#connectionGradient)" strokeWidth="3" 
                strokeDasharray="8,4" markerEnd="url(#arrowhead)" className="animate-pulse" />
          <line x1="40%" y1="55%" x2="65%" y2="45%" stroke="url(#connectionGradient)" strokeWidth="3" 
                strokeDasharray="8,4" markerEnd="url(#arrowhead)" className="animate-pulse" />
          <line x1="65%" y1="65%" x2="40%" y2="80%" stroke="url(#connectionGradient)" strokeWidth="3" 
                strokeDasharray="8,4" markerEnd="url(#arrowhead)" className="animate-pulse" />
        </svg>
        
        {/* Floating stats */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 border-2 border-amber-200">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-800">{wheels.length}</div>
            <div className="text-xs text-amber-600">Active Wheels</div>
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 border-2 border-amber-200">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-800">{wheels.reduce((sum, wheel) => sum + wheel.dots.length, 0)}</div>
            <div className="text-xs text-amber-600">Total Dots</div>
          </div>
        </div>
      </div>
    </div>
  );

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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
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
              className="pl-10 h-12 text-base border-2 border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl placeholder:text-amber-400"
            />
          </div>
        </div>

        {/* Recent Dots Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Recent Dots
            </span>
          </h2>
          <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/30 border-2 border-amber-200 rounded-xl p-4 max-h-96 overflow-y-auto shadow-lg">
            <div className="space-y-4">
              {dots.length > 0 ? (
                dots.slice(0, 4).map((dot: Dot) => (
                  <DotCard key={dot.id} dot={dot} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No dots captured yet</p>
                  <p className="text-sm text-gray-500">Use the floating dot to capture your first thought</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dot Wheels Map Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-amber-500" />
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              Dot Wheels Map
            </span>
          </h2>
          
          <DotWheelsMap wheels={wheels} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;