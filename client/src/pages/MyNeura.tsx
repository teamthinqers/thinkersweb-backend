import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useDotSparkTuning } from "@/hooks/useDotSparkTuning";
import { neuraStorage } from "@/lib/neuraStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BrainCircuit, BrainCog, ChevronLeft, ChevronRight, Check, Info, Lightbulb, Plus, Save, Sparkles, Target, X, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
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
    analytical?: number;
    intuitive?: number;
    specialties?: Record<string, number>;
    learningFocus?: string[];
  }>({});
  
  // Active tab for neural tuning
  const [activeTab, setActiveTab] = useState('core');
  
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
      console.error("Error checking activation status:", error);
    }
  }, []);
  
  // Handle name change with neuraStorage
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNeuraName(newName);
    neuraStorage.setName(newName);
  };
  
  // Function to activate Neura using neuraStorage utility
  const activateNeura = () => {
    try {
      // Use the neuraStorage utility for consistent activation
      neuraStorage.activate();
      setIsActivated(true);
      console.log("Activating Neura: using neuraStorage utility");
      
      // Ensure name is set properly
      const currentName = neuraStorage.getName();
      if (!currentName) {
        neuraStorage.setName(neuraName || 'Neura');
      }
      
      toast({
        title: "Neura Activated",
        description: "Your neural extension is now active and learning from your interactions.",
      });
    } catch (error) {
      console.error("Error activating Neura:", error);
      toast({
        title: "Activation Error",
        description: "Failed to activate Neura. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to deactivate Neura using neuraStorage utility
  const deactivateNeura = () => {
    try {
      neuraStorage.deactivate();
      setIsActivated(false);
      console.log("Deactivating Neura: using neuraStorage utility");
      
      toast({
        title: "Neura Deactivated",
        description: "Your neural extension has been deactivated.",
      });
    } catch (error) {
      console.error("Error deactivating Neura:", error);
      toast({
        title: "Deactivation Error",
        description: "Failed to deactivate Neura. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle parameter changes
  const handleParameterChange = (param: string, value: number) => {
    setPendingChanges(prev => ({
      ...prev,
      [param]: value
    }));
    setUnsavedChanges(true);
  };
  
  // Handle specialty weight changes
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
  
  // Save changes
  const handleSaveChanges = async () => {
    if (!unsavedChanges) return;
    
    try {
      updateTuning.mutate(pendingChanges, {
        onSuccess: () => {
          setPendingChanges({});
          setUnsavedChanges(false);
          toast({
            title: "Settings Saved",
            description: "Your DotSpark tuning has been updated.",
          });
        },
        onError: () => {
          toast({
            title: "Save Failed",
            description: "Failed to save tuning settings. Please try again.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Save Failed", 
        description: "Failed to save tuning settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Reset changes
  const handleResetChanges = () => {
    setPendingChanges({});
    setUnsavedChanges(false);
  };
  
  // Get current value for a parameter (with pending changes)
  const getCurrentValue = (param: string) => {
    if (pendingChanges[param as keyof typeof pendingChanges] !== undefined) {
      return pendingChanges[param as keyof typeof pendingChanges] as number;
    }
    return status?.tuning?.[param as keyof typeof status.tuning] as number || 0;
  };
  
  // Get current learning focus (with pending changes)
  const getCurrentLearningFocus = () => {
    return pendingChanges.learningFocus || status?.tuning?.learningFocus || [];
  };
  
  // Handle add learning focus
  const handleAddLearningFocus = () => {
    if (!newFocus.trim()) return;
    
    const currentFocus = getCurrentLearningFocus();
    if (currentFocus.includes(newFocus.trim())) {
      toast({
        title: "Duplicate Focus",
        description: "This learning focus already exists.",
        variant: "destructive",
      });
      return;
    }
    
    setPendingChanges(prev => ({
      ...prev,
      learningFocus: [...currentFocus, newFocus.trim()]
    }));
    setUnsavedChanges(true);
    setNewFocus('');
  };
  
  // Handle remove learning focus
  const handleRemoveLearningFocus = (focus: string) => {
    const currentFocus = getCurrentLearningFocus();
    setPendingChanges(prev => ({
      ...prev,
      learningFocus: currentFocus.filter(f => f !== focus)
    }));
    setUnsavedChanges(true);
  };
  
  if (isTuningLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading neural configuration...</p>
        </div>
      </div>
    );
  }

  const tuning = status?.tuning;
  const gameElements = status?.gameElements;

  if (!isActivated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Activation Card */}
          <div className="max-w-2xl mx-auto">
            <Card className="text-center border-2 border-dashed border-indigo-200 dark:border-indigo-800">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BrainCircuit className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-2xl text-indigo-900 dark:text-indigo-100">Activate Your Neura</CardTitle>
                <CardDescription className="text-lg">
                  Your personal neural extension is ready to be activated. Once active, it will learn from your interactions and adapt to your cognitive patterns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-left block mb-2">Neural Extension Name</label>
                    <Input
                      value={neuraName}
                      onChange={handleNameChange}
                      placeholder="Enter a name for your neural extension"
                      className="text-center text-lg font-medium"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={activateNeura}
                  size="lg"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Activate Neura
                </Button>
                
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Your neural extension will begin learning from your interactions</p>
                  <p>• Cognitive patterns will be analyzed and optimized</p>
                  <p>• All data remains private and secure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </div>
          
          {/* Save/Reset Controls */}
          {unsavedChanges && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetChanges}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Neural Extension Status Card */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{neuraName}</h2>
                  <p className="text-indigo-100">Neural Extension • Level {gameElements?.level || 1}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.round((gameElements?.experience || 0) / (gameElements?.experienceRequired || 1000) * 100)}%</div>
                <div className="text-sm text-indigo-100">Progress</div>
              </div>
            </div>
            
            {/* Experience Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1.5 text-sm font-medium">
                <span>Experience</span>
                <span>{gameElements?.experience || 0} / {gameElements?.experienceRequired || 1000} XP</span>
              </div>
              <Progress value={(gameElements?.experience || 0) / (gameElements?.experienceRequired || 1000) * 100} className="h-2 bg-indigo-100 dark:bg-indigo-950" />
            </div>
            
            {/* Capacity Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {/* Processing Efficiency */}
              <div className="text-center">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-indigo-100 dark:text-indigo-950" 
                      strokeWidth="8" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-indigo-500 transition-all duration-500 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 45 * (processingEfficiency / 100)} ${2 * Math.PI * 45}`}
                      strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-indigo-500" />
                  </div>
                </div>
                <div className="text-sm font-medium mt-1">Processing</div>
                <div className="text-xl font-bold">{Math.round(processingEfficiency)}%</div>
              </div>
              
              {/* Memory Capacity */}
              <div className="text-center">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-blue-100 dark:text-blue-950" 
                      strokeWidth="8" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-blue-500 transition-all duration-500 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 45 * (memoryCapacity / 100)} ${2 * Math.PI * 45}`}
                      strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCog className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="text-sm font-medium mt-1">Memory</div>
                <div className="text-xl font-bold">{Math.round(memoryCapacity)}%</div>
              </div>
              
              {/* Learning Rate */}
              <div className="text-center">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-purple-100 dark:text-purple-950" 
                      strokeWidth="8" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-purple-500 transition-all duration-500 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 45 * (learningRate / 100)} ${2 * Math.PI * 45}`}
                      strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="text-sm font-medium mt-1">Learning</div>
                <div className="text-xl font-bold">{Math.round(learningRate)}%</div>
              </div>
              
              {/* Specialization Level */}
              <div className="text-center">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-green-100 dark:text-green-950" 
                      strokeWidth="8" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-green-500 transition-all duration-500 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 45 * (specializationLevel / 100)} ${2 * Math.PI * 45}`}
                      strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="text-sm font-medium mt-1">Specialization</div>
                <div className="text-xl font-bold">{Math.round(specializationLevel)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* DotSpark Configuration */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cognitive Shield Section */}
          <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <BrainCog className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-amber-900 dark:text-amber-100">Cognitive Shield</CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    Core neural processing parameters
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cognitive Pace */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto font-medium text-left justify-start text-amber-800 dark:text-amber-200">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-600" />
                          Cognitive Pace
                          <Info className="h-4 w-4 text-amber-500" />
                        </div>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Cognitive Pace</h4>
                        <p className="text-sm text-muted-foreground">
                          How fast your brain processes and switches between thoughts. Higher values enable quicker cognitive transitions.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-mono bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                    {getCurrentValue('cognitivePace').toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[getCurrentValue('cognitivePace')]}
                  onValueChange={(value) => handleParameterChange('cognitivePace', value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full [&_.relative]:bg-amber-200 dark:[&_.relative]:bg-amber-800 [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-600"
                />
              </div>

              {/* Signal Focus */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto font-medium text-left justify-start text-amber-800 dark:text-amber-200">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-amber-600" />
                          Signal Focus
                          <Info className="h-4 w-4 text-amber-500" />
                        </div>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Signal Focus</h4>
                        <p className="text-sm text-muted-foreground">
                          Narrow beam (0.0) vs wide scanner (1.0) focus style. Controls attention breadth and depth.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-mono bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                    {getCurrentValue('signalFocus').toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[getCurrentValue('signalFocus')]}
                  onValueChange={(value) => handleParameterChange('signalFocus', value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full [&_.relative]:bg-amber-200 dark:[&_.relative]:bg-amber-800 [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-600"
                />
              </div>

              {/* Impulse Control */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto font-medium text-left justify-start text-amber-800 dark:text-amber-200">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-amber-600" />
                          Impulse Control
                          <Info className="h-4 w-4 text-amber-500" />
                        </div>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Impulse Control</h4>
                        <p className="text-sm text-muted-foreground">
                          High responsiveness (0.0) vs high precision (1.0). Balances quick reactions with careful consideration.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-mono bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                    {getCurrentValue('impulseControl').toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[getCurrentValue('impulseControl')]}
                  onValueChange={(value) => handleParameterChange('impulseControl', value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full [&_.relative]:bg-amber-200 dark:[&_.relative]:bg-amber-800 [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-600"
                />
              </div>

              {/* Mental Energy Flow */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto font-medium text-left justify-start text-amber-800 dark:text-amber-200">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          Mental Energy Flow
                          <Info className="h-4 w-4 text-amber-500" />
                        </div>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Mental Energy Flow</h4>
                        <p className="text-sm text-muted-foreground">
                          Action primed (0.0) vs reflection primed (1.0). Controls the balance between doing and thinking.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-mono bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded">
                    {getCurrentValue('mentalEnergyFlow').toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[getCurrentValue('mentalEnergyFlow')]}
                  onValueChange={(value) => handleParameterChange('mentalEnergyFlow', value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full [&_.relative]:bg-amber-200 dark:[&_.relative]:bg-amber-800 [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Expertise Layer Section */}
          <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100">Expertise Layer</CardTitle>
                  <CardDescription className="text-indigo-700 dark:text-indigo-300">
                    Domain specialization and knowledge weights
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 uppercase tracking-wide">Specialty Domains</h4>
                <div className="space-y-4">
                  {availableSpecialties.map((specialty) => (
                    <div key={specialty.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                          {specialty.name}
                        </label>
                        <span className="text-sm font-mono bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                          {((pendingChanges.specialties?.[specialty.id] ?? tuning?.specialties?.[specialty.id]) || 0).toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[(pendingChanges.specialties?.[specialty.id] ?? tuning?.specialties?.[specialty.id]) || 0]}
                        onValueChange={(value) => handleSpecialtyChange(specialty.id, value[0])}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full [&_.relative]:bg-indigo-200 dark:[&_.relative]:bg-indigo-800 [&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Focus */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 uppercase tracking-wide">Learning Directives</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {getCurrentLearningFocus().map((focus, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                      {focus}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                        onClick={() => handleRemoveLearningFocus(focus)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new learning focus..."
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddLearningFocus()}
                    className="flex-1 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                  />
                  <Button
                    onClick={handleAddLearningFocus}
                    disabled={!newFocus.trim()}
                    className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Neural Extension Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Deactivate Neural Extension</h4>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable learning and adaptation features
                </p>
              </div>
              <Button
                variant="outline"
                onClick={deactivateNeura}
                className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
              >
                Deactivate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}