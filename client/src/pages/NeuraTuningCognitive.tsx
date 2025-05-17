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
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      memoryBandwidth: 0.5,
      thoughtComplexity: 0.5,
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
          <h1 className="text-2xl font-bold">Memory Bandwidth</h1>
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
              <CardTitle>Memory Bandwidth</CardTitle>
              <CardDescription>
                Control how much information your Neura holds while thinking
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Memory Bandwidth */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Memory Bandwidth</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
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
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[neuralTuning?.memoryBandwidth ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5]}
              onValueChange={(value) => handleParameterChange('memoryBandwidth', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Short Burst Memory</span>
              <span>Balanced</span>
              <span>Deep Retainer</span>
            </div>
          </div>
          
          {/* Thought Complexity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Thought Complexity</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
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
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[neuralTuning?.thoughtComplexity ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5]}
              onValueChange={(value) => handleParameterChange('thoughtComplexity', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Simple Direct</span>
              <span>Balanced</span>
              <span>Complex Layered</span>
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