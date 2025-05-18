import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Zap, ChevronLeft, Save, Info, Check, Search, Scale } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function NeuraTuningCore() {
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
    cognitivePace?: number;
    memoryRecall?: number;
    signalFocus?: number;
    impulseControl?: number;
    mentalEnergyFlow?: number;
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      cognitivePace: 0.5,
      memoryRecall: 0.5,
      signalFocus: 0.5,
      impulseControl: 0.5,
      mentalEnergyFlow: 0.5,
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
        description: "Your neural mirror tuning parameters have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating neural tuning:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your neural mirror tuning settings.",
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
            <h1 className="text-2xl font-bold">Core Tuning</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading tuning parameters...</p>
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
          <h1 className="text-2xl font-bold">Core Tuning</h1>
        </div>
        {unsavedChanges && (
          <Button 
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
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
      
      {/* Core Tuning Section Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <Zap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle>Core Tuning Parameters</CardTitle>
              <CardDescription>
                Adjust the fundamental parameters to reflect your cognitive behavior
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Cognitive Pace - Speedometer visualization */}
          <div className="space-y-4 p-4 border border-indigo-200 dark:border-indigo-800 rounded-lg bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/50 dark:to-violet-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-indigo-600 to-violet-600 inline-block text-transparent bg-clip-text">Cognitive Pace</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Cognitive Pace Parameter</h4>
                      <p className="text-sm">
                        How fast your brain tends to process and switch between thoughts. Lower values indicate deeper, more focused processing, while higher values suggest rapid, agile thinking.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
                {Math.round((pendingChanges.cognitivePace ?? neuralTuning?.cognitivePace ?? 0.5) * 100)}%
              </span>
            </div>
            
            {/* Speedometer visualization */}
            <div className="relative h-36">
              <div className="absolute bottom-0 w-full">
                {/* Speedometer dial */}
                <div className="relative mx-auto w-48 h-24 overflow-hidden">
                  {/* Speedometer background */}
                  <div className="absolute bottom-0 w-full h-48 rounded-full border-8 border-gray-200 dark:border-gray-700" style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' }}></div>
                  
                  {/* Speedometer colors/segments */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-center">
                    <div className="h-24 w-48 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-tl-full rounded-tr-full opacity-30"></div>
                    </div>
                  </div>
                  
                  {/* Speedometer needle */}
                  <div 
                    className="absolute bottom-0 left-1/2 w-1 h-20 bg-gradient-to-t from-indigo-600 to-indigo-400 origin-bottom z-10"
                    style={{ 
                      transform: `translateX(-50%) rotate(${-90 + 180 * (pendingChanges.cognitivePace ?? neuralTuning?.cognitivePace ?? 0.5)}deg)`,
                      transformOrigin: 'bottom center',
                      transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                  ></div>
                  
                  {/* Needle center */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-md z-20"></div>
                  
                  {/* Speed ticks */}
                  <div className="absolute bottom-4 w-full flex justify-between px-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-3 w-0.5 bg-gray-400 dark:bg-gray-600"></div>
                    ))}
                  </div>
                </div>
                
                {/* Sliding control */}
                <div className="mt-4 px-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={pendingChanges.cognitivePace ?? neuralTuning?.cognitivePace ?? 0.5}
                    onChange={(e) => handleParameterChange('cognitivePace', [parseFloat(e.target.value)])}
                    className="w-full h-2 appearance-none bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 dark:from-blue-700 dark:via-indigo-700 dark:to-violet-700 rounded-md cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs mt-3">
              <div className="flex flex-col items-center">
                <span className="text-indigo-700 dark:text-indigo-400 font-medium">Deep Processor</span>
                <span className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">Thorough & Detailed</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-indigo-700 dark:text-indigo-400 font-medium">Balanced</span>
                <span className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">Adaptable</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-indigo-700 dark:text-indigo-400 font-medium">Rapid Processor</span>
                <span className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">Quick & Agile</span>
              </div>
            </div>
          </div>
          
          {/* Memory Recall - Brain hemisphere visualization */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-blue-50 dark:from-amber-950/40 dark:to-blue-950/40 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-amber-600 to-blue-600 inline-block text-transparent bg-clip-text">Memory Recall Style</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Memory Recall Parameter</h4>
                      <p className="text-sm">
                        How does your brain prefer to recall and relate information? This influences how your neural mirror reflects and connects your thought patterns.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-amber-300 to-blue-300 dark:from-amber-600 dark:to-blue-600"></div>
                <span className="text-sm font-medium">
                  {(pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5 ? 'Analogy-Driven' : 'Precision-Driven'}
                </span>
              </div>
            </div>
            
            {/* Brain hemispheres visualization */}
            <div className="relative h-44 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-32">
                  {/* Brain outline */}
                  <div className="absolute inset-0 flex items-center">
                    {/* Left hemisphere */}
                    <div 
                      className={`w-1/2 h-32 rounded-l-full border-2 border-r-0 transition-all duration-300 ${
                        (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5
                          ? 'border-amber-400 dark:border-amber-600 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50' 
                          : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
                      }`}
                    ></div>
                    
                    {/* Right hemisphere */}
                    <div 
                      className={`w-1/2 h-32 rounded-r-full border-2 border-l-0 transition-all duration-300 ${
                        (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) >= 0.5
                          ? 'border-blue-400 dark:border-blue-600 bg-gradient-to-l from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50' 
                          : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
                      }`}
                    ></div>
                  </div>
                  
                  {/* Brain connector line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700 transform -translate-x-1/2"></div>
                  
                  {/* Activity indicators */}
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="absolute top-0 left-0 w-full h-full">
                      <div 
                        className={`absolute top-1/4 left-1/4 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                          (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5 
                            ? 'bg-amber-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                        style={{ 
                          top: `${20 + i * 30}%`, 
                          left: `${25 - i * 5}%`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      ></div>
                      
                      <div 
                        className={`absolute top-1/4 right-1/4 w-3 h-3 rounded-full transform translate-x-1/2 -translate-y-1/2 ${
                          (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) >= 0.5 
                            ? 'bg-blue-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                        style={{ 
                          top: `${20 + i * 30}%`, 
                          right: `${25 - i * 5}%`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Brain hemisphere labels */}
              <div className="absolute bottom-0 inset-x-0 flex justify-between px-12">
                <div className={`text-center px-3 py-1 rounded-full text-xs font-medium ${
                  (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  Metaphors & Themes
                </div>
                
                <div className={`text-center px-3 py-1 rounded-full text-xs font-medium ${
                  (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) >= 0.5
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  Facts & Sequences
                </div>
              </div>
            </div>
            
            {/* Toggle options */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5 
                    ? "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 shadow-md" 
                    : "border-gray-200 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800"
                }`}
                onClick={() => handleParameterChange('memoryRecall', [0.2])}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="text-2xl">🌀</div>
                  <div>
                    <h4 className="font-medium text-amber-700 dark:text-amber-300">Analogy-Driven</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      "Like that time when..."
                    </p>
                  </div>
                </div>
                {(pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5 && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
              
              <div 
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) >= 0.5 
                    ? "bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-md" 
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                }`}
                onClick={() => handleParameterChange('memoryRecall', [0.8])}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="text-2xl">🔬</div>
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">Precision-Driven</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      "Exactly what happened..."
                    </p>
                  </div>
                </div>
                {(pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) >= 0.5 && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Signal Focus - Lens/Radar visualization */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-emerald-50 to-violet-50 dark:from-emerald-950/40 dark:to-violet-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <h3 className="text-lg font-medium bg-gradient-to-r from-emerald-600 to-violet-600 inline-block text-transparent bg-clip-text">Signal Focus</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Signal Focus Parameter</h4>
                      <p className="text-sm">
                        This is your brain's ability to lock on to a single goal vs juggling multiple contexts. It affects how your neural mirror reflects your attention patterns and prioritizes information.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-violet-100 dark:from-emerald-900/50 dark:to-violet-900/50 text-emerald-700 dark:text-emerald-300">
                {(pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) < 0.5 ? 'Narrow Beam' : 'Wide Scanner'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div 
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  (pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) < 0.5 
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-300 dark:border-emerald-700 shadow-md" 
                    : "border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                }`}
                onClick={() => handleParameterChange('signalFocus', [0.2])}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      (pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) < 0.5 
                        ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-900" 
                        : "border-gray-300 dark:border-gray-700"
                    }`}>
                      {(pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) < 0.5 && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1 flex items-center gap-2">
                      <span role="img" aria-label="laser" className="text-lg">🔦</span>
                      <span className="text-emerald-700 dark:text-emerald-300">Narrow Beam Focus</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You excel at deep concentration on a single task or goal. You prefer to complete one thing thoroughly before moving to the next.
                    </p>
                  </div>
                </div>
                {(pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) < 0.5 && (
                  <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
              
              <div 
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  (pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) >= 0.5 
                    ? "bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-300 dark:border-purple-700 shadow-md" 
                    : "border-gray-200 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800"
                }`}
                onClick={() => handleParameterChange('signalFocus', [0.8])}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      (pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) >= 0.5 
                        ? "border-purple-500 bg-purple-100 dark:bg-purple-900" 
                        : "border-gray-300 dark:border-gray-700"
                    }`}>
                      {(pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) >= 0.5 && (
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1 flex items-center gap-2">
                      <span role="img" aria-label="radar" className="text-lg">🔭</span>
                      <span className="text-purple-700 dark:text-purple-300">Wide Scanner Focus</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You thrive on juggling multiple tasks and contexts. You quickly shift attention between different areas and connect disparate information.
                    </p>
                  </div>
                </div>
                {(pendingChanges.signalFocus ?? neuralTuning?.signalFocus ?? 0.5) >= 0.5 && (
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Impulse Control Index */}
          <div className="space-y-3 mt-8 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">Impulse Control Index</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Impulse Control Parameter</h4>
                      <p className="text-sm">
                        This parameter balances how quickly you act vs. how long you deliberate. 
                        At one end, high responsiveness means quick reactions. At the other end, high precision 
                        means taking more time to consider options.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium">
                {Math.round((pendingChanges.impulseControl ?? neuralTuning?.impulseControl ?? 0.5) * 100)}%
              </span>
            </div>
            
            <Slider
              defaultValue={[neuralTuning?.impulseControl ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.impulseControl ?? neuralTuning?.impulseControl ?? 0.5]}
              onValueChange={(value) => handleParameterChange('impulseControl', value)}
              className="w-full"
            />
            
            <div className="grid grid-cols-3 text-center text-sm mt-2">
              <div className="flex flex-col items-center">
                <div className="mb-1 bg-violet-100 dark:bg-violet-900 p-1 rounded-md">
                  <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-violet-700 dark:text-violet-300 font-medium">High Responsiveness</span>
                <span className="text-xs text-muted-foreground mt-1">Quick reactions to incoming stimuli</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                  <Scale className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Balanced</span>
                <span className="text-xs text-muted-foreground mt-1">Context-dependent approach</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-1 bg-blue-100 dark:bg-blue-900 p-1 rounded-md">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">High Precision</span>
                <span className="text-xs text-muted-foreground mt-1">Careful consideration before action</span>
              </div>
            </div>
          </div>
          
          {/* Mental Energy Flow */}
          <div className="space-y-3 mt-8 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-amber-700 dark:text-amber-300">Mental Energy Flow</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Mental Energy Flow Parameter</h4>
                      <p className="text-sm">
                        This parameter represents whether your energy spikes during execution (Action Primed) 
                        or during planning and ideation (Reflection Primed). It affects how your neural 
                        mirror reflects your balance between immediate action and contemplative thinking.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium">
                {Math.round((pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) * 100)}%
              </span>
            </div>
            
            <div className="relative h-[120px] w-full bg-gradient-to-r from-amber-50 to-blue-50 dark:from-amber-950 dark:to-blue-950 rounded-lg overflow-hidden my-4 border border-gray-200 dark:border-gray-800">
              {/* Position indicator */}
              <div 
                className="absolute h-6 w-6 rounded-full bg-white shadow-lg border-2 border-blue-500 z-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ 
                  left: `${(pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) * 100}%`,
                  top: '50%'
                }}
              />
              
              {/* Action Primed Side */}
              <div className="absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center items-center text-center p-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all duration-300 ${
                  (pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) < 0.4 
                    ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className={`font-medium ${
                  (pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) < 0.4 
                    ? 'text-amber-700 dark:text-amber-300' 
                    : 'text-gray-500'
                }`}>Action Primed</h4>
              </div>
              
              {/* Reflection Primed Side */}
              <div className="absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center items-center text-center p-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all duration-300 ${
                  (pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) > 0.6 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  <Search className="h-5 w-5" />
                </div>
                <h4 className={`font-medium ${
                  (pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) > 0.6 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-500'
                }`}>Reflection Primed</h4>
              </div>
              
              {/* Energy flow visualization */}
              <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  d={`M0,50 C${20 + (pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) * 10},20 ${80 - (pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) * 10},80 100,50`} 
                  stroke={`rgba(${251 - (pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) * 150}, ${191 - (pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) * 50}, ${(pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5) * 255}, 0.5)`}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="3,2"
                  className="animate-pulse"
                />
              </svg>
            </div>
            
            <Slider
              defaultValue={[neuralTuning?.mentalEnergyFlow ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.mentalEnergyFlow ?? neuralTuning?.mentalEnergyFlow ?? 0.5]}
              onValueChange={(value) => handleParameterChange('mentalEnergyFlow', value)}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <div className="flex flex-col items-center">
                <span className="text-amber-600 dark:text-amber-400 font-medium">Action Primed</span>
                <span className="max-w-[120px] text-center">Energy peaks during execution</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-500 font-medium">Balanced</span>
                <span className="max-w-[120px] text-center">Flexible energy allocation</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-blue-600 dark:text-blue-400 font-medium">Reflection Primed</span>
                <span className="max-w-[120px] text-center">Energy peaks during planning</span>
              </div>
            </div>
          </div>

        </CardContent>
        
        <CardFooter className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/50 dark:to-blue-950/50 border-t px-6 py-4 justify-between">
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
            className={unsavedChanges ? "bg-indigo-600 hover:bg-indigo-700" : ""}
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