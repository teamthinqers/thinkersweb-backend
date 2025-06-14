import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeView, setActiveView] = useState<'mindmap' | 'wheels'>('mindmap');
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
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-xs">
            {dot.sourceType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : 
             dot.sourceType === 'text' ? <Type className="h-3 w-3 mr-1" /> : 
             <div className="flex gap-1"><Mic className="h-2 w-2" /><Type className="h-2 w-2" /></div>}
            {dot.sourceType}
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            {dot.pulse}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium text-sm mb-2 leading-relaxed">{dot.summary}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">{dot.anchor}</p>
        <div className="mt-2 text-xs text-gray-400">
          {dot.timestamp.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );

  const WheelCard: React.FC<{ wheel: Wheel }> = ({ wheel }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold" style={{ color: wheel.color }}>
            {wheel.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {wheel.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {wheel.dots.map(dot => (
            <div key={dot.id} className="p-2 bg-gray-50 rounded-md">
              <p className="text-sm font-medium mb-1">{dot.summary}</p>
              <div className="flex justify-between items-center">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                  {dot.pulse}
                </Badge>
                <span className="text-xs text-gray-500">{dot.sourceType}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Connected to: {wheel.connections.length} wheels
        </div>
      </CardContent>
    </Card>
  );

  const MindMapView: React.FC = () => (
    <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 min-h-96 border">
      <div className="text-center text-gray-600 mb-6">
        <Brain className="w-12 h-12 mx-auto mb-2 text-blue-500" />
        <h3 className="text-lg font-semibold">Neural Constellation</h3>
        <p className="text-sm">Visual representation of your connected thoughts</p>
      </div>
      
      {/* Simulated mind map visualization */}
      <div className="relative">
        {wheels.map((wheel, index) => (
          <div
            key={wheel.id}
            className="absolute w-24 h-24 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-lg"
            style={{ 
              backgroundColor: wheel.color,
              left: `${20 + index * 30}%`,
              top: `${30 + (index % 2) * 40}%`
            }}
          >
            <div className="text-center">
              <div className="text-xs font-bold">{wheel.name.split(' ')[0]}</div>
              <div className="text-xs opacity-75">{wheel.dots.length} dots</div>
            </div>
          </div>
        ))}
        
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
             refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
            </marker>
          </defs>
          <line x1="30%" y1="40%" x2="50%" y2="45%" stroke="#6B7280" strokeWidth="2" 
                strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
          <line x1="50%" y1="55%" x2="70%" y2="60%" stroke="#6B7280" strokeWidth="2" 
                strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
        </svg>
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
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My DotSpark Neura</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Enter keywords to search for a Dot"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base border-2 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
          />
        </div>
      </div>

      {/* Recent Dots Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Recent Dots
        </h2>
        <div className="bg-white border rounded-xl p-4 max-h-96 overflow-y-auto">
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

      {/* Dot Wheels Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-500" />
          Dot Wheels
        </h2>
        
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'mindmap' | 'wheels')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="mindmap" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Mind Map
            </TabsTrigger>
            <TabsTrigger value="wheels" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              Wheels View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mindmap" className="space-y-6">
            <MindMapView />
          </TabsContent>

          <TabsContent value="wheels" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wheels.map(wheel => (
                <WheelCard key={wheel.id} wheel={wheel} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;