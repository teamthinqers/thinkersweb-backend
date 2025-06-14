import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Mic, Type, Eye, Brain, Network, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
  const [captureMode, setCaptureMode] = useState<'select' | 'text' | 'voice'>('select');
  const [newDot, setNewDot] = useState({
    summary: '',
    anchor: '',
    pulse: '',
    sourceType: 'text' as 'voice' | 'text' | 'hybrid'
  });
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [currentVoiceStep, setCurrentVoiceStep] = useState<1 | 2 | 3>(1);
  const [voiceSteps, setVoiceSteps] = useState({
    summary: '',
    anchor: '',
    pulse: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real dots from API
  const { data: dots = [], isLoading } = useQuery({
    queryKey: ['/api/dots'],
    queryFn: async () => {
      const response = await fetch('/api/dots');
      if (!response.ok) throw new Error('Failed to fetch dots');
      return response.json();
    }
  });

  // Create dot mutation
  const createDotMutation = useMutation({
    mutationFn: async (dotData: any) => {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dotData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dot');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dots'] });
      toast({ title: "Dot created successfully!" });
      setNewDot({ summary: '', anchor: '', pulse: '', sourceType: 'text' });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to create dot", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Mock wheels data for visualization
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
      toast({
        title: "Please distill your thoughts. Sharply defined thoughts can spark better (max 220 charac)",
        variant: "destructive"
      });
      return;
    }
    if (newDot.anchor.length > 300) {
      toast({
        title: "Anchor text must be 300 characters or less",
        variant: "destructive"
      });
      return;
    }
    if (!newDot.pulse.trim() || newDot.pulse.split(' ').length > 1) {
      toast({
        title: "Pulse must be exactly one word describing the emotion",
        variant: "destructive"
      });
      return;
    }

    // Submit to backend
    createDotMutation.mutate(newDot);
  };

  const handleVoiceStep = (step: 1 | 2 | 3) => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      
      // Simulate voice processing and populate the appropriate step
      setTimeout(() => {
        const mockTranscript = step === 1 ? "Simulated summary from voice input" :
                             step === 2 ? "Simulated anchor context from voice input" :
                             "excited";
        
        setVoiceSteps(prev => ({
          ...prev,
          [step === 1 ? 'summary' : step === 2 ? 'anchor' : 'pulse']: mockTranscript
        }));
        
        if (step < 3) {
          setCurrentVoiceStep((step + 1) as 1 | 2 | 3);
        }
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
      setCurrentVoiceStep(step);
    }
  };

  const handleVoiceSubmit = () => {
    // Use voice transcriptions to create dot
    const voiceDot = {
      summary: voiceSteps.summary.substring(0, 220),
      anchor: voiceSteps.anchor.substring(0, 300), 
      pulse: voiceSteps.pulse.split(' ')[0],
      sourceType: 'voice' as const
    };
    
    createDotMutation.mutate(voiceDot);
  };

  const resetCapture = () => {
    setCaptureMode('select');
    setNewDot({
      summary: '',
      anchor: '',
      pulse: '',
      sourceType: 'text'
    });
    setVoiceSteps({
      summary: '',
      anchor: '',
      pulse: ''
    });
    setCurrentVoiceStep(1);
    setIsRecording(false);
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
                <p className="text-sm text-gray-600">Choose your capture method</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {captureMode === 'select' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setCaptureMode('text')}
                      className="h-24 flex flex-col items-center justify-center space-y-2"
                      variant="outline"
                    >
                      <Type className="h-8 w-8" />
                      <span className="font-medium">Text Input</span>
                      <span className="text-xs text-gray-500">Manual three-layer entry</span>
                    </Button>
                    <Button
                      onClick={() => setCaptureMode('voice')}
                      className="h-24 flex flex-col items-center justify-center space-y-2"
                      variant="outline"
                    >
                      <Mic className="h-8 w-8" />
                      <span className="font-medium">Voice Input</span>
                      <span className="text-xs text-gray-500">Guided voice prompts</span>
                    </Button>
                  </div>
                )}

                {captureMode === 'text' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Text Input - Three Layer Structure</h4>
                      <Button variant="ghost" size="sm" onClick={resetCapture}>
                        ← Back
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <label className="block text-sm font-medium mb-2 text-amber-700">
                          Layer 1: Summary (220 chars max)
                        </label>
                        <p className="text-xs text-gray-600 mb-2">Sharp, distilled core of your thought</p>
                        <Textarea
                          value={newDot.summary}
                          onChange={(e) => setNewDot({...newDot, summary: e.target.value})}
                          placeholder="What's the essential insight?"
                          maxLength={220}
                          className="min-h-[80px] border-amber-300 focus:border-amber-500"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {newDot.summary.length}/220 characters
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <label className="block text-sm font-medium mb-2 text-blue-700">
                          Layer 2: Anchor (300 chars max)
                        </label>
                        <p className="text-xs text-gray-600 mb-2">Context to help you recall this later</p>
                        <Textarea
                          value={newDot.anchor}
                          onChange={(e) => setNewDot({...newDot, anchor: e.target.value})}
                          placeholder="What context will help you remember this insight?"
                          maxLength={300}
                          className="min-h-[100px] border-blue-300 focus:border-blue-500"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {newDot.anchor.length}/300 characters
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <label className="block text-sm font-medium mb-2 text-green-700">
                          Layer 3: Pulse (One word)
                        </label>
                        <p className="text-xs text-gray-600 mb-2">Single emotion word</p>
                        <Input
                          value={newDot.pulse}
                          onChange={(e) => setNewDot({...newDot, pulse: e.target.value})}
                          placeholder="excited, curious, focused..."
                          className="border-green-300 focus:border-green-500"
                        />
                      </div>

                      <Button 
                        onClick={handleDotSubmit}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        disabled={createDotMutation.isPending || !newDot.summary || !newDot.anchor || !newDot.pulse}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        {createDotMutation.isPending ? 'Capturing...' : 'Create Dot'}
                      </Button>
                    </div>
                  </div>
                )}

                {captureMode === 'voice' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Voice Input - Guided Prompts</h4>
                      <Button variant="ghost" size="sm" onClick={resetCapture}>
                        ← Back
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-amber-700">Step 1: Summary (20-30 seconds)</h5>
                          {voiceSteps.summary && <span className="text-xs text-green-600">✓ Completed</span>}
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          "Start with your core insight. What's the main thought?"
                        </p>
                        <Button
                          variant={isRecording && currentVoiceStep === 1 ? 'destructive' : 'default'}
                          onClick={() => handleVoiceStep(1)}
                          className="w-full"
                          disabled={createDotMutation.isPending}
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          {isRecording && currentVoiceStep === 1 ? 'Recording Summary...' : 'Record Summary'}
                        </Button>
                        {voiceSteps.summary && (
                          <div className="mt-2 p-2 bg-white rounded text-sm">
                            {voiceSteps.summary} ({voiceSteps.summary.length}/220 chars)
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-blue-700">Step 2: Anchor (30-40 seconds)</h5>
                          {voiceSteps.anchor && <span className="text-xs text-green-600">✓ Completed</span>}
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          "Now provide context. What will help you remember this?"
                        </p>
                        <Button
                          variant={isRecording && currentVoiceStep === 2 ? 'destructive' : 'default'}
                          onClick={() => handleVoiceStep(2)}
                          className="w-full"
                          disabled={createDotMutation.isPending || !voiceSteps.summary}
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          {isRecording && currentVoiceStep === 2 ? 'Recording Anchor...' : 'Record Anchor'}
                        </Button>
                        {voiceSteps.anchor && (
                          <div className="mt-2 p-2 bg-white rounded text-sm">
                            {voiceSteps.anchor} ({voiceSteps.anchor.length}/300 chars)
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-green-700">Step 3: Pulse (5 seconds)</h5>
                          {voiceSteps.pulse && <span className="text-xs text-green-600">✓ Completed</span>}
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          "Finally, say one emotion word that captures how you feel about this."
                        </p>
                        <Button
                          variant={isRecording && currentVoiceStep === 3 ? 'destructive' : 'default'}
                          onClick={() => handleVoiceStep(3)}
                          className="w-full"
                          disabled={createDotMutation.isPending || !voiceSteps.anchor}
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          {isRecording && currentVoiceStep === 3 ? 'Recording Pulse...' : 'Record Pulse'}
                        </Button>
                        {voiceSteps.pulse && (
                          <div className="mt-2 p-2 bg-white rounded text-sm">
                            Pulse: "{voiceSteps.pulse}"
                          </div>
                        )}
                      </div>

                      {voiceSteps.summary && voiceSteps.anchor && voiceSteps.pulse && (
                        <Button 
                          onClick={handleVoiceSubmit}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-4"
                          disabled={createDotMutation.isPending}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {createDotMutation.isPending ? 'Capturing...' : 'Create Voice Dot'}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Dots</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading dots...</div>
                ) : dots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No dots captured yet.</p>
                    <p className="text-sm mt-1">Create your first dot to start building your neural map!</p>
                  </div>
                ) : (
                  dots.map((dot: any) => (
                    <DotCard key={dot.id} dot={dot} />
                  ))
                )}
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