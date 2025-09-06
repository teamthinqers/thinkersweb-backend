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
  ChevronRight, 
  MoreHorizontal, 
  X,
  Plus,
  Save,
  Target,
  Bookmark,
  Star,
  Check,
  Network,
  BookCopy,
  Brain,
  Database,
  Code2,
  Users2,
  Briefcase,
  Microscope,
  HelpCircle,
  GraduationCap,
  Trophy,
  Shield,
  Edit
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

export default function SectionedDotSparkTuningPage() {
  const [_, setLocation] = useLocation();
  const [newFocus, setNewFocus] = useState('');
  // Using fixed "My DotSpark" name for all users
  const dotsparkName = 'My DotSpark';
  
  // Removed sectioned navigation for a more integrated design
  
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
  
  // Section completion tracking
  const [sectionCompletion, setSectionCompletion] = useState({
    cognitive: false,
    memory: false,
    learning: false,
    expertise: false
  });
  
  // Active section state
  const [activeSection, setActiveSection] = useState<'cognitive' | 'memory' | 'learning' | 'expertise'>('cognitive');
  
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
      markSectionComplete('cognitive');
    } else if (paramName === 'precision') {
      // Precision affects memory capacity
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.6 ? 3 : -1)));
      markSectionComplete('cognitive');
    } else if (paramName === 'speed') {
      // Speed affects processing efficiency but can reduce memory
      setProcessingEfficiency(prev => Math.min(100, prev + (paramValue > 0.7 ? 4 : -1)));
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.7 ? -2 : 1)));
      markSectionComplete('cognitive');
    } else if (paramName === 'analytical') {
      // Analytical thinking affects memory capacity and precision
      setMemoryCapacity(prev => Math.min(100, prev + (paramValue > 0.5 ? 2 : -1)));
      markSectionComplete('memory');
    } else if (paramName === 'intuitive') {
      // Intuitive thinking affects learning rate
      setLearningRate(prev => Math.min(100, prev + (paramValue > 0.6 ? 3 : -1)));
      markSectionComplete('memory');
    } else if (paramName === 'memoryRetention' || paramName === 'memoryRecall') {
      markSectionComplete('memory');
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
    
    markSectionComplete('expertise');
  };
  
  // Function to add a new focus area
  const handleAddFocus = () => {
    if (!newFocus.trim()) return;
    
    const updatedFocus = [...(status?.tuning?.learningFocus || []), newFocus.trim()];
    updateLearningFocus(updatedFocus);
    setNewFocus('');
    
    if (updatedFocus.length > 0) {
      markSectionComplete('learning');
    }
  };
  
  // Function to remove a focus area
  const handleRemoveFocus = (index: number) => {
    const updatedFocus = [...(status?.tuning?.learningFocus || [])];
    updatedFocus.splice(index, 1);
    updateLearningFocus(updatedFocus);
  };
  
  // Function to handle name changes (placeholder for compatibility)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Name is fixed as "My DotSpark" - this function is kept for compatibility
  };
  
  // Function to mark a section as complete
  const markSectionComplete = (section: string) => {
    setSectionCompletion(prev => ({
      ...prev,
      [section]: true
    }));
  };
  
  // Function to navigate to next section
  const goToNextSection = () => {
    const sections: ('cognitive' | 'memory' | 'learning' | 'expertise')[] = ['cognitive', 'memory', 'learning', 'expertise'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      if (nextSection) {
        setActiveSection(nextSection);
      }
    }
  };
  
  // Function to navigate to previous section
  const goToPreviousSection = () => {
    const sections: ('cognitive' | 'memory' | 'learning' | 'expertise')[] = ['cognitive', 'memory', 'learning', 'expertise'];
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex > 0) {
      const previousSection = sections[currentIndex - 1];
      if (previousSection) {
        setActiveSection(previousSection);
      }
    }
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
          <h1 className="text-2xl font-bold">DotSpark Configuration</h1>
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
          <h1 className="text-2xl font-bold">DotSpark Configuration</h1>
        </div>
        <Button variant="outline" onClick={() => setLocation('/dotspark-capacity')} className="gap-1.5">
          <Gauge className="h-4 w-4" />
          <span>View Capacity</span>
        </Button>
      </div>
      
      {/* Setup Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Setup Progress</h2>
          <span className="text-sm text-muted-foreground">
            Step {activeSection === 'cognitive' ? '1' : 
                 activeSection === 'memory' ? '2' : 
                 activeSection === 'learning' ? '3' : 
                 activeSection === 'expertise' ? '4' : '1'} of 4
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${activeSection === 'cognitive' ? 25 : 
                      activeSection === 'memory' ? 50 : 
                      activeSection === 'learning' ? 75 : 
                      activeSection === 'expertise' ? 100 : 25}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <div className={`flex flex-col items-center ${activeSection === 'cognitive' ? 'text-violet-600 dark:text-violet-400 font-medium' : ''}`}>
            <div className={`w-2 h-2 rounded-full mb-1 ${activeSection === 'cognitive' || sectionCompletion.cognitive ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <span>Cognitive</span>
          </div>
          <div className={`flex flex-col items-center ${activeSection === 'memory' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>
            <div className={`w-2 h-2 rounded-full mb-1 ${activeSection === 'memory' || sectionCompletion.memory ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <span>Memory</span>
          </div>
          <div className={`flex flex-col items-center ${activeSection === 'learning' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
            <div className={`w-2 h-2 rounded-full mb-1 ${activeSection === 'learning' || sectionCompletion.learning ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <span>Learning</span>
          </div>
          <div className={`flex flex-col items-center ${activeSection === 'expertise' ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}`}>
            <div className={`w-2 h-2 rounded-full mb-1 ${activeSection === 'expertise' || sectionCompletion.expertise ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <span>Expertise</span>
          </div>
        </div>
      </div>
      
      {/* DotSpark Level Card with Capacity Metrics */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-950 border border-purple-100 dark:border-purple-900/50 overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-purple-200/30 to-indigo-200/10 dark:from-purple-800/20 dark:to-indigo-800/5 rounded-full blur-3xl"></div>
        </div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/dotspark-logo-wordmark.png" alt="DotSpark" className="h-5 w-auto rounded-sm" />
              <CardTitle>
                <span className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{dotsparkName}</span>
              </CardTitle>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/50">
              Level {gameElements?.level || 1}
            </Badge>
          </div>
          <CardDescription>Configure your cognitive extension to match your thought patterns</CardDescription>
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
              <p className="text-xs font-medium text-center">Processing</p>
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
              <p className="text-xs font-medium text-center">Memory</p>
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
              <p className="text-xs font-medium text-center">Learning</p>
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
              <p className="text-xs font-medium text-center">Expertise</p>
            </div>
          </div>
          
          {/* Summary of what we're configuring */}
          <div className="text-xs text-muted-foreground">
            <p>Configuring how your DotSpark processes, stores, and learns from information across different domains</p>
          </div>
        </CardContent>
      </Card>
      
      {/* DotSpark Add-Ons Configuration Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">DotSpark Add-Ons</h2>
        <p className="text-muted-foreground mb-6">
          Configure each of these DotSpark Add-Ons to mirror your natural style and intelligence while communicating with AI.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* CogniShield Configuration Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-amber-200 dark:border-amber-800 flex flex-col h-full relative">
            <div className="h-48 bg-gradient-to-br from-amber-800 to-orange-900 flex items-center justify-center relative overflow-hidden">
              {/* Subtle organic spark network */}
              <div className="absolute inset-0">
                <div className="absolute top-6 left-8 w-0.5 h-0.5 bg-amber-400 rounded-full opacity-70"></div>
                <div className="absolute top-16 right-10 w-1 h-1 bg-orange-400 rounded-full opacity-60"></div>
                <div className="absolute bottom-12 left-16 w-0.5 h-0.5 bg-yellow-500 rounded-full opacity-80"></div>
                <div className="absolute bottom-8 right-8 w-1 h-1 bg-amber-500 rounded-full opacity-50"></div>
                <div className="absolute top-20 left-1/2 w-0.5 h-0.5 bg-orange-500 rounded-full opacity-70"></div>
                {/* Connecting lines */}
                <div className="absolute top-6 left-8 w-8 h-px bg-gradient-to-r from-amber-400 to-transparent opacity-30"></div>
                <div className="absolute bottom-12 left-16 w-12 h-px bg-gradient-to-r from-yellow-500 to-transparent opacity-20"></div>
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1),transparent_70%)]"></div>
              <div className="z-10 p-6 flex flex-col items-center">
                <div className="rounded-full bg-amber-900/40 p-4 backdrop-blur-sm mb-4 border border-amber-600/30">
                  <Shield className="h-12 w-12 text-amber-100" />
                </div>
                <h3 className="text-xl font-bold text-amber-50">CogniShield (Coming Soon)</h3>
              </div>
            </div>
            <CardContent className="p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 flex flex-col justify-between min-h-[120px]">
              <p className="text-muted-foreground mb-4 flex-1">
                Configure Cogni Shield to retain your cognitive identity while taking help of AI.
              </p>
              <div className="flex justify-center mt-auto">
                <Button 
                  className="flex items-center justify-center gap-2 w-48 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white group-hover:translate-y-0 translate-y-1 transition-all duration-300 h-10 relative"
                  onClick={() => {
                    setLocation('/cognitive-shield-config');
                  }}
                >
                  <Shield className="h-4 w-4" />
                  Configure Shield
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Configuration Interface - Sectioned */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>
              {activeSection === 'cognitive' && 'Cognitive Processing'}
              {activeSection === 'memory' && 'Memory Configuration'}
              {activeSection === 'learning' && 'Learning Priorities'}
              {activeSection === 'expertise' && 'Expertise Domains'}
            </CardTitle>
            <CardDescription>
              {activeSection === 'cognitive' && 'Configure how your DotSpark processes information'}
              {activeSection === 'memory' && 'Define how your DotSpark stores and recalls information'}
              {activeSection === 'learning' && 'Set priorities for what your DotSpark should learn'}
              {activeSection === 'expertise' && 'Customize knowledge domains your DotSpark specializes in'}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={goToPreviousSection}
              disabled={activeSection === 'cognitive'}
              className={cn(
                "gap-1",
                activeSection === 'cognitive' ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button 
              size="sm" 
              variant={activeSection === 'expertise' ? "default" : "outline"}
              onClick={goToNextSection}
              disabled={activeSection === 'expertise'}
              className={cn(
                "gap-1",
                activeSection === 'expertise' ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              {activeSection === 'expertise' ? "Complete" : "Next"}
              {activeSection !== 'expertise' && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* COGNITIVE PROCESSING SECTION */}
            {activeSection === 'cognitive' && (
              <div className="space-y-6">
                {/* DotSpark Identity */}
                <div className="p-4 rounded-lg border border-violet-200 dark:border-violet-800 shadow-sm bg-violet-50/50 dark:bg-violet-950/20">
                  <h3 className="text-lg font-medium flex items-center gap-1.5 mb-3 bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
                    <BrainCircuit className="h-5 w-5 text-violet-500" />
                    <span>Your Brain Extension</span>
                  </h3>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="dotspark-name" className="text-sm font-medium">
                      DotSpark Name
                    </label>
                    <div className="relative">
                      <BrainCircuit className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-500" />
                      <Input
                        id="dotspark-name"
                        value={dotsparkName}
                        onChange={handleNameChange}
                        className="pl-10 border-violet-200 dark:border-violet-800 focus:border-violet-500 dark:focus:border-violet-500"
                        placeholder="Name your cognitive extension"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Give your DotSpark a unique name that resonates with your extended thinking style
                    </p>
                  </div>
                </div>
                
                {/* Thought Process Section */}
                <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm bg-amber-50/50 dark:bg-amber-950/20">
                  <h3 className="text-base font-medium flex items-center gap-1.5 mb-3 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Thought Generation</span>
                  </h3>
                  
                  {/* Divergent Thinking (formerly Creativity) */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <span>Thought Generation</span>
                      </label>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Thought Generation Style</h4>
                            <p className="text-sm text-muted-foreground">
                              How does your brain typically approach problems? Convergent thinking focuses on finding a single correct answer, while divergent thinking explores multiple possibilities.
                            </p>
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
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-amber-200 [&>span:first-child]:to-rose-200 [&>span:first-child]:dark:from-amber-950 [&>span:first-child]:dark:to-rose-950"
                      />
                      <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.creativity || 0) * 100)}%</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-amber-700 dark:text-amber-300">Convergent</span>
                      <span className="font-medium text-rose-700 dark:text-rose-300">Divergent</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>Single correct solution</span>
                      <span>Multiple creative possibilities</span>
                    </div>
                  </div>
                </div>
                
                {/* Information Processing Section */}
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
                  <h3 className="text-base font-medium flex items-center gap-1.5 mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>Information Processing</span>
                  </h3>
                  
                  {/* Depth vs Breadth (formerly Precision) */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <span>Processing Style</span>
                      </label>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Processing Style</h4>
                            <p className="text-sm text-muted-foreground">
                              How do you naturally process information? Breadth-focused thinking prioritizes the big picture, while depth-focused examines specific details thoroughly.
                            </p>
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
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-cyan-200 [&>span:first-child]:to-blue-200 [&>span:first-child]:dark:from-cyan-950 [&>span:first-child]:dark:to-blue-950"
                      />
                      <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.precision || 0) * 100)}%</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-cyan-700 dark:text-cyan-300">Breadth-focused</span>
                      <span className="font-medium text-blue-700 dark:text-blue-300">Depth-focused</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>Big picture overview</span>
                      <span>Detailed analysis</span>
                    </div>
                  </div>
                  
                  {/* Processing Speed (Deliberate vs. Quick) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <span>Thinking Pace</span>
                      </label>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Thinking Pace</h4>
                            <p className="text-sm text-muted-foreground">
                              How do you typically pace your thinking? Deliberate thinking is careful and methodical, while quick thinking provides rapid responses but may miss nuances.
                            </p>
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
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-indigo-200 [&>span:first-child]:to-orange-200 [&>span:first-child]:dark:from-indigo-950 [&>span:first-child]:dark:to-orange-950"
                      />
                      <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.speed || 0) * 100)}%</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">Deliberate</span>
                      <span className="font-medium text-orange-700 dark:text-orange-300">Quick</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span>Careful consideration</span>
                      <span>Rapid response</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* MEMORY SECTION */}
            {activeSection === 'memory' && (
              <div className="space-y-6">
                {/* Memory Overview */}
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
                  <h3 className="text-lg font-medium flex items-center gap-1.5 mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span>Memory Configuration</span>
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure how your DotSpark stores, organizes, and retrieves information. These settings impact how your cognitive extension remembers and connects different pieces of knowledge.
                  </p>
                </div>
                
                {/* Memory Capacity Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col items-center">
                    <div className="relative w-16 h-16 mx-auto mb-1">
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
                    <p className="text-xs font-medium text-center">Storage Capacity</p>
                  </div>
                  
                  <div className="p-3 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/20 flex flex-col items-center">
                    <div className="relative w-16 h-16 mx-auto mb-1">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="currentColor" 
                          className="text-cyan-100 dark:text-cyan-950" 
                          strokeWidth="8" 
                        />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="currentColor" 
                          className="text-cyan-500 transition-all duration-500 ease-out" 
                          strokeWidth="8" 
                          strokeDasharray={`${2 * Math.PI * 45 * ((tuning?.precision || 0.5) * 100 / 100)} ${2 * Math.PI * 45}`}
                          strokeDashoffset={(2 * Math.PI * 45) * 0.25}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-lg font-bold text-cyan-700 dark:text-cyan-400 transition-all duration-500 ease-out">{Math.round((tuning?.precision || 0.5) * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-center">Recall Accuracy</p>
                  </div>
                  
                  <div className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col items-center">
                    <div className="relative w-16 h-16 mx-auto mb-1">
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
                          strokeDasharray={`${2 * Math.PI * 45 * ((tuning?.analytical || 0.5) * 100 / 100)} ${2 * Math.PI * 45}`}
                          strokeDashoffset={(2 * Math.PI * 45) * 0.25}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400 transition-all duration-500 ease-out">{Math.round((tuning?.analytical || 0.5) * 100)}%</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-center">Connection Strength</p>
                  </div>
                  
                  <div className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col items-center">
                    <div className="relative w-16 h-16 mx-auto mb-1">
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
                        <span className="text-lg font-bold text-purple-700 dark:text-purple-400 transition-all duration-500 ease-out">{Math.round(processingEfficiency)}%</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-center">Retrieval Speed</p>
                  </div>
                </div>
                
                {/* Memory Retention */}
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm bg-white dark:bg-gray-950">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      <BrainCircuit className="h-4 w-4 text-blue-500" />
                      <span>Memory Retention</span>
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Memory Duration */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span>Retention Duration</span>
                        </label>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <p className="text-sm text-muted-foreground">
                              Controls how long your DotSpark retains information. Higher values prioritize long-term memory formation.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                        <Slider
                          defaultValue={[tuning?.precision || 0.5]}
                          max={1}
                          step={0.01}
                          onValueChange={(value) => handleParameterChange('memoryRetention', value)}
                          className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-cyan-200 [&>span:first-child]:to-blue-200 [&>span:first-child]:dark:from-cyan-950 [&>span:first-child]:dark:to-blue-950"
                        />
                        <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.precision || 0) * 100)}%</span>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-cyan-700 dark:text-cyan-300">Short-term focus</span>
                        <span className="font-medium text-blue-700 dark:text-blue-300">Long-term focus</span>
                      </div>
                    </div>
                    
                    {/* Memory Recall */}
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-indigo-500" />
                          <span>Recall Accuracy</span>
                        </label>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <p className="text-sm text-muted-foreground">
                              Controls the accuracy of information retrieval. Higher values prioritize precision over speed.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                        <Slider
                          defaultValue={[tuning?.analytical || 0.5]}
                          max={1}
                          step={0.01}
                          onValueChange={(value) => handleParameterChange('memoryRecall', value)}
                          className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-indigo-200 [&>span:first-child]:to-purple-200 [&>span:first-child]:dark:from-indigo-950 [&>span:first-child]:dark:to-purple-950"
                        />
                        <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.analytical || 0) * 100)}%</span>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-indigo-700 dark:text-indigo-300">Fast recall</span>
                        <span className="font-medium text-purple-700 dark:text-purple-300">Precise recall</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Connection Formation */}
                <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm bg-white dark:bg-gray-950">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
                      <Network className="h-4 w-4 text-purple-500" />
                      <span>Connection Formation</span>
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Control how your DotSpark forms connections between different pieces of information.
                    </p>
                    
                    {/* Connection Strength */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span>Connection Strength</span>
                        </label>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <p className="text-sm text-muted-foreground">
                              Controls how strongly different pieces of information are connected in your memory network.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      
                      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                        <Slider
                          defaultValue={[tuning?.intuitive || 0.5]}
                          max={1}
                          step={0.01}
                          onValueChange={(value) => handleParameterChange('intuitive', value)}
                          className="[&>span:first-child]:h-2 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-violet-200 [&>span:first-child]:to-purple-200 [&>span:first-child]:dark:from-violet-950 [&>span:first-child]:dark:to-purple-950"
                        />
                        <span className="w-12 text-sm text-muted-foreground">{Math.round((tuning?.intuitive || 0) * 100)}%</span>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-violet-700 dark:text-violet-300">Loose connections</span>
                        <span className="font-medium text-purple-700 dark:text-purple-300">Strong connections</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* LEARNING SECTION */}
            {activeSection === 'learning' && (
              <div className="space-y-6">
                {/* Learning Overview */}
                <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20">
                  <h3 className="text-lg font-medium flex items-center gap-1.5 mb-3 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                    <Bookmark className="h-5 w-5 text-emerald-500" />
                    <span>Continuous Learning</span>
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Guide your DotSpark's learning journey by defining what topics and skills you want it to explore and develop expertise in. Your DotSpark will prioritize these areas when processing information.
                  </p>
                </div>
                
                {/* Current Learning Focus */}
                <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm bg-white dark:bg-gray-950">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-emerald-500" />
                      <span>Your Learning Priorities</span>
                    </h3>
                    <span className="text-xs text-muted-foreground">Customize what your brain extension learns</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 min-h-[60px]">
                    {(tuning?.learningFocus?.length ?? 0) > 0 ? (
                      (tuning?.learningFocus || []).map((focus, index) => (
                        <div key={index} className="group flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 py-1.5 pl-3 pr-1.5 text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                          <span>{focus}</span>
                          <Button
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 rounded-full opacity-60 group-hover:opacity-100 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-200 dark:hover:bg-emerald-800/60"
                            onClick={() => handleRemoveFocus(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {focus}</span>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center py-4 text-sm text-muted-foreground">
                        No learning focus areas defined yet. Add some below!
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Input
                      value={newFocus}
                      onChange={(e) => setNewFocus(e.target.value)}
                      placeholder="Add a learning focus area (e.g., Machine Learning, Finance)..."
                      className="border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 dark:focus:border-emerald-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newFocus.trim()) {
                          e.preventDefault();
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
                  
                  <p className="text-xs text-muted-foreground">
                    These topics help your DotSpark prioritize what to learn and connect. Add subjects that matter to your thinking.
                  </p>
                </div>
                
                {/* Suggested Topics */}
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      <span>Suggested Learning Areas</span>
                    </h3>
                    <span className="text-xs text-muted-foreground">Based on your thinking patterns</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* In a real implementation, these would come from the API */}
                    {["Machine Learning", "Product Management", "UX Research", "Data Analysis", "Leadership", "Neural Networks", "Psychology", "Behavioral Economics"].map((topic) => (
                      <Badge key={topic} variant="outline" 
                        className={cn(
                          "py-1.5 px-3 text-sm cursor-pointer transition-colors",
                          "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30",
                          tuning?.learningFocus?.includes(topic) && "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700"
                        )}
                        onClick={() => {
                          if (!tuning?.learningFocus?.includes(topic)) {
                            const updatedFocus = [...(tuning?.learningFocus || []), topic];
                            updateLearningFocus(updatedFocus);
                          }
                        }}
                      >
                        {tuning?.learningFocus?.includes(topic) ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {topic}
                          </span>
                        ) : topic}
                      </Badge>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground italic">
                    Click on any topic to add it to your learning focus areas. Topics are generated based on your interactions and thinking style.
                  </p>
                </div>
              </div>
            )}
            
            {/* EXPERTISE SECTION */}
            {activeSection === 'expertise' && (
              <div className="space-y-6">
                {/* Expertise Overview */}
                <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm bg-indigo-50/50 dark:bg-indigo-950/20">
                  <h3 className="text-lg font-medium flex items-center gap-1.5 mb-3 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                    <GraduationCap className="h-5 w-5 text-indigo-500" />
                    <span>Domain Expertise</span>
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize your DotSpark's expertise areas to match your cognitive style and professional domains. These settings determine how your brain extension processes field-specific information.
                  </p>
                </div>
                
                {/* Expertise Domains Section */}
                <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-sm bg-indigo-50/50 dark:bg-indigo-950/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                      <Trophy className="h-4 w-4 text-indigo-500" />
                      <span>Domain Specialization</span>
                    </h3>
                    <span className="text-xs text-muted-foreground">Areas where your DotSpark excels</span>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Science */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Microscope className="h-4 w-4 text-emerald-500" />
                          <span>Science & Research</span>
                        </label>
                        <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                          {tuning?.specialties?.science ? Math.round(tuning.specialties.science * 100) : 0}%
                        </Badge>
                      </div>
                      <Slider
                        defaultValue={[tuning?.specialties?.science || 0]}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => handleSpecialtyChange('science', value)}
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-emerald-200 [&>span:first-child]:dark:bg-emerald-950"
                      />
                      <p className="text-xs text-muted-foreground">
                        Data analysis, research methodologies, hypothesis testing, and scientific principles
                      </p>
                    </div>
                    
                    {/* Business */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span>Business & Strategy</span>
                        </label>
                        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                          {tuning?.specialties?.business ? Math.round(tuning.specialties.business * 100) : 0}%
                        </Badge>
                      </div>
                      <Slider
                        defaultValue={[tuning?.specialties?.business || 0]}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => handleSpecialtyChange('business', value)}
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-blue-200 [&>span:first-child]:dark:bg-blue-950"
                      />
                      <p className="text-xs text-muted-foreground">
                        Management, marketing, finance, strategy, and organizational development
                      </p>
                    </div>
                    
                    {/* Creative */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>Creative & Arts</span>
                        </label>
                        <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                          {tuning?.specialties?.creative ? Math.round(tuning.specialties.creative * 100) : 0}%
                        </Badge>
                      </div>
                      <Slider
                        defaultValue={[tuning?.specialties?.creative || 0]}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => handleSpecialtyChange('creative', value)}
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-amber-200 [&>span:first-child]:dark:bg-amber-950"
                      />
                      <p className="text-xs text-muted-foreground">
                        Design thinking, artistic expression, storytelling, and creative problem-solving
                      </p>
                    </div>
                    
                    {/* Technology */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Code2 className="h-4 w-4 text-indigo-500" />
                          <span>Technology & Computing</span>
                        </label>
                        <Badge variant="outline" className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                          {tuning?.specialties?.technology ? Math.round(tuning.specialties.technology * 100) : 0}%
                        </Badge>
                      </div>
                      <Slider
                        defaultValue={[tuning?.specialties?.technology || 0]}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => handleSpecialtyChange('technology', value)}
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-indigo-200 [&>span:first-child]:dark:bg-indigo-950"
                      />
                      <p className="text-xs text-muted-foreground">
                        Software development, engineering principles, digital systems, and computational thinking
                      </p>
                    </div>
                    
                    {/* Social Sciences */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Users2 className="h-4 w-4 text-rose-500" />
                          <span>Social Sciences & Psychology</span>
                        </label>
                        <Badge variant="outline" className="bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                          {tuning?.specialties?.socialSciences ? Math.round(tuning.specialties.socialSciences * 100) : 0}%
                        </Badge>
                      </div>
                      <Slider
                        defaultValue={[tuning?.specialties?.socialSciences || 0]}
                        max={1}
                        step={0.01}
                        onValueChange={(value) => handleSpecialtyChange('socialSciences', value)}
                        className="[&>span:first-child]:h-2 [&>span:first-child]:bg-rose-200 [&>span:first-child]:dark:bg-rose-950"
                      />
                      <p className="text-xs text-muted-foreground">
                        Human behavior, social dynamics, psychological principles, and cultural understanding
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Setup Complete Section */}
                <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium flex items-center gap-1.5 text-green-700 dark:text-green-300">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Configuration Complete</span>
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    You've completed the configuration of your DotSpark brain extension. Your settings will be applied to how your DotSpark processes information, learns, and generates insights.
                  </p>
                  
                  <div className="flex justify-end">
                    <Button variant="default" onClick={() => setLocation('/')} className="gap-1.5">
                      <Check className="h-4 w-4" />
                      <span>Complete Setup</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Unlocked Capabilities Section - Only show when at least one section is complete */}
      {Object.values(sectionCompletion).some(v => v) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Unlocked Capabilities</h2>
          
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
      )}
    </div>
  );
}