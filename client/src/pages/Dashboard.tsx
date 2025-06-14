import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Mic, Type, Eye, Brain, Network, Zap } from "lucide-react";

// Mock data structure for demonstration
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
  const [activeView, setActiveView] = useState<'capture' | 'mindmap' | 'wheels'>('capture');
  const [newDot, setNewDot] = useState({
    summary: '',
    anchor: '',
    pulse: '',
    sourceType: 'text' as 'voice' | 'text' | 'hybrid'
  });

  // Mock data - will be replaced with real API calls
  const [wheels] = useState<Wheel[]>([
    {
      id: '1',
      name: 'Creative Ideas',
      category: 'Innovation',
      color: '#8B5CF6',
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

  const handleDotSubmit = () => {
    // Validate character limits
    if (newDot.summary.length > 220) {
      alert("Please distill your thoughts. Sharply defined thoughts can spark better (max 220 charac)");
      return;
    }
    if (newDot.anchor.length > 300) {
      alert("Anchor text must be 300 characters or less");
      return;
    }
    if (!newDot.pulse.trim() || newDot.pulse.split(' ').length > 1) {
      alert("Pulse must be exactly one word describing the emotion");
      return;
    }

    // Here we would save to backend
    console.log('Saving new dot:', newDot);
    
    // Reset form
    setNewDot({
      summary: '',
      anchor: '',
      pulse: '',
      sourceType: 'text'
    });
  };

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

  const WheelVisualization: React.FC<{ wheel: Wheel }> = ({ wheel }) => (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      style={{ left: wheel.position.x, top: wheel.position.y }}
    >
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xs text-center shadow-lg hover:scale-110 transition-transform"
        style={{ backgroundColor: wheel.color }}
      >
        <div>
          <div className="text-xs">{wheel.name}</div>
          <div className="text-xs opacity-80">{wheel.dots.length} dots</div>
        </div>
      </div>
    </div>
  );

  const MindMapView = () => (
    <div className="relative w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {wheels.flatMap(wheel => 
          wheel.connections.map(connectionId => {
            const connectedWheel = wheels.find(w => w.id === connectionId);
            if (!connectedWheel) return null;
            
            return (
              <line
                key={`${wheel.id}-${connectionId}`}
                x1={wheel.position.x}
                y1={wheel.position.y}
                x2={connectedWheel.position.x}
                y2={connectedWheel.position.y}
                stroke="#E5E7EB"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          })
        )}
      </svg>
      
      {wheels.map(wheel => (
        <WheelVisualization key={wheel.id} wheel={wheel} />
      ))}
      
      <div className="absolute bottom-4 left-4 text-sm text-gray-600">
        Neural Mind Map - {wheels.length} Wheels, {wheels.reduce((sum, w) => sum + w.dots.length, 0)} Dots
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Neural Dashboard</h1>
        <p className="text-gray-600">Capture thoughts, form wheels, spark connections</p>
      </div>

      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Capture Dots
          </TabsTrigger>
          <TabsTrigger value="wheels" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Wheels
          </TabsTrigger>
          <TabsTrigger value="mindmap" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Mind Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Create New Dot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dot Summary (220 chars max)
                  </label>
                  <Textarea
                    value={newDot.summary}
                    onChange={(e) => setNewDot({...newDot, summary: e.target.value})}
                    placeholder="Distill your thought into a sharp, sparkable summary..."
                    maxLength={220}
                    className="min-h-[80px]"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {newDot.summary.length}/220 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Anchor Text (300 chars max)
                  </label>
                  <Textarea
                    value={newDot.anchor}
                    onChange={(e) => setNewDot({...newDot, anchor: e.target.value})}
                    placeholder="Add context to help you remember this thought later..."
                    maxLength={300}
                    className="min-h-[100px]"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {newDot.anchor.length}/300 characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pulse (One emotion word)
                  </label>
                  <Input
                    value={newDot.pulse}
                    onChange={(e) => setNewDot({...newDot, pulse: e.target.value})}
                    placeholder="excited, curious, concerned..."
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant={newDot.sourceType === 'voice' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDot({...newDot, sourceType: 'voice'})}
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    Voice
                  </Button>
                  <Button 
                    variant={newDot.sourceType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDot({...newDot, sourceType: 'text'})}
                  >
                    <Type className="h-4 w-4 mr-1" />
                    Text
                  </Button>
                  <Button 
                    variant={newDot.sourceType === 'hybrid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDot({...newDot, sourceType: 'hybrid'})}
                  >
                    <Network className="h-4 w-4 mr-1" />
                    Hybrid
                  </Button>
                </div>

                <Button 
                  onClick={handleDotSubmit}
                  className="w-full"
                  disabled={!newDot.summary || !newDot.anchor || !newDot.pulse}
                >
                  Create Dot
                </Button>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Dots</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {wheels.flatMap(wheel => wheel.dots).map(dot => (
                  <DotCard key={dot.id} dot={dot} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="wheels" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wheels.map(wheel => (
              <Card key={wheel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: wheel.color }}
                      />
                      {wheel.name}
                    </CardTitle>
                    <Badge variant="secondary">{wheel.dots.length}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{wheel.category}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {wheel.dots.slice(0, 2).map(dot => (
                      <div key={dot.id} className="border-l-4 pl-3" style={{ borderColor: wheel.color }}>
                        <p className="text-sm font-medium">{dot.summary}</p>
                        <Badge className="mt-1 bg-gray-100 text-gray-700 text-xs">
                          {dot.pulse}
                        </Badge>
                      </div>
                    ))}
                    {wheel.dots.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{wheel.dots.length - 2} more dots
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mindmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Neural Mind Map
              </CardTitle>
              <p className="text-sm text-gray-600">
                Visual representation of your thought connections and patterns
              </p>
            </CardHeader>
            <CardContent>
              <MindMapView />
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{wheels.length}</div>
                  <div className="text-sm text-gray-600">Wheels</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {wheels.reduce((sum, w) => sum + w.dots.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Dots</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {wheels.reduce((sum, w) => sum + w.connections.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Connections</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;