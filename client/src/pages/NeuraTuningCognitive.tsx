import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BrainCog, ChevronLeft, Save, Info } from 'lucide-react';
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
  
  // Local state for unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    memoryBandwidth?: number;
    thoughtComplexity?: number;
    mentalModelDensity?: number;
    patternDetectionSensitivity?: number;
    decisionMakingIndex?: number;
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
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
        description: "Your cognitive style parameters have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating cognitive style:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your cognitive style settings.",
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
            <h1 className="text-2xl font-bold">Cognitive Style</h1>
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
          <h1 className="text-2xl font-bold">Cognitive Style</h1>
        </div>
        {unsavedChanges && (
          <Button 
            variant="default"
            className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1.5"
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
      
      {/* Cognitive Style Section Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-full">
              <BrainCog className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle>Cognitive Style</CardTitle>
              <CardDescription>
                Customize how Neura adapts to your natural thinking patterns
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Memory Bandwidth - Bar visualization */}
          <div className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">Memory Bandwidth</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-blue-400" />
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
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {Math.round((pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100)}%
              </span>
            </div>
            
            <div className="relative pt-3">
              <div className="flex items-center mb-2">
                <div 
                  className="h-3 bg-gradient-to-r from-blue-200 to-blue-600 rounded-full overflow-hidden" 
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
              <span className="text-blue-500 font-medium">Short Burst Memory</span>
              <span className="text-indigo-600 font-medium">Deep Retainer</span>
            </div>
          </div>
          
          {/* Thought Complexity - Layer visualization */}
          <div className="space-y-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 p-4 rounded-lg border border-green-100 dark:border-green-900">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 inline-block text-transparent bg-clip-text">Thought Complexity</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-green-400" />
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
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {Math.round((pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100)}%
              </span>
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
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {Math.round((pendingChanges.mentalModelDensity ?? neuralTuning?.mentalModelDensity ?? 0.5) * 100)}%
              </span>
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
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {Math.round((pendingChanges.patternDetectionSensitivity ?? neuralTuning?.patternDetectionSensitivity ?? 0.5) * 100)}%
              </span>
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
              <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                {Math.round((pendingChanges.decisionMakingIndex ?? neuralTuning?.decisionMakingIndex ?? 0.5) * 100)}%
              </span>
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

          <div className="mt-6 bg-violet-50 dark:bg-violet-950 p-4 rounded-lg border border-violet-100 dark:border-violet-900">
            <h4 className="text-sm font-medium text-violet-800 dark:text-violet-300 mb-2">Cognitive Style Settings</h4>
            <p className="text-sm text-violet-700 dark:text-violet-400">
              Adjust these settings to match your natural thinking patterns. Neura will adapt its responses to better reflect how your mind works.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/50 dark:to-purple-950/50 border-t px-6 py-4 justify-between">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/my-neura')}
          >
            Back to My Neura
          </Button>
          
          <Button 
            variant="default"
            onClick={saveChanges}
            disabled={!unsavedChanges || isUpdating}
            className={unsavedChanges ? "bg-violet-600 hover:bg-violet-700" : ""}
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