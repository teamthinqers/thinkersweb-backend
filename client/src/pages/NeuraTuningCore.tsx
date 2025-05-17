import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Zap, ChevronLeft, Save, Info } from 'lucide-react';
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
    creativity?: number;
    precision?: number;
    speed?: number;
    cognitivePace?: number;
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      creativity: 0.5,
      precision: 0.5,
      speed: 0.5,
      cognitivePace: 0.5,
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
                Adjust the fundamental behavior of your Neural Extension
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Creativity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Creativity</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Creativity Parameter</h4>
                      <p className="text-sm">
                        Controls how varied and unique your neural extension's responses will be. Higher values promote more novel and diverse insights.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[neuralTuning?.creativity ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5]}
              onValueChange={(value) => handleParameterChange('creativity', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Practical</span>
              <span>Balanced</span>
              <span>Experimental</span>
            </div>
          </div>
          
          {/* Precision */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Precision</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Precision Parameter</h4>
                      <p className="text-sm">
                        Defines how exact and detailed your neural extension's responses will be. Higher values provide more specific, factual, and carefully constructed responses.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[neuralTuning?.precision ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.precision ?? neuralTuning?.precision ?? 0.5]}
              onValueChange={(value) => handleParameterChange('precision', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Broad</span>
              <span>Balanced</span>
              <span>Detailed</span>
            </div>
          </div>
          
          {/* Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Speed</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Speed Parameter</h4>
                      <p className="text-sm">
                        Controls the trade-off between response time and depth. Higher values prioritize faster responses over exhaustive analysis.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[neuralTuning?.speed ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.speed ?? neuralTuning?.speed ?? 0.5]}
              onValueChange={(value) => handleParameterChange('speed', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Deep</span>
              <span>Balanced</span>
              <span>Quick</span>
            </div>
          </div>
          
          {/* Cognitive Pace */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Cognitive Pace</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
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
              <span className="text-sm font-medium text-muted-foreground">
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
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Deep Processor</span>
              <span>Balanced</span>
              <span>Rapid Processor</span>
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