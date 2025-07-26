import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Settings, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function TestCreation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Dot creation state
  const [dotData, setDotData] = useState({
    summary: '',
    anchor: '',
    pulse: ''
  });
  
  // Wheel creation state
  const [wheelData, setWheelData] = useState({
    heading: '',
    goals: '',
    timeline: '',
    chakraId: ''
  });
  
  // Chakra creation state
  const [chakraData, setChakraData] = useState({
    heading: '',
    purpose: '',
    timeline: ''
  });

  const createDot = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!dotData.summary || !dotData.anchor || !dotData.pulse) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all three layers (summary, anchor, pulse)",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest('/api/dots', {
        method: 'POST',
        body: JSON.stringify({
          summary: dotData.summary,
          anchor: dotData.anchor,
          pulse: dotData.pulse,
          sourceType: 'text'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({
          title: "Dot Created!",
          description: "Your dot has been saved successfully",
        });
        setDotData({ summary: '', anchor: '', pulse: '' });
      } else {
        throw new Error('Failed to create dot');
      }
    } catch (error) {
      console.error('Error creating dot:', error);
      toast({
        title: "Error",
        description: "Failed to create dot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWheel = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!wheelData.heading || !wheelData.goals || !wheelData.timeline) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all wheel fields (heading, goals, timeline)",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest('/api/wheels', {
        method: 'POST',
        body: JSON.stringify({
          heading: wheelData.heading,
          goals: wheelData.goals,
          timeline: wheelData.timeline,
          chakraId: wheelData.chakraId || null,
          sourceType: 'text'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({
          title: "Wheel Created!",
          description: "Your wheel has been saved successfully",
        });
        setWheelData({ heading: '', goals: '', timeline: '', chakraId: '' });
      } else {
        throw new Error('Failed to create wheel');
      }
    } catch (error) {
      console.error('Error creating wheel:', error);
      toast({
        title: "Error",
        description: "Failed to create wheel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createChakra = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!chakraData.heading || !chakraData.purpose || !chakraData.timeline) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all chakra fields (heading, purpose, timeline)",
          variant: "destructive",
        });
        return;
      }
      
      const response = await apiRequest('/api/chakras', {
        method: 'POST',
        body: JSON.stringify({
          heading: chakraData.heading,
          purpose: chakraData.purpose,
          timeline: chakraData.timeline,
          sourceType: 'text'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast({
          title: "Chakra Created!",
          description: "Your chakra has been saved successfully",
        });
        setChakraData({ heading: '', purpose: '', timeline: '' });
      } else {
        throw new Error('Failed to create chakra');
      }
    } catch (error) {
      console.error('Error creating chakra:', error);
      toast({
        title: "Error",
        description: "Failed to create chakra. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-6 border-b border-amber-200/30 dark:border-amber-700/30 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-3 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-amber-800 dark:text-amber-200">Manual Creation Test</h1>
        </div>
        <Badge variant="outline" className="text-amber-700 border-amber-300">
          UI/UX Testing
        </Badge>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Create Dot */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Brain className="h-5 w-5" />
                Create Dot
              </CardTitle>
              <CardDescription>
                Create a three-layer dot manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Layer 1: Summary (max 220 chars)
                </label>
                <Textarea
                  placeholder="Brief insight or realization..."
                  value={dotData.summary}
                  onChange={(e) => setDotData(prev => ({ ...prev, summary: e.target.value }))}
                  maxLength={220}
                  className="min-h-[80px]"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {dotData.summary.length}/220 characters
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Layer 2: Anchor (max 300 chars)
                </label>
                <Textarea
                  placeholder="Memory anchor or context..."
                  value={dotData.anchor}
                  onChange={(e) => setDotData(prev => ({ ...prev, anchor: e.target.value }))}
                  maxLength={300}
                  className="min-h-[80px]"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {dotData.anchor.length}/300 characters
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Layer 3: Pulse (emotion word)
                </label>
                <Input
                  placeholder="excited, focused, curious..."
                  value={dotData.pulse}
                  onChange={(e) => setDotData(prev => ({ ...prev, pulse: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={createDot}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                {loading ? 'Creating...' : 'Create Dot'}
              </Button>
            </CardContent>
          </Card>

          {/* Create Wheel */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 w-5 h-5 border-2 border-orange-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-1 w-3 h-3 border-2 border-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                </div>
                Create Wheel
              </CardTitle>
              <CardDescription>
                Create a goal-oriented wheel manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Heading
                </label>
                <Input
                  placeholder="Wheel title..."
                  value={wheelData.heading}
                  onChange={(e) => setWheelData(prev => ({ ...prev, heading: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Goals
                </label>
                <Textarea
                  placeholder="What do you want to achieve..."
                  value={wheelData.goals}
                  onChange={(e) => setWheelData(prev => ({ ...prev, goals: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Timeline
                </label>
                <Input
                  placeholder="6 months, 2 years, etc..."
                  value={wheelData.timeline}
                  onChange={(e) => setWheelData(prev => ({ ...prev, timeline: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Chakra ID (optional)
                </label>
                <Input
                  placeholder="Leave empty for independent wheel"
                  value={wheelData.chakraId}
                  onChange={(e) => setWheelData(prev => ({ ...prev, chakraId: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={createWheel}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {loading ? 'Creating...' : 'Create Wheel'}
              </Button>
            </CardContent>
          </Card>

          {/* Create Chakra */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Settings className="h-5 w-5" />
                Create Chakra
              </CardTitle>
              <CardDescription>
                Create a life-level purpose chakra manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Heading
                </label>
                <Input
                  placeholder="Chakra title..."
                  value={chakraData.heading}
                  onChange={(e) => setChakraData(prev => ({ ...prev, heading: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Purpose
                </label>
                <Textarea
                  placeholder="Life-level purpose or vision..."
                  value={chakraData.purpose}
                  onChange={(e) => setChakraData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Timeline
                </label>
                <Input
                  placeholder="5-20 years, lifelong, etc..."
                  value={chakraData.timeline}
                  onChange={(e) => setChakraData(prev => ({ ...prev, timeline: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={createChakra}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800"
              >
                {loading ? 'Creating...' : 'Create Chakra'}
              </Button>
            </CardContent>
          </Card>
          
        </div>

        {/* Instructions */}
        <Card className="mt-8 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Zap className="h-5 w-5" />
              Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>Dots:</strong> Individual insights with 3 layers (summary, anchor, pulse emotion)</p>
              <p><strong>Wheels:</strong> Goal-oriented collections of dots with timelines (can belong to chakras)</p>
              <p><strong>Chakras:</strong> Life-level purposes that can contain multiple wheels</p>
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                After creating items, check the Dashboard/Grid to see them in the visual map.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}