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
    analytical?: number;
    intuitive?: number;
    contextualThinking?: number;
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      analytical: 0.5,
      intuitive: 0.5,
      contextualThinking: 0.5,
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
              <CardTitle>Cognitive Style Parameters</CardTitle>
              <CardDescription>
                Define how your neural extension processes information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Analytical */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Analytical Thinking</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Analytical Thinking</h4>
                      <p className="text-sm">
                        Controls how systematically your neural extension approaches problems. Higher values promote logical analysis and methodical thinking.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[neuralTuning?.analytical ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5]}
              onValueChange={(value) => handleParameterChange('analytical', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Flexible</span>
              <span>Balanced</span>
              <span>Structured</span>
            </div>
          </div>
          
          {/* Intuitive */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Intuitive Thinking</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Intuitive Thinking</h4>
                      <p className="text-sm">
                        Controls how much your neural extension relies on pattern recognition and holistic insights. Higher values promote connecting disparate ideas and concepts.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[neuralTuning?.intuitive ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5]}
              onValueChange={(value) => handleParameterChange('intuitive', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Literal</span>
              <span>Balanced</span>
              <span>Abstract</span>
            </div>
          </div>
          
          {/* Contextual vs. Universal Thinking */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Contextual vs. Universal Thinking</h3>
                <HoverCard>
                  <HoverCardTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Contextual vs. Universal Thinking</h4>
                      <p className="text-sm">
                        Determines whether your neural extension prioritizes situational, context-dependent thinking or focuses on universal principles and broad applications. Lower values emphasize specific contexts and adaptability to unique situations, while higher values prioritize consistent principles across different scenarios.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round((pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5) * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[neuralTuning?.contextualThinking ?? 0.5]}
              max={1}
              step={0.01}
              value={[pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5]}
              onValueChange={(value) => handleParameterChange('contextualThinking', value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Situational Focus</span>
              <span>Balanced</span>
              <span>Universal Principles</span>
            </div>
          </div>
          
          <div className="mt-6 bg-violet-50 dark:bg-violet-950 p-4 rounded-lg border border-violet-100 dark:border-violet-900">
            <h4 className="text-sm font-medium text-violet-800 dark:text-violet-300 mb-2">How Cognitive Style Works</h4>
            <p className="text-sm text-violet-700 dark:text-violet-400">
              The cognitive style parameters define how your neural extension approaches problems and processes information. Balancing analytical and intuitive thinking with contextual awareness creates a well-rounded assistant, while emphasizing specific parameters tailors responses to your preferred thinking style.
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