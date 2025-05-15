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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="step1">1. Register/Sign In</TabsTrigger>
            <TabsTrigger value="step2">2. Setup Your Neura</TabsTrigger>
            <TabsTrigger value="step3">3. Link WhatsApp</TabsTrigger>
          </TabsList>
          
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
              <CardHeader>
                <CardTitle>Configure Your Neura</CardTitle>
                <CardDescription>
                  Personalize how your cognitive extension works to match your thinking
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
                      <h3 className="text-lg font-semibold mb-4">Core Parameters</h3>
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Creativity slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                              <span className="font-medium">Creativity</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(((pendingChanges?.creativity !== undefined ? pendingChanges.creativity : tuning?.creativity) || 0.5) * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[((pendingChanges?.creativity !== undefined ? pendingChanges.creativity : tuning?.creativity) || 0.5)]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={(val) => handleSliderChange('creativity', val)}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Methodical</span>
                            <span>Creative</span>
                          </div>
                        </div>
                        
                        {/* Precision slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-sky-500" />
                              <span className="font-medium">Precision</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(((pendingChanges?.precision !== undefined ? pendingChanges.precision : tuning?.precision) || 0.5) * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[((pendingChanges?.precision !== undefined ? pendingChanges.precision : tuning?.precision) || 0.5)]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={(val) => handleSliderChange('precision', val)}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Flexible</span>
                            <span>Precise</span>
                          </div>
                        </div>
                        
                        {/* Speed slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-violet-500" />
                              <span className="font-medium">Speed</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(((pendingChanges?.speed !== undefined ? pendingChanges.speed : tuning?.speed) || 0.5) * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[((pendingChanges?.speed !== undefined ? pendingChanges.speed : tuning?.speed) || 0.5)]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={(val) => handleSliderChange('speed', val)}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Thorough</span>
                            <span>Quick</span>
                          </div>
                        </div>
                        
                        {/* Analytical slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <BrainCog className="h-4 w-4 text-emerald-500" />
                              <span className="font-medium">Analytical</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(((pendingChanges?.analytical !== undefined ? pendingChanges.analytical : tuning?.analytical) || 0.5) * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[((pendingChanges?.analytical !== undefined ? pendingChanges.analytical : tuning?.analytical) || 0.5)]}
                            min={0}
                            max={1}
                            step={0.01}
                            onValueChange={(val) => handleSliderChange('analytical', val)}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Balanced</span>
                            <span>Analytical</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Domain expertise section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Domain Expertise</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tap on domains to set your expertise level. Your Neura will adapt its responses based on your knowledge.
                      </p>
                      
                      {domainGroups.map((group) => (
                        <div key={group.name} className="mb-6">
                          <h4 className="text-md font-medium mb-3">{group.name}</h4>
                          <div className="grid gap-3 md:grid-cols-3">
                            {group.domains.map((domain) => {
                              const Icon = domain.icon;
                              const level = selectedExpertise[domain.id] || 0;
                              const label = getExpertiseLabel(level);
                              
                              return (
                                <div
                                  key={domain.id}
                                  className="relative overflow-hidden border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                  onClick={(e) => {
                                    // Increment the level, cycling through 0, 0.25, 0.5, 0.75, 1
                                    const newLevel = level >= 1 ? 0 : Math.round((level + 0.25) * 100) / 100;
                                    updateExpertise(domain.id, newLevel);
                                    createRipple(e);
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Icon className="h-4 w-4 text-primary" />
                                      </div>
                                      <span className="font-medium text-sm">{domain.name}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <div className="h-2 w-full bg-muted rounded-full mb-1 overflow-hidden">
                                      <div 
                                        className="h-full bg-primary rounded-full transition-all duration-300" 
                                        style={{ width: `${level * 100}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-medium">
                                        {label}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {Math.round(level * 100)}%
                                      </span>
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
