import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Plus, Brain, Users, ArrowLeft, Zap, Target, Lightbulb, Filter, Mic, Type, Wand2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  timestamp: Date;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai';
  category: string;
  position?: { x: number; y: number };
}

interface Spark {
  id: string;
  name: string;
  description: string;
  dots: Dot[];
  createdAt: Date;
  category: string;
  insights: string[];
}

export default function Spark() {
  const [droppedDots, setDroppedDots] = useState<string[]>([]);
  const [intentText, setIntentText] = useState("");
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [filters, setFilters] = useState({
    sourceType: 'all',
    captureMode: 'all',
    category: 'all',
    emotion: 'all'
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedDot, setDraggedDot] = useState<string | null>(null);

  // Fetch user's dots from the API
  const { data: userDots = [], isLoading } = useQuery({
    queryKey: ['/api/dots'],
    select: (data: any[]) => {
      // Transform API dots to Spark interface format
      return data.map((dot: any, index: number) => {
        const content = typeof dot.content === 'string' ? JSON.parse(dot.content) : dot.content;
        
        // Generate random position for each dot
        const angle = (index * 137.5) * (Math.PI / 180); // Golden angle for good distribution
        const radius = 180 + (index % 3) * 60; // Varying distances from center
        const centerX = 400; // Canvas center
        const centerY = 250;
        
        return {
          id: dot.id.toString(),
          oneWordSummary: content.oneWordSummary || content.summary?.substring(0, 15) || 'Dot',
          summary: content.summary || dot.title || '',
          anchor: content.anchor || '',
          pulse: content.pulse || 'neutral',
          timestamp: new Date(dot.createdAt),
          sourceType: content.sourceType || 'text',
          captureMode: content.captureMode || 'natural',
          category: content.category || 'General',
          position: {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          }
        };
      });
    }
  });

  // Filter dots based on current filter settings
  const filteredDots = userDots.filter((dot: Dot) => {
    if (filters.sourceType !== 'all' && dot.sourceType !== filters.sourceType) return false;
    if (filters.captureMode !== 'all' && dot.captureMode !== filters.captureMode) return false;
    if (filters.category !== 'all' && dot.category !== filters.category) return false;
    if (filters.emotion !== 'all' && dot.pulse !== filters.emotion) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, dotId: string) => {
    setDraggedDot(dotId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedDot && !droppedDots.includes(draggedDot)) {
      setDroppedDots(prev => [...prev, draggedDot]);
    }
    setDraggedDot(null);
  };

  const removeDotFromIntent = (dotId: string) => {
    setDroppedDots(prev => prev.filter(id => id !== dotId));
  };

  const generateSpark = () => {
    if (droppedDots.length < 2 || !intentText.trim()) return;

    const selectedDotObjects = userDots.filter((dot: Dot) => droppedDots.includes(dot.id));
    
    const newSpark: Spark = {
      id: `spark-${Date.now()}`,
      name: intentText.split(' ').slice(0, 3).join(' '),
      description: `Spark generated from "${intentText}"`,
      dots: selectedDotObjects,
      createdAt: new Date(),
      category: 'Custom',
      insights: [
        `Your intent "${intentText}" connects strongly with these patterns`,
        `The combination reveals synergies between ${selectedDotObjects.map(d => d.category).join(', ')} domains`,
        `This grouping suggests new optimization opportunities`
      ]
    };

    setSparks(prev => [...prev, newSpark]);
    setDroppedDots([]);
    setIntentText('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-amber-700">Loading your dots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-amber-200 hover:bg-amber-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Sparkles className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Spark Intent Canvas
              </h1>
              <p className="text-amber-700 text-sm">Drag your dots to the intent box to discover connections</p>
            </div>
          </div>
        </div>

        {/* Show message if no dots available */}
        {userDots.length === 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6 text-center">
              <Lightbulb className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-800 mb-2">No Dots Available</h3>
              <p className="text-amber-700 mb-4">
                You need to save some dots first before you can create sparks. 
                Start by capturing your thoughts and insights.
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {userDots.length > 0 && (
          <>
            {/* Filters */}
            <Card className="mb-6 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Filters:</span>
                  </div>
                  
                  <Select value={filters.sourceType} onValueChange={(value) => setFilters(prev => ({...prev, sourceType: value}))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="voice">Voice</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.captureMode} onValueChange={(value) => setFilters(prev => ({...prev, captureMode: value}))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-sm text-amber-600">
                    {filteredDots.length} of {userDots.length} dots visible
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Canvas Area */}
            <div className="relative h-[500px] mb-8" ref={canvasRef}>
              {/* Central Intent Box */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Card 
                  className="w-96 border-4 border-dashed border-amber-400 bg-gradient-to-br from-amber-50 to-orange-100 shadow-2xl z-10"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-amber-800">
                      <Target className="h-6 w-6" />
                      Intent Box
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={intentText}
                      onChange={(e) => setIntentText(e.target.value)}
                      placeholder="Enter your objective or goal here..."
                      className="min-h-20 border-amber-300 focus:border-amber-500"
                    />
                    
                    {/* Dropped Dots */}
                    {droppedDots.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-amber-700">Connected Dots:</h4>
                        <div className="flex flex-wrap gap-2">
                          {droppedDots.map(dotId => {
                            const dot = userDots.find((d: any) => d.id === dotId);
                            return dot ? (
                              <Badge 
                                key={dotId} 
                                className="bg-amber-200 text-amber-800 cursor-pointer hover:bg-amber-300"
                                onClick={() => removeDotFromIntent(dotId)}
                              >
                                {dot.oneWordSummary} ✕
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={generateSpark}
                      disabled={droppedDots.length < 2 || !intentText.trim()}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Spark
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Floating Dots Around Intent Box */}
              <div className="absolute inset-0 pointer-events-none">
                {filteredDots.map((dot: Dot) => (
                  <div
                    key={dot.id}
                    className="absolute pointer-events-auto"
                    style={{
                      left: `${dot.position?.x}px`,
                      top: `${dot.position?.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <Card
                      draggable
                      onDragStart={(e) => handleDragStart(e, dot.id)}
                      className={`w-32 cursor-move transition-all duration-200 border-2 hover:shadow-lg hover:scale-105 ${
                        droppedDots.includes(dot.id)
                          ? 'opacity-50 border-gray-300'
                          : draggedDot === dot.id
                          ? 'border-amber-500 shadow-lg transform scale-110'
                          : 'border-amber-200 hover:border-amber-300'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            {dot.sourceType === 'voice' ? (
                              <Mic className="h-4 w-4 text-amber-600" />
                            ) : (
                              <Type className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-amber-800 mb-1">
                            {dot.oneWordSummary}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              dot.captureMode === 'ai' 
                                ? 'border-purple-300 text-purple-700 bg-purple-50'
                                : 'border-amber-300 text-amber-700 bg-amber-50'
                            }`}
                          >
                            {dot.captureMode}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Created Sparks */}
        {sparks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-600" />
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                Your Sparks
              </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sparks.map((spark) => (
                <Card key={spark.id} className="border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50/30">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-amber-800">{spark.name}</CardTitle>
                        <p className="text-sm text-amber-600">{spark.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Connected Dots */}
                    <div>
                      <h4 className="text-sm font-medium text-amber-700 mb-2">Connected Dots:</h4>
                      <div className="flex flex-wrap gap-2">
                        {spark.dots.map(dot => (
                          <Badge key={dot.id} variant="outline" className="text-xs">
                            {dot.oneWordSummary}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Insights */}
                    <div>
                      <h4 className="text-sm font-medium text-amber-700 mb-2">Insights:</h4>
                      <ul className="space-y-1">
                        {spark.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-amber-600 flex items-start gap-2">
                            <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}