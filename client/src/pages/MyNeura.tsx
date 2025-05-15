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

export default function MyNeura() {
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
  
  const [activeTab, setActiveTab] = useState<string>('parameters');
  const [whatsAppDirectLink, setWhatsAppDirectLink] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  
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
            <span className="text-primary">My Neura</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Fine-tune your personal neural extension to match your unique thought patterns and cognitive style.
          </p>
        </div>
        
        {/* Activation status indicator */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full mr-2 ${isActivated ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="font-medium">Neura Status: {isActivated ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {!user && (
              <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In to Configure
              </Button>
            )}
            {user && !isActivated && (
              <Button onClick={() => setActiveTab('whatsapp')} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                Connect WhatsApp
              </Button>
            )}
            {isActivated && (
              <Button onClick={() => setLocation('/dashboard')} variant="outline" className="border-green-500 text-green-600 hover:text-green-700 hover:bg-green-50">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            )}
          </div>
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
        
        {/* Main tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Main navigation tabs */}
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="parameters" className="text-sm">
              <div className="flex items-center">
                <BrainCircuit className="h-4 w-4 mr-2" />
                <span>Parameters</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="expertise" className="text-sm">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                <span>Expertise</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-sm">
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                <span>WhatsApp</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
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
          
          {/* Tab 3: WhatsApp Connection */}
          <TabsContent value="whatsapp" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5 text-green-500" />
                  WhatsApp Connection
                </CardTitle>
                <CardDescription>
                  Link your WhatsApp to Neura for seamless interaction through messaging
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <LogIn className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      You need to sign in before you can connect your WhatsApp account to Neura.
                    </p>
                    <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In with Google
                    </Button>
                  </div>
                ) : (
                  <DotSparkWhatsAppLinking />
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('expertise')}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Expertise
                </Button>
                {isActivated && (
                  <Button 
                    onClick={() => setLocation('/dashboard')}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}