import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Brain, Users, ArrowLeft, Zap, Target, Lightbulb } from "lucide-react";

interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  timestamp: Date;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai';
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

export default function SparkTest() {
  const [selectedDots, setSelectedDots] = useState<string[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [showCreateSpark, setShowCreateSpark] = useState(false);

  // Sample dots for testing
  const sampleDots: Dot[] = [
    {
      id: '1',
      oneWordSummary: 'Focus',
      summary: 'Deep work sessions are most productive in the morning when my mind is fresh',
      anchor: 'Consistent 6 AM start time leads to 3x more productive coding sessions',
      pulse: 'energized',
      timestamp: new Date(),
      sourceType: 'text',
      captureMode: 'natural'
    },
    {
      id: '2',
      oneWordSummary: 'Music',
      summary: 'Instrumental jazz helps maintain concentration during complex problem solving',
      anchor: 'No lyrics allows brain to focus on logical thinking without language interference',
      pulse: 'calm',
      timestamp: new Date(),
      sourceType: 'voice',
      captureMode: 'natural'
    },
    {
      id: '3',
      oneWordSummary: 'Environment',
      summary: 'Clean workspace directly correlates with clearer thinking patterns',
      anchor: 'Organized desk setup reduces cognitive load and decision fatigue',
      pulse: 'focused',
      timestamp: new Date(),
      sourceType: 'text',
      captureMode: 'ai'
    },
    {
      id: '4',
      oneWordSummary: 'Breaks',
      summary: 'Short 5-minute breaks every 25 minutes prevent mental fatigue buildup',
      anchor: 'Pomodoro technique maintains consistent energy throughout day',
      pulse: 'refreshed',
      timestamp: new Date(),
      sourceType: 'voice',
      captureMode: 'natural'
    },
    {
      id: '5',
      oneWordSummary: 'Learning',
      summary: 'Teaching concepts to others reveals gaps in my own understanding',
      anchor: 'Explaining forces deeper comprehension and memory consolidation',
      pulse: 'enlightened',
      timestamp: new Date(),
      sourceType: 'text',
      captureMode: 'natural'
    }
  ];

  const toggleDotSelection = (dotId: string) => {
    setSelectedDots(prev => 
      prev.includes(dotId) 
        ? prev.filter(id => id !== dotId)
        : [...prev, dotId]
    );
  };

  const createSpark = () => {
    if (selectedDots.length < 2) return;

    const selectedDotObjects = sampleDots.filter(dot => selectedDots.includes(dot.id));
    
    const newSpark: Spark = {
      id: `spark-${Date.now()}`,
      name: `Productivity Spark ${sparks.length + 1}`,
      description: 'AI-generated insights from connected dots',
      dots: selectedDotObjects,
      createdAt: new Date(),
      category: 'Productivity',
      insights: [
        'Your productivity peaks align with environmental optimization',
        'Morning focus combined with clean workspace creates optimal conditions',
        'Teaching others strengthens your own learning patterns'
      ]
    };

    setSparks(prev => [...prev, newSpark]);
    setSelectedDots([]);
    setShowCreateSpark(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
              <Sparkles className="h-10 w-10 text-amber-600 animate-pulse" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Sparkles className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Spark Test Lab
              </h1>
              <p className="text-amber-700">Experiment with manual dot grouping and insight generation</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-amber-600 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">How to Create Sparks:</h3>
                <ol className="list-decimal list-inside space-y-1 text-amber-700">
                  <li>Select 2 or more dots by clicking on them</li>
                  <li>Click "Create Spark" to group them together</li>
                  <li>AI will generate insights from the connected dots</li>
                  <li>View your created sparks in the bottom section</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dot Selection Area */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                Available Dots
              </span>
            </h2>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Selected: {selectedDots.length}
              </span>
              
              <Button
                onClick={createSpark}
                disabled={selectedDots.length < 2}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Spark
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleDots.map((dot) => (
              <Card
                key={dot.id}
                className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
                  selectedDots.includes(dot.id)
                    ? 'border-amber-500 bg-amber-50 shadow-lg transform scale-105'
                    : 'border-amber-200 hover:border-amber-300'
                }`}
                onClick={() => toggleDotSelection(dot.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-amber-800">
                      {dot.oneWordSummary}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Badge variant="outline" className={`text-xs ${
                        dot.captureMode === 'ai' 
                          ? 'border-purple-300 text-purple-700 bg-purple-50'
                          : 'border-amber-300 text-amber-700 bg-amber-50'
                      }`}>
                        {dot.captureMode}
                      </Badge>
                      {selectedDots.includes(dot.id) && (
                        <Badge className="bg-amber-500 text-white">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">{dot.summary}</p>
                  <div className="flex justify-between items-center">
                    <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200">
                      {dot.pulse}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {dot.sourceType}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

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
                        <p className="text-sm text-gray-600">{spark.dots.length} dots connected</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Connected Dots */}
                      <div>
                        <h4 className="font-medium text-amber-700 mb-2">Connected Dots:</h4>
                        <div className="flex flex-wrap gap-2">
                          {spark.dots.map((dot) => (
                            <Badge key={dot.id} variant="outline" className="text-xs border-amber-300 text-amber-700">
                              {dot.oneWordSummary}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div>
                        <h4 className="font-medium text-amber-700 mb-2">AI Insights:</h4>
                        <ul className="space-y-1">
                          {spark.insights.map((insight, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <Brain className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {sparks.length === 0 && (
          <Card className="border-2 border-dashed border-amber-300 bg-amber-50/30">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-700 mb-2">No Sparks Created Yet</h3>
              <p className="text-amber-600">Select dots above to create your first spark and discover insights!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}