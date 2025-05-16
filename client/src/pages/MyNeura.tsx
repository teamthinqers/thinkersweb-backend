import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useNeuralTuning } from '@/hooks/useNeuralTuning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Brain, 
  Check, 
  BrainCircuit, 
  Zap, 
  Gauge, 
  BrainCog, 
  Lightbulb,
  ChevronRight,
  Save,
  ChevronLeft,
  NetworkIcon,
  Star,
  Target,
  MoreHorizontal,
  X,
  Plus,
  Bookmark,
  Microscope,
  GraduationCap,
  LogIn,
  LayoutDashboard,
  Search,
  Sparkles
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

export default function MyNeura() {
  const [, setLocation] = useLocation();
  const { user, loginWithGoogle, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  // Neural Extension name
  const [neuraName, setNeuraName] = useState(localStorage.getItem('neuraName') || 'My Neural Extension');
  
  // Neural Tuning
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateTuning,
    isUpdating,
    updateLearningFocus,
    isUpdatingFocus,
    availableSpecialties
  } = useNeuralTuning();
  
  // State for capacity metrics with animation
  const [processingEfficiency, setProcessingEfficiency] = useState<number>(65);
  const [memoryCapacity, setMemoryCapacity] = useState<number>(48);
  const [learningRate, setLearningRate] = useState<number>(52);
  const [specializationLevel, setSpecializationLevel] = useState<number>(35);
  
  // Update capacity metrics when status changes
  useEffect(() => {
    if (status) {
      const { gameElements, tuning } = status;
      setProcessingEfficiency(gameElements?.stats?.adaptationScore || 0);
      setMemoryCapacity(Math.min(100, ((gameElements?.stats?.connectionsFormed || 0) / 50) * 100));
      setLearningRate(Math.min(100, ((gameElements?.stats?.insightsGenerated || 0) / 20) * 100));
      setSpecializationLevel(Math.min(100, (Object.keys(tuning?.specialties || {}).length / 8) * 100));
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
  
  // Is Neura activated
  const [isActivated, setIsActivated] = useState<boolean>(
    localStorage.getItem('neuraActivated') === 'true'
  );
  
  // Check localStorage for activation status on page load/revisit
  useEffect(() => {
    const storedActivation = localStorage.getItem('neuraActivated') === 'true';
    setIsActivated(storedActivation);
    console.log("Loading activation status from localStorage:", storedActivation);
  }, []);
  
  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNeuraName(newName);
    localStorage.setItem('neuraName', newName);
  };
  
  // Function to activate Neura
  const activateNeura = () => {
    // Set in localStorage and update state
    localStorage.setItem('neuraActivated', 'true');
    setIsActivated(true);
    
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
  };
  
  // Function to deactivate Neura (for testing purposes)
  const deactivateNeura = () => {
    localStorage.setItem('neuraActivated', 'false');
    setIsActivated(false);
    
    toast({
      title: "Neura Deactivated",
      description: "Your neural extension has been deactivated.",
      variant: "default",
    });
  };
  
  // Function to handle slider value changes
  const handleParameterChange = (paramName: string, value: number[]) => {
    const paramValue = value[0];
    
    setPendingChanges(prev => ({
      ...prev,
      [paramName]: paramValue
    }));
    
    setUnsavedChanges(true);
    
    // Simulate capacity changes based on parameter adjustments
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
  
  // Save pending changes to Neural tuning
  const saveChanges = async () => {
    if (!user) {
      // Prompt login if user is not authenticated
      toast({
        title: "Login Required",
        description: "Please login to save your neural tuning settings.",
        variant: "default",
      });
      return;
    }
    
    try {
      // Update using the mutation function from the hook
      updateTuning(pendingChanges);
      
      setUnsavedChanges(false);
      setPendingChanges({});
      
      toast({
        title: "Neural Tuning Updated",
        description: "Your neural extension tuning parameters have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating neural tuning:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your neural tuning settings.",
        variant: "destructive",
      });
    }
  };
  
  // Prompt to save changes on navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);
  
  // Handle login with Google
  const handleLoginWithGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "There was a problem logging you in. Please try again.",
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
  
  // Handle search
  const handleSearch = (query: string) => {
    // Not implemented in this version
  };
  
  // Loading state
  if (isTuningLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onSearch={handleSearch} />
        <div className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-4xl">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <BrainCircuit className="h-16 w-16 text-indigo-400 animate-pulse mb-4" />
              <h3 className="text-xl font-medium mb-2">Loading Neura...</h3>
              <p className="text-muted-foreground">Connecting to your neural extension</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => setLocation('/')} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Neura</h1>
        </div>
        
        {isActivated && (
          <div className="mb-6 p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <Check className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium">Neura is Active</h3>
                <p className="text-sm text-muted-foreground">Your neural extension is active and ready to assist you.</p>
              </div>
            </div>
          </div>
        )}
        
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
                      className="text-emerald-100 dark:text-emerald-950" 
                      strokeWidth="8" 
                    />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="currentColor" 
                      className="text-emerald-500 transition-all duration-500 ease-out" 
                      strokeWidth="8" 
                      strokeDasharray={`${2 * Math.PI * 45 * (specializationLevel / 100)} ${2 * Math.PI * 45}`}
                      strokeDashoffset={2 * Math.PI * 45 * 0.25}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="h-5 w-5 text-emerald-500" />
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
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="core" className="group">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm flex items-center gap-1">
                  <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                  Core Tuning
                </span>
                <span className="h-1 w-full bg-indigo-300/30 group-data-[state=active]:bg-indigo-500 rounded-full transition-colors duration-300"></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="cognitive" className="group">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm flex items-center gap-1">
                  <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                  Cognitive Style
                </span>
                <span className="h-1 w-full bg-indigo-300/30 group-data-[state=active]:bg-indigo-500 rounded-full transition-colors duration-300"></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="expertise" className="group">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm flex items-center gap-1">
                  <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                  Expertise Focus
                </span>
                <span className="h-1 w-full bg-indigo-300/30 group-data-[state=active]:bg-indigo-500 rounded-full transition-colors duration-300"></span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="learning" className="group">
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm flex items-center gap-1">
                  <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                  Learning Focus
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
                <CardDescription>
                  These parameters affect how your neural extension processes and responds to information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Creativity */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Creativity</h4>
                      <p className="text-sm text-muted-foreground">Influences variety and uniqueness of neural responses</p>
                    </div>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800">
                      {Math.round((pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100)}%
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-200 dark:from-blue-900 dark:via-indigo-800 dark:to-purple-700 rounded-full relative">
                    <Slider
                      defaultValue={[neuralTuning?.creativity ?? 0.5]}
                      value={[pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5]}
                      onValueChange={(value) => handleParameterChange('creativity', value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Focused</span>
                    <span>Balanced</span>
                    <span>Exploratory</span>
                  </div>
                </div>
                
                {/* Precision */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Precision</h4>
                      <p className="text-sm text-muted-foreground">Balances factual accuracy against intuitive leaps</p>
                    </div>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-200 dark:border-blue-800">
                      {Math.round((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100)}%
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-gradient-to-r from-blue-100 to-cyan-200 dark:from-blue-900 dark:to-cyan-800 rounded-full relative">
                    <Slider
                      defaultValue={[neuralTuning?.precision ?? 0.5]}
                      value={[pendingChanges.precision ?? neuralTuning?.precision ?? 0.5]}
                      onValueChange={(value) => handleParameterChange('precision', value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conceptual</span>
                    <span>Balanced</span>
                    <span>Exact</span>
                  </div>
                </div>
                
                {/* Speed */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Speed</h4>
                      <p className="text-sm text-muted-foreground">Controls trade-off between processing speed and depth</p>
                    </div>
                    <Badge variant="outline" className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-950 dark:to-emerald-950 border border-cyan-200 dark:border-cyan-800">
                      {Math.round((pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100)}%
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-gradient-to-r from-cyan-100 to-emerald-200 dark:from-cyan-900 dark:to-emerald-800 rounded-full relative">
                    <Slider
                      defaultValue={[neuralTuning?.speed ?? 0.5]}
                      value={[pendingChanges.speed ?? neuralTuning?.speed ?? 0.5]}
                      onValueChange={(value) => handleParameterChange('speed', value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Thorough</span>
                    <span>Balanced</span>
                    <span>Efficient</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Cognitive Style Tab */}
          <TabsContent value="cognitive" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BrainCog className="h-5 w-5 text-purple-500" />
                  <CardTitle>Cognitive Style Parameters</CardTitle>
                </div>
                <CardDescription>
                  Set the cognitive approach your neural extension uses to process information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Analytical */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Analytical Thinking</h4>
                      <p className="text-sm text-muted-foreground">Systematic, logical approach to problem-solving</p>
                    </div>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
                      {Math.round((pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100)}%
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 rounded-full relative">
                    <Slider
                      defaultValue={[neuralTuning?.analytical ?? 0.5]}
                      value={[pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5]}
                      onValueChange={(value) => handleParameterChange('analytical', value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Flexible</span>
                    <span>Balanced</span>
                    <span>Structured</span>
                  </div>
                </div>
                
                {/* Intuitive */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Intuitive Thinking</h4>
                      <p className="text-sm text-muted-foreground">Pattern recognition and insight-based approach</p>
                    </div>
                    <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800">
                      {Math.round((pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100)}%
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-gradient-to-r from-purple-100 to-pink-200 dark:from-purple-900 dark:to-pink-800 rounded-full relative">
                    <Slider
                      defaultValue={[neuralTuning?.intuitive ?? 0.5]}
                      value={[pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5]}
                      onValueChange={(value) => handleParameterChange('intuitive', value)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="absolute inset-0"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Methodical</span>
                    <span>Balanced</span>
                    <span>Intuitive</span>
                  </div>
                </div>
                
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-indigo-500 mt-1" />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Understanding Cognitive Parameters</h5>
                      <p className="text-sm text-muted-foreground">
                        These parameters work together to form your neural extension's thinking style. 
                        You can emphasize both analytical and intuitive approaches independently to create a 
                        balanced cognitive profile tailored to your needs.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Expertise Focus Tab */}
          <TabsContent value="expertise" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <CardTitle>Domain Expertise</CardTitle>
                </div>
                <CardDescription>
                  Set which knowledge domains your neural extension should specialize in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableSpecialties.map((specialty) => (
                    <Card key={specialty.id} className={`border ${
                      (pendingChanges.specialties?.[specialty.id] ?? neuralTuning?.specialties?.[specialty.id])
                        ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40'
                        : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">{specialty.name}</h3>
                          <Switch
                            checked={!!(pendingChanges.specialties?.[specialty.id] ?? neuralTuning?.specialties?.[specialty.id])}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                handleSpecialtyChange(specialty.id, [0.7]); // Default value when turned on
                              } else {
                                // Create a copy of specialties without this one
                                const { [specialty.id]: _, ...rest } = pendingChanges.specialties || {};
                                setPendingChanges(prev => ({
                                  ...prev,
                                  specialties: rest
                                }));
                                setUnsavedChanges(true);
                              }
                            }}
                          />
                        </div>
                        
                        {(pendingChanges.specialties?.[specialty.id] ?? neuralTuning?.specialties?.[specialty.id]) && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Focus Level</span>
                              <span className="text-sm font-medium">
                                {Math.round((pendingChanges.specialties?.[specialty.id] ?? neuralTuning?.specialties?.[specialty.id] ?? 0) * 100)}%
                              </span>
                            </div>
                            <Slider
                              defaultValue={[neuralTuning?.specialties?.[specialty.id] ?? 0.7]}
                              value={[pendingChanges.specialties?.[specialty.id] ?? neuralTuning?.specialties?.[specialty.id] ?? 0.7]}
                              onValueChange={(value) => handleSpecialtyChange(specialty.id, value)}
                              min={0.1}
                              max={1}
                              step={0.01}
                              disabled={!(pendingChanges.specialties?.[specialty.id] ?? neuralTuning?.specialties?.[specialty.id])}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-indigo-500 mt-1" />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Specialization Impact</h5>
                      <p className="text-sm text-muted-foreground">
                        Specializing in fewer domains increases expertise depth, while broader 
                        coverage provides more versatility. Your neural extension will learn 
                        faster in selected domains and prioritize these areas in responses.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Learning Focus Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <CardTitle>Learning Directives</CardTitle>
                </div>
                <CardDescription>
                  Direct what your neural extension should actively learn and prioritize
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add learning directive..."
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newFocus.trim()) {
                        handleAddFocus();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    onClick={() => {
                      if (newFocus.trim()) {
                        handleAddFocus();
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="ml-1">Add</span>
                  </Button>
                </div>
                
                <div className="border rounded-lg divide-y">
                  {(pendingChanges.learningFocus ?? neuralTuning?.learningFocus)?.length ? (
                    (pendingChanges.learningFocus ?? neuralTuning?.learningFocus)?.map((focus: string, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-indigo-500" />
                          <span>{focus}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFocus(index)}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 flex flex-col items-center justify-center text-center">
                      <Lightbulb className="h-10 w-10 text-muted-foreground/30 mb-2" />
                      <p className="text-muted-foreground">
                        No learning directives set yet. Add topics you'd like your neural extension to focus on learning.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-1" />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Learning Directives Guide</h5>
                      <p className="text-sm text-muted-foreground">
                        These directives help your neural extension prioritize what to learn.
                        Good examples include "Contemporary AI research", "Marketing strategies",
                        or "Climate science developments".
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Save/Activation Button Row */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            className="flex-1 gap-2"
            variant="outline"
            disabled={!unsavedChanges || isUpdating}
            onClick={saveChanges}
          >
            <Save className="h-4 w-4" />
            <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
          </Button>
          
          <Button 
            className={`flex-1 py-6 px-8 text-white ${
              isActivated 
                ? "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            }`}
            onClick={() => {
              activateNeura();
              
              toast({
                title: "Neura Activated",
                description: "Your neural extension is now active with your configured parameters!",
                variant: "default",
              });
            }}
            disabled={isUpdating || isActivated}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2" />
                <span className="text-lg font-semibold">
                  {isActivated ? "Neura Active" : "Activate Neura"}
                </span>
              </div>
              <span className="text-xs mt-1">
                {isActivated 
                  ? "Your neural extension is active and running" 
                  : "Apply all settings and activate your neural extension"}
              </span>
            </div>
          </Button>
        </div>
      </main>
    </div>
  );
}