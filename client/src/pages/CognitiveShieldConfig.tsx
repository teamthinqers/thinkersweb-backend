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
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="creativity" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"></div>
                  Creativity Level
                </Label>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {Math.round((pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual creativity meter with sparks */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100}%` }}
                  >
                    {/* Animated sparks */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                {/* Floating sparks around the meter */}
                <div className="absolute -top-1 left-1/4 w-0.5 h-0.5 bg-amber-400 rounded-full opacity-70 animate-ping"></div>
                <div className="absolute -bottom-1 right-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-50 animate-pulse"></div>
              </div>
              
              <Slider
                id="creativity"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('creativity', value[0])}
                className="creativity-slider"
              />
              <p className="text-xs text-muted-foreground">
                Balance between structured thinking (left) and creative exploration (right)
              </p>
            </div>

            {/* Precision Parameter */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="precision" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-400"></div>
                  Precision Focus
                </Label>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                  {Math.round((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual precision meter with focused beam effect */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100}%` }}
                  >
                    {/* Focused beam effect */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-red-300 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  </div>
                </div>
                {/* Precision indicators */}
                <div className="absolute -top-1 right-1/4 w-0.5 h-0.5 bg-orange-400 rounded-full opacity-80 animate-ping"></div>
                <div className="absolute -bottom-1 left-2/3 w-1 h-1 bg-red-400 rounded-full opacity-60 animate-pulse"></div>
              </div>
              
              <Slider
                id="precision"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.precision ?? neuralTuning?.precision ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('precision', value[0])}
                className="precision-slider"
              />
              <p className="text-xs text-muted-foreground">
                Emphasis on broad concepts (left) vs detailed accuracy (right)
              </p>
            </div>

            {/* Processing Speed Parameter */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="speed" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400"></div>
                  Processing Speed
                </Label>
                <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                  {Math.round((pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual speed meter with lightning effect */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100}%` }}
                  >
                    {/* Lightning effect */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-yellow-200 rounded-full animate-ping shadow-lg"></div>
                    </div>
                  </div>
                </div>
                {/* Speed indicators */}
                <div className="absolute -top-1 left-3/4 w-0.5 h-0.5 bg-yellow-400 rounded-full opacity-90 animate-ping"></div>
                <div className="absolute -bottom-1 right-1/4 w-1 h-1 bg-amber-400 rounded-full opacity-70 animate-pulse"></div>
              </div>
              
              <Slider
                id="speed"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.speed ?? neuralTuning?.speed ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('speed', value[0])}
                className="speed-slider"
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
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="analytical" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                  Analytical Thinking
                </Label>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {Math.round((pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual analytical meter with grid pattern */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100}%` }}
                  >
                    {/* Grid pattern effect */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-blue-200 rounded-sm animate-pulse"></div>
                    </div>
                  </div>
                </div>
                {/* Analytical grid indicators */}
                <div className="absolute -top-1 left-1/3 w-0.5 h-0.5 bg-blue-400 rounded-sm opacity-80"></div>
                <div className="absolute -bottom-1 right-1/3 w-1 h-1 bg-indigo-400 rounded-sm opacity-60"></div>
              </div>
              
              <Slider
                id="analytical"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('analytical', value[0])}
                className="analytical-slider"
              />
              <p className="text-xs text-muted-foreground">
                Emphasis on logical/systematic thinking and structured analysis
              </p>
            </div>

            {/* Intuitive Parameter */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="intuitive" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                  Intuitive Processing
                </Label>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                  {Math.round((pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual intuitive meter with flowing pattern */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100}%` }}
                  >
                    {/* Flowing pattern effect */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-pink-200 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
                {/* Intuitive flow indicators */}
                <div className="absolute -top-1 left-2/3 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-1 left-1/4 w-1 h-1 bg-pink-400 rounded-full opacity-50 animate-bounce"></div>
              </div>
              
              <Slider
                id="intuitive"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('intuitive', value[0])}
                className="intuitive-slider"
              />
              <p className="text-xs text-muted-foreground">
                Pattern recognition and insight-based thinking emphasis
              </p>
            </div>

            {/* Contextual Thinking Parameter */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border border-teal-200 dark:border-teal-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="contextualThinking" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"></div>
                  Contextual Thinking
                </Label>
                <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
                  {Math.round((pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual contextual meter with network pattern */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5) * 100}%` }}
                  >
                    {/* Network pattern effect */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-cyan-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                {/* Contextual network indicators */}
                <div className="absolute -top-1 right-1/3 w-0.5 h-0.5 bg-teal-400 rounded-full opacity-75 animate-ping"></div>
                <div className="absolute -bottom-1 left-1/2 w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-pulse"></div>
              </div>
              
              <Slider
                id="contextualThinking"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('contextualThinking', value[0])}
                className="contextual-slider"
              />
              <p className="text-xs text-muted-foreground">
                Contextual considerations (left) vs universal principles (right)
              </p>
            </div>

            {/* Memory Bandwidth Parameter */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="memoryBandwidth" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-400"></div>
                  Memory Bandwidth
                </Label>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {Math.round((pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual memory meter with data stream effect */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100}%` }}
                  >
                    {/* Data stream effect */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-green-200 rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
                {/* Memory stream indicators */}
                <div className="absolute -top-1 left-3/5 w-0.5 h-0.5 bg-emerald-400 rounded-full opacity-85 animate-pulse"></div>
                <div className="absolute -bottom-1 right-2/5 w-1 h-1 bg-green-400 rounded-full opacity-65 animate-ping"></div>
              </div>
              
              <Slider
                id="memoryBandwidth"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('memoryBandwidth', value[0])}
                className="memory-slider"
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