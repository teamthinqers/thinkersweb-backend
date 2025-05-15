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
  Check
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

export default function DotSparkTuningUnified() {
  const [_, setLocation] = useLocation();
  const [newFocus, setNewFocus] = useState('');
  
  // Using fixed "My DotSpark" name for all users
  const dotsparkName = 'My DotSpark';
  
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
  
  // Destructure tuning params for easier access
  const tuning = status?.tuning || {};
  
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
      
      {/* Main capacity metrics */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gauge className="h-5 w-5 text-blue-500" />
            <span>DotSpark Capacity Metrics</span>
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
            <CardContent className="space-y-4">
              <SliderParam
                name="Thinking Style"
                paramKey="creativity"
                value={tuning.creativity || 0.5}
                icon={<Dices className="h-4 w-4 text-rose-500" />}
                leftLabel="Precise"
                rightLabel="Creative"
                description="Controls the balance between precise, structured thinking and creative, out-of-the-box thinking."
                gradient="from-blue-200 to-rose-200 dark:from-blue-950 dark:to-rose-950"
              />
              
              <SliderParam
                name="Analytical Depth"
                paramKey="precision"
                value={tuning.precision || 0.5}
                icon={<Microscope className="h-4 w-4 text-blue-500" />}
                leftLabel="Overview"
                rightLabel="Deep Analysis"
                description="Determines how deeply your DotSpark analyzes information. Higher values emphasize thorough, detailed analysis."
                gradient="from-emerald-200 to-blue-200 dark:from-emerald-950 dark:to-blue-950"
              />
              
              <SliderParam
                name="Processing Speed"
                paramKey="speed"
                value={tuning.speed || 0.5}
                icon={<Cpu className="h-4 w-4 text-green-500" />}
                leftLabel="Thorough"
                rightLabel="Rapid"
                description="Balances processing speed with depth. Higher values optimize for quicker responses with potentially less depth."
                gradient="from-amber-200 to-emerald-200 dark:from-amber-950 dark:to-emerald-950"
              />
              
              <SliderParam
                name="Adaptability"
                paramKey="adaptability"
                value={tuning.adaptability || 0.5}
                icon={<Rocket className="h-4 w-4 text-amber-500" />}
                leftLabel="Stable"
                rightLabel="Adaptive"
                description="Determines how quickly your DotSpark adapts to new information and changes its thinking patterns."
                gradient="from-purple-200 to-amber-200 dark:from-purple-950 dark:to-amber-950"
              />
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
            <CardContent className="space-y-4">
              <SliderParam
                name="Memory Retention"
                paramKey="memoryRetention"
                value={tuning.memoryRetention || 0.5}
                icon={<Bookmark className="h-4 w-4 text-indigo-500" />}
                leftLabel="Short-term"
                rightLabel="Long-term"
                description="Controls how strongly information is stored in memory. Higher values prioritize long-term retention."
                gradient="from-slate-200 to-indigo-200 dark:from-slate-950 dark:to-indigo-950"
              />
              
              <SliderParam
                name="Memory Recall"
                paramKey="memoryRecall"
                value={tuning.memoryRecall || 0.5}
                icon={<Zap className="h-4 w-4 text-amber-500" />}
                leftLabel="Contextual"
                rightLabel="Immediate"
                description="Determines how efficiently information is retrieved. Higher values prioritize quick access to stored information."
                gradient="from-blue-200 to-amber-200 dark:from-blue-950 dark:to-amber-950"
              />
              
              <SliderParam
                name="Connection Strength"
                paramKey="connectionStrength"
                value={tuning.connectionStrength || 0.5}
                icon={<NetworkIcon className="h-4 w-4 text-violet-500" />}
                leftLabel="Independent"
                rightLabel="Connected"
                description="Controls how strongly concepts are linked together in your DotSpark's memory network."
                gradient="from-cyan-200 to-violet-200 dark:from-cyan-950 dark:to-violet-950"
              />
              
              <SliderParam
                name="Pattern Recognition"
                paramKey="patternRecognition"
                value={tuning.patternRecognition || 0.5}
                icon={<Target className="h-4 w-4 text-rose-500" />}
                leftLabel="Specific"
                rightLabel="Abstract"
                description="Determines how easily your DotSpark identifies patterns across different pieces of information."
                gradient="from-emerald-200 to-rose-200 dark:from-emerald-950 dark:to-rose-950"
              />
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
            <Trophy className="h-5 w-5 text-amber-500" />
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
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
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