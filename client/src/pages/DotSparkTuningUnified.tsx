import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
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
  Cpu,
  Database,
  NetworkIcon,
  Brain,
  Star,
  Rocket,
  LucideIcon,
  Bookmark,
  Plus,
  X,
  Target,
  Microscope,
  GraduationCap,
  Dices,
  FlaskConical,
  BookOpen,
  Trophy,
  Check,
  Puzzle,
  CircleSlash,
  CircleX,
  Aperture
} from 'lucide-react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Clock5, 
  Combine,
  GitMerge, 
  Info, 
  Layers, 
  Save 
} from 'lucide-react';

export default function DotSparkTuningUnified() {
  const [_, setLocation] = useLocation();
  const [newFocus, setNewFocus] = useState('');
  
  // Using fixed "My DotSpark Neura" name for all users
  const dotsparkName = 'My DotSpark Neura';
  
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
  
  // Destructure tuning params for easier access with default values for all properties
  const tuning = {
    creativity: 0.5,
    precision: 0.5,
    speed: 0.5,
    adaptability: 0.5,
    analytical: 0.5,
    intuitive: 0.5,
    memoryRetention: 0.5,
    memoryRecall: 0.5,
    connectionStrength: 0.5,
    patternRecognition: 0.5,
    learningRate: 0.5,
    conceptIntegration: 0.5,
    curiosityIndex: 0.5,
    specialties: {},
    learningFocus: [],
    ...status?.tuning
  };
  
  // State for capacity metrics with animation
  const [processingEfficiency, setProcessingEfficiency] = useState<number>(65);
  const [memoryCapacity, setMemoryCapacity] = useState<number>(48);
  const [learningRate, setLearningRate] = useState<number>(52);
  const [specializationLevel, setSpecializationLevel] = useState<number>(35);
  
  // Create a safe status object with default values
  const safeStatus = {
    isActive: true,
    gameElements: {
      level: 1,
      experience: 0,
      experienceRequired: 100,
      unlockedCapabilities: [],
      achievements: [],
      stats: {
        messagesProcessed: 0,
        insightsGenerated: 0,
        connectionsFormed: 0,
        adaptationScore: 0
      }
    },
    topicsTracked: [],
    adaptationLevel: 0,
    patternsDetected: [],
    ...status
  };

  // Update capacity metrics when status changes
  useEffect(() => {
    const { gameElements, tuning } = safeStatus;
    setProcessingEfficiency(gameElements?.stats?.adaptationScore || 0);
    setMemoryCapacity(Math.min(100, ((gameElements?.stats?.connectionsFormed || 0) / 50) * 100));
    setLearningRate(Math.min(100, ((gameElements?.stats?.insightsGenerated || 0) / 20) * 100));
    setSpecializationLevel(Math.min(100, (Object.keys(tuning?.specialties || {}).length / 8) * 100));
  }, [safeStatus]);
  
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
    } else if (paramName === 'adaptability') {
      // Adaptability affects all metrics slightly
      setProcessingEfficiency(prev => Math.min(100, prev + (paramValue > 0.6 ? 2 : -1)));
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.5 ? 1 : -0.5)));
      setLearningRate(prev => Math.min(100, prev + (paramValue > 0.7 ? 3 : -1)));
    } else if (paramName === 'analytical') {
      // Analytical thinking affects memory capacity and precision
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.5 ? 2 : -1)));
    } else if (paramName === 'intuitive') {
      // Intuitive thinking affects learning rate
      setLearningRate(prev => Math.min(100, prev + (paramValue > 0.6 ? 3 : -1)));
    } else if (paramName === 'memoryRetention' || paramName === 'memoryRecall') {
      // Memory parameters affect memory capacity
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.6 ? 2 : -1)));
    } else if (paramName === 'learningRate' || paramName === 'conceptIntegration' || paramName === 'curiosityIndex') {
      // Learning parameters affect learning rate
      setLearningRate(prev => Math.min(100, prev + (paramValue > 0.6 ? 2 : -1)));
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
  
  // Function to format parameter value as percentage
  const formatParam = (value?: number) => {
    return Math.round((value || 0) * 100) + '%';
  };
  
  // Function to get adaptability level label
  const getAdaptabilityLabel = (value: number): string => {
    if (value < 0.2) return "Conservative";
    if (value < 0.4) return "Stable";
    if (value < 0.6) return "Flexible";
    if (value < 0.8) return "Adaptive";
    return "Highly Dynamic";
  };
  
  // Function to get adaptability description
  const getAdaptabilityDescription = (value: number): string => {
    if (value < 0.2) return "Maintains consistent behavior patterns";
    if (value < 0.4) return "Gradually incorporates new information";
    if (value < 0.6) return "Balanced adaptation to changing contexts";
    if (value < 0.8) return "Quickly adjusts to new information streams";
    return "Rapidly evolves thinking patterns";
  };

  // Define slider parameter components for reuse
  type SliderParamProps = {
    name: string;
    paramKey: string;
    value: number;
    icon: React.ReactNode;
    leftLabel: string;
    rightLabel: string;
    description: string;
    gradient?: string;
  };

  const SliderParam = ({ 
    name, 
    paramKey, 
    value, 
    icon, 
    leftLabel, 
    rightLabel, 
    description,
    gradient = "from-blue-200 to-violet-200 dark:from-blue-950 dark:to-violet-950" 
  }: SliderParamProps) => (
    <div className="space-y-1.5 mb-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium flex items-center gap-1.5">
          {icon}
          <span>{name}</span>
        </label>
        <div className="flex items-center">
          <Badge variant="outline" className="font-mono">
            {formatParam(value)}
          </Badge>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                <Lightbulb className="h-3.5 w-3.5" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{name}</h4>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <Slider
          defaultValue={[value]}
          max={1}
          step={0.01}
          onValueChange={(val) => handleParameterChange(paramKey, val)}
          className={`[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:${gradient}`}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <BrainCircuit className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your DotSpark...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center text-center max-w-md gap-2">
          <BrainCircuit className="h-10 w-10 text-destructive" />
          <h2 className="text-xl font-bold">Connection Error</h2>
          <p className="text-muted-foreground">
            Unable to connect to your DotSpark. Please try again or contact support if the issue persists.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span>{dotsparkName}</span>
        </h1>
        <Button variant="ghost" onClick={() => setLocation('/activate-dotspark')}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </div>
      
      {/* Main Neura capacity metrics */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            <span>My Neura Capacity Metrics</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {/* Processing Efficiency */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
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
                    strokeDasharray={`${2 * Math.PI * 45 * (processingEfficiency / 100)} ${2 * Math.PI * 45}`}
                    strokeDashoffset={(2 * Math.PI * 45) * 0.25}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-purple-700 dark:text-purple-400">{Math.round(processingEfficiency)}%</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-center">Processing</p>
                <p className="text-xs text-muted-foreground">Efficiency</p>
              </div>
            </div>
            
            {/* Memory Capacity */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
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
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{Math.round(memoryCapacity)}%</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-center">Memory</p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </div>
            </div>
            
            {/* Learning Rate */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
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
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{Math.round(learningRate)}%</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-center">Learning</p>
                <p className="text-xs text-muted-foreground">Capability</p>
              </div>
            </div>
            
            {/* Specialization */}
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto">
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
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{Math.round(specializationLevel)}%</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-center">Domain</p>
                <p className="text-xs text-muted-foreground">Expertise</p>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            <p>Adjust the parameters below to tune how your DotSpark processes, learns, and communicates</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Tuning Parameters */}
      <Tabs defaultValue="cognitive" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="cognitive" className="flex items-center gap-1.5">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Cognitive</span>
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Memory</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Learning</span>
          </TabsTrigger>
          <TabsTrigger value="specialties" className="flex items-center gap-1.5">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Specialties</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Cognitive Processing Tab */}
        <TabsContent value="cognitive">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Cognitive Processing
              </CardTitle>
              <CardDescription>
                Configure how your DotSpark processes information and thinks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Thinking Style Trade-off*/}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Dices className="h-4 w-4 text-rose-500" />
                    <span>Thinking Style</span>
                  </label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Thinking Style</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls the balance between precise, structured thinking and creative, out-of-the-box thinking.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className={`p-3 rounded-lg border ${tuning.creativity < 0.5 ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-800'} cursor-pointer transition-colors`}
                    onClick={() => handleParameterChange('creativity', [0.2])}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full ${tuning.creativity < 0.5 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'} flex items-center justify-center`}>
                        {tuning.creativity < 0.5 && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <h4 className="font-medium text-sm">Logical Precision</h4>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">Favors structured, methodical thinking with clear patterns and precise reasoning</p>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg border ${tuning.creativity >= 0.5 ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-800'} cursor-pointer transition-colors`}
                    onClick={() => handleParameterChange('creativity', [0.8])}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full ${tuning.creativity >= 0.5 ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'} flex items-center justify-center`}>
                        {tuning.creativity >= 0.5 && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <h4 className="font-medium text-sm">Creative Exploration</h4>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">Embraces divergent thinking with multiple perspectives and novel connections</p>
                  </div>
                </div>
                
                <Slider
                  defaultValue={[tuning.creativity || 0.5]}
                  max={1}
                  step={0.01}
                  onValueChange={(val) => handleParameterChange('creativity', val)}
                  className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-200 [&>span:first-child]:to-rose-200 [&>span:first-child]:dark:from-blue-950 [&>span:first-child]:dark:to-rose-950"
                />
              </div>
              
              {/* Processing Mode Multiple Choice */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <BrainCog className="h-4 w-4 text-violet-500" />
                    <span>Processing Mode</span>
                  </label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Processing Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Determines how your DotSpark processes and analyzes information, with each mode optimized for different types of thinking.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div 
                    className={`p-2 rounded-lg border ${tuning.analytical > 0.6 && tuning.intuitive < 0.4 ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-800'} cursor-pointer transition-colors text-center`}
                    onClick={() => {
                      handleParameterChange('analytical', [0.8]);
                      handleParameterChange('intuitive', [0.3]);
                    }}
                  >
                    <div className="h-8 flex items-center justify-center">
                      <Microscope className={`h-6 w-6 ${tuning.analytical > 0.6 && tuning.intuitive < 0.4 ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    <h4 className="font-medium text-sm">Analytical</h4>
                    <p className="text-xs text-muted-foreground">Systematic reasoning with logical steps</p>
                  </div>
                  
                  <div 
                    className={`p-2 rounded-lg border ${tuning.analytical > 0.4 && tuning.analytical < 0.6 && tuning.intuitive > 0.4 && tuning.intuitive < 0.6 ? 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-800'} cursor-pointer transition-colors text-center`}
                    onClick={() => {
                      handleParameterChange('analytical', [0.5]);
                      handleParameterChange('intuitive', [0.5]);
                    }}
                  >
                    <div className="h-8 flex items-center justify-center">
                      <BrainCircuit className={`h-6 w-6 ${tuning.analytical > 0.4 && tuning.analytical < 0.6 && tuning.intuitive > 0.4 && tuning.intuitive < 0.6 ? 'text-purple-500' : 'text-gray-400'}`} />
                    </div>
                    <h4 className="font-medium text-sm">Balanced</h4>
                    <p className="text-xs text-muted-foreground">Integrates both analytical and intuitive approaches</p>
                  </div>
                  
                  <div 
                    className={`p-2 rounded-lg border ${tuning.analytical < 0.4 && tuning.intuitive > 0.6 ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-800'} cursor-pointer transition-colors text-center`}
                    onClick={() => {
                      handleParameterChange('analytical', [0.3]);
                      handleParameterChange('intuitive', [0.8]);
                    }}
                  >
                    <div className="h-8 flex items-center justify-center">
                      <Lightbulb className={`h-6 w-6 ${tuning.analytical < 0.4 && tuning.intuitive > 0.6 ? 'text-amber-500' : 'text-gray-400'}`} />
                    </div>
                    <h4 className="font-medium text-sm">Intuitive</h4>
                    <p className="text-xs text-muted-foreground">Relies on patterns and holistic understanding</p>
                  </div>
                </div>
              </div>
              
              {/* Depth-Speed Trade-off Meter */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-green-500" />
                    <span>Processing Trade-off</span>
                  </label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Processing Trade-off</h4>
                        <p className="text-sm text-muted-foreground">
                          Balance between deep, thorough processing and rapid responses. This represents the classic trade-off between depth and speed.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="relative pt-5">
                  <Slider
                    defaultValue={[tuning.speed || 0.5]}
                    max={1}
                    step={0.01}
                    onValueChange={(val) => handleParameterChange('speed', val)}
                    className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-200 [&>span:first-child]:to-emerald-200 [&>span:first-child]:dark:from-blue-950 [&>span:first-child]:dark:to-emerald-950"
                  />
                  
                  <div className="flex justify-between mt-2">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Deep Processing</span>
                      <span className="text-xs text-muted-foreground">Thorough & comprehensive</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Rapid Processing</span>
                      <span className="text-xs text-muted-foreground">Fast & efficient</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-0 left-0 w-full flex justify-between px-1">
                    <div className={`text-xs ${tuning.speed < 0.3 ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-muted-foreground'}`}>
                      Depth+
                    </div>
                    <div className={`text-xs ${tuning.speed > 0.3 && tuning.speed < 0.7 ? 'text-purple-700 dark:text-purple-300 font-medium' : 'text-muted-foreground'}`}>
                      Balanced
                    </div>
                    <div className={`text-xs ${tuning.speed > 0.7 ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-muted-foreground'}`}>
                      Speed+
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Adaptability Levels */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Rocket className="h-4 w-4 text-amber-500" />
                    <span>Adaptability Level</span>
                  </label>
                  <Badge variant="outline" className="font-mono">
                    Level {Math.floor((tuning.adaptability || 0) * 10)}
                  </Badge>
                </div>
                
                <div className="relative">
                  <div className="grid grid-cols-5 gap-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`h-4 rounded ${level < Math.floor((tuning.adaptability || 0) * 5) ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-3 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={tuning.adaptability <= 0.2 ? 'text-gray-400 border-gray-200' : ''}
                      disabled={tuning.adaptability <= 0.2}
                      onClick={() => handleParameterChange('adaptability', [(tuning.adaptability || 0) - 0.2])}
                    >
                      Lower
                    </Button>
                    
                    <div className="text-sm text-center">
                      <span className="font-medium">{getAdaptabilityLabel(tuning.adaptability || 0)}</span>
                      <p className="text-xs text-muted-foreground">{getAdaptabilityDescription(tuning.adaptability || 0)}</p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={tuning.adaptability >= 0.8 ? 'text-gray-400 border-gray-200' : ''}
                      disabled={tuning.adaptability >= 0.8}
                      onClick={() => handleParameterChange('adaptability', [(tuning.adaptability || 0) + 0.2])}
                    >
                      Higher
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Neural Activation Pattern */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span>Neural Activation Pattern</span>
                  </label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Neural Activation Pattern</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls how your DotSpark's neural network activates when processing information, affecting the emergent properties of its thinking.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="relative">
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({length: 9}).map((_, i) => {
                        const isActive = (i < Math.floor((tuning.precision || 0.5) * 9));
                        const brightness = Math.min(100, 60 + i * 5);
                        
                        return (
                          <div 
                            key={i} 
                            className={`h-3 rounded ${isActive ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            style={{opacity: isActive ? 0.5 + (i/18) : 0.2}}
                          />
                        );
                      })}
                    </div>
                    <div className="text-center mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 text-xs w-full"
                        onClick={() => handleParameterChange('precision', [
                          tuning.precision === 0.3 ? 0.8 : tuning.precision === 0.8 ? 0.5 : 0.3
                        ])}
                      >
                        {tuning.precision === 0.8 ? 'Focused' : tuning.precision === 0.5 ? 'Balanced' : 'Diffuse'}
                      </Button>
                      <span className="text-xs text-muted-foreground">Precision</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({length: 9}).map((_, i) => {
                        const patternVal = (tuning.patternRecognition || 0.5);
                        const isActive = i === 0 || i === 2 || i === 4 || i === 6 || i === 8 ? 
                                        (patternVal > 0.6) : 
                                        (patternVal > 0.3);
                        
                        return (
                          <div 
                            key={i} 
                            className={`h-3 rounded ${isActive ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            style={{opacity: isActive ? 0.5 + (Math.abs(4-i)/8) : 0.2}}
                          />
                        );
                      })}
                    </div>
                    <div className="text-center mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 text-xs w-full"
                        onClick={() => handleParameterChange('patternRecognition', [
                          tuning.patternRecognition === 0.3 ? 0.7 : tuning.patternRecognition === 0.7 ? 0.5 : 0.3
                        ])}
                      >
                        {tuning.patternRecognition === 0.7 ? 'Connected' : tuning.patternRecognition === 0.5 ? 'Integrated' : 'Independent'}
                      </Button>
                      <span className="text-xs text-muted-foreground">Pattern Recognition</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Context Window Size */}
              <div className="space-y-3 border rounded-lg p-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-indigo-500" />
                    <span>Context Window Size</span>
                  </label>
                  <Badge variant="outline" className="font-mono">
                    {Math.round(((tuning.memoryRetention || 0.5) * 64) + 4)}K tokens
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${(tuning.memoryRetention || 0.5) * 100}%` }}
                    />
                    
                    <div className="absolute w-full h-full flex items-center justify-between px-2">
                      <span className="text-xs font-medium text-indigo-800 dark:text-indigo-200 drop-shadow-sm">
                        Base Memory
                      </span>
                      <span className="text-xs font-medium text-indigo-800 dark:text-indigo-200 drop-shadow-sm">
                        Extended Capacity
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleParameterChange('memoryRetention', [0.2])}
                      className={tuning.memoryRetention <= 0.3 ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 dark:border-indigo-700' : ''}
                    >
                      Compact
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleParameterChange('memoryRetention', [0.5])}
                      className={tuning.memoryRetention > 0.3 && tuning.memoryRetention < 0.7 ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 dark:border-indigo-700' : ''}
                    >
                      Standard
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleParameterChange('memoryRetention', [0.8])}
                      className={tuning.memoryRetention >= 0.7 ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 dark:border-indigo-700' : ''}
                    >
                      Extended
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Determines how much information your DotSpark can hold in memory at once. Larger windows enable more complex analyses but require more cognitive resources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Memory Tab */}
        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" />
                Memory Systems
              </CardTitle>
              <CardDescription>
                Configure how your DotSpark stores and recalls information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Memory Pathway Multiple-Choice */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <BrainCircuit className="h-4 w-4 text-blue-500" />
                    <span>Memory Pathway</span>
                  </label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Memory Pathway</h4>
                        <p className="text-sm text-muted-foreground">
                          Defines how information is encoded and processed in your DotSpark's memory system, affecting recall, retention, and knowledge application.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <RadioGroup 
                  className="grid grid-cols-3 gap-2"
                  defaultValue={tuning.memoryRecall > 0.7 ? "semantic" : tuning.memoryRecall < 0.3 ? "episodic" : "hybrid"}
                  onValueChange={(val) => {
                    if (val === "semantic") {
                      handleParameterChange('memoryRecall', [0.8]);
                      handleParameterChange('connectionStrength', [0.7]);
                    } else if (val === "episodic") {
                      handleParameterChange('memoryRecall', [0.2]);
                      handleParameterChange('connectionStrength', [0.4]);
                    } else {
                      handleParameterChange('memoryRecall', [0.5]);
                      handleParameterChange('connectionStrength', [0.5]);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="episodic" id="episodic" className="sr-only peer" />
                    <Label
                      htmlFor="episodic"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                    >
                      <Clock5 className="mb-2 h-6 w-6" />
                      <div className="text-center space-y-0.5">
                        <p className="text-sm font-medium leading-none">Episodic</p>
                        <p className="text-xs text-muted-foreground">Experiential memory</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hybrid" id="hybrid" className="sr-only peer" />
                    <Label
                      htmlFor="hybrid"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                    >
                      <Combine className="mb-2 h-6 w-6" />
                      <div className="text-center space-y-0.5">
                        <p className="text-sm font-medium leading-none">Hybrid</p>
                        <p className="text-xs text-muted-foreground">Balanced approach</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="semantic" id="semantic" className="sr-only peer" />
                    <Label
                      htmlFor="semantic"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                    >
                      <NetworkIcon className="mb-2 h-6 w-6" />
                      <div className="text-center space-y-0.5">
                        <p className="text-sm font-medium leading-none">Semantic</p>
                        <p className="text-xs text-muted-foreground">Conceptual networks</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Memory Retention Threshold */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Save className="h-4 w-4 text-cyan-500" />
                    <span>Memory Retention Threshold</span>
                  </label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Memory Retention Threshold</h4>
                        <p className="text-sm text-muted-foreground">
                          Determines which information is preserved in long-term memory. Higher thresholds prioritize only the most significant information.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="flex items-center justify-between px-1 pt-1">
                  <span className="text-xs">Low Threshold</span>
                  <span className="text-xs font-medium">
                    {tuning.memoryRetention < 0.3 ? "Almost Everything" : 
                     tuning.memoryRetention < 0.5 ? "Most Information" : 
                     tuning.memoryRetention < 0.7 ? "Important Details" : 
                     tuning.memoryRetention < 0.9 ? "Key Concepts" : "Critical Insights"}
                  </span>
                  <span className="text-xs">High Threshold</span>
                </div>
                
                <div className="p-1">
                  <Slider
                    defaultValue={[tuning.memoryRetention || 0.5]}
                    max={1}
                    step={0.01}
                    onValueChange={(val) => handleParameterChange('memoryRetention', val)}
                    className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-cyan-200 [&>span:first-child]:to-blue-200 [&>span:first-child]:dark:from-cyan-950 [&>span:first-child]:dark:to-blue-950"
                  />
                </div>
                
                <div className="flex justify-between px-2 gap-2">
                  <div className={`text-xs px-2 py-1 rounded-full ${tuning.memoryRetention < 0.3 ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                    Broad
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${tuning.memoryRetention >= 0.3 && tuning.memoryRetention < 0.7 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                    Balanced
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${tuning.memoryRetention >= 0.7 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                    Selective
                  </div>
                </div>
              </div>
              
              {/* Neural Connection Density */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <NetworkIcon className="h-4 w-4 text-violet-500" />
                    <span>Neural Connection Density</span>
                  </label>
                  <Badge>Level {Math.floor((tuning.connectionStrength || 0) * 10)}</Badge>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const connectionLevel = Math.ceil((tuning.connectionStrength || 0) * 5);
                    const isActive = level <= connectionLevel;
                    
                    return (
                      <div 
                        key={level}
                        className={`cursor-pointer transition-all rounded-md border ${isActive ? 'bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-800'}`}
                        onClick={() => handleParameterChange('connectionStrength', [level / 5])}
                      >
                        <div className="p-3 text-center">
                          <div className="flex justify-center">
                            <div className="relative w-8 h-8 mb-1">
                              {/* Simulated neural network with density based on level */}
                              {Array.from({length: level * 2}).map((_, i) => (
                                <div 
                                  key={i}
                                  className={`absolute w-1 h-1 rounded-full ${isActive ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                  style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                  }}
                                />
                              ))}
                              {Array.from({length: level * level}).map((_, i) => (
                                <div 
                                  key={i}
                                  className={`absolute h-px ${isActive ? 'bg-violet-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                                  style={{
                                    width: `${Math.random() * 50 + 10}%`,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 50}%`,
                                    transform: `rotate(${Math.random() * 360}deg)`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs font-medium">{level}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {tuning.connectionStrength < 0.3 ? 
                    "Sparse connections prioritize clear, distinct concepts with minimal interference." :
                    tuning.connectionStrength < 0.6 ?
                    "Balanced neural density enables moderate cross-referencing between related domains." :
                    "Dense neural network creates rich associations across multiple knowledge domains."}
                </p>
              </div>
              
              {/* Pattern Recognition Sensitivity */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Puzzle className="h-4 w-4 text-amber-500" />
                    <span>Pattern Recognition Sensitivity</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium flex justify-between">
                      <span>Threshold</span>
                      <span>{Math.round((1 - (tuning.patternRecognition || 0.5)) * 100)}%</span>
                    </label>
                    <Slider
                      defaultValue={[1 - (tuning.patternRecognition || 0.5)]}
                      max={1}
                      step={0.01}
                      onValueChange={(val) => handleParameterChange('patternRecognition', [1 - val[0]])}
                      className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-amber-200 [&>span:first-child]:to-amber-100 [&>span:first-child]:dark:from-amber-900 [&>span:first-child]:dark:to-amber-950"
                    />
                    <div className="flex justify-between">
                      <span className="text-xs">Low</span>
                      <span className="text-xs">High</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium flex justify-between">
                      <span>Range</span>
                      <span>{Math.round((tuning.patternRecognition || 0.5) * 100)}%</span>
                    </label>
                    <Slider
                      defaultValue={[tuning.patternRecognition || 0.5]}
                      max={1}
                      step={0.01}
                      onValueChange={(val) => handleParameterChange('patternRecognition', val)}
                      className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-amber-100 [&>span:first-child]:to-amber-300 [&>span:first-child]:dark:from-amber-950 [&>span:first-child]:dark:to-amber-900"
                    />
                    <div className="flex justify-between">
                      <span className="text-xs">Narrow</span>
                      <span className="text-xs">Wide</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-md border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-medium">Current pattern sensitivity:</p>
                      <p className="text-xs">
                        {tuning.patternRecognition < 0.3 ? 
                          "Conservative detection requiring strong evidence and clear similarities" :
                          tuning.patternRecognition < 0.6 ?
                          "Balanced pattern recognition with moderate sensitivity to similarities" :
                          "Highly sensitive pattern matching that identifies subtle connections"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Memory Integration Strategy */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <GitMerge className="h-4 w-4 text-blue-500" />
                    <span>Memory Integration Strategy</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant={tuning.memoryRecall < 0.4 && tuning.connectionStrength < 0.4 ? "default" : "outline"} 
                    className="h-auto py-3 flex flex-col items-center"
                    onClick={() => {
                      handleParameterChange('memoryRecall', [0.3]);
                      handleParameterChange('connectionStrength', [0.3]);
                    }}
                  >
                    <Layers className="h-5 w-5 mb-2" />
                    <div className="space-y-1 text-center">
                      <h4 className="text-xs font-medium">Segregated</h4>
                      <p className="text-xs text-muted-foreground">Keep domains separate</p>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={tuning.memoryRecall >= 0.4 && tuning.memoryRecall <= 0.6 && tuning.connectionStrength >= 0.4 && tuning.connectionStrength <= 0.6 ? "default" : "outline"} 
                    className="h-auto py-3 flex flex-col items-center"
                    onClick={() => {
                      handleParameterChange('memoryRecall', [0.5]);
                      handleParameterChange('connectionStrength', [0.5]);
                    }}
                  >
                    <GitMerge className="h-5 w-5 mb-2" />
                    <div className="space-y-1 text-center">
                      <h4 className="text-xs font-medium">Integrated</h4>
                      <p className="text-xs text-muted-foreground">Connect when relevant</p>
                    </div>
                  </Button>
                  
                  <Button 
                    variant={tuning.memoryRecall > 0.6 && tuning.connectionStrength > 0.6 ? "default" : "outline"} 
                    className="h-auto py-3 flex flex-col items-center"
                    onClick={() => {
                      handleParameterChange('memoryRecall', [0.7]);
                      handleParameterChange('connectionStrength', [0.7]);
                    }}
                  >
                    <NetworkIcon className="h-5 w-5 mb-2" />
                    <div className="space-y-1 text-center">
                      <h4 className="text-xs font-medium">Holistic</h4>
                      <p className="text-xs text-muted-foreground">Unified knowledge base</p>
                    </div>
                  </Button>
                </div>
              </div>
              
              {/* Working Memory Buffer */}
              <div className="space-y-2 border rounded-lg p-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-indigo-500" />
                    <span>Working Memory Buffer</span>
                  </label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Working Memory Buffer</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls how many active concepts your DotSpark can manipulate simultaneously. This is separate from long-term storage and affects reasoning complexity.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="mt-2 space-y-2">
                  <Slider
                    defaultValue={[Math.floor((tuning.patternRecognition || 0.5) * 4) + 3]}
                    min={3}
                    max={7}
                    step={1}
                    onValueChange={(val) => handleParameterChange('patternRecognition', [(val[0] - 3) / 4])}
                  />
                  
                  <div className="flex justify-between">
                    <div className="text-center">
                      <div className="bg-gray-100 dark:bg-gray-800 w-8 h-8 rounded-md flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-mono">3</span>
                      </div>
                      <p className="text-xs">Basic</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-gray-100 dark:bg-gray-800 w-8 h-8 rounded-md flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-mono">5</span>
                      </div>
                      <p className="text-xs">Standard</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-gray-100 dark:bg-gray-800 w-8 h-8 rounded-md flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-mono">7</span>
                      </div>
                      <p className="text-xs">Advanced</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground pt-1">
                    Current buffer size: <span className="font-semibold text-foreground">{Math.floor((tuning.patternRecognition || 0.5) * 4) + 3} conceptual units</span> (affects cognitive load and reasoning complexity)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Learning Tab */}
        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                Learning Systems
              </CardTitle>
              <CardDescription>
                Configure how your DotSpark acquires and integrates new knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SliderParam
                name="Learning Speed"
                paramKey="learningRate"
                value={tuning.learningRate || 0.5}
                icon={<Sparkles className="h-4 w-4 text-amber-500" />}
                leftLabel="Gradual"
                rightLabel="Rapid"
                description="Determines how quickly your DotSpark absorbs new information and concepts."
                gradient="from-slate-200 to-amber-200 dark:from-slate-950 dark:to-amber-950"
              />
              
              <SliderParam
                name="Concept Integration"
                paramKey="conceptIntegration"
                value={tuning.conceptIntegration || 0.5}
                icon={<FlaskConical className="h-4 w-4 text-violet-500" />}
                leftLabel="Compartmentalized"
                rightLabel="Integrated"
                description="Controls how well new concepts are connected with existing knowledge."
                gradient="from-blue-200 to-violet-200 dark:from-blue-950 dark:to-violet-950"
              />
              
              <SliderParam
                name="Curiosity Index"
                paramKey="curiosityIndex"
                value={tuning.curiosityIndex || 0.5}
                icon={<Lightbulb className="h-4 w-4 text-yellow-500" />}
                leftLabel="Focused"
                rightLabel="Exploratory"
                description="Determines how much your DotSpark explores beyond its established knowledge domains."
                gradient="from-amber-200 to-yellow-200 dark:from-amber-950 dark:to-yellow-950"
              />
              
              {/* Learning Focus Areas */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  Learning Priorities
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                  {tuning.learningFocus?.length ? (
                    tuning.learningFocus.map((focus, index) => (
                      <div key={index} className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 py-1 pl-3 pr-1 text-sm">
                        {focus}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-full"
                          onClick={() => handleRemoveFocus(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="w-full text-center py-2 text-sm text-muted-foreground">
                      No learning priorities set yet. Add topics you want your DotSpark to focus on learning.
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    placeholder="Add a learning priority..."
                    className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddFocus()}
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleAddFocus}
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Add topics or domains you want your DotSpark to prioritize learning about.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Specialties Tab */}
        <TabsContent value="specialties">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Domain Expertise
              </CardTitle>
              <CardDescription>
                Configure which knowledge domains your DotSpark specializes in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableSpecialties.map((specialty) => (
                  <div key={specialty.id} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">{specialty.name}</label>
                      <Badge variant="outline" className="font-mono">
                        {formatParam(tuning.specialties?.[specialty.id])}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                      <Slider
                        defaultValue={[tuning.specialties?.[specialty.id] || 0]}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => handleSpecialtyChange(specialty.id, value)}
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-amber-100 [&>span:first-child]:to-amber-300 [&>span:first-child]:dark:from-amber-950 [&>span:first-child]:dark:to-amber-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Adjust the sliders to determine how much your DotSpark should specialize in each knowledge domain.
                Higher values mean more expertise in that area.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Game Elements Preview */}
      <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            DotSpark Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-100/50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                Level {status?.gameElements?.level || 1}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {status?.gameElements?.experience || 0} / {status?.gameElements?.experienceRequired || 1000} XP
              </span>
            </div>
          </div>
          
          <Progress 
            value={(status?.gameElements?.experience || 0) / (status?.gameElements?.experienceRequired || 1000) * 100}
            className="h-2 mb-6 bg-amber-100 dark:bg-amber-950"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                Unlocked Capabilities
              </h3>
              <ul className="space-y-1">
                {status?.gameElements?.unlockedCapabilities?.map((capability, i) => (
                  <li key={i} className="text-sm flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500" />
                Recent Achievements
              </h3>
              <ul className="space-y-1">
                {status?.gameElements?.achievements
                  ?.filter(a => a.unlocked)
                  .slice(0, 3)
                  .map((achievement, i) => (
                    <li key={i} className="text-sm flex items-center gap-1.5">
                      <Badge variant="outline" className="h-5 px-1 bg-amber-100/50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                        <Star className="h-3 w-3 fill-amber-500 mr-1" />
                        <span className="text-xs">{achievement.name}</span>
                      </Badge>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}