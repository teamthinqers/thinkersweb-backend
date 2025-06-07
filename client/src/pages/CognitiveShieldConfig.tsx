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
            
            {/* Creativity Parameter - Artist's Palette Theme */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-orange-100 via-yellow-50 to-amber-100 dark:from-orange-950/30 dark:via-yellow-950/20 dark:to-amber-950/30 border-2 border-orange-300 dark:border-orange-700 shadow-lg">
              {/* Floating paint drops background */}
              <div className="absolute top-2 right-4 w-2 h-2 bg-orange-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-6 right-8 w-1 h-1 bg-yellow-500 rounded-full opacity-60 animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-4 left-6 w-1.5 h-1.5 bg-amber-500 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              
              <div className="flex items-center justify-between relative z-10">
                <Label htmlFor="creativity" className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-orange-400 via-yellow-400 to-amber-400 rounded-lg shadow-md"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
                  </div>
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Creativity Level</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-orange-200 to-amber-200 dark:from-orange-800 dark:to-amber-800 rounded-full">
                  <span className="text-sm font-bold text-orange-800 dark:text-orange-200">
                    {Math.round((pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Artist's brush stroke meter */}
              <div className="relative h-4 bg-gradient-to-r from-orange-200 via-yellow-200 to-amber-200 dark:from-orange-900 dark:via-yellow-900 dark:to-amber-900 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-500 relative shadow-lg"
                  style={{ width: `${(pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100}%` }}
                >
                  {/* Paint brush effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  <div className="absolute right-1 top-1 bottom-1 w-2 bg-yellow-200 rounded-full animate-ping opacity-75"></div>
                </div>
                {/* Paint splatters */}
                <div className="absolute top-0 left-1/4 w-1 h-1 bg-orange-400 rounded-full animate-bounce opacity-60"></div>
                <div className="absolute bottom-0 right-1/3 w-0.5 h-0.5 bg-yellow-500 rounded-full animate-pulse opacity-80"></div>
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
              <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                🎨 Balance structured thinking (left) and creative exploration (right)
              </p>
            </div>

            {/* Precision Parameter - Laser Targeting Theme */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-red-100 via-orange-50 to-red-100 dark:from-red-950/30 dark:via-orange-950/20 dark:to-red-950/30 border-2 border-red-400 dark:border-red-600 shadow-lg">
              {/* Targeting crosshairs background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-red-400 transform -translate-y-0.5"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-400 transform -translate-x-0.5"></div>
              </div>
              {/* Floating targeting dots */}
              <div className="absolute top-3 right-6 w-1 h-1 bg-red-500 rounded-full animate-ping opacity-70"></div>
              <div className="absolute top-8 right-3 w-0.5 h-0.5 bg-orange-600 rounded-full animate-pulse opacity-80"></div>
              <div className="absolute bottom-3 left-4 w-1 h-1 bg-red-400 rounded-full animate-bounce opacity-60"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <Label htmlFor="precision" className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-orange-500 rounded-sm shadow-md border border-red-600 dark:border-red-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border border-red-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Precision Focus</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-red-200 to-orange-200 dark:from-red-800 dark:to-orange-800 rounded-lg border border-red-300 dark:border-red-600">
                  <span className="text-sm font-bold text-red-800 dark:text-red-200 font-mono">
                    {Math.round((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Laser beam precision meter */}
              <div className="relative h-4 bg-gradient-to-r from-red-200 via-orange-200 to-red-200 dark:from-red-900 dark:via-orange-900 dark:to-red-900 rounded-sm overflow-hidden shadow-inner border border-red-300 dark:border-red-700">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-500 rounded-sm transition-all duration-300 relative shadow-lg"
                  style={{ width: `${(pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100}%` }}
                >
                  {/* Laser beam effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/50 to-red-100 animate-pulse"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-200 shadow-lg animate-ping"></div>
                  {/* Targeting line */}
                  <div className="absolute right-2 top-1 bottom-1 w-px bg-white/80"></div>
                </div>
                {/* Precision markers */}
                <div className="absolute top-0 left-1/3 w-px h-full bg-red-400 opacity-30"></div>
                <div className="absolute top-0 right-1/4 w-px h-full bg-orange-400 opacity-40"></div>
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
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                🎯 Broad concepts (left) vs detailed accuracy (right)
              </p>
            </div>

            {/* Processing Speed Parameter - Lightning Bolt Theme */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 dark:from-yellow-950/30 dark:via-amber-950/20 dark:to-yellow-950/30 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg">
              {/* Lightning bolt background pattern */}
              <div className="absolute top-2 right-8 transform rotate-12">
                <div className="w-3 h-0.5 bg-yellow-400 opacity-30"></div>
                <div className="w-2 h-0.5 bg-yellow-500 opacity-40 ml-1 mt-0.5"></div>
                <div className="w-1 h-0.5 bg-yellow-600 opacity-50 ml-2 mt-0.5"></div>
              </div>
              {/* Electric sparks */}
              <div className="absolute top-4 right-3 w-1 h-1 bg-yellow-500 rounded-full animate-ping opacity-80" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute top-8 right-12 w-0.5 h-0.5 bg-amber-500 rounded-full animate-pulse opacity-70" style={{ animationDelay: '0.8s' }}></div>
              <div className="absolute bottom-5 left-8 w-1 h-1 bg-yellow-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1.2s' }}></div>
              
              <div className="flex items-center justify-between relative z-10">
                <Label htmlFor="speed" className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-md shadow-md transform rotate-45"></div>
                    <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                      <div className="w-2 h-0.5 bg-white"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 border border-yellow-400 rounded-full animate-ping opacity-60"></div>
                  </div>
                  <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">Processing Speed</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-800 dark:to-amber-800 rounded-lg border border-yellow-300 dark:border-yellow-600">
                  <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200 font-mono">
                    {Math.round((pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Lightning bolt speed meter */}
              <div className="relative h-4 bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200 dark:from-yellow-900 dark:via-amber-900 dark:to-yellow-900 rounded-md overflow-hidden shadow-inner border border-yellow-300 dark:border-yellow-700">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-400 rounded-md transition-all duration-200 relative shadow-lg"
                  style={{ width: `${(pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100}%` }}
                >
                  {/* Electric current effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/70 to-white/40 animate-pulse"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-100 shadow-lg animate-ping"></div>
                  {/* Lightning zigzag */}
                  <div className="absolute right-1 top-1 w-2 h-0.5 bg-white/90 transform rotate-12"></div>
                  <div className="absolute right-2 bottom-1 w-1 h-0.5 bg-white/80 transform -rotate-12"></div>
                </div>
                {/* Speed trail markers */}
                <div className="absolute top-0 left-1/4 w-0.5 h-full bg-yellow-400 opacity-40 transform skew-x-12"></div>
                <div className="absolute top-0 right-1/3 w-0.5 h-full bg-amber-400 opacity-50 transform skew-x-12"></div>
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
              <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                ⚡ Deep reflection (left) vs quick response time (right)
              </p>
            </div>
          </div>

          {/* Cognitive Style Section */}
          <div className="space-y-6">
            <div className="border-b border-amber-200 dark:border-amber-800 pb-2">
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Cognitive Style</h3>
            </div>
            
            {/* Analytical Parameter - Digital Circuit Grid Theme */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-100 via-indigo-50 to-blue-100 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-950/30 border-2 border-blue-400 dark:border-blue-600 shadow-lg">
              {/* Circuit board pattern background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-8 h-px bg-blue-400"></div>
                <div className="absolute top-4 left-12 w-px h-4 bg-blue-400"></div>
                <div className="absolute top-8 left-8 w-4 h-px bg-blue-400"></div>
                <div className="absolute bottom-6 right-6 w-6 h-px bg-indigo-400"></div>
                <div className="absolute bottom-6 right-6 w-px h-3 bg-indigo-400"></div>
              </div>
              {/* Digital nodes */}
              <div className="absolute top-3 right-5 w-1.5 h-1.5 bg-blue-500 rounded-sm animate-pulse opacity-70" style={{ animationDelay: '0.4s' }}></div>
              <div className="absolute top-7 right-10 w-1 h-1 bg-indigo-500 rounded-sm animate-ping opacity-60" style={{ animationDelay: '0.9s' }}></div>
              <div className="absolute bottom-4 left-6 w-1 h-1 bg-blue-400 rounded-sm animate-bounce opacity-50" style={{ animationDelay: '1.3s' }}></div>
              
              <div className="flex items-center justify-between relative z-10">
                <Label htmlFor="analytical" className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-sm shadow-md border border-blue-600 dark:border-blue-400"></div>
                    <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
                      <div className="w-1 h-1 bg-blue-200 rounded-sm"></div>
                      <div className="w-1 h-1 bg-blue-300 rounded-sm"></div>
                      <div className="w-1 h-1 bg-blue-300 rounded-sm"></div>
                      <div className="w-1 h-1 bg-blue-200 rounded-sm"></div>
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border border-blue-400 rounded-sm animate-ping"></div>
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Analytical Thinking</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 rounded-lg border border-blue-300 dark:border-blue-600">
                  <span className="text-sm font-bold text-blue-800 dark:text-blue-200 font-mono">
                    {Math.round((pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Circuit board progress meter */}
              <div className="relative h-4 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200 dark:from-blue-900 dark:via-indigo-900 dark:to-blue-900 rounded-sm overflow-hidden shadow-inner border border-blue-300 dark:border-blue-700">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 rounded-sm transition-all duration-400 relative shadow-lg"
                  style={{ width: `${(pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100}%` }}
                >
                  {/* Digital processing effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/60 to-blue-100/80 animate-pulse"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-100 shadow-lg animate-ping"></div>
                  {/* Circuit traces */}
                  <div className="absolute right-1 top-1 w-2 h-0.5 bg-white/90"></div>
                  <div className="absolute right-2 top-1 w-0.5 h-1 bg-white/80"></div>
                  <div className="absolute right-1 bottom-1 w-1 h-0.5 bg-white/70"></div>
                </div>
                {/* Logic gates indicators */}
                <div className="absolute top-0 left-1/4 w-1 h-full bg-blue-400 opacity-40"></div>
                <div className="absolute top-0 right-1/3 w-0.5 h-full bg-indigo-400 opacity-50"></div>
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
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                🔬 Emphasis on logical/systematic thinking and structured analysis
              </p>
            </div>

            {/* Intuitive Parameter - Mystical Flow Theme */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-purple-950/30 border-2 border-purple-400 dark:border-purple-600 shadow-lg">
              {/* Mystical flowing pattern background */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute top-3 left-6 w-8 h-2 bg-purple-400 rounded-full transform rotate-12"></div>
                <div className="absolute top-8 left-10 w-6 h-1 bg-pink-400 rounded-full transform -rotate-6"></div>
                <div className="absolute bottom-6 right-8 w-10 h-1 bg-purple-500 rounded-full transform rotate-45"></div>
                <div className="absolute bottom-10 right-4 w-4 h-2 bg-pink-500 rounded-full transform -rotate-12"></div>
              </div>
              {/* Floating mystical orbs */}
              <div className="absolute top-4 right-6 w-2 h-2 bg-purple-500 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.6s' }}></div>
              <div className="absolute top-9 right-12 w-1 h-1 bg-pink-500 rounded-full animate-ping opacity-70" style={{ animationDelay: '1.1s' }}></div>
              <div className="absolute bottom-5 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.6s' }}></div>
              
              <div className="flex items-center justify-between relative z-10">
                <Label htmlFor="intuitive" className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-md border border-purple-600 dark:border-purple-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 border border-pink-400 rounded-full animate-ping opacity-60"></div>
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Intuitive Processing</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-full border border-purple-300 dark:border-purple-600">
                  <span className="text-sm font-bold text-purple-800 dark:text-purple-200 font-mono">
                    {Math.round((pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Mystical flow progress meter */}
              <div className="relative h-4 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 dark:from-purple-900 dark:via-pink-900 dark:to-purple-900 rounded-full overflow-hidden shadow-inner border border-purple-300 dark:border-purple-700">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 rounded-full transition-all duration-500 relative shadow-lg"
                  style={{ width: `${(pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100}%` }}
                >
                  {/* Mystical energy flow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/50 to-pink-200/70 animate-pulse"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-pink-100 shadow-lg animate-ping"></div>
                  {/* Flowing essence */}
                  <div className="absolute right-1 top-1 w-2 h-1 bg-white/80 rounded-full transform rotate-12"></div>
                  <div className="absolute right-2 bottom-1 w-1 h-1 bg-white/90 rounded-full"></div>
                </div>
                {/* Flow stream indicators */}
                <div className="absolute top-0 left-1/5 w-0.5 h-full bg-purple-400 opacity-40 transform skew-x-6"></div>
                <div className="absolute top-0 right-1/4 w-1 h-full bg-pink-400 opacity-50 transform -skew-x-6"></div>
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
              <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                🔮 Pattern recognition and insight-based thinking emphasis
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
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="thoughtComplexity" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-400 to-pink-400"></div>
                  Thought Complexity
                </Label>
                <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
                  {Math.round((pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual complexity meter with layered pattern */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100}%` }}
                  >
                    {/* Layered complexity effect */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-pink-200 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                  </div>
                </div>
                {/* Complexity layer indicators */}
                <div className="absolute -top-1 left-1/2 w-0.5 h-0.5 bg-rose-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute -bottom-1 right-1/5 w-1 h-1 bg-pink-400 rounded-full opacity-55 animate-bounce"></div>
              </div>
              
              <Slider
                id="thoughtComplexity"
                min={0}
                max={1}
                step={0.01}
                value={[(pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5)]}
                onValueChange={(value) => handleParameterChange('thoughtComplexity', value[0])}
                className="complexity-slider"
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