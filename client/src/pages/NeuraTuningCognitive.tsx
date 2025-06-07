import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BrainCog, ChevronLeft, Save, Info, Settings } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function NeuraTuningCognitive() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // DotSpark Tuning hook
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateTuning,
    isUpdating
  } = useDotSparkTuning();
  
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Local state for unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    // Core tuning parameters
    cognitivePace?: number;
    signalFocus?: number;
    impulseControl?: number;
    mentalEnergyFlow?: number;
    // Cognitive style parameters
    analytical?: number;
    intuitive?: number;
    contextualThinking?: number;
    memoryBandwidth?: number;
    thoughtComplexity?: number;
    mentalModelDensity?: number;
    patternDetectionSensitivity?: number;
    decisionMakingIndex?: number;
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      // Core tuning parameters
      cognitivePace: 0.5,
      signalFocus: 0.5,
      impulseControl: 0.5,
      mentalEnergyFlow: 0.5,
      // Cognitive style parameters
      analytical: 0.8,
      intuitive: 0.6,
      contextualThinking: 0.5,
      memoryBandwidth: 0.5,
      thoughtComplexity: 0.5,
      mentalModelDensity: 0.5,
      patternDetectionSensitivity: 0.5,
      decisionMakingIndex: 0.5,
    }
  };
  
  // Function to handle slider value changes
  const handleParameterChange = (paramName: string, value: number[]) => {
    const paramValue = value[0];
    
    // Update the pending changes object with the new parameter value
    setPendingChanges(prev => ({
      ...prev,
      [paramName]: paramValue
    }));
    
    // Mark that we have unsaved changes
    setUnsavedChanges(true);
  };
  
  // Save pending changes to Neural tuning
  const saveChanges = async () => {
    if (!unsavedChanges) {
      toast({
        title: "No Changes",
        description: "No changes to save.",
        variant: "default",
      });
      return;
    }
    
    try {
      // Update using the mutation function from the hook
      updateTuning(pendingChanges);
      
      // Reset state after saving
      setUnsavedChanges(false);
      setPendingChanges({});
      
      toast({
        title: "Changes Saved",
        description: "Your neural mirror cognitive style parameters have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating cognitive style:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your neural mirror cognitive style settings.",
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (isTuningLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-6 px-4">
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
            <div className="h-10 w-10 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading cognitive parameters...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
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
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 border-amber-600"
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
                Save Changes
              </span>
            )}
          </Button>
        )}
      </div>
      
      {/* Cognitive Shield Configuration Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
              <BrainCog className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle>Cognitive Shield</CardTitle>
              <CardDescription>
                Set up your Cognitive Shield to protect your thinking identity.
                It ensures your natural intelligence stays intact while interacting with AI.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Memory Bandwidth - Bar visualization */}
          <div className="space-y-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-amber-600 to-yellow-600 inline-block text-transparent bg-clip-text">Memory Bandwidth</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Memory Bandwidth</h4>
                      <p className="text-sm">
                        Represents how much information you typically hold in your mind while thinking. If you prefer quick, focused thinking with essential details (Short Burst Memory), use lower values. If you tend to hold and process large amounts of information simultaneously (Deep Retainer), use higher values.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>

            </div>
            
            <div className="relative pt-3">
              <div className="flex items-center mb-2">
                <div 
                  className="h-3 bg-gradient-to-r from-amber-200 to-amber-600 rounded-full overflow-hidden" 
                  style={{ width: `${(pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100}%` }}
                >
                </div>
                <div 
                  className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" 
                  style={{ width: `${100 - (pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100}%` }}
                >
                </div>
              </div>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5}
                onChange={(e) => handleParameterChange('memoryBandwidth', [parseFloat(e.target.value)])}
                className="absolute top-0 left-0 w-full h-8 opacity-0 cursor-pointer"
              />
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-amber-500 font-medium">Short Burst Memory</span>
              <span className="text-yellow-600 font-medium">Deep Retainer</span>
            </div>
          </div>
          
          {/* Thought Complexity - Layer visualization */}
          <div className="space-y-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-amber-600 to-orange-600 inline-block text-transparent bg-clip-text">Thought Complexity</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Thought Complexity</h4>
                      <p className="text-sm">
                        Reflects your natural thinking style. If you prefer straightforward, direct thinking that gets to the point quickly (Simple Direct), use lower values. If you tend toward nuanced, multidimensional thinking that considers many angles simultaneously (Complex Layered), use higher values.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>

            </div>
            
            <div className="py-2 relative">
              {/* Layer visualization - stacked rectangles */}
              <div className="flex flex-col gap-1 mb-3">
                {[...Array(5)].map((_, i) => {
                  const value = pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5;
                  const threshold = i / 5;
                  const isActive = value >= threshold;
                  const width = 100 - i * 15; // Decrease width for each layer
                  
                  return (
                    <div key={i} className="flex justify-center">
                      <div 
                        className={`h-4 rounded-sm transition-all ${
                          isActive ? 'bg-gradient-to-r from-green-300 to-emerald-500 shadow' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
              
              {/* Dial control */}
              <div className="relative h-12 mx-auto flex items-center">
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                    style={{ width: `${(pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100}%` }}
                  ></div>
                </div>
                
                <div 
                  className="absolute w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-emerald-500 shadow flex items-center justify-center"
                  style={{ 
                    left: `calc(${(pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100}% - 12px)`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5}
                  onChange={(e) => handleParameterChange('thoughtComplexity', [parseFloat(e.target.value)])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-green-500 font-medium">Simple Direct</span>
              <span className="text-emerald-600 font-medium">Complex Layered</span>
            </div>
          </div>

          {/* Mental Model Density - Building blocks visualization */}
          <div className="space-y-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 p-4 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-amber-600 to-yellow-600 inline-block text-transparent bg-clip-text">Mental Model Density</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Mental Model Density</h4>
                      <p className="text-sm">
                        Reflects how structured your inner playbook is for solving problems. If you prefer adaptable, spontaneous thinking without rigid frameworks (Free Thinker), use lower values. If you tend to rely on organized mental frameworks and structured approaches (Model Architect), use higher values.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>

            </div>
            
            <div className="py-2">
              <div className="flex justify-center gap-1 mb-3">
                {/* Building blocks visualization */}
                {[...Array(10)].map((_, i) => {
                  const value = (pendingChanges.mentalModelDensity ?? neuralTuning?.mentalModelDensity ?? 0.5);
                  const threshold = i * 0.1;
                  const filled = value >= threshold;
                  
                  return (
                    <div 
                      key={i}
                      className={`h-8 w-8 rounded-sm border border-amber-300 dark:border-amber-700 flex items-center justify-center transition-colors ${
                        filled ? 'bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-amber-500 dark:to-yellow-600' : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                      onClick={() => handleParameterChange('mentalModelDensity', [(i + 1) * 0.1])}
                    >
                      {filled && <div className="w-3 h-3 rounded-full bg-white dark:bg-amber-200"></div>}
                    </div>
                  );
                })}
              </div>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pendingChanges.mentalModelDensity ?? neuralTuning?.mentalModelDensity ?? 0.5}
                onChange={(e) => handleParameterChange('mentalModelDensity', [parseFloat(e.target.value)])}
                className="w-full h-2 bg-gradient-to-r from-amber-200 to-yellow-500 rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-amber-500 font-medium">Free Thinker</span>
              <div className="text-center text-amber-700 font-medium">Framework Builder</div>
              <span className="text-yellow-600 font-medium">Model Architect</span>
            </div>
          </div>

          {/* Pattern Detection Sensitivity - Network visualization */}
          <div className="space-y-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 p-4 rounded-lg border border-purple-100 dark:border-purple-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-fuchsia-600 inline-block text-transparent bg-clip-text">Pattern Detection Sensitivity</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-purple-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Pattern Detection Sensitivity</h4>
                      <p className="text-sm">
                        Reflects how easily you spot themes, loops, and connections. If you focus on optimizing details within specific areas (Local Optimizer), use lower values. If you naturally scan across systems to identify broad patterns and connections (System Scanner), use higher values.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>

            </div>
            
            <div className="relative py-4">
              {/* Network visualization */}
              <div className="relative h-24 mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-3 items-center justify-center">
                    {/* Create nodes that light up based on sensitivity value */}
                    {[...Array(16)].map((_, i) => {
                      const value = pendingChanges.patternDetectionSensitivity ?? neuralTuning?.patternDetectionSensitivity ?? 0.5;
                      const threshold = i / 16;
                      const isActive = value >= threshold;
                      const size = Math.max(6, Math.min(12, 8 + (i % 3) * 2));
                      
                      return (
                        <div key={i} className="relative">
                          <div 
                            className={`rounded-full transition-all duration-300 ${
                              isActive 
                                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-200 dark:shadow-purple-900/30' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            style={{ height: `${size}px`, width: `${size}px` }}
                          ></div>
                          
                          {/* Connection lines between nodes */}
                          {i < 12 && isActive && (
                            <div 
                              className="absolute top-1/2 left-full h-0.5 bg-gradient-to-r from-purple-500 to-fuchsia-400 transform -translate-y-1/2"
                              style={{ width: '12px', opacity: Math.min(1, value * 1.5) }}
                            ></div>
                          )}
                          
                          {i > 3 && i % 4 !== 0 && isActive && (
                            <div 
                              className="absolute top-full left-1/2 w-0.5 bg-gradient-to-b from-purple-500 to-fuchsia-400 transform -translate-x-1/2"
                              style={{ height: '12px', opacity: Math.min(1, value * 1.5) }}
                            ></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Custom range input control over network display */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={pendingChanges.patternDetectionSensitivity ?? neuralTuning?.patternDetectionSensitivity ?? 0.5}
                  onChange={(e) => handleParameterChange('patternDetectionSensitivity', [parseFloat(e.target.value)])}
                  className="absolute bottom-0 left-0 w-full h-3 appearance-none bg-gradient-to-r from-purple-200 to-fuchsia-400 rounded-md cursor-pointer"
                />
              </div>
              
              <div className="h-2"></div>
              
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 mb-1">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full"
                  style={{width: `${(pendingChanges.patternDetectionSensitivity ?? neuralTuning?.patternDetectionSensitivity ?? 0.5) * 100}%`}}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-purple-500 font-medium">Local Optimizer</span>
              <span className="text-fuchsia-600 font-medium">System Scanner</span>
            </div>
          </div>

          {/* Decision Making Index - Balance Scale visualization */}
          <div className="space-y-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 p-4 rounded-lg border border-rose-100 dark:border-rose-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-rose-600 to-pink-600 inline-block text-transparent bg-clip-text">Decision Making Index</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-rose-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Decision Making Index</h4>
                      <p className="text-sm">
                        Distinguishes between intuitive and structured logical thinking. If you typically rely on gut feel, pattern recognition, or mental shortcuts and often "just know" (Intuitive Thinking), use lower values. If you prefer to break problems down step-by-step, analyze variables, and follow defined reasoning (Structured Logical Thinking), use higher values.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>

            </div>
            
            <div className="py-3 relative">
              {/* Balance scale visualization */}
              <div className="flex items-center justify-center mb-4 relative">
                <div className="absolute top-0 left-0 w-full h-3 flex items-center">
                  <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                </div>
                
                <div className="flex justify-between w-full px-6 pt-4 relative">
                  {/* Left side: Intuitive */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-0.5 bg-gradient-to-b from-gray-300 to-rose-400 dark:from-gray-600 dark:to-rose-500"></div>
                    <div 
                      className={`mt-1 h-10 w-10 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${
                        (pendingChanges.decisionMakingIndex ?? neuralTuning?.decisionMakingIndex ?? 0.5) <= 0.5
                          ? 'bg-gradient-to-br from-rose-400 to-pink-500 transform scale-110'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      {(pendingChanges.decisionMakingIndex ?? neuralTuning?.decisionMakingIndex ?? 0.5) <= 0.5 && (
                        <span className="text-white text-xs font-bold">✨</span>
                      )}
                    </div>
                    <div className="mt-2 text-xs font-medium text-rose-500">Intuitive</div>
                  </div>
                  
                  {/* Center pivot */}
                  <div className="absolute left-1/2 top-0 -translate-x-1/2">
                    <div className="h-4 w-4 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                    <div className="h-12 w-0.5 bg-gray-400 dark:bg-gray-500 mx-auto"></div>
                  </div>
                  
                  {/* Right side: Logical */}
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-0.5 bg-gradient-to-b from-gray-300 to-pink-400 dark:from-gray-600 dark:to-pink-500"></div>
                    <div 
                      className={`mt-1 h-10 w-10 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${
                        (pendingChanges.decisionMakingIndex ?? neuralTuning?.decisionMakingIndex ?? 0.5) > 0.5
                          ? 'bg-gradient-to-br from-pink-400 to-pink-600 transform scale-110'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      {(pendingChanges.decisionMakingIndex ?? neuralTuning?.decisionMakingIndex ?? 0.5) > 0.5 && (
                        <span className="text-white text-xs font-bold">🧩</span>
                      )}
                    </div>
                    <div className="mt-2 text-xs font-medium text-pink-500">Logical</div>
                  </div>
                </div>
              </div>
              
              {/* Slider control */}
              <div className="px-2 pt-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={pendingChanges.decisionMakingIndex ?? neuralTuning?.decisionMakingIndex ?? 0.5}
                  onChange={(e) => handleParameterChange('decisionMakingIndex', [parseFloat(e.target.value)])}
                  className="w-full h-2 bg-gradient-to-r from-rose-300 via-gray-200 to-pink-300 dark:from-rose-500 dark:via-gray-600 dark:to-pink-500 rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Gut Feel</span>
                  <span>Balanced</span>
                  <span>Step-by-Step</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cognitive Pace - Stunning Meter Visualization */}
          <div className="space-y-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-6 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-amber-600 to-orange-600 inline-block text-transparent bg-clip-text">Cognitive Pace</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Cognitive Pace</h4>
                      <p className="text-sm">
                        Controls how your mind processes information. Deep processors are thorough and detail-oriented, taking time to analyze deeply. Rapid processors are quick and agile, making fast connections. Balanced mode provides optimal flexibility between speed and depth.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            
            <div className="relative py-6">
              {/* Main meter container */}
              <div className="relative h-20 bg-gradient-to-r from-blue-100 via-green-100 to-red-100 dark:from-blue-950/40 dark:via-green-950/40 dark:to-red-950/40 rounded-full border-2 border-amber-200 dark:border-amber-800 shadow-inner">
                
                {/* Speed zones */}
                <div className="absolute inset-0 flex items-center">
                  {/* Deep Processor Zone */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Deep</div>
                      <div className="text-xs text-blue-500 dark:text-blue-500">Processor</div>
                    </div>
                  </div>
                  
                  {/* Balanced Zone */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs font-medium text-green-600 dark:text-green-400">Balanced</div>
                      <div className="text-xs text-green-500 dark:text-green-500">Mode</div>
                    </div>
                  </div>
                  
                  {/* Rapid Processor Zone */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs font-medium text-red-600 dark:text-red-400">Rapid</div>
                      <div className="text-xs text-red-500 dark:text-red-500">Processor</div>
                    </div>
                  </div>
                </div>
                
                {/* Indicator needle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 transition-all duration-500 ease-out"
                  style={{ 
                    left: `${(pendingChanges.cognitivePace ?? neuralTuning.cognitivePace) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="h-full w-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-lg"></div>
                  {/* Needle top indicator */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-amber-500"></div>
                  </div>
                  {/* Needle bottom indicator */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-amber-500"></div>
                  </div>
                </div>
                
                {/* Zone markers */}
                <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
              </div>
              
              {/* Current mode display */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900">
                  {(() => {
                    const value = pendingChanges.cognitivePace ?? neuralTuning.cognitivePace;
                    if (value < 0.33) {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Deep Processor Mode</span>
                        </>
                      );
                    } else if (value < 0.67) {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Balanced Mode</span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600"></div>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">Rapid Processor Mode</span>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
              
              {/* Interactive slider (invisible overlay) */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pendingChanges.cognitivePace ?? neuralTuning.cognitivePace}
                onChange={(e) => handleParameterChange('cognitivePace', [parseFloat(e.target.value)])}
                className="absolute top-0 left-0 w-full h-20 opacity-0 cursor-pointer"
              />
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Adjust how your mind processes information - from thorough analysis to rapid connections
            </div>
          </div>

          {/* Signal Focus - Aperture Lens Visualization */}
          <div className="space-y-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-6 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-amber-600 to-orange-600 inline-block text-transparent bg-clip-text">Signal Focus</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Signal Focus</h4>
                      <p className="text-sm">
                        Controls your attention style. Narrow beam focus concentrates intensely on specific details, while wide scanner focus takes in broad patterns and connections across multiple areas simultaneously.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            
            <div className="relative py-8">
              {/* Camera aperture/lens visualization */}
              <div className="relative h-32 flex items-center justify-center">
                
                {/* Aperture ring container */}
                <div className="relative w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 rounded-full border-4 border-amber-400 dark:border-amber-600 shadow-lg">
                  
                  {/* Aperture blades that open/close */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute bg-amber-600 dark:bg-amber-500 transition-all duration-700 ease-out"
                        style={{
                          width: '50%',
                          height: '2px',
                          top: '50%',
                          left: '50%',
                          transformOrigin: '0 0',
                          transform: `rotate(${i * 45}deg) translateX(${10 - (pendingChanges.signalFocus ?? neuralTuning.signalFocus) * 35}px)`,
                          opacity: 0.8
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* Central aperture opening */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black dark:bg-gray-900 rounded-full transition-all duration-700 ease-out shadow-inner"
                    style={{
                      width: `${30 + (pendingChanges.signalFocus ?? neuralTuning.signalFocus) * 50}px`,
                      height: `${30 + (pendingChanges.signalFocus ?? neuralTuning.signalFocus) * 50}px`
                    }}
                  >
                    {/* Light ray effect */}
                    <div className="absolute inset-1 bg-gradient-radial from-amber-300/30 to-transparent rounded-full animate-pulse"></div>
                  </div>
                  
                  {/* F-stop indicators around the ring */}
                  {['f/1.4', 'f/2.8', 'f/5.6', 'f/11'].map((fstop, i) => (
                    <div 
                      key={fstop}
                      className="absolute text-xs font-mono text-amber-700 dark:text-amber-300"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-50px) rotate(-${i * 90}deg)`
                      }}
                    >
                      {fstop}
                    </div>
                  ))}
                </div>
                
                {/* Focus breadth indicators */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-1 bg-amber-500 rounded-full mb-1"></div>
                    <span>Sharp</span>
                  </div>
                </div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs font-medium text-orange-700 dark:text-orange-300">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mb-1 opacity-60"></div>
                    <span>Wide</span>
                  </div>
                </div>
              </div>
              
              {/* Aperture scale */}
              <div className="mt-6 px-4">
                <div className="relative">
                  <div className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${(pendingChanges.signalFocus ?? neuralTuning.signalFocus) * 100}%` }}
                    ></div>
                  </div>
                  <div 
                    className="absolute top-0 w-4 h-4 bg-amber-600 rounded-full border-2 border-white shadow-md transition-all duration-300 transform -translate-y-1 -translate-x-2"
                    style={{ left: `${(pendingChanges.signalFocus ?? neuralTuning.signalFocus) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Narrow Beam</span>
                  <span>Balanced</span>
                  <span>Wide Scanner</span>
                </div>
              </div>
              
              {/* Current focus mode */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900">
                  {(() => {
                    const value = pendingChanges.signalFocus ?? neuralTuning.signalFocus;
                    if (value < 0.33) {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Narrow Focus</span>
                        </>
                      );
                    } else if (value < 0.67) {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Adaptive Focus</span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Wide Focus</span>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
              
              {/* Interactive slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pendingChanges.signalFocus ?? neuralTuning.signalFocus}
                onChange={(e) => handleParameterChange('signalFocus', [parseFloat(e.target.value)])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Adjust your mental aperture - from sharp detail focus to broad pattern recognition
            </div>
          </div>

          {/* Impulse Control - Balance Scale Visualization */}
          <div className="space-y-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-6 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-amber-600 to-orange-600 inline-block text-transparent bg-clip-text">Impulse Control</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Impulse Control</h4>
                      <p className="text-sm">
                        Balances responsiveness versus precision. High responsiveness enables quick reactions and spontaneous thinking, while high precision emphasizes careful consideration and measured responses.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            
            <div className="relative py-8">
              {/* Balance scale visualization */}
              <div className="relative h-40">
                {/* Scale base */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-24 bg-gradient-to-b from-amber-400 to-amber-600 rounded-lg"></div>
                
                {/* Scale fulcrum */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
                
                {/* Scale beam */}
                <div 
                  className="absolute bottom-22 left-1/2 transform -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-700 ease-out origin-center"
                  style={{
                    transform: `translateX(-50%) rotate(${((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * 30}deg)`
                  }}
                ></div>
                
                {/* Left pan (Responsiveness) */}
                <div 
                  className="absolute w-20 h-16 bg-gradient-to-b from-amber-200 to-amber-400 rounded-lg border-2 border-amber-600 transition-all duration-700 ease-out"
                  style={{
                    bottom: `${85 + ((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * -20}px`,
                    left: `${20 + ((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * -10}px`
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs font-bold text-amber-800">Quick</div>
                      <div className="text-xs text-amber-700">Response</div>
                    </div>
                  </div>
                  {/* Chain */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-amber-600"></div>
                </div>
                
                {/* Right pan (Precision) */}
                <div 
                  className="absolute w-20 h-16 bg-gradient-to-b from-orange-200 to-orange-400 rounded-lg border-2 border-orange-600 transition-all duration-700 ease-out"
                  style={{
                    bottom: `${85 + ((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * 20}px`,
                    right: `${20 + ((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * 10}px`
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs font-bold text-orange-800">High</div>
                      <div className="text-xs text-orange-700">Precision</div>
                    </div>
                  </div>
                  {/* Chain */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-orange-600"></div>
                </div>
                
                {/* Weight indicators */}
                <div 
                  className="absolute w-4 h-4 bg-amber-600 rounded-full transition-all duration-700 ease-out"
                  style={{
                    bottom: `${105 + ((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * -20}px`,
                    left: `${40 + ((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * -10}px`
                  }}
                ></div>
                <div 
                  className="absolute w-4 h-4 bg-orange-600 rounded-full transition-all duration-700 ease-out"
                  style={{
                    bottom: `${105 + ((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * 20}px`,
                    right: `${40 + ((pendingChanges.impulseControl ?? neuralTuning.impulseControl) - 0.5) * 10}px`
                  }}
                ></div>
              </div>
              
              {/* Current balance mode */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900">
                  {(() => {
                    const value = pendingChanges.impulseControl ?? neuralTuning.impulseControl;
                    if (value < 0.33) {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">High Responsiveness</span>
                        </>
                      );
                    } else if (value < 0.67) {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Balanced Control</span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">High Precision</span>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
              
              {/* Interactive slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pendingChanges.impulseControl ?? neuralTuning.impulseControl}
                onChange={(e) => handleParameterChange('impulseControl', [parseFloat(e.target.value)])}
                className="absolute top-0 left-0 w-full h-40 opacity-0 cursor-pointer"
              />
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Balance quick responses with careful precision
            </div>
          </div>

          {/* Mental Energy Flow - Dual Tank System */}
          <div className="space-y-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-6 rounded-lg border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-amber-600 to-orange-600 inline-block text-transparent bg-clip-text">Mental Energy Flow</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Mental Energy Flow</h4>
                      <p className="text-sm">
                        Controls your mental energy direction. Action-primed flow channels energy toward immediate doing and implementation, while reflection-primed flow directs energy toward deep thinking and contemplation.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            
            <div className="relative py-8">
              {/* Dual tank system visualization */}
              <div className="relative h-32 flex items-end justify-center gap-8">
                
                {/* Action Tank (Left) */}
                <div className="relative">
                  <div className="w-20 h-24 bg-gradient-to-t from-amber-200 to-amber-100 dark:from-amber-800 dark:to-amber-700 border-2 border-amber-400 dark:border-amber-600 rounded-lg overflow-hidden">
                    {/* Liquid level */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-700 ease-out"
                      style={{
                        height: `${(1 - (pendingChanges.mentalEnergyFlow ?? neuralTuning.mentalEnergyFlow)) * 100}%`
                      }}
                    >
                      {/* Bubbles effect */}
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute w-1 h-1 bg-amber-200 rounded-full animate-bounce"
                          style={{
                            left: `${20 + i * 25}%`,
                            bottom: `${10 + i * 15}%`,
                            animationDelay: `${i * 400}ms`,
                            animationDuration: '2s'
                          }}
                        ></div>
                      ))}
                    </div>
                    
                    {/* Tank markers */}
                    <div className="absolute left-0 right-0 top-1/4 h-0.5 bg-amber-600/30"></div>
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-amber-600/30"></div>
                    <div className="absolute left-0 right-0 top-3/4 h-0.5 bg-amber-600/30"></div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-amber-700 dark:text-amber-300">
                    Action
                  </div>
                </div>
                
                {/* Central valve/control */}
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full border-2 border-white shadow-lg mb-2">
                    <div className="absolute inset-1 bg-amber-200 rounded-full"></div>
                    {/* Valve indicator */}
                    <div 
                      className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-amber-800 transition-all duration-700"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${(pendingChanges.mentalEnergyFlow ?? neuralTuning.mentalEnergyFlow - 0.5) * 180}deg)`
                      }}
                    ></div>
                  </div>
                  
                  {/* Flow pipes */}
                  <div className="flex gap-1">
                    <div 
                      className="w-2 h-16 bg-amber-400 rounded-full transition-all duration-700"
                      style={{
                        opacity: (1 - (pendingChanges.mentalEnergyFlow ?? neuralTuning.mentalEnergyFlow)) * 0.8 + 0.2
                      }}
                    ></div>
                    <div 
                      className="w-2 h-16 bg-orange-400 rounded-full transition-all duration-700"
                      style={{
                        opacity: (pendingChanges.mentalEnergyFlow ?? neuralTuning.mentalEnergyFlow) * 0.8 + 0.2
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Reflection Tank (Right) */}
                <div className="relative">
                  <div className="w-20 h-24 bg-gradient-to-t from-orange-200 to-orange-100 dark:from-orange-800 dark:to-orange-700 border-2 border-orange-400 dark:border-orange-600 rounded-lg overflow-hidden">
                    {/* Liquid level */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-700 ease-out"
                      style={{
                        height: `${(pendingChanges.mentalEnergyFlow ?? neuralTuning.mentalEnergyFlow) * 100}%`
                      }}
                    >
                      {/* Gentle swirl effect */}
                      {[...Array(2)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute w-1 h-1 bg-orange-200 rounded-full animate-ping"
                          style={{
                            left: `${30 + i * 30}%`,
                            bottom: `${20 + i * 20}%`,
                            animationDelay: `${i * 600}ms`,
                            animationDuration: '3s'
                          }}
                        ></div>
                      ))}
                    </div>
                    
                    {/* Tank markers */}
                    <div className="absolute left-0 right-0 top-1/4 h-0.5 bg-orange-600/30"></div>
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-orange-600/30"></div>
                    <div className="absolute left-0 right-0 top-3/4 h-0.5 bg-orange-600/30"></div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-orange-700 dark:text-orange-300">
                    Reflection
                  </div>
                </div>
              </div>
              
              {/* Energy distribution slider */}
              <div className="mt-8 px-4">
                <div className="relative">
                  <div className="w-full h-3 bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 dark:from-amber-800 dark:via-yellow-800 dark:to-orange-800 rounded-full border border-amber-300 dark:border-amber-700">
                    <div 
                      className="absolute top-0 bottom-0 w-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full border-2 border-white shadow-md transition-all duration-300 transform -translate-x-3"
                      style={{ left: `${(pendingChanges.mentalEnergyFlow ?? neuralTuning.mentalEnergyFlow) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Action Primed</span>
                  <span>Balanced</span>
                  <span>Reflection Primed</span>
                </div>
              </div>
              
              {/* Current flow mode */}
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900">
                  {(() => {
                    const value = pendingChanges.mentalEnergyFlow ?? neuralTuning.mentalEnergyFlow;
                    if (value < 0.33) {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Action Dominant</span>
                        </>
                      );
                    } else if (value < 0.67) {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Balanced Flow</span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Reflection Dominant</span>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>
              
              {/* Interactive slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pendingChanges.mentalEnergyFlow ?? neuralTuning.mentalEnergyFlow}
                onChange={(e) => handleParameterChange('mentalEnergyFlow', [parseFloat(e.target.value)])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Balance your mental energy tanks - distribute focus between doing and thinking
            </div>
          </div>


        </CardContent>
        
        <CardFooter className="bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/50 dark:to-yellow-950/50 border-t px-6 py-4 justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/my-neura')}
          >
            Back to DotSpark
          </Button>
          
          <Button 
            variant="default"
            onClick={saveChanges}
            disabled={!unsavedChanges || isUpdating}
            className={unsavedChanges ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600" : "bg-gray-400 text-gray-600 cursor-not-allowed"}
          >
            {isUpdating ? (
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-4 w-4 mr-1" />
                {unsavedChanges ? "Save Changes" : "No Changes"}
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}