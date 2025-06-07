import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { neuraStorage } from '@/lib/neuraStorage';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BrainCircuit, 
  Sparkles, 
  Zap, 
  BrainCog, 
  Lightbulb,
  ChevronLeft,
  ChevronRight, 
  Plus,
  X,
  Target,
  Info, 
  Check,
  AlertCircle,
  Save
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MyNeura() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Neural Extension name using neuraStorage utility
  const [neuraName, setNeuraName] = useState(neuraStorage.getName());
  
  // DotSpark Tuning
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateTuning,
    isUpdating,
    updateLearningFocus,
    isUpdatingFocus,
    availableSpecialties
  } = useDotSparkTuning();
  
  // State for capacity metrics with animation
  const [processingEfficiency, setProcessingEfficiency] = useState<number>(65);
  const [memoryCapacity, setMemoryCapacity] = useState<number>(48);
  const [learningRate, setLearningRate] = useState<number>(52);
  const [specializationLevel, setSpecializationLevel] = useState<number>(35);
  
  // Update capacity metrics when status changes
  useEffect(() => {
    if (status) {
      setProcessingEfficiency(status.gameElements?.stats?.adaptationScore || 0);
      setMemoryCapacity(Math.min(100, ((status.gameElements?.stats?.connectionsFormed || 0) / 50) * 100));
      setLearningRate(Math.min(100, ((status.gameElements?.stats?.insightsGenerated || 0) / 20) * 100));
      setSpecializationLevel(Math.min(100, (Object.keys(status.tuning?.specialties || {}).length / 8) * 100));
    }
  }, [status]);
  
  // State for tracking unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    creativity?: number;
    precision?: number;
    speed?: number;
    adaptability?: number;
    cognitivePace?: number;
    signalFocus?: number;
    impulseControl?: number;
    mentalEnergyFlow?: number;
    analytical?: number;
    intuitive?: number;
    contextualThinking?: number;
    memoryBandwidth?: number;
    thoughtComplexity?: number;
    mentalModelDensity?: number;
    patternDetectionSensitivity?: number;
    decisionMakingIndex?: number;
    memoryRetention?: number;
    memoryRecall?: number;
    connectionStrength?: number;
    patternRecognition?: number;
    learningRate?: number;
    conceptIntegration?: number;
    curiosityIndex?: number;
    specialties?: Record<string, number>;
    learningFocus?: string[];
  }>({});
  
  // Active tab for neural tuning
  const [activeTab, setActiveTab] = useState('core');
  
  // Track if we're on mobile for responsive layout
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // New focus for learning directives
  const [newFocus, setNewFocus] = useState('');
  
  // Is Neura activated - using neuraStorage utility
  const [isActivated, setIsActivated] = useState<boolean>(neuraStorage.isActivated());
  
  // Check for activation status on page load/revisit
  useEffect(() => {
    try {
      const activated = neuraStorage.isActivated();
      console.log("Loading activation status from neuraStorage:", activated);
      setIsActivated(activated);
    } catch (error) {
      console.error("Error reading activation status:", error);
      setIsActivated(false);
    }
  }, []);
  
  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update neura name when it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setNeuraName(neuraStorage.getName());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Destructure status for easier access
  const tuning = status?.tuning;
  const gameElements = status?.gameElements;
  
  // Save changes to backend
  const saveChanges = async () => {
    if (!pendingChanges || Object.keys(pendingChanges).length === 0) {
      return;
    }
    
    try {
      // Separate learning focus from other tuning parameters
      const { learningFocus, ...tuningParams } = pendingChanges;
      
      // Update tuning parameters if present
      if (Object.keys(tuningParams).length > 0) {
        await updateTuning(tuningParams);
      }
      
      // Update learning focus if present
      if (learningFocus) {
        await updateLearningFocus(learningFocus);
      }
      
      // Clear pending changes and mark as saved
      setPendingChanges({});
      setUnsavedChanges(false);
      
      toast({
        title: "Settings Saved",
        description: "Your Neura tuning has been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to activate Neura
  const activateNeura = () => {
    try {
      // Use the neuraStorage utility for consistent activation
      neuraStorage.activate();
      setIsActivated(true);
      console.log("Activating Neura: using neuraStorage utility");
      
      toast({
        title: "Neura Activated",
        description: "Your neural extension is now active and ready to assist you.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error activating Neura:", error);
      toast({
        title: "Activation Failed",
        description: "There was a problem activating your Neura.",
        variant: "destructive",
      });
    }
  };
  
  // Function to deactivate Neura
  const deactivateNeura = () => {
    try {
      // Use the neuraStorage utility for consistent deactivation
      neuraStorage.deactivate();
      setIsActivated(false);
      console.log("Deactivating Neura: using neuraStorage utility");
      
      toast({
        title: "Neura Deactivated",
        description: "Your Neura has been deactivated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deactivating Neura:", error);
      toast({
        title: "Deactivation Failed",
        description: "There was a problem deactivating your Neura.",
        variant: "destructive",
      });
    }
  };
  
  // Toggle Neura activation
  const toggleNeuraActivation = () => {
    // If trying to activate and user is not signed in, prompt them to sign in
    if (!isActivated && !user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to activate your Neura.",
        variant: "default",
      });
      
      // Optional: Redirect to auth page after a short delay
      setTimeout(() => {
        setLocation('/auth');
      }, 1500);
      
      return;
    }
    
    // Otherwise, proceed as normal
    if (isActivated) {
      deactivateNeura();
    } else {
      activateNeura();
    }
  };
  
  // Function to handle slider value changes - only updates local state without saving to backend
  const handleParameterChange = (paramName: string, paramValue: number) => {
    
    // Update the pending changes object with the new parameter value
    setPendingChanges(prev => ({
      ...prev,
      [paramName]: paramValue
    }));
    
    // Mark that there are unsaved changes
    setUnsavedChanges(true);
  };
  
  // Function to handle specialty weight changes
  const handleSpecialtyChange = (specialty: string, weight: number) => {
    setPendingChanges(prev => ({
      ...prev,
      specialties: {
        ...prev.specialties,
        [specialty]: weight
      }
    }));
    setUnsavedChanges(true);
  };
  
  // Function to add new learning focus
  const addLearningFocus = () => {
    if (newFocus.trim() && tuning?.learningFocus) {
      const updatedFocus = [...tuning.learningFocus, newFocus.trim()];
      setPendingChanges(prev => ({
        ...prev,
        learningFocus: updatedFocus
      }));
      setNewFocus('');
      setUnsavedChanges(true);
    }
  };
  
  // Function to remove learning focus
  const removeLearningFocus = (focusToRemove: string) => {
    if (tuning?.learningFocus) {
      const updatedFocus = tuning.learningFocus.filter(focus => focus !== focusToRemove);
      setPendingChanges(prev => ({
        ...prev,
        learningFocus: updatedFocus
      }));
      setUnsavedChanges(true);
    }
  };
  
  // Get current value for a parameter (pending change or current tuning value)
  const getCurrentValue = (paramName: string): number => {
    // First check if there's a pending change
    if (pendingChanges[paramName as keyof typeof pendingChanges] !== undefined) {
      return pendingChanges[paramName as keyof typeof pendingChanges] as number;
    }
    
    // Otherwise return the current tuning value
    return tuning?.[paramName as keyof typeof tuning] as number || 0;
  };
  
  // Get current learning focus (pending or current)
  const getCurrentLearningFocus = (): string[] => {
    if (pendingChanges.learningFocus) {
      return pendingChanges.learningFocus;
    }
    return tuning?.learningFocus || [];
  };
  
  // Render header with consistent styling
  const renderHeader = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            onClick={() => setLocation('/')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Neura</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Neura Status:</span>
            <span className={`inline-flex h-3 w-3 rounded-full ${isActivated ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <div className="flex items-center gap-2">
            {unsavedChanges && isActivated && (
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
            <Button 
              variant={isActivated ? "outline" : "default"} 
              className={isActivated ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950" : "bg-indigo-600 hover:bg-indigo-700"} 
              onClick={toggleNeuraActivation}
            >
              {isActivated ? "Deactivate Neura" : "Activate Neura"}
            </Button>
          </div>
        </div>
      </div>
      
      {isActivated ? (
        <div className="mb-6 p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <Check className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium">Neura is Active</h3>
              <p className="text-sm text-muted-foreground">Your neural extension is active and ready to assist you.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-amber-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium">Neura is Inactive</h3>
              <p className="text-sm text-muted-foreground">Activate your neural extension to begin receiving personalized insights.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Loading state
  if (isTuningLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        {renderHeader()}
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <BrainCircuit className="h-16 w-16 text-indigo-400 animate-pulse mb-4" />
            <h3 className="text-xl font-medium mb-2">Loading Neura...</h3>
            <p className="text-muted-foreground">Connecting to your neural extension</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      {/* Header Section with Status Indicators */}
      {renderHeader()}
      
      {/* Neural Extension Level Card with Capacity Metrics */}
      <Card className="mb-8 bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/30 dark:to-slate-950 border border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-indigo-200/30 to-blue-200/10 dark:from-indigo-800/20 dark:to-blue-800/5 rounded-full blur-3xl"></div>
        </div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-700 dark:text-indigo-400" />
              <CardTitle>
                <span className="font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{neuraName}</span>
              </CardTitle>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800/50">
              Level {gameElements?.level || 1}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 relative z-10">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Processing Efficiency</span>
                  <span className="text-muted-foreground">{Math.round(processingEfficiency)}%</span>
                </div>
                <Progress value={processingEfficiency} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Memory Capacity</span>
                  <span className="text-muted-foreground">{Math.round(memoryCapacity)}%</span>
                </div>
                <Progress value={memoryCapacity} className="h-2" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Learning Rate</span>
                  <span className="text-muted-foreground">{Math.round(learningRate)}%</span>
                </div>
                <Progress value={learningRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Specialization Level</span>
                  <span className="text-muted-foreground">{Math.round(specializationLevel)}%</span>
                </div>
                <Progress value={specializationLevel} className="h-2" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Experience: {gameElements?.experience || 0} / {gameElements?.experienceRequired || 100}</span>
              <span>Messages Processed: {gameElements?.stats?.messagesProcessed || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">{gameElements?.unlockedCapabilities?.length || 0} Capabilities</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Neural Tuning Tabs */}
      {isActivated ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCog className="h-5 w-5" />
              Neural Tuning
            </CardTitle>
            <CardDescription>
              Customize your Neura's cognitive parameters and learning directives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="core">Core Parameters</TabsTrigger>
                <TabsTrigger value="cognitive">Cognitive Style</TabsTrigger>
                <TabsTrigger value="learning">Learning Focus</TabsTrigger>
              </TabsList>
              
              {/* Core Parameters Tab */}
              <TabsContent value="core" className="space-y-6 mt-6">
                <div className="grid gap-6">
                  {/* Creativity Parameter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Creativity
                        <HoverCard>
                          <HoverCardTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-sm">Controls how innovative and varied your Neura's responses are. Higher values encourage more creative and original thinking.</p>
                          </HoverCardContent>
                        </HoverCard>
                      </label>
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {getCurrentValue('creativity').toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[getCurrentValue('creativity')]}
                      onValueChange={(value) => handleParameterChange('creativity', value[0])}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  {/* Precision Parameter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Precision
                        <HoverCard>
                          <HoverCardTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-sm">Affects factual accuracy and attention to detail. Higher values result in more precise and methodical responses.</p>
                          </HoverCardContent>
                        </HoverCard>
                      </label>
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {getCurrentValue('precision').toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[getCurrentValue('precision')]}
                      onValueChange={(value) => handleParameterChange('precision', value[0])}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  {/* Speed Parameter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Response Speed
                        <HoverCard>
                          <HoverCardTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-sm">Balances response time versus depth. Higher values prioritize quicker responses, lower values allow for more thorough analysis.</p>
                          </HoverCardContent>
                        </HoverCard>
                      </label>
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {getCurrentValue('speed').toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[getCurrentValue('speed')]}
                      onValueChange={(value) => handleParameterChange('speed', value[0])}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Cognitive Style Tab */}
              <TabsContent value="cognitive" className="space-y-6 mt-6">
                <div className="grid gap-6">
                  {/* Core Cognitive Parameters */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Core Cognitive Patterns</h4>
                    
                    {/* Cognitive Pace */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Cognitive Pace
                          <HoverCard>
                            <HoverCardTrigger>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">How fast your brain processes and switches between thoughts. Higher values enable rapid thought transitions.</p>
                            </HoverCardContent>
                          </HoverCard>
                        </label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {getCurrentValue('cognitivePace').toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[getCurrentValue('cognitivePace')]}
                        onValueChange={(value) => handleParameterChange('cognitivePace', value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    {/* Signal Focus */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Signal Focus
                          <HoverCard>
                            <HoverCardTrigger>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">Focus style: narrow beam (0.0) for deep concentration vs wide scanner (1.0) for broad awareness.</p>
                            </HoverCardContent>
                          </HoverCard>
                        </label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {getCurrentValue('signalFocus').toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[getCurrentValue('signalFocus')]}
                        onValueChange={(value) => handleParameterChange('signalFocus', value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    {/* Impulse Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <BrainCog className="h-4 w-4" />
                          Impulse Control
                          <HoverCard>
                            <HoverCardTrigger>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">Balance between high responsiveness (0.0) and high precision (1.0). Controls reaction vs reflection.</p>
                            </HoverCardContent>
                          </HoverCard>
                        </label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {getCurrentValue('impulseControl').toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[getCurrentValue('impulseControl')]}
                        onValueChange={(value) => handleParameterChange('impulseControl', value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    {/* Mental Energy Flow */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Mental Energy Flow
                          <HoverCard>
                            <HoverCardTrigger>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">Energy orientation: action primed (0.0) for immediate execution vs reflection primed (1.0) for deep analysis.</p>
                            </HoverCardContent>
                          </HoverCard>
                        </label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {getCurrentValue('mentalEnergyFlow').toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[getCurrentValue('mentalEnergyFlow')]}
                        onValueChange={(value) => handleParameterChange('mentalEnergyFlow', value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Thinking Style Parameters */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Thinking Style</h4>
                    
                    {/* Analytical Parameter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <BrainCog className="h-4 w-4" />
                          Analytical Thinking
                          <HoverCard>
                            <HoverCardTrigger>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">Emphasizes logical, systematic, and structured thinking approaches.</p>
                            </HoverCardContent>
                          </HoverCard>
                        </label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {getCurrentValue('analytical').toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[getCurrentValue('analytical')]}
                        onValueChange={(value) => handleParameterChange('analytical', value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    {/* Intuitive Parameter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Intuitive Thinking
                          <HoverCard>
                            <HoverCardTrigger>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">Focuses on pattern recognition, insights, and holistic understanding.</p>
                            </HoverCardContent>
                          </HoverCard>
                        </label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {getCurrentValue('intuitive').toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[getCurrentValue('intuitive')]}
                        onValueChange={(value) => handleParameterChange('intuitive', value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    {/* Contextual Thinking */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Contextual Thinking
                          <HoverCard>
                            <HoverCardTrigger>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <p className="text-sm">Thinking scope: contextual (0.0) focuses on specific situations vs universal (1.0) seeks broad principles.</p>
                            </HoverCardContent>
                          </HoverCard>
                        </label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {getCurrentValue('contextualThinking').toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[getCurrentValue('contextualThinking')]}
                        onValueChange={(value) => handleParameterChange('contextualThinking', value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Learning Focus Tab */}
              <TabsContent value="learning" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Active Learning Directives</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {getCurrentLearningFocus().map((focus, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {focus}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive" 
                            onClick={() => removeLearningFocus(focus)}
                          />
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new learning focus..."
                        value={newFocus}
                        onChange={(e) => setNewFocus(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addLearningFocus()}
                      />
                      <Button 
                        onClick={addLearningFocus}
                        size="sm"
                        disabled={!newFocus.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Specialty Weights</h4>
                    <div className="space-y-4">
                      {availableSpecialties.map((specialty) => {
                        const specialtyKey = typeof specialty === 'string' ? specialty : specialty.id;
                        const specialtyName = typeof specialty === 'string' ? specialty : specialty.name;
                        return (
                          <div key={specialtyKey} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium capitalize">
                                {specialtyName}
                              </label>
                              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {((pendingChanges.specialties?.[specialtyKey] ?? tuning?.specialties?.[specialtyKey]) || 0).toFixed(2)}
                              </span>
                            </div>
                            <Slider
                              value={[(pendingChanges.specialties?.[specialtyKey] ?? tuning?.specialties?.[specialtyKey]) || 0]}
                              onValueChange={(value) => handleSpecialtyChange(specialtyKey, value[0])}
                              max={1}
                              min={0}
                              step={0.01}
                              className="w-full"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BrainCircuit className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">Neura Not Active</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Activate your neural extension to access tuning parameters and customize your cognitive experience.
            </p>
            <Button onClick={toggleNeuraActivation} className="bg-indigo-600 hover:bg-indigo-700">
              Activate Neura
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}