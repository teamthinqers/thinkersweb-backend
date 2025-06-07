import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useNeuralTuning } from '@/hooks/useNeuralTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Save, Shield } from 'lucide-react';

export default function CognitiveShieldConfig() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Neural Tuning hook
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateTuning,
    isUpdating
  } = useNeuralTuning();
  
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Local state for unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    creativity?: number;
    precision?: number;
    speed?: number;
    analytical?: number;
    intuitive?: number;
    contextualThinking?: number;
    memoryBandwidth?: number;
    thoughtComplexity?: number;
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      creativity: 0.7,
      precision: 0.8,
      speed: 0.5,
      analytical: 0.8,
      intuitive: 0.6,
      contextualThinking: 0.6,
      memoryBandwidth: 0.7,
      thoughtComplexity: 0.5,
    }
  };
  
  // Function to handle slider value changes
  const handleParameterChange = (paramName: string, value: number) => {
    // Update the pending changes object with the new parameter value
    setPendingChanges(prev => ({
      ...prev,
      [paramName]: value
    }));
    
    // Mark that we have unsaved changes
    setUnsavedChanges(true);
  };
  
  // Save pending changes to Neural tuning
  const saveChanges = async () => {
    if (!unsavedChanges) {
      toast({
        title: "No changes to save",
        description: "Make some adjustments first.",
        variant: "default",
      });
      return;
    }

    try {
      updateTuning(pendingChanges);
      
      toast({
        title: "Shield Updated",
        description: "Your cognitive shield settings have been saved successfully.",
        variant: "default",
      });
      
      // Clear pending changes and unsaved state
      setPendingChanges({});
      setUnsavedChanges(false);
      
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (isTuningLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation('/my-neura')} className="p-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Cognitive Shield</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-t-amber-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading cognitive parameters...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/my-neura')} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Cognitive Shield</h1>
        </div>
        {unsavedChanges && (
          <Button 
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
            onClick={saveChanges}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                Save Shield Settings
              </span>
            )}
          </Button>
        )}
      </div>
      
      {/* Main Content Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Cognitive Shield Configuration</CardTitle>
              <CardDescription>
                Configure these parameters to shield you from biases while using AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-8">
          {/* Core Tuning Section */}
          <div className="space-y-6">
            <div className="border-b border-amber-200 dark:border-amber-800 pb-2">
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Core Tuning</h3>
            </div>
            
            {/* Creativity Parameter */}
            <div className="parameter-creativity space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="creativity" className="text-sm font-medium">
                  Creativity Level
                </Label>
                <span className="parameter-value">
                  {Math.round((pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100)}%
                </span>
              </div>
              <Slider
                id="creativity"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('creativity', value[0])}
                className="slider-track-glow"
              />
              <p className="text-xs text-muted-foreground">
                Balance between structured thinking (left) and creative exploration (right)
              </p>
            </div>

            {/* Precision Parameter */}
            <div className="parameter-precision space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="precision" className="text-sm font-medium">
                  Precision Focus
                </Label>
                <span className="parameter-value">
                  {Math.round((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100)}%
                </span>
              </div>
              <Slider
                id="precision"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.precision ?? neuralTuning?.precision ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('precision', value[0])}
                className="slider-track-glow"
              />
              <p className="text-xs text-muted-foreground">
                Emphasis on broad concepts (left) vs detailed accuracy (right)
              </p>
            </div>

            {/* Processing Speed Parameter */}
            <div className="parameter-speed space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="speed" className="text-sm font-medium">
                  Processing Speed
                </Label>
                <span className="parameter-value">
                  {Math.round((pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100)}%
                </span>
              </div>
              <Slider
                id="speed"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.speed ?? neuralTuning?.speed ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('speed', value[0])}
                className="slider-track-glow"
              />
              <p className="text-xs text-muted-foreground">
                Deep reflection (left) vs quick response time (right)
              </p>
            </div>
          </div>

          {/* Cognitive Style Section */}
          <div className="space-y-6">
            <div className="border-b border-amber-200 dark:border-amber-800 pb-2">
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Cognitive Style</h3>
            </div>
            
            {/* Analytical Parameter */}
            <div className="parameter-analytical space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytical" className="text-sm font-medium">
                  Analytical Thinking
                </Label>
                <span className="parameter-value">
                  {Math.round((pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100)}%
                </span>
              </div>
              <Slider
                id="analytical"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('analytical', value[0])}
                className="slider-track-glow"
              />
              <p className="text-xs text-muted-foreground">
                Emphasis on logical/systematic thinking and structured analysis
              </p>
            </div>

            {/* Intuitive Parameter */}
            <div className="parameter-intuitive space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="intuitive" className="text-sm font-medium">
                  Intuitive Processing
                </Label>
                <span className="parameter-value">
                  {Math.round((pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100)}%
                </span>
              </div>
              <Slider
                id="intuitive"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('intuitive', value[0])}
                className="slider-track-glow"
              />
              <p className="text-xs text-muted-foreground">
                Pattern recognition and insight-based thinking emphasis
              </p>
            </div>

            {/* Contextual Thinking Parameter */}
            <div className="parameter-contextual space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="contextualThinking" className="text-sm font-medium">
                  Contextual Thinking
                </Label>
                <span className="parameter-value">
                  {Math.round((pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5) * 100)}%
                </span>
              </div>
              <Slider
                id="contextualThinking"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('contextualThinking', value[0])}
                className="slider-track-glow"
              />
              <p className="text-xs text-muted-foreground">
                Contextual considerations (left) vs universal principles (right)
              </p>
            </div>

            {/* Memory Bandwidth Parameter */}
            <div className="parameter-memory space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="memoryBandwidth" className="text-sm font-medium">
                  Memory Bandwidth
                </Label>
                <span className="parameter-value">
                  {Math.round((pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100)}%
                </span>
              </div>
              <Slider
                id="memoryBandwidth"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('memoryBandwidth', value[0])}
                className="slider-track-glow"
              />
              <p className="text-xs text-muted-foreground">
                Short burst memory (left) vs deep retainer memory (right)
              </p>
            </div>

            {/* Thought Complexity Parameter */}
            <div className="parameter-complexity space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="thoughtComplexity" className="text-sm font-medium">
                  Thought Complexity
                </Label>
                <span className="parameter-value">
                  {Math.round((pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100)}%
                </span>
              </div>
              <Slider
                id="thoughtComplexity"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('thoughtComplexity', value[0])}
                className="slider-track-glow"
              />
              <p className="text-xs text-muted-foreground">
                Simple direct thinking (left) vs complex layered thinking (right)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-amber-200 dark:border-amber-800">
            <Button 
              variant="outline"
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
              onClick={() => setLocation('/my-neura')}
            >
              Back to Overview
            </Button>
            <Button 
              disabled={isUpdating || !unsavedChanges}
              variant="default" 
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              onClick={saveChanges}
            >
              <Save className="mr-1 h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save Shield Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}