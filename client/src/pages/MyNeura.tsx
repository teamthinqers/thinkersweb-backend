import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { neuraStorage } from '@/lib/neuraStorage';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BrainCircuit, 
  Sparkles, 
  Zap, 
  BrainCog, 
  Lightbulb,
  ChevronLeft,
  ChevronRight, 
  Plus,
  X,
  Target,
  Info, 
  Check,
  AlertCircle,
  Save,
  Edit,
  Shield
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MyNeura() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // DotSpark name using neuraStorage utility
  const [dotSparkName, setDotSparkName] = useState(neuraStorage.getName());
  
  // DotSpark Tuning
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateTuning,
    isUpdating,
    updateLearningFocus,
    isUpdatingFocus,
    availableSpecialties
  } = useDotSparkTuning();
  
  // State for capacity metrics with animation
  // Users start at Level 1 with very low initial percentages and upgrade as they cross thresholds
  const [processingEfficiency, setProcessingEfficiency] = useState<number>(15);
  const [memoryCapacity, setMemoryCapacity] = useState<number>(10);
  const [learningRate, setLearningRate] = useState<number>(8);
  const [specializationLevel, setSpecializationLevel] = useState<number>(5);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Only update capacity metrics when status changes if not a new user
  useEffect(() => {
    // Skip this effect entirely - we want fixed values for new users
    // This effect would be updated later when users actually progress
    // It's commented out so we understand we're using fixed values for demonstration
    /*
    if (status) {
      setProcessingEfficiency(status.gameElements?.stats?.adaptationScore || 0);
      setMemoryCapacity(Math.min(100, ((status.gameElements?.stats?.connectionsFormed || 0) / 50) * 100));
      setLearningRate(Math.min(100, ((status.gameElements?.stats?.insightsGenerated || 0) / 20) * 100));
      setSpecializationLevel(Math.min(100, (Object.keys(status.tuning?.specialties || {}).length / 8) * 100));
    }
    */
  }, [status]);
  
  // State for tracking unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    creativity?: number;
    precision?: number;
    speed?: number;
    analytical?: number;
    intuitive?: number;
    specialties?: Record<string, number>;
    learningFocus?: string[];
  }>({});
  
  // State for tracking configured sections
  const [cognitiveShieldConfigured, setCognitiveShieldConfigured] = useState(false);
  const [expertiseLayerConfigured, setExpertiseLayerConfigured] = useState(false);
  
  // Check localStorage for configuration status
  useEffect(() => {
    const cognitiveConfigured = localStorage.getItem('cognitiveShieldConfigured') === 'true';
    const expertiseConfigured = localStorage.getItem('expertiseLayerConfigured') === 'true';
    setCognitiveShieldConfigured(cognitiveConfigured);
    setExpertiseLayerConfigured(expertiseConfigured);
  }, []);
  
  // State for invite code modal
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  
  // Active tab for neural tuning
  const [activeTab, setActiveTab] = useState('cognitive');
  
  // Function to validate invite code and activate DotSpark
  const handleInviteCodeSubmit = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter an invite code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidatingCode(true);
    
    try {
      // Validate the invite code with the server
      const response = await fetch('/api/validate-invite-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });
      
      if (response.ok) {
        // Code is valid, mark invite as validated and activate DotSpark
        neuraStorage.markInviteValidated();
        neuraStorage.activate();
        setShowInviteDialog(false);
        setInviteCode('');
        setIsActivated(true);
        toast({
          title: "Welcome to DotSpark!",
          description: "Your exclusive access has been activated.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Invalid Invite Code",
          description: error.message || "The invite code you entered is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to validate invite code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCode(false);
    }
  };
  

  
  // Track if we're on mobile for responsive layout
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  // New focus for learning directives
  const [newFocus, setNewFocus] = useState('');
  
  // Is Neura activated - using neuraStorage utility
  const [isActivated, setIsActivated] = useState<boolean>(neuraStorage.isActivated());
  
  // Check for activation status on page load/revisit
  useEffect(() => {
    try {
      const activated = neuraStorage.isActivated();
      console.log("Loading activation status from neuraStorage:", activated);
      setIsActivated(activated);
    } catch (error) {
      console.error("Error checking activation status:", error);
    }
  }, []);
  
  // Handle responsive layout adjustments and persistence
  useEffect(() => {
    // Handle window resize for responsive layout
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 768;
      setIsMobileView(mobileCheck);
    };
    
    // Listen for window resize events
    window.addEventListener('resize', handleResize);
    
    // Set up activation state listener from storage events (for cross-tab/device persistence)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'neuraActivated') {
        const newActivationState = e.newValue === 'true';
        setIsActivated(newActivationState);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Handle name change with neuraStorage
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setDotSparkName(newName);
    neuraStorage.setName(newName);
  };
  
  // Function to handle DotSpark activation with invite validation
  const handleActivateDotSpark = () => {
    // Check if user has been authenticated before activating
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to activate your DotSpark.",
        variant: "destructive",
      });
      return;
    }
    
    // If invite has been validated before, activate directly
    if (neuraStorage.isInviteValidated()) {
      activateDotSpark();
    } else {
      // First time activation - show invite code dialog
      setShowInviteDialog(true);
    }
  };

  // Function to activate DotSpark using neuraStorage utility
  const activateDotSpark = () => {
    try {
      // Use the neuraStorage utility for consistent activation
      neuraStorage.activate();
      setIsActivated(true);
      console.log("Activating DotSpark: using neuraStorage utility");
      
      // Ensure name is set properly
      if (!dotSparkName || dotSparkName === '') {
        const defaultName = 'My DotSpark';
        neuraStorage.setName(defaultName);
        setDotSparkName(defaultName);
      }
      
      // Show activation toast
      toast({
        title: "DotSpark Activated",
        description: "Your DotSpark is now active and ready to enhance your intelligence.",
        variant: "default",
      });
      
      // Save any pending changes
      if (unsavedChanges) {
        updateTuning(pendingChanges);
        setUnsavedChanges(false);
        setPendingChanges({});
      }
    } catch (error) {
      console.error("Error activating DotSpark:", error);
      toast({
        title: "Activation Failed",
        description: "There was a problem activating your DotSpark.",
        variant: "destructive",
      });
    }
  };
  
  // Function to deactivate DotSpark using neuraStorage utility
  const deactivateDotSpark = () => {
    try {
      // Use the neuraStorage utility for consistent deactivation
      neuraStorage.deactivate();
      setIsActivated(false);
      console.log("Deactivating DotSpark: using neuraStorage utility");
      
      toast({
        title: "DotSpark Deactivated",
        description: "Your DotSpark has been deactivated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deactivating DotSpark:", error);
      toast({
        title: "Deactivation Failed",
        description: "There was a problem deactivating your DotSpark.",
        variant: "destructive",
      });
    }
  };
  
  // Toggle DotSpark activation
  const toggleDotSparkActivation = () => {
    // If trying to activate and user is not signed in, prompt them to sign in
    if (!isActivated && !user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to activate your DotSpark.",
        variant: "default",
      });
      
      // Optional: Redirect to auth page after a short delay
      setTimeout(() => {
        setLocation('/auth');
      }, 1500);
      
      return;
    }
    
    // Otherwise, proceed as normal
    if (isActivated) {
      deactivateDotSpark();
    } else {
      activateDotSpark();
    }
  };
  
  // Function to handle slider value changes - only updates local state without saving to backend
  const handleParameterChange = (paramName: string, paramValue: number) => {
    
    // Update the pending changes object with the new parameter value
    setPendingChanges(prev => ({
      ...prev,
      [paramName]: paramValue
    }));
    
    // Mark that we have unsaved changes
    setUnsavedChanges(true);
    
    // Preview capacity changes based on parameter adjustments without saving
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
    
    setPendingChanges(prev => ({
      ...prev,
      specialties: {
        ...(prev.specialties || {}),
        [specialtyId]: specialtyValue
      }
    }));
    
    setUnsavedChanges(true);
    
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
    
    setPendingChanges(prev => ({
      ...prev,
      learningFocus: updatedFocus
    }));
    
    setUnsavedChanges(true);
    setNewFocus('');
  };
  
  // Function to remove a focus area
  const handleRemoveFocus = (index: number) => {
    const updatedFocus = [...(status?.tuning?.learningFocus || [])];
    updatedFocus.splice(index, 1);
    
    setPendingChanges(prev => ({
      ...prev,
      learningFocus: updatedFocus
    }));
    
    setUnsavedChanges(true);
  };
  
  // Save pending changes to Neural tuning - only triggered when user clicks Save Changes
  const saveChanges = async () => {
    if (!unsavedChanges) {
      // No changes to save
      toast({
        title: "No Changes",
        description: "No changes to save.",
        variant: "default",
      });
      return;
    }
    
    if (!user) {
      // Prompt login if user is not authenticated
      toast({
        title: "Sign in Required",
        description: "Please sign in to save your neural tuning settings.",
        variant: "default",
      });
      
      // Redirect to auth page after a short delay
      setTimeout(() => {
        setLocation('/auth');
      }, 1500);
      
      return;
    }
    
    try {
      // Update using the mutation function from the hook
      updateTuning(pendingChanges);
      
      // Reset state after saving
      setUnsavedChanges(false);
      setPendingChanges({});
      setJustSaved(true);
      
      // Mark the sections as configured after saving
      setCognitiveShieldConfigured(true);
      setExpertiseLayerConfigured(true);
      
      // Reset saved status after 2 seconds
      setTimeout(() => {
        setJustSaved(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating neural tuning:", error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving your DotSpark tuning settings.",
        variant: "destructive",
      });
    }
  };
  
  // Extract values from status for rendering
  const { gameElements, tuning: neuralTuning } = status || { 
    gameElements: {
      level: 1,
      experience: 0,
      experienceRequired: 1000,
      stats: {
        adaptationScore: 0,
        connectionsFormed: 0,
        insightsGenerated: 0,
        messagesProcessed: 0
      }
    }, 
    tuning: {
      creativity: 0.5,
      precision: 0.5,
      speed: 0.5,
      analytical: 0.5,
      intuitive: 0.5,
      specialties: {},
      learningFocus: []
    }
  };

  // Header section with status and controls
  const renderHeader = () => (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/')} className="p-2 flex-shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setLocation('/dotspark-tuning')}
          >
            <img src="/dotspark-logo-header.png?v=3" alt="DotSpark" className="h-6 w-16 object-contain" />
          </div>
        </div>
        
        {/* Mobile layout - stack vertically */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-sm font-medium whitespace-nowrap">Status:</span>
            <span className={`inline-flex h-3 w-3 rounded-full flex-shrink-0 ${isActivated ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm font-medium">{isActivated ? 'Active' : 'Inactive'}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {unsavedChanges && isActivated && (
              <Button 
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 justify-center whitespace-nowrap"
                onClick={saveChanges}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </span>
                )}
              </Button>
            )}
            <Button 
              variant={isActivated ? "outline" : "default"} 
              size="sm"
              className={`flex items-center justify-center whitespace-nowrap ${
                isActivated 
                  ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950" 
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
              onClick={isActivated ? deactivateDotSpark : handleActivateDotSpark}
            >
              <span className="hidden sm:inline">{isActivated ? "Deactivate DotSpark" : "Activate DotSpark"}</span>
              <span className="sm:hidden">{isActivated ? "Deactivate" : "Activate"}</span>
            </Button>
          </div>
        </div>
      </div>
      
      {isActivated ? (
        <div className="mb-6 p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <Check className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium">DotSpark is Active</h3>
              <p className="text-sm text-muted-foreground">Your DotSpark is active and ready to assist you.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-amber-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium">DotSpark is Inactive</h3>
              <p className="text-sm text-muted-foreground">Activate your DotSpark to begin receiving personalized insights.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Loading state
  if (isTuningLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        {renderHeader()}
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <BrainCircuit className="h-16 w-16 text-amber-400 animate-pulse mb-4" />
            <h3 className="text-xl font-medium mb-2">Loading DotSpark...</h3>
            <p className="text-muted-foreground">Connecting to your DotSpark</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      {/* Header Section with Status Indicators */}
      {renderHeader()}
      
      {/* My Neural Capacity Card with Metrics */}
      <Card className="mb-8 bg-gradient-to-br from-amber-50 to-slate-50 dark:from-amber-950/30 dark:to-slate-950 border border-amber-100 dark:border-amber-900/50 overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-amber-200/30 to-orange-200/10 dark:from-amber-800/20 dark:to-orange-800/5 rounded-full blur-3xl"></div>
        </div>
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              <CardTitle>
                <span className="font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">My DotSpark Capacity</span>
              </CardTitle>
            </div>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/50">
              Level 1
            </Badge>
          </div>
          <CardDescription>Track your DotSpark system's capacity and performance metrics</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4 relative z-10">
          {/* Experience Progress */}
          <div className="mb-4">
            <div className="flex justify-between mb-1.5 text-sm font-medium">
              <span>Experience</span>
              <span>125 / 1000 XP</span>
            </div>
            <Progress value={12.5} className="h-2 bg-amber-100 dark:bg-amber-950" />
          </div>
          
          {/* Capacity Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {/* Processing Efficiency */}
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
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
                            strokeDasharray={`${2 * Math.PI * 45 * (processingEfficiency / 100)} ${2 * Math.PI * 45}`}
                            strokeDashoffset={2 * Math.PI * 45 * 0.25}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-amber-500" />
                        </div>
                      </div>
                      <div className="text-sm font-medium mt-1">Processing</div>
                      <div className="text-xs text-muted-foreground">Usage Frequency</div>
                      <div className="text-xl font-bold">{Math.round(processingEfficiency)}%</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 p-3 shadow-lg max-w-[200px]">
                    <p className="text-sm font-medium">Processing Capacity</p>
                    <p className="text-xs text-muted-foreground mt-1">Increases when you use DotSpark regularly. Higher usage frequency means better processing power.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Memory Capacity */}
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
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
                            className="text-amber-600 transition-all duration-500 ease-out" 
                            strokeWidth="8" 
                            strokeDasharray={`${2 * Math.PI * 45 * (memoryCapacity / 100)} ${2 * Math.PI * 45}`}
                            strokeDashoffset={2 * Math.PI * 45 * 0.25}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BrainCog className="h-5 w-5 text-amber-600" />
                        </div>
                      </div>
                      <div className="text-sm font-medium mt-1">Memory</div>
                      <div className="text-xs text-muted-foreground">Entries & Storage</div>
                      <div className="text-xl font-bold">{Math.round(memoryCapacity)}%</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 p-3 shadow-lg max-w-[200px]">
                    <p className="text-sm font-medium">Memory Capacity</p>
                    <p className="text-xs text-muted-foreground mt-1">Grows as you add entries and save knowledge in your DotSpark. More entries mean increased memory capacity.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Learning Rate */}
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="45" 
                            fill="none" 
                            stroke="currentColor" 
                            className="text-orange-100 dark:text-orange-950" 
                            strokeWidth="8" 
                          />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="45" 
                            fill="none" 
                            stroke="currentColor" 
                            className="text-orange-600 transition-all duration-500 ease-out" 
                            strokeWidth="8" 
                            strokeDasharray={`${2 * Math.PI * 45 * (learningRate / 100)} ${2 * Math.PI * 45}`}
                            strokeDashoffset={2 * Math.PI * 45 * 0.25}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lightbulb className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="text-sm font-medium mt-1">Learning</div>
                      <div className="text-xs text-muted-foreground">WhatsApp Interactions</div>
                      <div className="text-xl font-bold">{Math.round(learningRate)}%</div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 p-3 shadow-lg max-w-[200px]">
                    <p className="text-sm font-medium">Learning Capacity</p>
                    <p className="text-xs text-muted-foreground mt-1">Improves when you enable WhatsApp integration. More interactions through WhatsApp enhance your learning rate.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Implementation Level */}
            <div className="text-center">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-yellow-100 dark:text-yellow-950" 
                    strokeWidth="8" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-yellow-600 transition-all duration-500 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray={`${2 * Math.PI * 45 * (specializationLevel / 100)} ${2 * Math.PI * 45}`}
                    strokeDashoffset={2 * Math.PI * 45 * 0.25}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="text-sm font-medium mt-1">Implementation</div>
              <div className="text-xs text-muted-foreground">Decision Making</div>
              <div className="text-xl font-bold">{Math.round(specializationLevel)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Neural Tuning Section Cards */}
      <div className="my-8">
        <h2 className="text-2xl font-bold mb-6">Configure Your DotSpark Add Ons</h2>
        <p className="text-muted-foreground mb-8">
          Configure each of these DotSpark Add Ons to mirror your natural style and intelligence which communicating with AI.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 auto-rows-fr">

          {/* CogniShield Card */}
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
                <h3 className="text-xl font-bold text-amber-50">CogniShield</h3>
              </div>
            </div>
            <CardContent className="p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 flex flex-col justify-between min-h-[120px]">
              <p className="text-muted-foreground mb-4 flex-1">
                Configure your cognitive shield to monitor AI alignment with your thinking patterns.
              </p>
              <div className="flex justify-center mt-auto">
                <Button 
                  className="flex items-center justify-center gap-2 w-48 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white group-hover:translate-y-0 translate-y-1 transition-all duration-300 h-10 relative"
                  onClick={() => {
                    setLocation('/cognitive-shield-config');
                  }}
                >
                  {cognitiveShieldConfigured && (
                    <Edit className="h-3 w-3 absolute -top-1 -right-1 bg-white text-amber-700 rounded-full p-0.5" />
                  )}
                  {cognitiveShieldConfigured ? 'Configured' : 'Configure Shield'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expertise Layer Card */}
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
                  <Target className="h-12 w-12 text-amber-100" />
                </div>
                <h3 className="text-xl font-bold text-amber-50">Expertise Layer (Optional)</h3>
              </div>
            </div>
            <CardContent className="p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 flex flex-col justify-between min-h-[120px]">
              <p className="text-muted-foreground mb-4 flex-1">
                Configure your professional expertise layer for domain specific insights.
              </p>
              <div className="flex justify-center mt-auto">
                <Button 
                  className="flex items-center justify-center gap-2 w-48 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white group-hover:translate-y-0 translate-y-1 transition-all duration-300 h-10 relative"
                  onClick={() => {
                    setLocation('/dotspark-tuning/expertise');
                  }}
                >
                  {expertiseLayerConfigured && (
                    <Edit className="h-3 w-3 absolute -top-1 -right-1 bg-white text-amber-700 rounded-full p-0.5" />
                  )}
                  {expertiseLayerConfigured ? 'Configured' : 'Configure Expertise'}
                </Button>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
      

      
      {/* Save button fixed at bottom if changes are unsaved */}
      {unsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-white dark:bg-gray-950 border-t shadow-lg z-10">
          <div className="container max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <Button 
              disabled={isUpdating || justSaved}
              variant="default" 
              className={justSaved ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
              onClick={saveChanges}
            >
              {justSaved ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-1 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {/* Invite Code Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Activate DotSpark
            </DialogTitle>
            <DialogDescription>
              DotSpark is an exclusive service. Please enter your invite code to activate your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="Enter your invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInviteCodeSubmit();
                  }
                }}
                disabled={isValidatingCode}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteDialog(false);
                  setInviteCode('');
                }}
                disabled={isValidatingCode}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteCodeSubmit}
                disabled={isValidatingCode || !inviteCode.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isValidatingCode ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Validating...
                  </span>
                ) : (
                  'Activate DotSpark'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}