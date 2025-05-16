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
    analytical?: number;
    intuitive?: number;
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
      console.error("Error checking activation status:", error);
    }
  }, []);
  
  // Handle responsive layout adjustments and persistence
  useEffect(() => {
    // Handle window resize for responsive layout
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 768;
      setIsMobileView(mobileCheck);
    };
    
    // Listen for window resize events
    window.addEventListener('resize', handleResize);
    
    // Set up activation state listener from storage events (for cross-tab/device persistence)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'neuraActivated') {
        const newActivationState = e.newValue === 'true';
        setIsActivated(newActivationState);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
    };
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
      if (!neuraName || neuraName === '') {
        const defaultName = 'My Neural Extension';
        neuraStorage.setName(defaultName);
        setNeuraName(defaultName);
      }
      
      // Show activation toast
      toast({
        title: "Neura Activated",
        description: "Your neural extension is now active and ready to assist you.",
        variant: "default",
      });
      
      // Save any pending changes
      if (unsavedChanges) {
        updateTuning(pendingChanges);
        setUnsavedChanges(false);
        setPendingChanges({});
      }
    } catch (error) {
      console.error("Error activating Neura:", error);
      toast({
        title: "Activation Failed",
        description: "There was a problem activating your neural extension.",
        variant: "destructive",
      });
    }
  };
  
  // Function to deactivate Neura using neuraStorage utility
  const deactivateNeura = () => {
    try {
      // Use the neuraStorage utility for consistent deactivation
      neuraStorage.deactivate();
      setIsActivated(false);
      console.log("Deactivating Neura: using neuraStorage utility");
      
      toast({
        title: "Neura Deactivated",
        description: "Your neural extension has been deactivated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deactivating Neura:", error);
      toast({
        title: "Deactivation Failed",
        description: "There was a problem deactivating your neural extension.",
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
        description: "Please sign in to activate your neural extension.",
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
  const handleParameterChange = (paramName: string, value: number[]) => {
    const paramValue = value[0];
    
    // Update the pending changes object with the new parameter value
    setPendingChanges(prev => ({
      ...prev,
      [paramName]: paramValue
    }));
    
    // Mark that we have unsaved changes
    setUnsavedChanges(true);
    
    // Preview capacity changes based on parameter adjustments without saving
    // In a real implementation, these would be calculated by the backend
    if (paramName === 'creativity') {
      // Creativity affects processing efficiency and learning rate
      setProcessingEfficiency(prev => Math.min(100, prev + (Math.random() * 4 - 2)));
      setLearningRate(prev => Math.min(100, prev + (paramValue > 0.5 ? 2 : -1)));
    } else if (paramName === 'precision') {
      // Precision affects memory capacity
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.6 ? 3 : -1)));
    } else if (paramName === 'speed') {
      // Speed affects processing efficiency but can reduce memory
      setProcessingEfficiency(prev => Math.min(100, prev + (paramValue > 0.7 ? 4 : -1)));
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.7 ? -2 : 1)));
    } else if (paramName === 'analytical') {
      // Analytical thinking affects memory capacity and precision
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.5 ? 2 : -1)));
    } else if (paramName === 'intuitive') {
      // Intuitive thinking affects learning rate
      setLearningRate(prev => Math.min(100, prev + (paramValue > 0.6 ? 3 : -1)));
    }
  };
  
  // Function to handle specialty value changes
  const handleSpecialtyChange = (specialtyId: string, value: number[]) => {
    const specialtyValue = value[0];
    
    setPendingChanges(prev => ({
      ...prev,
      specialties: {
        ...(prev.specialties || {}),
        [specialtyId]: specialtyValue
      }
    }));
    
    setUnsavedChanges(true);
    
    // Update specialization level based on specialty strength
    setSpecializationLevel(prev => {
      const currentSpecialties = Object.keys(status?.tuning?.specialties || {}).length;
      return Math.min(100, (currentSpecialties / 8) * 100 + (specialtyValue > 0.7 ? 5 : -2));
    });
    
    // Specialty changes also affect other metrics
    setMemoryCapacity(prev => Math.min(100, prev + (specialtyValue > 0.6 ? 1 : -0.5)));
    setLearningRate(prev => Math.min(100, prev + (specialtyValue > 0.5 ? 2 : -1)));
  };
  
  // Function to add a new focus area
  const handleAddFocus = () => {
    if (!newFocus.trim()) return;
    
    const updatedFocus = [...(status?.tuning?.learningFocus || []), newFocus.trim()];
    
    setPendingChanges(prev => ({
      ...prev,
      learningFocus: updatedFocus
    }));
    
    setUnsavedChanges(true);
    setNewFocus('');
  };
  
  // Function to remove a focus area
  const handleRemoveFocus = (index: number) => {
    const updatedFocus = [...(status?.tuning?.learningFocus || [])];
    updatedFocus.splice(index, 1);
    
    setPendingChanges(prev => ({
      ...prev,
      learningFocus: updatedFocus
    }));
    
    setUnsavedChanges(true);
  };
  
  // Save pending changes to Neural tuning - only triggered when user clicks Save Changes
  const saveChanges = async () => {
    if (!unsavedChanges) {
      // No changes to save
      toast({
        title: "No Changes",
        description: "No changes to save.",
        variant: "default",
      });
      return;
    }
    
    if (!user) {
      // Prompt login if user is not authenticated
      toast({
        title: "Sign in Required",
        description: "Please sign in to save your neural tuning settings.",
        variant: "default",
      });
      
      // Redirect to auth page after a short delay
      setTimeout(() => {
        setLocation('/auth');
      }, 1500);
      
      return;
    }
    
    try {
      // Update using the mutation function from the hook
      updateTuning(pendingChanges);
      
      // Reset state after saving
      setUnsavedChanges(false);
      setPendingChanges({});
      
      // Notify user that changes were saved successfully
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
  
  // Extract values from status for rendering
  const { gameElements, tuning: neuralTuning } = status || { 
    gameElements: {
      level: 1,
      experience: 0,
      experienceRequired: 1000,
      stats: {
        adaptationScore: 0,
        connectionsFormed: 0,
        insightsGenerated: 0,
        messagesProcessed: 0
      }
    }, 
    tuning: {
      creativity: 0.5,
      precision: 0.5,
      speed: 0.5,
      analytical: 0.5,
      intuitive: 0.5,
      specialties: {},
      learningFocus: []
    }
  };

  // Header section with status and controls
  const renderHeader = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/')} className="p-2">
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
          <CardDescription>Configure how your neural extension processes information</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4 relative z-10">
          {/* Experience Progress */}
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
      
      {/* Neural Tuning Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex mb-6 w-full overflow-x-auto pb-2 scrollbar-none">
          <TabsTrigger value="core" className="group min-w-[120px] px-1 md:px-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs md:text-sm flex items-center gap-1">
                <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span className="whitespace-nowrap">Core Tuning</span>
              </span>
              <span className="h-1 w-full bg-indigo-300/30 group-data-[state=active]:bg-indigo-500 rounded-full transition-colors duration-300"></span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="cognitive" className="group min-w-[120px] px-1 md:px-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs md:text-sm flex items-center gap-1">
                <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span className="whitespace-nowrap">Cognitive Style</span>
              </span>
              <span className="h-1 w-full bg-indigo-300/30 group-data-[state=active]:bg-indigo-500 rounded-full transition-colors duration-300"></span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="expertise" className="group min-w-[120px] px-1 md:px-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs md:text-sm flex items-center gap-1">
                <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                <span className="whitespace-nowrap">Expertise Focus</span>
              </span>
              <span className="h-1 w-full bg-indigo-300/30 group-data-[state=active]:bg-indigo-500 rounded-full transition-colors duration-300"></span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="learning" className="group min-w-[120px] px-1 md:px-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs md:text-sm flex items-center gap-1">
                <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                <span className="whitespace-nowrap">Learning Focus</span>
              </span>
              <span className="h-1 w-full bg-indigo-300/30 group-data-[state=active]:bg-indigo-500 rounded-full transition-colors duration-300"></span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        {/* Core Tuning Tab */}
        <TabsContent value="core" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <CardTitle>Core Processing Parameters</CardTitle>
              </div>
              <CardDescription>Adjust how your neural extension processes information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Creativity */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="flex items-center gap-1 text-base font-medium cursor-help">
                        Creativity <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Creativity Level</h4>
                        <p className="text-sm">
                          Determines how varied and unique your neural extension's responses will be. Higher values produce more novel connections between topics.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-medium">{Math.round((pendingChanges.creativity !== undefined ? pendingChanges.creativity : neuralTuning?.creativity || 0.5) * 100)}%</span>
                </div>
                <Slider
                  value={[pendingChanges.creativity !== undefined ? pendingChanges.creativity : (neuralTuning?.creativity || 0.5)]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(value) => handleParameterChange('creativity', value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Focused & Precise</span>
                  <span>Novel & Exploratory</span>
                </div>
              </div>
              
              {/* Precision */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="flex items-center gap-1 text-base font-medium cursor-help">
                        Precision <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Precision Level</h4>
                        <p className="text-sm">
                          Controls how factually accurate and detailed your neural extension will be. Higher values emphasize exactness over generalization.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-medium">{Math.round((pendingChanges.precision !== undefined ? pendingChanges.precision : neuralTuning?.precision || 0.5) * 100)}%</span>
                </div>
                <Slider
                  value={[pendingChanges.precision !== undefined ? pendingChanges.precision : (neuralTuning?.precision || 0.5)]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(value) => handleParameterChange('precision', value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>General Understanding</span>
                  <span>Exact Details</span>
                </div>
              </div>
              
              {/* Speed */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="flex items-center gap-1 text-base font-medium cursor-help">
                        Processing Speed <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Processing Speed</h4>
                        <p className="text-sm">
                          Balances response time against comprehensiveness. Higher speeds may sacrifice some depth for quicker responses.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-medium">{Math.round((pendingChanges.speed !== undefined ? pendingChanges.speed : neuralTuning?.speed || 0.5) * 100)}%</span>
                </div>
                <Slider
                  value={[pendingChanges.speed !== undefined ? pendingChanges.speed : (neuralTuning?.speed || 0.5)]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(value) => handleParameterChange('speed', value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>In-depth Analysis</span>
                  <span>Quick Response</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              {unsavedChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  You have unsaved changes
                </span>
              )}
              <Button 
                variant="default" 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setActiveTab('cognitive')}
              >
                Next Step <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Cognitive Style Tab */}
        <TabsContent value="cognitive" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BrainCog className="h-5 w-5 text-indigo-500" />
                <CardTitle>Cognitive Style Parameters</CardTitle>
              </div>
              <CardDescription>Define how your neural extension approaches problem-solving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Analytical */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="flex items-center gap-1 text-base font-medium cursor-help">
                        Analytical Thinking <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Analytical Thinking</h4>
                        <p className="text-sm">
                          Emphasizes logical, systematic processing of information. Higher values provide more structured analysis with clear reasoning.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-medium">{Math.round((pendingChanges.analytical !== undefined ? pendingChanges.analytical : neuralTuning?.analytical || 0.5) * 100)}%</span>
                </div>
                <Slider
                  value={[pendingChanges.analytical !== undefined ? pendingChanges.analytical : (neuralTuning?.analytical || 0.5)]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(value) => handleParameterChange('analytical', value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Fluid Reasoning</span>
                  <span>Structured Analysis</span>
                </div>
              </div>
              
              {/* Intuitive */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="flex items-center gap-1 text-base font-medium cursor-help">
                        Intuitive Thinking <Info className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Intuitive Thinking</h4>
                        <p className="text-sm">
                          Focuses on pattern recognition and insight generation. Higher values lead to more holistic perspectives and "connecting the dots".
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm font-medium">{Math.round((pendingChanges.intuitive !== undefined ? pendingChanges.intuitive : neuralTuning?.intuitive || 0.5) * 100)}%</span>
                </div>
                <Slider
                  value={[pendingChanges.intuitive !== undefined ? pendingChanges.intuitive : (neuralTuning?.intuitive || 0.5)]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(value) => handleParameterChange('intuitive', value)}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Direct Observation</span>
                  <span>Pattern Recognition</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('core')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous 
            </Button>
            <div className="flex items-center gap-2">
              {unsavedChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  You have unsaved changes
                </span>
              )}
              <Button 
                variant="default" 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setActiveTab('expertise')}
              >
                Next Step <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Expertise Focus Tab */}
        <TabsContent value="expertise" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                <CardTitle>Expertise Focus Areas</CardTitle>
              </div>
              <CardDescription>Customize domain-specific expertise for your neural extension</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Adjust the strength of each specialization to tune how your neural extension prioritizes these domains when processing information.
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Specialties from current tuning */}
                {neuralTuning?.specialties && Object.entries(neuralTuning.specialties).map(([specialty, value]) => (
                  <div key={specialty} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">{specialty}</span>
                      <span className="text-sm font-medium">
                        {Math.round((pendingChanges.specialties?.[specialty] !== undefined 
                          ? pendingChanges.specialties[specialty] 
                          : value) * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[pendingChanges.specialties?.[specialty] !== undefined 
                        ? pendingChanges.specialties[specialty] 
                        : value]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={(val) => handleSpecialtyChange(specialty, val)}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Basic Knowledge</span>
                      <span>Expert Level</span>
                    </div>
                  </div>
                ))}
                
                {/* Default specialties if none are set */}
                {(!neuralTuning?.specialties || Object.keys(neuralTuning.specialties).length === 0) && (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground mb-2">
                      You haven't added any expertise specializations yet.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Start by adding domains like "Business Strategy," "Technical Research," or "Creative Writing."
                    </p>
                  </div>
                )}
                
                {/* Available specialties to add */}
                {availableSpecialties && availableSpecialties.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-3">Add New Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableSpecialties
                        .filter(specialty => {
                          // Safely handle different specialty data structures
                          const specialtyId = typeof specialty === 'string' 
                            ? specialty 
                            : typeof specialty === 'object' && specialty !== null && 'id' in specialty 
                              ? String(specialty.id) 
                              : String(specialty);
                          
                          return !neuralTuning?.specialties || 
                            !Object.keys(neuralTuning.specialties).includes(specialtyId);
                        })
                        .map(specialty => {
                          // Safely extract ID and name
                          const specialtyId = typeof specialty === 'string' 
                            ? specialty 
                            : typeof specialty === 'object' && specialty !== null && 'id' in specialty 
                              ? String(specialty.id) 
                              : String(specialty);
                          
                          const specialtyName = typeof specialty === 'string' 
                            ? specialty 
                            : typeof specialty === 'object' && specialty !== null && 'name' in specialty 
                              ? String(specialty.name) 
                              : String(specialty);
                          
                          return (
                            <Badge 
                              key={specialtyId}
                              className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 dark:hover:bg-indigo-800/50 cursor-pointer"
                              onClick={() => handleSpecialtyChange(specialtyId, [0.5])}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              {specialtyName}
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('cognitive')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous 
            </Button>
            <div className="flex items-center gap-2">
              {unsavedChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  You have unsaved changes
                </span>
              )}
              <Button 
                variant="default" 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setActiveTab('learning')}
              >
                Next Step <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Learning Focus Tab */}
        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-indigo-500" />
                <CardTitle>Learning Focus Directives</CardTitle>
              </div>
              <CardDescription>Guide what your neural extension prioritizes learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Add specific topics or skills you want your neural extension to learn about and improve upon over time.
                </p>
              </div>
              
              {/* Add new focus area */}
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Add new learning focus (e.g., Machine Learning Fundamentals)"
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFocus()}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  className="shrink-0"
                  onClick={handleAddFocus}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              
              {/* Current focus areas */}
              <div className="space-y-2">
                {(pendingChanges.learningFocus || neuralTuning?.learningFocus || []).length > 0 ? (
                  <div className="rounded-md border">
                    <ScrollArea className="h-[200px]">
                      <div className="p-4 pt-0">
                        <div className="h-2" />
                        {(pendingChanges.learningFocus || neuralTuning?.learningFocus || []).map((focus, index) => (
                          <div 
                            key={focus + index}
                            className="flex items-center justify-between py-3 border-b last:border-b-0"
                          >
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-indigo-500" />
                              <span>{focus}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveFocus(index)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="py-8 text-center border rounded-md">
                    <p className="text-muted-foreground mb-2">
                      No learning focus areas yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add topics you want your neural extension to learn about
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('expertise')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous 
            </Button>
            <div className="flex items-center gap-2">
              {unsavedChanges && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  You have unsaved changes
                </span>
              )}
              <Button 
                disabled={isUpdating}
                variant="default" 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={saveChanges}
              >
                <Save className="mr-1 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Save button fixed at bottom if changes are unsaved */}
      {unsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white dark:bg-gray-950 border-t shadow-lg z-10">
          <div className="container max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <Button 
              disabled={isUpdating}
              variant="default" 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={saveChanges}
            >
              <Save className="mr-1 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}