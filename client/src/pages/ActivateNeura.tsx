import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Brain, 
  Check, 
  LogIn, 
  LayoutDashboard, 
  MessageCircle, 
  Sparkles, 
  RefreshCw, 
  Wrench, 
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
  Sliders,
  Microscope,
  GraduationCap,
  Target,
  Search
} from 'lucide-react';
import { DotSparkWhatsAppLinking } from '@/components/dotspark/DotSparkWhatsAppLinking';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export default function ActivateNeura() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const { 
    isWhatsAppConnected, 
    isLoading: isWhatsAppStatusLoading, 
    isActiveInLocalStorage,
    repairActivationStatus 
  } = useWhatsAppStatus();
  
  // DotSpark Tuning
  const { 
    tuning, 
    setTuning, 
    status, 
    isLoading: isTuningLoading, 
    saveTuning 
  } = useDotSparkTuning();

  // State for tracking unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  
  // For expertise cards
  const [selectedExpertise, setSelectedExpertise] = useState<{[key: string]: number}>({});
  
  const [activeTab, setActiveTab] = useState<string>('step1');
  const [whatsAppDirectLink, setWhatsAppDirectLink] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isNeuraActivated, setIsNeuraActivated] = useState<boolean>(() => 
    localStorage.getItem("neuraActivated") === "true"
  );
  
  // Check for Neura activation on mount and when localStorage changes
  useEffect(() => {
    const checkNeuraActivation = () => {
      const activated = localStorage.getItem("neuraActivated") === "true";
      setIsNeuraActivated(activated);
    };
    
    // Check on mount
    checkNeuraActivation();
    
    // Listen for storage events (in case another tab changes activation)
    window.addEventListener('storage', checkNeuraActivation);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', checkNeuraActivation);
    };
  }, []);
  
  // Combined activation status 
  const isActivated = isWhatsAppConnected || isActiveInLocalStorage || isNeuraActivated;
  
  // Progress based on setup stage
  const progress = !user ? 33 : (!tuning || Object.keys(tuning).length === 0) ? 67 : isActivated ? 100 : 67;
  
  // Save changes function
  const saveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return false;
    
    try {
      // Merge pending changes with existing tuning
      const updatedTuning = {
        ...tuning,
        ...pendingChanges
      };
      
      if (user) {
        // Save to backend if user is logged in
        await saveTuning(updatedTuning);
        toast({
          title: "Parameters saved",
          description: "Your neural parameters have been saved successfully.",
          variant: "default"
        });
      } else {
        // Just store in state if not logged in
        // This allows the user to experience Neura setup without an account
        toast({
          title: "Parameters set",
          description: "Your neural parameters have been set for this session. Sign in to save permanently.",
          variant: "default"
        });
      }
      
      // Reset state
      setUnsavedChanges(false);
      setPendingChanges({});
      
      return true;
    } catch (error) {
      toast({
        title: "Error saving parameters",
        description: "There was a problem setting your neural parameters. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Use our simplified activation function
  const activateNeura = async () => {
    setIsChecking(true);
    try {
      const success = await simpleActivateNeura();
      if (success) {
        // Refresh the page to show activated state
        window.location.reload();
      }
    } finally {
      setIsChecking(false);
    }
  };
  
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
      ...pendingChanges?.specialties || tuning?.specialties || {},
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
  
  // Function to simply activate Neura without all the WhatsApp complexity
  const simpleActivateNeura = async () => {
    try {
      // Save any pending changes first
      if (unsavedChanges) {
        await saveChanges();
      }
      
      // Set local activation status to true 
      localStorage.setItem("neuraActivated", "true");
      localStorage.setItem("neuraActivatedTimestamp", new Date().toISOString());
      
      // Update state
      setIsNeuraActivated(true);
      
      // Show success toast
      toast({
        title: "Neura Activated!",
        description: "Your neural extension is now fully activated and ready to use.",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error("Error activating Neura:", error);
      
      toast({
        title: "Activation Error",
        description: "There was a problem activating your Neura. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  // Get WhatsApp direct link
  useEffect(() => {
    fetch('/api/whatsapp/contact')
      .then(res => res.json())
      .then(data => {
        if (data && data.directLink) {
          setWhatsAppDirectLink(data.directLink);
          console.log("Got WhatsApp direct link:", data.directLink);
        }
      })
      .catch(err => console.error("Error fetching WhatsApp contact:", err));
  }, []);
  
  // Initialize domain expertise from tuning
  useEffect(() => {
    if (tuning?.specialties) {
      setSelectedExpertise(tuning.specialties);
    }
  }, [tuning]);
  
  // Update active tab when auth state changes
  useEffect(() => {
    if (!user) {
      setActiveTab('step1');
    } else if (!tuning || Object.keys(tuning).length === 0) {
      setActiveTab('step2');
    } else {
      setActiveTab('step3');
    }
  }, [user, tuning]);
  
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
  
  // Use isWhatsAppStatusLoading for checking status
  // (isChecking is already declared above)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Include header component */}
      <Header onSearch={handleSearch} />
      
      <div className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {isActivated ? (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">Neura Activated</span>
            ) : (
              <span className="text-primary">My Neura</span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Fine-tune your personal neural extension to match your unique thought patterns and cognitive style.
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
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
        
        {/* Main activation content */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Small, subtle tabs for the 3-step process */}
          <TabsList className="grid w-full grid-cols-3 mb-2 bg-background/60 border">
            <TabsTrigger value="step1" className="text-xs">Core Parameters</TabsTrigger>
            <TabsTrigger value="step2" className="text-xs">Domain Expertise</TabsTrigger>
            <TabsTrigger value="step3" className="text-xs">Activation</TabsTrigger>
          </TabsList>
          
          {/* Neural parameters visualization */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'step1' ? 'bg-primary text-primary-foreground' : progress > 33 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                {progress > 33 ? <Check className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">Core</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-gray-200 dark:bg-gray-800"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'step2' ? 'bg-primary text-primary-foreground' : progress > 67 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                {progress > 67 ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">Expertise</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-gray-200 dark:bg-gray-800"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'step3' ? 'bg-primary text-primary-foreground' : progress > 99 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                {progress > 99 ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">Activate</span>
            </div>
          </div>
          
          {/* Tab 1: Account Connection */}
          <TabsContent value="step1" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  Core Neural Parameters
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
                      <span>Generalized</span>
                      <span>Highly Precise</span>
                    </div>
                  </div>
                  
                  {/* Speed slider with enhanced visual design */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Speed</h3>
                        <p className="text-sm text-muted-foreground">Balances processing speed vs depth of analysis</p>
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
                      <span>Deep Analysis</span>
                      <span>Rapid Response</span>
                    </div>
                  </div>
                  
                  {/* Analytical slider with enhanced visual design */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <h3 className="font-medium">Analytical Focus</h3>
                        <p className="text-sm text-muted-foreground">Balance between analytical and intuitive thinking</p>
                      </div>
                      <Badge variant="outline" className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border border-cyan-200 dark:border-cyan-800">
                        {Math.round((pendingChanges.analytical ?? tuning?.analytical ?? 0.5) * 100)}%
                      </Badge>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-cyan-100 to-blue-200 dark:from-cyan-900 dark:to-blue-800 rounded-full relative">
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
                      <span>Intuitive/Pattern-Based</span>
                      <span>Logical/Systematic</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('step3')}>
                  <Sliders className="mr-2 h-4 w-4" />
                  Advanced Settings
                </Button>
                <Button onClick={() => setActiveTab('step2')} className="bg-primary hover:bg-primary/90">
                  Domain Expertise
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tab 2: Neura Setup */}
          <TabsContent value="step2" className="mt-4">
            <Card>
              <CardHeader className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-b rounded-t-lg">
                <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Activate Your Neura</CardTitle>
                <CardDescription className="max-w-md mx-auto mt-2">
                  Fine-tune how your cognitive extension processes information to match your unique way of thinking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="font-medium text-amber-800">Account Required</h3>
                        <p className="text-amber-700 text-sm mt-1">
                          Please complete Step 1 by signing in first.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-3 text-amber-800 border-amber-300 hover:bg-amber-100"
                          onClick={() => setActiveTab('step1')}
                        >
                          Go to Step 1
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-8">
                    {/* Core parameters section */}
                    <div>
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Core Parameters</h3>
                        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                          Fine-tune how your Neura processes information. These parameters define your unique cognitive extension.
                        </p>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-5 rounded-lg border border-indigo-100 dark:border-indigo-950/30 shadow-sm">
                        {/* Creativity slider */}
                        <div className="space-y-3 bg-white dark:bg-background rounded-lg p-4 shadow-sm border border-indigo-100/50 dark:border-slate-800">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                              </div>
                              <div>
                                <span className="font-medium block">Creativity</span>
                                <span className="text-xs text-muted-foreground">Influences response variety and novelty</span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md">
                              {Math.round(((pendingChanges?.creativity !== undefined ? pendingChanges.creativity : tuning?.creativity) || 0.5) * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[((pendingChanges?.creativity !== undefined ? pendingChanges.creativity : tuning?.creativity) || 0.5)]}
                            min={0}
                            max={1}
                            step={0.01}
                            className="py-1"
                            onValueChange={(val) => handleSliderChange('creativity', val)}
                          />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">Methodical</span>
                            <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded font-medium">Creative</span>
                          </div>
                        </div>
                        
                        {/* Precision slider */}
                        <div className="space-y-3 bg-white dark:bg-background rounded-lg p-4 shadow-sm border border-indigo-100/50 dark:border-slate-800">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                <Target className="h-4 w-4 text-sky-500 dark:text-sky-400" />
                              </div>
                              <div>
                                <span className="font-medium block">Precision</span>
                                <span className="text-xs text-muted-foreground">Controls factual accuracy and detail</span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-md">
                              {Math.round(((pendingChanges?.precision !== undefined ? pendingChanges.precision : tuning?.precision) || 0.5) * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[((pendingChanges?.precision !== undefined ? pendingChanges.precision : tuning?.precision) || 0.5)]}
                            min={0}
                            max={1}
                            step={0.01}
                            className="py-1"
                            onValueChange={(val) => handleSliderChange('precision', val)}
                          />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">Flexible</span>
                            <span className="text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded font-medium">Precise</span>
                          </div>
                        </div>
                        
                        {/* Speed slider */}
                        <div className="space-y-3 bg-white dark:bg-background rounded-lg p-4 shadow-sm border border-indigo-100/50 dark:border-slate-800">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <Gauge className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                              </div>
                              <div>
                                <span className="font-medium block">Speed</span>
                                <span className="text-xs text-muted-foreground">Controls response time vs. depth</span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-md">
                              {Math.round(((pendingChanges?.speed !== undefined ? pendingChanges.speed : tuning?.speed) || 0.5) * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[((pendingChanges?.speed !== undefined ? pendingChanges.speed : tuning?.speed) || 0.5)]}
                            min={0}
                            max={1}
                            step={0.01}
                            className="py-1"
                            onValueChange={(val) => handleSliderChange('speed', val)}
                          />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">Thorough</span>
                            <span className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded font-medium">Quick</span>
                          </div>
                        </div>
                        
                        {/* Analytical slider */}
                        <div className="space-y-3 bg-white dark:bg-background rounded-lg p-4 shadow-sm border border-indigo-100/50 dark:border-slate-800">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <BrainCog className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                              </div>
                              <div>
                                <span className="font-medium block">Analytical</span>
                                <span className="text-xs text-muted-foreground">Logical and systematic thinking</span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md">
                              {Math.round(((pendingChanges?.analytical !== undefined ? pendingChanges.analytical : tuning?.analytical) || 0.5) * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[((pendingChanges?.analytical !== undefined ? pendingChanges.analytical : tuning?.analytical) || 0.5)]}
                            min={0}
                            max={1}
                            step={0.01}
                            className="py-1"
                            onValueChange={(val) => handleSliderChange('analytical', val)}
                          />
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">Balanced</span>
                            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded font-medium">Analytical</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Domain expertise section */}
                    <div>
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Domain Expertise</h3>
                        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                          Tap on domains to set your expertise level. Your Neura will adapt its cognitive processing based on your unique knowledge patterns.
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <BrainCircuit className="h-5 w-5 text-primary mr-2" />
                          <h3 className="text-base font-medium">Mastery Score: <span className="text-primary">{calculateMasteryScore()}</span></h3>
                        </div>
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Filter domains..."
                            className="pl-9 h-9 rounded-md border border-input bg-transparent text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {domainGroups
                        .filter(group => {
                          if (!domainFilter) return true;
                          return group.domains.some(domain => 
                            domain.name.toLowerCase().includes(domainFilter.toLowerCase())
                          );
                        })
                        .map((group) => (
                        <div key={group.name} className="mb-8">
                          <div className="flex items-center mb-4">
                            <div className="h-px flex-grow bg-gray-200 dark:bg-gray-800 mr-3"></div>
                            <h4 className="text-md font-medium text-primary">{group.name}</h4>
                            <div className="h-px flex-grow bg-gray-200 dark:bg-gray-800 ml-3"></div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            {group.domains
                              .filter(domain => 
                                !domainFilter || domain.name.toLowerCase().includes(domainFilter.toLowerCase())
                              )
                              .map((domain) => {
                              const Icon = domain.icon;
                              const level = selectedExpertise[domain.id] || 0;
                              const label = getExpertiseLabel(level);
                              
                              // Determine colors based on expertise level
                              let badgeClass = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
                              let cardClass = "border";
                              let iconBgClass = "bg-primary/10";
                              
                              if (level > 0.8) {
                                badgeClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
                                cardClass = "border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-900/10";
                                iconBgClass = "bg-purple-100 dark:bg-purple-900/30";
                              }
                              else if (level > 0.6) {
                                badgeClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
                                cardClass = "border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-900/10";
                                iconBgClass = "bg-indigo-100 dark:bg-indigo-900/30";
                              }
                              else if (level > 0.4) {
                                badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                                cardClass = "border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-900/10";
                                iconBgClass = "bg-blue-100 dark:bg-blue-900/30";
                              }
                              else if (level > 0.2) {
                                badgeClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                                cardClass = "border-green-200 dark:border-green-900/40 bg-green-50/40 dark:bg-green-900/10";
                                iconBgClass = "bg-green-100 dark:bg-green-900/30";
                              }
                              else if (level > 0) {
                                badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
                                cardClass = "border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-900/10";
                                iconBgClass = "bg-amber-100 dark:bg-amber-900/30";
                              }
                              
                              return (
                                <div
                                  key={domain.id}
                                  className={`relative overflow-hidden rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${cardClass}`}
                                  onClick={(e) => {
                                    // Increment the level, cycling through 0, 0.2, 0.4, 0.6, 0.8, 1
                                    const newLevel = level >= 1 ? 0 : Math.round((level + 0.2) * 100) / 100;
                                    updateExpertise(domain.id, newLevel);
                                    createRipple(e);
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-9 h-9 rounded-full ${iconBgClass} flex items-center justify-center`}>
                                        <Icon className="h-5 w-5 text-primary" />
                                      </div>
                                      <span className="font-medium">{domain.name}</span>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                                      {label}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3">
                                    <div className="h-3 w-full bg-muted rounded-full mb-2 overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 rounded-full transition-all duration-300" 
                                        style={{ width: `${level * 100}%` }}
                                      ></div>
                                    </div>
                                    
                                    {/* Level markers */}
                                    <div className="flex justify-between px-0.5 mb-1">
                                      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((mark) => (
                                        <div 
                                          key={mark} 
                                          className={`w-1.5 h-2.5 rounded-sm transition-colors ${level >= mark ? 'bg-primary/70' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        ></div>
                                      ))}
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-muted-foreground">Novice</span>
                                      <span className="text-xs font-medium">
                                        {Math.round(level * 100)}%
                                      </span>
                                      <span className="text-xs text-muted-foreground">Expert</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('step1')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button 
                  onClick={() => {
                    if (unsavedChanges) {
                      saveChanges();
                    }
                    setActiveTab('step3');
                  }}
                  className="bg-primary hover:bg-primary/90"
                  disabled={!user}
                >
                  Next: Link WhatsApp
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tab 3: Activation */}
          <TabsContent value="step3" className="mt-4">
            <Card>
              <CardHeader className={isActivated ? 'text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-b rounded-t-lg' : 'text-center'}>
                {isActivated ? (
                  <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                <CardTitle className={isActivated ? 'text-2xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400' : 'text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'}>
                  {isActivated ? 
                    "Neura Activated" : 
                    "Activate Your Neura"
                  }
                </CardTitle>
                <CardDescription className="max-w-md mx-auto mt-2">
                  {isActivated ? 
                    "Your neural extension is now fully configured and ready to use. You can access all features through the dashboard." : 
                    "Your neural parameters are set. Activate Neura to start experiencing your personalized cognitive extension."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-6">
                  {!user ? (
                    <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-amber-800">Account Required</h3>
                          <p className="text-amber-700 text-sm mt-1">
                            Please complete Step 1 by signing in first.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-3 text-amber-800 border-amber-300 hover:bg-amber-100"
                            onClick={() => setActiveTab('step1')}
                          >
                            Go to Step 1
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : tuning && Object.keys(tuning).length === 0 ? (
                    <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-amber-800">Configure Neural Parameters</h3>
                          <p className="text-amber-700 text-sm mt-1">
                            Please complete Steps 1 and 2 to configure your neural parameters before activation.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-3 text-amber-800 border-amber-300 hover:bg-amber-100"
                            onClick={() => setActiveTab('step1')}
                          >
                            Configure Parameters
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : isActivated ? (
                    <div className="flex flex-col space-y-6 items-center">
                      {/* Activated status display */}
                      <div className="rounded-lg border p-6 bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/20">
                        <h3 className="font-medium text-lg mb-4">Setup Complete</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 mr-3">
                              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <span className="font-medium">Core Parameters Configured</span>
                              <p className="text-sm text-muted-foreground">Your neural extension's core processing preferences are set</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 mr-3">
                              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <span className="font-medium">Domain Expertise Defined</span>
                              <p className="text-sm text-muted-foreground">Your knowledge specializations are established</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5 mr-3">
                              <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <span className="font-medium">Neura Activated</span>
                              <p className="text-sm text-muted-foreground">Your neural extension is ready to use</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Neura activation status */}
                      <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                          <span>Neura Status</span>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          Active
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-6">
                      <div className="p-6 border rounded-lg w-full bg-gradient-to-br from-purple-50/30 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/20">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-medium">Ready to Activate</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your neural parameters have been configured. Activate now to start using your personalized Neura.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center p-3 border rounded bg-white/50 dark:bg-black/10">
                            <Gauge className="h-5 w-5 text-indigo-500 mr-3" />
                            <div className="flex-1">
                              <span className="text-sm font-medium">Core Parameters</span>
                              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                            <Check className="h-4 w-4 text-green-500 ml-2" />
                          </div>
                          
                          <div className="flex items-center p-3 border rounded bg-white/50 dark:bg-black/10">
                            <Microscope className="h-5 w-5 text-indigo-500 mr-3" />
                            <div className="flex-1">
                              <span className="text-sm font-medium">Domain Expertise</span>
                              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                            <Check className="h-4 w-4 text-green-500 ml-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('step2')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <div className="flex space-x-4">
                  {isActivated ? (
                    <Button 
                      onClick={() => setLocation('/dashboard')} 
                      size="lg" 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Open Dashboard
                    </Button>
                  ) : (
                    user && tuning && Object.keys(tuning).length > 0 && (
                      <div className="flex space-x-3">
                        <Button 
                          onClick={saveChanges}
                          variant={unsavedChanges ? "default" : "outline"}
                          disabled={!unsavedChanges}
                          className={unsavedChanges 
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "border-purple-200 text-muted-foreground hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50"
                          }
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {unsavedChanges ? "Save Changes" : "No Changes to Save"}
                        </Button>
                        
                        <Button 
                          onClick={activateNeura}
                          disabled={isChecking || unsavedChanges}
                          size="lg"
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          {isChecking ? (
                            <>
                              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            <>
                              <Zap className="mr-2 h-5 w-5" />
                              Activate Neura
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
