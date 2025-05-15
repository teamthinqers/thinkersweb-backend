import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useNeuralTuning } from '@/hooks/useNeuralTuning';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BrainCircuit, 
  Sparkles, 
  Zap, 
  Gauge, 
  BrainCog, 
  Lightbulb, 
  ChevronLeft,
  ChevronRight, 
  MoreHorizontal, 
  X,
  Plus,
  Save,
  Target,
  Bookmark,
  Star,
  Check
} from 'lucide-react';
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';

export default function NeuralTuningPage() {
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('hygiene');
  const [newFocus, setNewFocus] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [dotsparkName, setDotsparkName] = useState(localStorage.getItem('dotsparkName') || 'My DotSpark');
  
  const { 
    status, 
    isLoading, 
    isError, 
    availableSpecialties,
    updateTuning,
    isUpdating,
    updateLearningFocus,
    isUpdatingFocus
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
  
  // Function to handle slider value changes
  const handleParameterChange = (paramName: string, value: number[]) => {
    const paramValue = value[0];
    updateTuning({ [paramName]: paramValue });
    
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
    updateTuning({
      specialties: {
        [specialtyId]: specialtyValue
      }
    });
    
    // Update specialization level based on specialty strength
    setSpecializationLevel(prev => {
      const currentSpecialties = Object.keys(tuning?.specialties || {}).length;
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
    updateLearningFocus(updatedFocus);
    setNewFocus('');
  };
  
  // Function to remove a focus area
  const handleRemoveFocus = (index: number) => {
    const updatedFocus = [...(status?.tuning?.learningFocus || [])];
    updatedFocus.splice(index, 1);
    updateLearningFocus(updatedFocus);
  };
  
  // Function to handle DotSpark name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setDotsparkName(newName);
    localStorage.setItem('dotsparkName', newName);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800"></div>
          <div className="h-8 w-48 bg-purple-200 dark:bg-purple-800 rounded"></div>
        </div>
        
        <div className="h-12 w-full bg-purple-200 dark:bg-purple-800 rounded mb-6"></div>
        
        <div className="grid gap-6">
          <div className="h-48 bg-purple-100 dark:bg-purple-900/40 rounded-lg"></div>
          <div className="h-48 bg-purple-100 dark:bg-purple-900/40 rounded-lg"></div>
          <div className="h-48 bg-purple-100 dark:bg-purple-900/40 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => setLocation('/')} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">DotSpark Tuning</h1>
        </div>
        
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Connection Error</CardTitle>
            <CardDescription>Unable to connect to your neural extension</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              There was an error connecting to your neural extension. This could be due to network issues or your neural extension may need to be reactivated.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Extract values from status for rendering
  const { gameElements, tuning } = status || { gameElements: undefined, tuning: undefined };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/')} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">DotSpark Tuning</h1>
        </div>
        <Button variant="outline" onClick={() => setLocation('/neural-capacity')} className="gap-1.5">
          <Gauge className="h-4 w-4" />
          <span>View Capacity</span>
        </Button>
      </div>
      
      {/* Neural Extension Level Card with Capacity Metrics */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-950 border border-purple-100 dark:border-purple-900/50 overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-purple-200/30 to-indigo-200/10 dark:from-purple-800/20 dark:to-indigo-800/5 rounded-full blur-3xl"></div>
        </div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-700 dark:text-purple-400" />
              <CardTitle>
                <span className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{dotsparkName}</span>
              </CardTitle>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/50">
              Level {gameElements?.level || 1}
            </Badge>
          </div>
          <CardDescription>Configure how your cognitive extension processes information</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4 relative z-10">
          {/* Experience Progress */}
          <div className="mb-4">
            <div className="flex justify-between mb-1.5 text-sm font-medium">
              <span>Experience</span>
              <span>{gameElements?.experience || 0} / {gameElements?.experienceRequired || 1000} XP</span>
            </div>
            <Progress value={(gameElements?.experience || 0) / (gameElements?.experienceRequired || 1000) * 100} className="h-2 bg-purple-100 dark:bg-purple-950" />
          </div>
          
          {/* Capacity Metrics */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {/* Processing Efficiency */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto">
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
                    strokeDashoffset={(2 * Math.PI * 45) * 0.25}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400 transition-all duration-500 ease-out">{Math.round(processingEfficiency)}%</span>
                </div>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">Processing</p>
            </div>
            
            {/* Memory Capacity */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto">
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
                    strokeDashoffset={(2 * Math.PI * 45) * 0.25}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-400 transition-all duration-500 ease-out">{Math.round(memoryCapacity)}%</span>
                </div>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">Memory</p>
            </div>
            
            {/* Learning Rate */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto">
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
                    strokeDasharray={`${2 * Math.PI * 45 * (learningRate / 100)} ${2 * Math.PI * 45}`}
                    strokeDashoffset={(2 * Math.PI * 45) * 0.25}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 transition-all duration-500 ease-out">{Math.round(learningRate)}%</span>
                </div>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">Learning</p>
            </div>
            
            {/* Specialization */}
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-amber-100 dark:text-amber-950" 
                    strokeWidth="8" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-amber-500 transition-all duration-500 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray={`${2 * Math.PI * 45 * (specializationLevel / 100)} ${2 * Math.PI * 45}`}
                    strokeDashoffset={(2 * Math.PI * 45) * 0.25}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-400 transition-all duration-500 ease-out">{Math.round(specializationLevel)}%</span>
                </div>
              </div>
              <p className="text-xs mt-1 text-muted-foreground">Specialties</p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mb-2">
            <p>Tuning your neural extension affects how it processes information and generates insights. Each parameter adjustment adapts your extension to better match your cognitive preferences.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Four layers for neural tuning */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="hygiene" className="group">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm flex items-center gap-1">
                <span className="inline-block w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                Hygiene
              </span>
              <span className="h-1 w-full bg-indigo-300/30 group-data-[state=active]:bg-indigo-500 rounded-full transition-colors duration-300"></span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="expertise" className="group">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm flex items-center gap-1">
                <span className="inline-block w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                Expertise
              </span>
              <span className="h-1 w-full bg-blue-300/30 group-data-[state=active]:bg-blue-500 rounded-full transition-colors duration-300"></span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="personal" className="group">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm flex items-center gap-1">
                <span className="inline-block w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">3</span>
                Personal
              </span>
              <span className="h-1 w-full bg-emerald-300/30 group-data-[state=active]:bg-emerald-500 rounded-full transition-colors duration-300"></span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="learning" className="group">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm flex items-center gap-1">
                <span className="inline-block w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">4</span>
                Learning
              </span>
              <span className="h-1 w-full bg-amber-300/30 group-data-[state=active]:bg-amber-500 rounded-full transition-colors duration-300"></span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        {/* LAYER 1: Hygiene Setup - Quick defaults */}
        <TabsContent value="hygiene" className="space-y-6">
          <Card className="border-indigo-100 dark:border-indigo-900/40 overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-indigo-200/30 to-purple-200/10 dark:from-indigo-800/20 dark:to-purple-800/5 rounded-full blur-3xl"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle>Neural Hygiene Setup</CardTitle>
                  <CardDescription>Select a preset configuration to instantly activate your neural extension</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Neural Extension Name */}
              <div className="mb-6">
                <label htmlFor="neural-name" className="block text-sm font-medium mb-2">
                  Name Your Neural Extension
                </label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12a6 6 0 0 0 12 0c0-1.39-.5-2.68-1.34-3.7.3-1.2.58-2.1.95-2.8a1 1 0 0 0-.17-1.14 1.8 1.8 0 0 0-2.27-.17 6 6 0 0 0-10.32 4.68A5.77 5.77 0 0 0 4.5 12c0 3.14 2.56 5.7 5.68 5.7 1.38 0 2.58-.75 3.32-1.2a10.8 10.8 0 0 0 3.5 0c.33.19.94.47 1.6.5a1.5 1.5 0 0 0 1.26-.63c.3-.38.36-.9.25-1.37C19.75 13.75 19.5 12.75 19.5 12a6 6 0 0 0-.28-1.81"></path><path d="M14 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0"></path><path d="M8 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0"></path></svg>
                  <Input
                    id="dotspark-name"
                    value={dotsparkName}
                    onChange={handleNameChange}
                    className="pl-10 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 dark:focus:border-indigo-500"
                    placeholder="Enter a name for your DotSpark"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Give your DotSpark a unique name to help personalize your experience
                </p>
              </div>

              {/* Creativity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <Sparkles className="h-4 w-4 text-pink-500" />
                        <label htmlFor="creativity" className="text-sm font-medium">
                          Creativity
                        </label>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Creativity Parameter</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls how creative and varied the neural extension's outputs will be. Higher values produce more unique and unexpected connections.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.creativity || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="creativity"
                  defaultValue={[(tuning?.creativity || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('creativity', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Logical</span>
                  <span>Creative</span>
                </div>
              </div>
              
              {/* Precision Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <Target className="h-4 w-4 text-blue-500" />
                        <label htmlFor="precision" className="text-sm font-medium">
                          Precision
                        </label>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Precision Parameter</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls the accuracy and detail level in the neural extension's processing. Higher values produce more accurate and detailed insights.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.precision || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="precision"
                  defaultValue={[(tuning?.precision || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('precision', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Broad</span>
                  <span>Precise</span>
                </div>
              </div>
              
              {/* Speed Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <label htmlFor="speed" className="text-sm font-medium">
                          Processing Speed
                        </label>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Processing Speed Parameter</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls the balance between speed and depth of processing. Higher values prioritize faster responses over deeper analysis.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.speed || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="speed"
                  defaultValue={[(tuning?.speed || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('speed', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Deep</span>
                  <span>Fast</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cognitive Style Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-indigo-500" />
                Cognitive Style
              </CardTitle>
              <CardDescription>Adjust the thinking style your neural extension emphasizes</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Analytical Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="analytical" className="text-sm font-medium flex items-center gap-1.5">
                    <BrainCog className="h-4 w-4 text-blue-600" />
                    Analytical Thinking
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.analytical || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="analytical"
                  defaultValue={[(tuning?.analytical || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('analytical', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              
              {/* Intuitive Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="intuitive" className="text-sm font-medium flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Intuitive Thinking
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.intuitive || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="intuitive"
                  defaultValue={[(tuning?.intuitive || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('intuitive', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Specialties Tab */}
        <TabsContent value="specialties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Domain Specialties
              </CardTitle>
              <CardDescription>Adjust how your neural extension specializes in different knowledge domains</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                <p>Higher values mean your neural extension will emphasize that knowledge domain when processing information and generating insights.</p>
              </div>
              
              {availableSpecialties.map((specialty) => (
                <div key={specialty.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor={`specialty-${specialty.id}`} className="text-sm font-medium">
                      {specialty.name}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(((tuning?.specialties?.[specialty.id]) || 0) * 100)}%
                    </span>
                  </div>
                  <Slider
                    id={`specialty-${specialty.id}`}
                    defaultValue={[((tuning?.specialties?.[specialty.id]) || 0) * 100]}
                    max={100}
                    step={5}
                    onValueCommit={(value) => handleSpecialtyChange(specialty.id, [value[0] / 100])}
                    className="py-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Learning Focus Tab */}
        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-green-500" />
                Learning Focus
              </CardTitle>
              <CardDescription>Direct your neural extension to focus on specific topics or skills</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                <p>Your neural extension will prioritize content related to these topics when learning and generating insights.</p>
              </div>
              
              {/* Add new focus area */}
              <div className="flex gap-2">
                <Input 
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  placeholder="Add a learning focus area"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFocus()}
                />
                <Button 
                  onClick={handleAddFocus} 
                  size="icon"
                  disabled={isUpdatingFocus || !newFocus.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Current focus areas */}
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Current Focus Areas</h3>
                {(!tuning?.learningFocus || tuning.learningFocus.length === 0) ? (
                  <div className="text-sm text-muted-foreground italic">
                    No focus areas defined yet. Add some above to guide your neural extension's learning.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tuning.learningFocus.map((focus, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/30"
                      >
                        {focus}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 rounded-full p-0 text-green-700 dark:text-green-400 hover:bg-green-200/50 dark:hover:bg-green-900/30"
                          onClick={() => handleRemoveFocus(index)}
                          disabled={isUpdatingFocus}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Achievements Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>Track your neural extension's learning progress</CardDescription>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {gameElements?.achievements?.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-3">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full mt-0.5",
                        achievement.unlocked 
                          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/60 dark:text-yellow-400" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {achievement.unlocked ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <LockIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "text-sm font-medium",
                            achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {achievement.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(achievement.progress * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <Progress 
                          value={achievement.progress * 100} 
                          className={cn(
                            "h-1.5",
                            achievement.unlocked 
                              ? "bg-yellow-100 dark:bg-yellow-950/40" 
                              : "bg-muted"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Unlocked Capabilities Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Unlocked Capabilities
              </CardTitle>
              <CardDescription>Features your neural extension has learned</CardDescription>
            </CardHeader>
            
            <CardContent>
              {(!gameElements?.unlockedCapabilities || gameElements.unlockedCapabilities.length === 0) ? (
                <div className="text-sm text-muted-foreground italic">
                  No capabilities unlocked yet. Continue using your neural extension to unlock new features.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {gameElements.unlockedCapabilities.map((capability, index) => (
                    <Badge 
                      key={index}
                      className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:hover:bg-purple-900/30"
                    >
                      {capability}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Lock icon component
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}