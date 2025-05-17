import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Zap, ChevronLeft, Save, Info, Check } from 'lucide-react';
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
  
  // Local state for unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    cognitivePace?: number;
    memoryRecall?: number;
    signalFocus?: number;
    impulseControl?: number;
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      cognitivePace: 0.5,
      memoryRecall: 0.5,
      signalFocus: 0.5,
      impulseControl: 0.5,
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
        description: "Your neural extension tuning parameters have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating neural tuning:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your neural tuning settings.",
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
                Adjust the fundamental behavior of your cognitive companion
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Cognitive Pace - Featured Parameter */}
          <div className="space-y-3 p-4 border border-indigo-200 dark:border-indigo-800 rounded-lg bg-gradient-to-r from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/50 dark:to-violet-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">Cognitive Pace</h3>
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
            <Slider
              defaultValue={[neuralTuning?.cognitivePace ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.cognitivePace ?? neuralTuning?.cognitivePace ?? 0.5]}
              onValueChange={(value) => handleParameterChange('cognitivePace', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs">
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
          
          {/* Memory Recall */}
          <div className="space-y-3 mt-8 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-amber-700 dark:text-amber-300">Memory Recall Style</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Memory Recall Parameter</h4>
                      <p className="text-sm">
                        How does your brain prefer to recall and relate information? This influences how your cognitive companion processes and connects ideas.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div 
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5 
                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-300 dark:border-amber-700 shadow-md" 
                    : "border-gray-200 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800"
                }`}
                onClick={() => handleParameterChange('memoryRecall', [0.2])}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5 
                        ? "border-amber-500 bg-amber-100 dark:bg-amber-900" 
                        : "border-gray-300 dark:border-gray-700"
                    }`}>
                      {(pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) < 0.5 && (
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1 flex items-center gap-2">
                      <span role="img" aria-label="spiral" className="text-lg">🌀</span>
                      <span className="text-amber-700 dark:text-amber-300">Analogy-Driven Recall</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You connect new ideas through metaphors, comparisons, and themes. You think in "like that time when…"
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
                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700 shadow-md" 
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800"
                }`}
                onClick={() => handleParameterChange('memoryRecall', [0.8])}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      (pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) >= 0.5 
                        ? "border-blue-500 bg-blue-100 dark:bg-blue-900" 
                        : "border-gray-300 dark:border-gray-700"
                    }`}>
                      {(pendingChanges.memoryRecall ?? neuralTuning?.memoryRecall ?? 0.5) >= 0.5 && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-1 flex items-center gap-2">
                      <span role="img" aria-label="microscope" className="text-lg">🔬</span>
                      <span className="text-blue-700 dark:text-blue-300">Precision-Driven Recall</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You remember exact facts, sequences, names, and data points. You think in "this is what happened exactly."
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
          
          {/* Signal Focus */}
          <div className="space-y-3 mt-8 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-emerald-700 dark:text-emerald-300">Signal Focus</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Signal Focus Parameter</h4>
                      <p className="text-sm">
                        This is your brain's ability to lock on to a single goal vs juggling multiple contexts. It affects how your cognitive companion prioritizes and processes information.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
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
                  <ZapIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-violet-700 dark:text-violet-300 font-medium">High Responsiveness</span>
                <span className="text-xs text-muted-foreground mt-1">Quick reactions to incoming stimuli</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                  <BalanceIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">Balanced</span>
                <span className="text-xs text-muted-foreground mt-1">Context-dependent approach</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-1 bg-blue-100 dark:bg-blue-900 p-1 rounded-md">
                  <SearchIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">High Precision</span>
                <span className="text-xs text-muted-foreground mt-1">Careful consideration before action</span>
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