import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
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

export default function DotSparkTuningPage() {
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
  } = useDotSparkTuning();
  
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
            <CardDescription>Unable to connect to your DotSpark</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              There was an error connecting to your DotSpark. This could be due to network issues or your DotSpark may need to be reactivated.
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
        <Button variant="outline" onClick={() => setLocation('/dotspark-capacity')} className="gap-1.5">
          <Gauge className="h-4 w-4" />
          <span>View Capacity</span>
        </Button>
      </div>
      
      {/* DotSpark Level Card with Capacity Metrics */}
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
              <p className="text-xs mt-1 text-muted-foreground">Specialty</p>
            </div>
          </div>
          
          {/* Unlocked Capabilities */}
          <div className="mb-4">
            <span className="text-sm font-medium mb-2 inline-block">Unlocked Capabilities</span>
            <div className="flex flex-wrap gap-1.5">
              {gameElements?.unlockedCapabilities?.map((capability, index) => (
                <Badge key={index} variant="outline" className="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tuning Interface */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>DotSpark Tuning Interface</CardTitle>
          <CardDescription>Adjust these parameters to customize how your DotSpark processes and responds</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="hygiene" className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-sky-400"></div>
                <span>Hygiene</span>
              </TabsTrigger>
              <TabsTrigger value="expertise" className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span>Expertise</span>
              </TabsTrigger>
              <TabsTrigger value="personal" className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Personal</span>
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Learning</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Hygiene Tab - Core Parameters */}
            <TabsContent value="hygiene" className="space-y-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="dotspark-name" className="text-sm font-medium">
                  DotSpark Name
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
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Creativity</label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">About Creativity</h4>
                        <p className="text-sm text-muted-foreground">Affects the variety and uniqueness of responses. Higher creativity leads to more diverse but potentially less precise outputs.</p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="rounded-md border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-2">
                            <div className="font-semibold text-xs text-blue-700 dark:text-blue-400">Higher Values</div>
                            <p className="text-xs text-muted-foreground mt-1">More creative and diverse output</p>
                          </div>
                          <div className="rounded-md border border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2">
                            <div className="font-semibold text-xs text-amber-700 dark:text-amber-400">Lower Values</div>
                            <p className="text-xs text-muted-foreground mt-1">More consistent and predictable output</p>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <Slider
                    defaultValue={[tuning?.creativity || 0.5]}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleParameterChange('creativity', value)}
                    className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-indigo-200 [&>span:first-child]:to-violet-200 [&>span:first-child]:dark:from-indigo-950 [&>span:first-child]:dark:to-violet-950"
                  />
                  <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.creativity || 0) * 100)}%</span>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Conventional</span>
                  <span>Creative</span>
                </div>
              </div>
              
              {/* Precision Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Precision</label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">About Precision</h4>
                        <p className="text-sm text-muted-foreground">Controls accuracy and detail level. Higher precision leads to more factual and detailed responses but may limit creativity.</p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="rounded-md border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-2">
                            <div className="font-semibold text-xs text-blue-700 dark:text-blue-400">Higher Values</div>
                            <p className="text-xs text-muted-foreground mt-1">More factual and detailed output</p>
                          </div>
                          <div className="rounded-md border border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2">
                            <div className="font-semibold text-xs text-amber-700 dark:text-amber-400">Lower Values</div>
                            <p className="text-xs text-muted-foreground mt-1">More general and concise output</p>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <Slider
                    defaultValue={[tuning?.precision || 0.5]}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleParameterChange('precision', value)}
                    className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-200 [&>span:first-child]:to-sky-200 [&>span:first-child]:dark:from-blue-950 [&>span:first-child]:dark:to-sky-950"
                  />
                  <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.precision || 0) * 100)}%</span>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Generalized</span>
                  <span>Detailed</span>
                </div>
              </div>
              
              {/* Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Speed</label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">About Speed</h4>
                        <p className="text-sm text-muted-foreground">Controls response time vs. depth tradeoff. Higher speed leads to faster but potentially less thorough responses.</p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="rounded-md border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-2">
                            <div className="font-semibold text-xs text-blue-700 dark:text-blue-400">Higher Values</div>
                            <p className="text-xs text-muted-foreground mt-1">Faster response times</p>
                          </div>
                          <div className="rounded-md border border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2">
                            <div className="font-semibold text-xs text-amber-700 dark:text-amber-400">Lower Values</div>
                            <p className="text-xs text-muted-foreground mt-1">More thorough and considered responses</p>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <Slider
                    defaultValue={[tuning?.speed || 0.5]}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleParameterChange('speed', value)}
                    className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-emerald-200 [&>span:first-child]:to-green-200 [&>span:first-child]:dark:from-emerald-950 [&>span:first-child]:dark:to-green-950"
                  />
                  <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.speed || 0) * 100)}%</span>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Thorough</span>
                  <span>Rapid</span>
                </div>
              </div>
            </TabsContent>
            
            {/* Expertise Tab - Cognitive Style */}
            <TabsContent value="expertise" className="space-y-6">
              {/* Analytical Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Analytical Thinking</label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">About Analytical Thinking</h4>
                        <p className="text-sm text-muted-foreground">Controls emphasis on logical, systematic thinking processes. Higher analytical thinking leads to more structured output.</p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="rounded-md border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-2">
                            <div className="font-semibold text-xs text-blue-700 dark:text-blue-400">Higher Values</div>
                            <p className="text-xs text-muted-foreground mt-1">More structured, logical analysis</p>
                          </div>
                          <div className="rounded-md border border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2">
                            <div className="font-semibold text-xs text-amber-700 dark:text-amber-400">Lower Values</div>
                            <p className="text-xs text-muted-foreground mt-1">Less emphasis on systematic analysis</p>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <Slider
                    defaultValue={[tuning?.analytical || 0.5]}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleParameterChange('analytical', value)}
                    className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-200 [&>span:first-child]:to-cyan-200 [&>span:first-child]:dark:from-blue-950 [&>span:first-child]:dark:to-cyan-950"
                  />
                  <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.analytical || 0) * 100)}%</span>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Flexible</span>
                  <span>Systematic</span>
                </div>
              </div>
              
              {/* Intuitive Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Intuitive Thinking</label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">About Intuitive Thinking</h4>
                        <p className="text-sm text-muted-foreground">Controls emphasis on pattern recognition and insight generation. Higher intuitive thinking leads to more abstract connections.</p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="rounded-md border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-2">
                            <div className="font-semibold text-xs text-blue-700 dark:text-blue-400">Higher Values</div>
                            <p className="text-xs text-muted-foreground mt-1">More pattern recognition and insight</p>
                          </div>
                          <div className="rounded-md border border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2">
                            <div className="font-semibold text-xs text-amber-700 dark:text-amber-400">Lower Values</div>
                            <p className="text-xs text-muted-foreground mt-1">Less emphasis on abstract connections</p>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <Slider
                    defaultValue={[tuning?.intuitive || 0.5]}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleParameterChange('intuitive', value)}
                    className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-purple-200 [&>span:first-child]:to-violet-200 [&>span:first-child]:dark:from-purple-950 [&>span:first-child]:dark:to-violet-950"
                  />
                  <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.intuitive || 0) * 100)}%</span>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Concrete</span>
                  <span>Abstract</span>
                </div>
              </div>
              
              {/* Specialties - Grid of sliders */}
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Domain Specialties</h3>
                  <span className="text-xs text-muted-foreground">Adjust focus level for each domain</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {availableSpecialties.map((specialty) => {
                    const specialtyValue = tuning?.specialties?.[specialty.id] || 0;
                    
                    return (
                      <div key={specialty.id} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-sm">{specialty.name}</label>
                          <span className="text-xs text-muted-foreground">{Math.round(specialtyValue * 100)}%</span>
                        </div>
                        
                        <Slider
                          defaultValue={[specialtyValue]}
                          max={1}
                          step={0.01}
                          onValueChange={(value) => handleSpecialtyChange(specialty.id, value)}
                          className={cn(
                            "[&>span:first-child]:h-1.5",
                            specialty.id === 'tech' && "[&>span:first-child]:bg-blue-200 dark:[&>span:first-child]:bg-blue-900",
                            specialty.id === 'business' && "[&>span:first-child]:bg-amber-200 dark:[&>span:first-child]:bg-amber-900",
                            specialty.id === 'science' && "[&>span:first-child]:bg-emerald-200 dark:[&>span:first-child]:bg-emerald-900",
                            specialty.id === 'creative' && "[&>span:first-child]:bg-violet-200 dark:[&>span:first-child]:bg-violet-900",
                            specialty.id === 'health' && "[&>span:first-child]:bg-green-200 dark:[&>span:first-child]:bg-green-900",
                            specialty.id === 'finance' && "[&>span:first-child]:bg-cyan-200 dark:[&>span:first-child]:bg-cyan-900",
                            specialty.id === 'education' && "[&>span:first-child]:bg-indigo-200 dark:[&>span:first-child]:bg-indigo-900",
                            specialty.id === 'social' && "[&>span:first-child]:bg-orange-200 dark:[&>span:first-child]:bg-orange-900",
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Achievements</h3>
                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30">
                    {gameElements?.achievements?.filter(a => a.unlocked).length || 0} / {gameElements?.achievements?.length || 0} Unlocked
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {gameElements?.achievements?.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        achievement.unlocked 
                          ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                      )}>
                        {achievement.unlocked ? (
                          <Star className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium">{achievement.name}</h4>
                          {achievement.unlocked && (
                            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{achievement.description}</p>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              achievement.unlocked 
                                ? "bg-green-500 dark:bg-green-600" 
                                : "bg-blue-400 dark:bg-blue-600"
                            )} 
                            style={{ width: `${achievement.progress * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Stats */}
              <div className="space-y-4 mt-6">
                <h3 className="text-sm font-medium">DotSpark Stats</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Messages Processed */}
                  <div className="p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Messages</h4>
                        <p className="text-xs text-muted-foreground">Total processed</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                      {gameElements?.stats?.messagesProcessed || 0}
                    </div>
                  </div>
                  
                  {/* Insights Generated */}
                  <div className="p-4 rounded-lg border border-violet-100 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Insights</h4>
                        <p className="text-xs text-muted-foreground">Total generated</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-violet-700 dark:text-violet-400">
                      {gameElements?.stats?.insightsGenerated || 0}
                    </div>
                  </div>
                  
                  {/* Connections Formed */}
                  <div className="p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BrainCog className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Connections</h4>
                        <p className="text-xs text-muted-foreground">Total formed</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {gameElements?.stats?.connectionsFormed || 0}
                    </div>
                  </div>
                  
                  {/* Adaptation Score */}
                  <div className="p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Adaptation</h4>
                        <p className="text-xs text-muted-foreground">Learning score</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      {gameElements?.stats?.adaptationScore || 0}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Learning Tab */}
            <TabsContent value="learning" className="space-y-6">
              {/* Learning Focus */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Learning Focus</h3>
                  <span className="text-xs text-muted-foreground">Tell your DotSpark what to prioritize</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {tuning?.learningFocus?.map((focus, index) => (
                    <div key={index} className="group flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 py-1 pl-3 pr-1.5 text-sm">
                      <span>{focus}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 rounded-full opacity-60 group-hover:opacity-100 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-800/60"
                        onClick={() => handleRemoveFocus(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {(tuning?.learningFocus?.length === 0) && (
                    <div className="text-sm text-muted-foreground italic">No learning focus areas defined yet</div>
                  )}
                </div>
                
                {/* Add new focus area */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new learning focus area..."
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddFocus();
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                    onClick={handleAddFocus}
                    disabled={!newFocus.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  Learning focus areas guide what your DotSpark will prioritize learning about
                </p>
              </div>
              
              {/* Topics Tracked */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Topics Being Tracked</h3>
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                    {status?.topicsTracked?.length || 0} Topics
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {status?.topicsTracked?.map((topic, index) => (
                    <div key={index} className="rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 py-1 px-3 text-sm">
                      {topic}
                    </div>
                  ))}
                  
                  {(status?.topicsTracked?.length === 0) && (
                    <div className="text-sm text-muted-foreground italic">No topics being tracked yet</div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  Topics are automatically identified from your interactions and entries
                </p>
              </div>
              
              {/* Detected Patterns */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Detected Patterns</h3>
                  <span className="text-xs text-muted-foreground">Recurring themes in your content</span>
                </div>
                
                <div className="space-y-3">
                  {status?.patternsDetected?.map((pattern, index) => (
                    <div key={index} className="rounded-lg border border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">{pattern.pattern}</h4>
                        <Badge variant="outline" className="bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          {Math.round(pattern.frequency * 100)}% Frequency
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {pattern.examples.map((example, i) => (
                          <p key={i} className="text-xs text-muted-foreground">"{example}"</p>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {(status?.patternsDetected?.length === 0) && (
                    <div className="text-sm text-muted-foreground italic">No patterns detected yet</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Unlocked Capabilities Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Unlocked Capabilities</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {gameElements?.unlockedCapabilities?.map((capability, index) => (
            <Card key={index} className="border-indigo-100 dark:border-indigo-900/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {capability}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {capability === 'Pattern Recognition' && 'Identifies recurring themes and structures in your content.'}
                  {capability === 'Topic Analysis' && 'Extracts and categorizes the main topics from your entries.'}
                  {capability === 'Auto-Summarization' && 'Automatically creates concise summaries of longer content.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// LockIcon component for achievements
function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}