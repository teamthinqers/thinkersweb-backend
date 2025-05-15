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
  Microscope,
  GraduationCap,
  Target
} from 'lucide-react';
import { DotSparkWhatsAppLinking } from '@/components/dotspark/DotSparkWhatsAppLinking';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

export default function ActivateDotSpark() {
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
  
  // Combined activation status
  const isActivated = isWhatsAppConnected || isActiveInLocalStorage;
  
  // Progress based on setup stage
  const progress = !user ? 33 : (!tuning || Object.keys(tuning).length === 0) ? 67 : isActivated ? 100 : 67;
  
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
  
  // Save pending changes to DotSpark tuning
  const saveChanges = async () => {
    if (!user) return;
    
    try {
      // Merge pending changes with existing tuning
      const updatedTuning = {
        ...tuning,
        ...pendingChanges
      };
      
      await saveTuning(updatedTuning);
      
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
  
  // Determine if we're currently checking activation status
  const isChecking = isWhatsAppStatusLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Include header component */}
      <Header onSearch={handleSearch} />
      
      <div className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Activate Your <span className="text-primary">Neura</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Set up your personal cognitive extension to enhance your thinking and capture your ideas.
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
            <TabsTrigger value="step1" className="text-xs">1. Sign In</TabsTrigger>
            <TabsTrigger value="step2" className="text-xs">2. Neural Setup</TabsTrigger>
            <TabsTrigger value="step3" className="text-xs">3. Link WhatsApp</TabsTrigger>
          </TabsList>
          
          {/* Progress steps visualization */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'step1' ? 'bg-primary text-primary-foreground' : (progress > 33 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800')}`}>
                {progress > 33 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">Sign In</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-gray-200 dark:bg-gray-800"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'step2' ? 'bg-primary text-primary-foreground' : (progress > 67 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800')}`}>
                {progress > 67 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">Neural Setup</span>
            </div>
            <div className="h-0.5 flex-1 mx-2 bg-gray-200 dark:bg-gray-800"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'step3' ? 'bg-primary text-primary-foreground' : (progress > 99 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800')}`}>
                {progress > 99 ? <Check className="h-4 w-4" /> : "3"}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">WhatsApp</span>
            </div>
          </div>
          
          {/* Tab 1: Account Connection */}
          <TabsContent value="step1" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Neura Account</CardTitle>
                <CardDescription>
                  Sign in to start the activation process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Personal Cognitive Extension</h3>
                      <p className="text-muted-foreground text-sm">
                        Your Neura adapts to your unique thought patterns
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Enhanced Thinking</h3>
                      <p className="text-muted-foreground text-sm">
                        Connect related ideas and develop deeper insights
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Accessible Anywhere</h3>
                      <p className="text-muted-foreground text-sm">
                        Capture thoughts via WhatsApp, even when offline
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  size="lg"
                  disabled={!!user || isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : user ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in with Google
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {user && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setActiveTab('step2')} 
                  className="bg-primary hover:bg-primary/90"
                >
                  Next: Setup Your Neura
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
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
                          Tap on domains to set your expertise level. Your Neura will adapt its cognitive processing based on your knowledge patterns.
                        </p>
                      </div>
                      
                      {domainGroups.map((group) => (
                        <div key={group.name} className="mb-8">
                          <div className="flex items-center mb-4">
                            <div className="h-px flex-grow bg-gray-200 dark:bg-gray-800 mr-3"></div>
                            <h4 className="text-md font-medium text-primary">{group.name}</h4>
                            <div className="h-px flex-grow bg-gray-200 dark:bg-gray-800 ml-3"></div>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            {group.domains.map((domain) => {
                              const Icon = domain.icon;
                              const level = selectedExpertise[domain.id] || 0;
                              const label = getExpertiseLabel(level);
                              
                              // Determine badge color based on expertise level
                              let badgeClass = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
                              if (level > 0.8) badgeClass = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
                              else if (level > 0.6) badgeClass = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
                              else if (level > 0.4) badgeClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                              else if (level > 0.2) badgeClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                              else if (level > 0) badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
                              
                              return (
                                <div
                                  key={domain.id}
                                  className="relative overflow-hidden border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] bg-background"
                                  onClick={(e) => {
                                    // Increment the level, cycling through 0, 0.2, 0.4, 0.6, 0.8, 1
                                    const newLevel = level >= 1 ? 0 : Math.round((level + 0.2) * 100) / 100;
                                    updateExpertise(domain.id, newLevel);
                                    createRipple(e);
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-primary" />
                                      </div>
                                      <span className="font-medium">{domain.name}</span>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                                      {label}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3">
                                    <div className="h-2.5 w-full bg-muted rounded-full mb-2 overflow-hidden">
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
                                          className={`w-1 h-2 ${level >= mark ? 'bg-primary/70' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        ></div>
                                      ))}
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
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
          
          {/* Tab 3: WhatsApp Linking */}
          <TabsContent value="step3" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isActivated ? 
                    "Neura Activated" : 
                    "Link WhatsApp to Your Neura"
                  }
                </CardTitle>
                <CardDescription>
                  {isActivated ? 
                    "Your WhatsApp is connected and Neura is active." : 
                    "Send a WhatsApp message to activate your personal cognitive extension."
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
                  ) : (
                    <>
                      {/* WhatsApp linking components */}
                      <DotSparkWhatsAppLinking 
                        isActivated={isActivated} 
                        isChecking={isChecking}
                        directLink={whatsAppDirectLink}
                      />
                      
                      {/* Status display */}
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${isActivated ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                            <span>WhatsApp Connection</span>
                          </div>
                          <span className="text-sm font-medium">
                            {isActivated ? 'Active' : isChecking ? 'Checking...' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </>
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
                
                <div className="flex flex-col space-y-4">
                  {isActivated ? (
                    <>
                      <Button 
                        onClick={() => setLocation('/dashboard')} 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Open Dashboard
                      </Button>
                    </>
                  ) : (
                    user && (
                      <Button 
                        variant="outline" 
                        onClick={repairActivationStatus}
                        disabled={isChecking}
                      >
                        {isChecking ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Check Connection Status
                          </>
                        )}
                      </Button>
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
