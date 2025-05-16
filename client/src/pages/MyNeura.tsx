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
  CheckCircle,
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

export default function MyNeura() {
  const [, setLocation] = useLocation();
  const { user, loginWithGoogle, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

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
  
  // Access nested properties from status
  const tuning = status?.tuning || {
    creativity: 0.5,
    precision: 0.5,
    speed: 0.5,
    analytical: 0.5,
    intuitive: 0.5,
    specialties: {},
    learningFocus: []
  };
  const gameElements = status?.gameElements || {
    level: 1,
    experience: 0,
    experienceRequired: 1000,
    unlockedCapabilities: [],
    achievements: [],
    stats: {
      messagesProcessed: 0,
      insightsGenerated: 0,
      connectionsFormed: 0,
      adaptationScore: 0
    }
  };
  
  // State for capacity metrics with animation
  const [processingEfficiency, setProcessingEfficiency] = useState<number>(65);
  const [memoryCapacity, setMemoryCapacity] = useState<number>(48);
  const [learningRate, setLearningRate] = useState<number>(52);
  const [specializationLevel, setSpecializationLevel] = useState<number>(35);

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
  
  // For expertise cards
  const [selectedExpertise, setSelectedExpertise] = useState<{[key: string]: number}>({});
  
  const [activeTab, setActiveTab] = useState<string>('hygiene');
  const [neuraName, setNeuraName] = useState<string>('Neura');
  
  // Domain filter for expertise
  const [domainFilter, setDomainFilter] = useState('');

  // Is Neura activated
  const [isActivated, setIsActivated] = useState<boolean>(
    localStorage.getItem('neuraActivated') === 'true'
  );
  
  // Function to activate Neura
  const activateNeura = () => {
    localStorage.setItem('neuraActivated', 'true');
    setIsActivated(true);
    
    // Save any pending changes
    if (unsavedChanges) {
      updateTuning(pendingChanges);
      setUnsavedChanges(false);
      setPendingChanges({});
    }
  };
  
  // Learning focus array for learning tab
  const [learningFocus, setLearningFocus] = useState<string[]>([]);
  const [newFocus, setNewFocus] = useState('');
  
  // Empty search handler for header
  const handleSearch = () => {};
  
  // Prepare dotspark domain expertise areas
  const domainGroups = [
    {
      name: 'Technology',
      domains: [
        { id: 'tech', name: 'Technology & Programming', icon: BrainCircuit },
        { id: 'ai', name: 'Artificial Intelligence', icon: BrainCog },
        { id: 'data', name: 'Data Science', icon: NetworkIcon }
      ]
    },
    {
      name: 'Business',
      domains: [
        { id: 'business', name: 'Business Strategy', icon: Target },
        { id: 'marketing', name: 'Marketing', icon: Star },
        { id: 'finance', name: 'Finance', icon: Zap }
      ]
    },
    {
      name: 'Science',
      domains: [
        { id: 'science', name: 'General Science', icon: Microscope },
        { id: 'research', name: 'Research Methods', icon: Lightbulb },
        { id: 'academic', name: 'Academic Writing', icon: GraduationCap }
      ]
    }
  ];
  
  // Get expertise level label
  const getExpertiseLabel = (level: number) => {
    if (level <= 0.2) return 'Novice';
    if (level <= 0.4) return 'Beginner';
    if (level <= 0.6) return 'Intermediate';
    if (level <= 0.8) return 'Advanced';
    return 'Expert';
  };
  
  // Create a ripple effect on card click
  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const button = event.currentTarget;
    
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    
    // Calculate click position relative to the button
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;
    
    // Create a circle element
    const circle = document.createElement('span');
    circle.className = 'absolute rounded-full bg-amber-500/20 animate-ripple';
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    
    // Remove any existing ripple
    const ripple = button.getElementsByClassName('animate-ripple');
    if (ripple.length) {
      ripple[0].remove();
    }
    
    // Add the circle to the button
    button.appendChild(circle);
    
    // Remove the circle after the animation completes
    setTimeout(() => {
      if (circle.parentElement === button) {
        button.removeChild(circle);
      }
    }, 600);
  };
  
  // Calculate mastery score from all expertise levels
  const calculateMasteryScore = () => {
    const domainCount = domainGroups.reduce((count, group) => count + group.domains.length, 0);
    const totalExpertise = Object.values(selectedExpertise).reduce((sum, level) => sum + level, 0);
    const maxPossibleScore = domainCount * 1; // Max level is 1.0 per domain
    
    // Calculate percentage and round to nearest integer
    const percentage = Math.round((totalExpertise / maxPossibleScore) * 100);
    
    // Return score with a minimum of 10 if any domain has expertise
    return percentage > 0 ? percentage : (Object.keys(selectedExpertise).length > 0 ? 10 : 0);
  };
  
  // Update selected expertise and pending changes
  const updateExpertise = (domainId: string, level: number) => {
    setSelectedExpertise(prev => ({
      ...prev,
      [domainId]: level
    }));
    
    // Update pending changes for specialties
    const specialties = {
      ...(pendingChanges.specialties as Record<string, number> || {}),
      ...(tuning.specialties as Record<string, number> || {}),
      [domainId]: level
    };
    
    setPendingChanges(prev => ({
      ...prev,
      specialties
    }));
    
    setUnsavedChanges(true);
  };
  
  // Handle slider changes
  const handleSliderChange = (param: string, value: number | number[]) => {
    const singleValue = Array.isArray(value) ? value[0] : value;
    
    setPendingChanges(prev => ({
      ...prev,
      [param]: singleValue
    }));
    
    setUnsavedChanges(true);
  };
  
  // Save pending changes to Neural tuning
  const saveChanges = async () => {
    if (!user) return;
    
    try {
      // Update using the mutation function from the hook
      updateTuning(pendingChanges);
      
      setUnsavedChanges(false);
      setPendingChanges({});
      
      toast({
        title: "Settings Saved",
        description: "Your Neura preferences have been updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving tuning:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  

  
  // Initialize domain expertise from tuning
  useEffect(() => {
    if (tuning?.specialties) {
      setSelectedExpertise(tuning.specialties);
    }
  }, [tuning]);
  
  // Handle Google login
  const handleLogin = async () => {
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
  
  // Utility functions for neural tuning
  const formatAdaptationLevel = (level: number): string => {
    if (level < 20) return 'Novice';
    if (level < 40) return 'Developing';
    if (level < 60) return 'Advancing';
    if (level < 80) return 'Proficient';
    return 'Expert';
  };
  
  const getAdaptationProgress = (level: number): number => {
    return Math.min(100, Math.max(0, level));
  };
  
  // Determine if we're currently checking activation status
  const isChecking = isTuningLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Include header component */}
      <Header onSearch={handleSearch} />
      
      <div className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-4xl">
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
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-xs font-medium">Processing</div>
                      <div className="text-sm font-bold">{gameElements?.stats?.adaptationScore?.toFixed(0) || 'N/A'}</div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Processing Efficiency</h4>
                      <p className="text-xs">Measures how efficiently Neura processes your inputs and adapts to your thinking style.</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              
              {/* Neural Connections */}
              <div className="text-center">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <NetworkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-xs font-medium">Connections</div>
                      <div className="text-sm font-bold">{gameElements?.stats?.connectionsFormed || 0}</div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Neural Connections</h4>
                      <p className="text-xs">The number of connections Neura has formed between different topics and concepts.</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              
              {/* Insights */}
              <div className="text-center">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-xs font-medium">Insights</div>
                      <div className="text-sm font-bold">{gameElements?.stats?.insightsGenerated || 0}</div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Insights Generated</h4>
                      <p className="text-xs">The number of unique insights Neura has generated based on your interactions.</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              
              {/* Messages */}
              <div className="text-center">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <BrainCog className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="text-xs font-medium">Messages</div>
                      <div className="text-sm font-bold">{gameElements?.stats?.messagesProcessed || 0}</div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Messages Processed</h4>
                      <p className="text-xs">The total number of messages Neura has processed and learned from.</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Floating save button for tuning changes */}
        {unsavedChanges && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button 
              onClick={saveChanges}
              className="shadow-lg bg-green-500 hover:bg-green-600 text-white"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
        
        {/* Neural Tuning Tabs */}
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
              {/* Core Processing Parameters */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Core Processing Parameters</h4>
                <p className="text-sm text-muted-foreground">These settings control how your neural extension processes information</p>
              </div>
              
              {/* Creativity slider with enhanced visual design */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Creativity</h3>
                    <p className="text-sm text-muted-foreground">Influences variety and uniqueness of neural responses</p>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800">
                    {Math.round((pendingChanges.creativity ?? tuning?.creativity ?? 0.5) * 100)}%
                  </Badge>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-200 dark:from-blue-900 dark:via-indigo-800 dark:to-purple-700 rounded-full relative">
                  <Slider
                    defaultValue={[tuning?.creativity ?? 0.5]}
                    value={[pendingChanges.creativity ?? tuning?.creativity ?? 0.5]}
                    onValueChange={(value) => handleSliderChange('creativity', value)}
                    max={1}
                    step={0.01}
                    className="absolute inset-0"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Logical & Structured</span>
                  <span>Creative & Exploratory</span>
                </div>
              </div>
              
              {/* Precision slider with enhanced visual design */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Precision</h3>
                    <p className="text-sm text-muted-foreground">Determines accuracy and attention to detail</p>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
                    {Math.round((pendingChanges.precision ?? tuning?.precision ?? 0.5) * 100)}%
                  </Badge>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 rounded-full relative">
                  <Slider
                    defaultValue={[tuning?.precision ?? 0.5]}
                    value={[pendingChanges.precision ?? tuning?.precision ?? 0.5]}
                    onValueChange={(value) => handleSliderChange('precision', value)}
                    max={1}
                    step={0.01}
                    className="absolute inset-0"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Broad Strokes</span>
                  <span>Highly Detailed</span>
                </div>
              </div>
              
              {/* Speed slider with enhanced visual design */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Speed</h3>
                    <p className="text-sm text-muted-foreground">Controls response time vs. depth tradeoff</p>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800">
                    {Math.round((pendingChanges.speed ?? tuning?.speed ?? 0.5) * 100)}%
                  </Badge>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-amber-100 to-orange-200 dark:from-amber-900 dark:to-orange-800 rounded-full relative">
                  <Slider
                    defaultValue={[tuning?.speed ?? 0.5]}
                    value={[pendingChanges.speed ?? tuning?.speed ?? 0.5]}
                    onValueChange={(value) => handleSliderChange('speed', value)}
                    max={1}
                    step={0.01}
                    className="absolute inset-0"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Deep & Thorough</span>
                  <span>Quick & Responsive</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expertise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Domain Specialties
              </CardTitle>
              <CardDescription>Adjust how your neural extension specializes in different knowledge domains</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Filter for domains */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Filter domains..."
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="pl-9"
                />
                <div className="absolute left-3 top-2.5 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
              </div>
              
              {/* Domain group tabs */}
              <div className="grid gap-4">
                {domainGroups
                  .filter(group => 
                    domainFilter === '' || 
                    group.name.toLowerCase().includes(domainFilter.toLowerCase()) || 
                    group.domains.some(domain => 
                      domain.name.toLowerCase().includes(domainFilter.toLowerCase())
                    )
                  )
                  .map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-3">
                      <h3 className="text-md font-medium">{group.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {group.domains
                          .filter(domain => 
                            domainFilter === '' || 
                            domain.name.toLowerCase().includes(domainFilter.toLowerCase())
                          )
                          .map((domain, domainIndex) => {
                            // Get domain expertise level
                            const expertiseLevel = selectedExpertise[domain.id] || 0;
                            
                            return (
                              <div 
                                key={domainIndex} 
                                className={`rounded-lg border p-4 hover:border-primary/50 transition-colors relative overflow-hidden ${
                                  expertiseLevel > 0 ? 'bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/30 dark:to-transparent' : ''
                                }`}
                                onClick={(e) => {
                                  createRipple(e);
                                  // Cycle through expertise levels on click
                                  const newLevel = (expertiseLevel >= 1) ? 0 : expertiseLevel + 0.2;
                                  updateExpertise(domain.id, newLevel);
                                }}
                              >
                                {/* Domain Icon and Name */}
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-9 h-9 rounded-full ${
                                      expertiseLevel > 0 
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' 
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                    } flex items-center justify-center`}>
                                      {React.createElement(domain.icon, { className: 'h-5 w-5' })}
                                    </div>
                                    <div>
                                      <h4 className="font-medium leading-none">{domain.name}</h4>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {expertiseLevel > 0 ? getExpertiseLabel(expertiseLevel) : 'Not specialized'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Expertise Level Indicator */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span>Specialization Level</span>
                                    <span className="font-medium">{Math.round(expertiseLevel * 100)}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 rounded-full"
                                      style={{ width: `${expertiseLevel * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Mastery Score Card */}
              <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-100 dark:border-amber-900/50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Domain Mastery Score</h3>
                        <p className="text-sm text-muted-foreground">Overall expertise level across all domains</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-sm px-2.5 py-1">
                      {calculateMasteryScore()}%
                    </Badge>
                  </div>
                  
                  <div className="h-2 w-full bg-amber-100 dark:bg-amber-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 rounded-full"
                      style={{ width: `${calculateMasteryScore()}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="personal" className="space-y-6">
          <Card className="border-emerald-100 dark:border-emerald-900/40">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <BrainCog className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle>Cognitive Parameters</CardTitle>
                  <CardDescription>Adjust how your neural extension thinks and processes information</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Analytical slider with enhanced visual design */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Analytical Thinking</h3>
                    <p className="text-sm text-muted-foreground">Logical, systematic thinking emphasis</p>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
                    {Math.round((pendingChanges.analytical ?? tuning?.analytical ?? 0.5) * 100)}%
                  </Badge>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full relative">
                  <Slider
                    defaultValue={[tuning?.analytical ?? 0.5]}
                    value={[pendingChanges.analytical ?? tuning?.analytical ?? 0.5]}
                    onValueChange={(value) => handleSliderChange('analytical', value)}
                    max={1}
                    step={0.01}
                    className="absolute inset-0"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Freestyle Thinking</span>
                  <span>Systematic Analysis</span>
                </div>
              </div>
              
              {/* Intuitive slider with enhanced visual design */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Intuitive Thinking</h3>
                    <p className="text-sm text-muted-foreground">Pattern recognition and insight emphasis</p>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border border-violet-200 dark:border-violet-800">
                    {Math.round((pendingChanges.intuitive ?? tuning?.intuitive ?? 0.5) * 100)}%
                  </Badge>
                </div>
                <div className="h-2 w-full bg-gradient-to-r from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800 rounded-full relative">
                  <Slider
                    defaultValue={[tuning?.intuitive ?? 0.5]}
                    value={[pendingChanges.intuitive ?? tuning?.intuitive ?? 0.5]}
                    onValueChange={(value) => handleSliderChange('intuitive', value)}
                    max={1}
                    step={0.01}
                    className="absolute inset-0"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Fact-Based</span>
                  <span>Pattern-Sensing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
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
              {/* Current focus areas */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Current Focus Areas</h4>
                <p className="text-sm text-muted-foreground">
                  {learningFocus.length > 0 
                    ? "These are the topics your neural extension is actively learning about"
                    : "Add topics below to direct your neural extension's learning"}
                </p>
                
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {learningFocus.map((focus, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-1 py-1.5 pl-3 pr-2"
                    >
                      {focus}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-secondary"
                        onClick={() => {
                          const newFocus = [...learningFocus];
                          newFocus.splice(index, 1);
                          setLearningFocus(newFocus);
                          
                          setPendingChanges(prev => ({
                            ...prev,
                            learningFocus: newFocus
                          }));
                          
                          setUnsavedChanges(true);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Add new focus */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Add Focus Area</h4>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter a learning topic..."
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newFocus.trim()) {
                        e.preventDefault();
                        const updatedFocus = [...learningFocus, newFocus.trim()];
                        setLearningFocus(updatedFocus);
                        setNewFocus('');
                        
                        setPendingChanges(prev => ({
                          ...prev,
                          learningFocus: updatedFocus
                        }));
                        
                        setUnsavedChanges(true);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    onClick={() => {
                      if (newFocus.trim()) {
                        const updatedFocus = [...learningFocus, newFocus.trim()];
                        setLearningFocus(updatedFocus);
                        setNewFocus('');
                        
                        setPendingChanges(prev => ({
                          ...prev,
                          learningFocus: updatedFocus
                        }));
                        
                        setUnsavedChanges(true);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Activation Button */}
          <div className="flex justify-center">
            <Button 
              className={`w-full sm:w-auto py-6 px-8 text-white ${
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
              disabled={isTuningLoading || isActivated}
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
        </TabsContent>
          
          {/* Tab 1: Neural Parameters */}
          <TabsContent value="parameters" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  Neural Parameters
                </CardTitle>
                <CardDescription>
                  Configure the core parameters that determine how your neural extension processes information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  
                  {/* Creativity slider with enhanced visual design */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Creativity</h3>
                        <p className="text-sm text-muted-foreground">Influences variety and uniqueness of neural responses</p>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border border-indigo-200 dark:border-indigo-800">
                        {Math.round((pendingChanges.creativity ?? tuning?.creativity ?? 0.5) * 100)}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-blue-100 via-indigo-200 to-purple-200 dark:from-blue-900 dark:via-indigo-800 dark:to-purple-700 rounded-full relative">
                      <Slider
                        defaultValue={[tuning?.creativity ?? 0.5]}
                        value={[pendingChanges.creativity ?? tuning?.creativity ?? 0.5]}
                        onValueChange={(value) => handleSliderChange('creativity', value)}
                        max={1}
                        step={0.01}
                        className="absolute inset-0"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Logical & Structured</span>
                      <span>Creative & Exploratory</span>
                    </div>
                  </div>
                  
                  {/* Precision slider with enhanced visual design */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Precision</h3>
                        <p className="text-sm text-muted-foreground">Determines accuracy and attention to detail</p>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800">
                        {Math.round((pendingChanges.precision ?? tuning?.precision ?? 0.5) * 100)}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 rounded-full relative">
                      <Slider
                        defaultValue={[tuning?.precision ?? 0.5]}
                        value={[pendingChanges.precision ?? tuning?.precision ?? 0.5]}
                        onValueChange={(value) => handleSliderChange('precision', value)}
                        max={1}
                        step={0.01}
                        className="absolute inset-0"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Broad Strokes</span>
                      <span>Highly Detailed</span>
                    </div>
                  </div>
                  
                  {/* Speed slider with enhanced visual design */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Speed</h3>
                        <p className="text-sm text-muted-foreground">Balances response time against thoroughness</p>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800">
                        {Math.round((pendingChanges.speed ?? tuning?.speed ?? 0.5) * 100)}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-amber-100 to-orange-200 dark:from-amber-900 dark:to-orange-800 rounded-full relative">
                      <Slider
                        defaultValue={[tuning?.speed ?? 0.5]}
                        value={[pendingChanges.speed ?? tuning?.speed ?? 0.5]}
                        onValueChange={(value) => handleSliderChange('speed', value)}
                        max={1}
                        step={0.01}
                        className="absolute inset-0"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Thorough & Complete</span>
                      <span>Quick & Responsive</span>
                    </div>
                  </div>
                  
                  {/* Analytical slider with enhanced visual design */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Analytical Thinking</h3>
                        <p className="text-sm text-muted-foreground">Balances systematic analysis with intuitive insights</p>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border border-violet-200 dark:border-violet-800">
                        {Math.round((pendingChanges.analytical ?? tuning?.analytical ?? 0.5) * 100)}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-violet-100 to-purple-200 dark:from-violet-900 dark:to-purple-800 rounded-full relative">
                      <Slider
                        defaultValue={[tuning?.analytical ?? 0.5]}
                        value={[pendingChanges.analytical ?? tuning?.analytical ?? 0.5]}
                        onValueChange={(value) => handleSliderChange('analytical', value)}
                        max={1}
                        step={0.01}
                        className="absolute inset-0"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Intuitive & Holistic</span>
                      <span>Analytical & Systematic</span>
                    </div>
                  </div>
                  
                  {/* Intuitive slider with enhanced visual design */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Intuitive Insights</h3>
                        <p className="text-sm text-muted-foreground">Balances pattern recognition with explicit reasoning</p>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-fuchsia-50 to-pink-50 dark:from-fuchsia-950 dark:to-pink-950 border border-fuchsia-200 dark:border-fuchsia-800">
                        {Math.round((pendingChanges.intuitive ?? tuning?.intuitive ?? 0.5) * 100)}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-fuchsia-100 to-pink-200 dark:from-fuchsia-900 dark:to-pink-800 rounded-full relative">
                      <Slider
                        defaultValue={[tuning?.intuitive ?? 0.5]}
                        value={[pendingChanges.intuitive ?? tuning?.intuitive ?? 0.5]}
                        onValueChange={(value) => handleSliderChange('intuitive', value)}
                        max={1}
                        step={0.01}
                        className="absolute inset-0"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Explicit Reasoning</span>
                      <span>Pattern Recognition</span>
                    </div>
                  </div>
                  
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="secondary"
                  onClick={() => setActiveTab('expertise')}
                >
                  Continue to Expertise
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tab 2: Domain Expertise */}
          <TabsContent value="expertise" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="mr-2 h-5 w-5 text-amber-500" />
                    Domain Expertise
                  </div>
                  <Badge variant={calculateMasteryScore() > 50 ? "default" : "outline"} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    Mastery Score: {calculateMasteryScore()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Customize your Neura's expertise levels in different domains to match your interests and knowledge areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Domain search and filter */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Filter domains..." 
                      className="pl-8"
                      value={domainFilter}
                      onChange={(e) => setDomainFilter(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  {domainGroups.map((group) => {
                    // Filter domains based on search
                    const filteredDomains = group.domains.filter(domain => 
                      domain.name.toLowerCase().includes(domainFilter.toLowerCase()) ||
                      group.name.toLowerCase().includes(domainFilter.toLowerCase())
                    );
                    
                    // Skip group if no domains match filter
                    if (filteredDomains.length === 0) return null;
                    
                    return (
                      <div key={group.name}>
                        <h3 className="text-lg font-medium mb-3">{group.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredDomains.map(domain => {
                            const currentLevel = selectedExpertise[domain.id] || 0;
                            const Icon = domain.icon;
                            
                            return (
                              <div 
                                key={domain.id}
                                className="relative overflow-hidden border rounded-lg transition-all hover:shadow-md cursor-pointer"
                                onClick={(e) => {
                                  createRipple(e);
                                  
                                  // Cycle through levels: 0 -> 0.25 -> 0.5 -> 0.75 -> 1.0 -> 0
                                  const newLevel = currentLevel >= 1 ? 0 : currentLevel + 0.25;
                                  updateExpertise(domain.id, newLevel);
                                }}
                              >
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-5 w-5 text-primary" />
                                      <h4 className="font-medium">{domain.name}</h4>
                                    </div>
                                    <Badge variant={currentLevel > 0 ? "default" : "outline"} className={`
                                      ${currentLevel <= 0.2 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : ''}
                                      ${currentLevel > 0.2 && currentLevel <= 0.4 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
                                      ${currentLevel > 0.4 && currentLevel <= 0.6 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                                      ${currentLevel > 0.6 && currentLevel <= 0.8 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : ''}
                                      ${currentLevel > 0.8 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''}
                                    `}>
                                      {getExpertiseLabel(currentLevel)}
                                    </Badge>
                                  </div>
                                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        currentLevel <= 0.2 ? 'bg-gray-400' : 
                                        currentLevel <= 0.4 ? 'bg-blue-500' : 
                                        currentLevel <= 0.6 ? 'bg-green-500' : 
                                        currentLevel <= 0.8 ? 'bg-amber-500' : 
                                        'bg-purple-500'
                                      }`}
                                      style={{ width: `${currentLevel * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('parameters')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Parameters
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setActiveTab('whatsapp')}
                >
                  Continue to WhatsApp
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          

        </Tabs>
      </div>
    </div>
  );
}