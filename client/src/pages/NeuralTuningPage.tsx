import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useNeuralTuning } from '@/hooks/useNeuralTuning';
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

export default function NeuralTuningPage() {
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('parameters');
  const [newFocus, setNewFocus] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  
  const { 
    status, 
    isLoading, 
    isError, 
    availableSpecialties,
    updateTuning,
    isUpdating,
    updateLearningFocus,
    isUpdatingFocus
  } = useNeuralTuning();
  
  // Function to handle slider value changes
  const handleParameterChange = (paramName: string, value: number[]) => {
    const paramValue = value[0];
    updateTuning({ [paramName]: paramValue });
  };
  
  // Function to handle specialty value changes
  const handleSpecialtyChange = (specialtyId: string, value: number[]) => {
    const specialtyValue = value[0];
    updateTuning({
      specialties: {
        [specialtyId]: specialtyValue
      }
    });
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
          <h1 className="text-2xl font-bold">Neural Extension Tuning</h1>
        </div>
        
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Connection Error</CardTitle>
            <CardDescription>Unable to connect to your neural extension</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              There was an error connecting to your neural extension. This could be due to network issues or your neural extension may need to be reactivated.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { gameElements, tuning } = status || {};
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/')} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Neural Extension Tuning</h1>
        </div>
        <Button variant="outline" onClick={() => setLocation('/neural-capacity')} className="gap-1.5">
          <Gauge className="h-4 w-4" />
          <span>View Capacity</span>
        </Button>
      </div>
      
      {/* Neural Extension Level Card */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-950 border border-purple-100 dark:border-purple-900/50">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-700 dark:text-purple-400" />
              <CardTitle>Neural Extension</CardTitle>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/50">
              Level {gameElements?.level || 1}
            </Badge>
          </div>
          <CardDescription>Configure how your cognitive extension processes information</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4">
          <div className="mb-4">
            <div className="flex justify-between mb-1.5 text-sm font-medium">
              <span>Experience</span>
              <span>{gameElements?.experience || 0} / {gameElements?.experienceRequired || 1000} XP</span>
            </div>
            <Progress value={(gameElements?.experience || 0) / (gameElements?.experienceRequired || 1000) * 100} className="h-2 bg-purple-100 dark:bg-purple-950" />
          </div>
          
          <div className="text-sm text-muted-foreground mb-2">
            <p>Tuning your neural extension affects how it processes information and generates insights. Each parameter adjustment adapts your extension to better match your cognitive preferences.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for different tuning options */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="parameters" className="flex items-center gap-1.5">
            <Gauge className="h-4 w-4" />
            <span>Parameters</span>
          </TabsTrigger>
          <TabsTrigger value="specialties" className="flex items-center gap-1.5">
            <BrainCog className="h-4 w-4" />
            <span>Specialties</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" />
            <span>Learning</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-6">
          {/* Core processing parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Core Processing
              </CardTitle>
              <CardDescription>Adjust how your neural extension processes and responds to information</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Creativity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <Sparkles className="h-4 w-4 text-pink-500" />
                        <label htmlFor="creativity" className="text-sm font-medium">
                          Creativity
                        </label>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Creativity Parameter</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls how creative and varied the neural extension's outputs will be. Higher values produce more unique and unexpected connections.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.creativity || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="creativity"
                  defaultValue={[(tuning?.creativity || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('creativity', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Logical</span>
                  <span>Creative</span>
                </div>
              </div>
              
              {/* Precision Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <Target className="h-4 w-4 text-blue-500" />
                        <label htmlFor="precision" className="text-sm font-medium">
                          Precision
                        </label>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Precision Parameter</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls the accuracy and detail level in the neural extension's processing. Higher values produce more accurate and detailed insights.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.precision || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="precision"
                  defaultValue={[(tuning?.precision || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('precision', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Broad</span>
                  <span>Precise</span>
                </div>
              </div>
              
              {/* Speed Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <label htmlFor="speed" className="text-sm font-medium">
                          Processing Speed
                        </label>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Processing Speed Parameter</h4>
                        <p className="text-sm text-muted-foreground">
                          Controls the balance between speed and depth of processing. Higher values prioritize faster responses over deeper analysis.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.speed || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="speed"
                  defaultValue={[(tuning?.speed || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('speed', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Deep</span>
                  <span>Fast</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Cognitive Style Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-indigo-500" />
                Cognitive Style
              </CardTitle>
              <CardDescription>Adjust the thinking style your neural extension emphasizes</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Analytical Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="analytical" className="text-sm font-medium flex items-center gap-1.5">
                    <BrainCog className="h-4 w-4 text-blue-600" />
                    Analytical Thinking
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.analytical || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="analytical"
                  defaultValue={[(tuning?.analytical || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('analytical', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              
              {/* Intuitive Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="intuitive" className="text-sm font-medium flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Intuitive Thinking
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((tuning?.intuitive || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  id="intuitive"
                  defaultValue={[(tuning?.intuitive || 0.5) * 100]}
                  max={100}
                  step={5}
                  onValueCommit={(value) => handleParameterChange('intuitive', [value[0] / 100])}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Specialties Tab */}
        <TabsContent value="specialties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Domain Specialties
              </CardTitle>
              <CardDescription>Adjust how your neural extension specializes in different knowledge domains</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                <p>Higher values mean your neural extension will emphasize that knowledge domain when processing information and generating insights.</p>
              </div>
              
              {availableSpecialties.map((specialty) => (
                <div key={specialty.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor={`specialty-${specialty.id}`} className="text-sm font-medium">
                      {specialty.name}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(((tuning?.specialties?.[specialty.id]) || 0) * 100)}%
                    </span>
                  </div>
                  <Slider
                    id={`specialty-${specialty.id}`}
                    defaultValue={[((tuning?.specialties?.[specialty.id]) || 0) * 100]}
                    max={100}
                    step={5}
                    onValueCommit={(value) => handleSpecialtyChange(specialty.id, [value[0] / 100])}
                    className="py-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Learning Focus Tab */}
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
              <div className="text-sm text-muted-foreground mb-2">
                <p>Your neural extension will prioritize content related to these topics when learning and generating insights.</p>
              </div>
              
              {/* Add new focus area */}
              <div className="flex gap-2">
                <Input 
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  placeholder="Add a learning focus area"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFocus()}
                />
                <Button 
                  onClick={handleAddFocus} 
                  size="icon"
                  disabled={isUpdatingFocus || !newFocus.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Current focus areas */}
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Current Focus Areas</h3>
                {(!tuning?.learningFocus || tuning.learningFocus.length === 0) ? (
                  <div className="text-sm text-muted-foreground italic">
                    No focus areas defined yet. Add some above to guide your neural extension's learning.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tuning.learningFocus.map((focus, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/30"
                      >
                        {focus}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 rounded-full p-0 text-green-700 dark:text-green-400 hover:bg-green-200/50 dark:hover:bg-green-900/30"
                          onClick={() => handleRemoveFocus(index)}
                          disabled={isUpdatingFocus}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Achievements Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
              <CardDescription>Track your neural extension's learning progress</CardDescription>
            </CardHeader>
            
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {gameElements?.achievements?.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-3">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full mt-0.5",
                        achievement.unlocked 
                          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/60 dark:text-yellow-400" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {achievement.unlocked ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <LockIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "text-sm font-medium",
                            achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {achievement.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(achievement.progress * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <Progress 
                          value={achievement.progress * 100} 
                          className={cn(
                            "h-1.5",
                            achievement.unlocked 
                              ? "bg-yellow-100 dark:bg-yellow-950/40" 
                              : "bg-muted"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Unlocked Capabilities Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                Unlocked Capabilities
              </CardTitle>
              <CardDescription>Features your neural extension has learned</CardDescription>
            </CardHeader>
            
            <CardContent>
              {(!gameElements?.unlockedCapabilities || gameElements.unlockedCapabilities.length === 0) ? (
                <div className="text-sm text-muted-foreground italic">
                  No capabilities unlocked yet. Continue using your neural extension to unlock new features.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {gameElements.unlockedCapabilities.map((capability, index) => (
                    <Badge 
                      key={index}
                      className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:hover:bg-purple-900/30"
                    >
                      {capability}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Lock icon component
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}