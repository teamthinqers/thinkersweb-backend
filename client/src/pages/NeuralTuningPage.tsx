import React, { useState } from 'react';
import { Brain, Zap, Lightbulb, FlaskConical, Clock, Gauge, Award, Target, Layers, Sparkles } from 'lucide-react';
import { useNeuralTuning } from '@/hooks/useNeuralTuning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Neural Tuning Page - Core PWA functionality
 * This page allows users to customize their neural extension parameters
 * and view their progress in the gamified experience
 */
export default function NeuralTuningPage() {
  const { 
    tuning, 
    gameElements, 
    updateTuning, 
    updateSpecialty,
    updateLearningFocus,
    formatTuningValue, 
    calculateLevelProgress,
    isPending,
    isLoading
  } = useNeuralTuning();
  
  const [newFocus, setNewFocus] = useState('');
  const [activeTab, setActiveTab] = useState('tuning');

  // For handling specialty domain selections
  const [selectedDomain, setSelectedDomain] = useState('general');
  const [specialtyValue, setSpecialtyValue] = useState(tuning?.specialties.general || 0.5);

  // Calculate experience progress
  const levelProgress = calculateLevelProgress() * 100;
  
  // Handle specialty domain change
  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    setSpecialtyValue(tuning?.specialties[domain] || 0.5);
  };
  
  // Handle specialty value update
  const handleSpecialtyUpdate = () => {
    if (selectedDomain) {
      updateSpecialty(selectedDomain, specialtyValue);
    }
  };
  
  // Handle adding new learning focus
  const handleAddFocus = () => {
    if (newFocus && tuning) {
      const updatedFocus = [...tuning.learningFocus, newFocus];
      updateLearningFocus(updatedFocus);
      setNewFocus('');
    }
  };
  
  // Handle removing learning focus
  const handleRemoveFocus = (focus: string) => {
    if (tuning) {
      const updatedFocus = tuning.learningFocus.filter(f => f !== focus);
      updateLearningFocus(updatedFocus);
    }
  };

  // If tuning data is not yet loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center gap-4">
          <Brain className="h-16 w-16 text-primary animate-pulse" />
          <p className="text-lg text-center">Loading your neural extension...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-4 pt-6 pb-16">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-violet-500 text-transparent bg-clip-text">
          Neural Extension Tuning
        </h1>
        <p className="text-muted-foreground">
          Customize how your neural extension processes information
        </p>
      </header>

      <Card className="mb-8 border-purple-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-700 to-violet-500 flex items-center justify-center text-white shadow-lg">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Neural Level {gameElements?.level || 1}</h2>
              <p className="text-sm text-muted-foreground">
                Adaptation Score: {gameElements?.stats.adaptationScore || 0}%
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-medium border-purple-300">
            {gameElements?.unlockedCapabilities.length || 0} Capabilities
          </Badge>
        </div>
        
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <div className="flex justify-between text-sm mb-1">
            <span>Experience</span>
            <span>{gameElements?.experience || 0}/{gameElements?.experienceRequired || 100} XP</span>
          </div>
          <Progress value={levelProgress} className="h-2 bg-purple-100" />
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="tuning" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span>Core Tuning</span>
          </TabsTrigger>
          <TabsTrigger value="specialties" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            <span>Specialties</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Core Tuning Tab */}
        <TabsContent value="tuning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Core Parameters
              </CardTitle>
              <CardDescription>
                Adjust how your neural extension processes information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Creativity */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Creativity
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {formatTuningValue(tuning?.creativity)}
                  </span>
                </div>
                <Slider
                  value={[tuning?.creativity || 0.5]}
                  min={0}
                  max={1}
                  step={0.01}
                  className="[&>span:first-child]:bg-amber-500/20"
                  onValueChange={([value]) => updateTuning({ creativity: value })}
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values produce more creative and varied responses
                </p>
              </div>
              
              {/* Precision */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-500" />
                    Precision
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {formatTuningValue(tuning?.precision)}
                  </span>
                </div>
                <Slider
                  value={[tuning?.precision || 0.5]}
                  min={0}
                  max={1}
                  step={0.01}
                  className="[&>span:first-child]:bg-emerald-500/20"
                  onValueChange={([value]) => updateTuning({ precision: value })}
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values improve factual accuracy and detail level
                </p>
              </div>
              
              {/* Speed */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Speed
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {formatTuningValue(tuning?.speed)}
                  </span>
                </div>
                <Slider
                  value={[tuning?.speed || 0.5]}
                  min={0}
                  max={1}
                  step={0.01}
                  className="[&>span:first-child]:bg-blue-500/20"
                  onValueChange={([value]) => updateTuning({ speed: value })}
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values prioritize response speed over depth
                </p>
              </div>
              
              {/* Cognitive Style: Analytical vs Intuitive */}
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium mb-3">Cognitive Style Balance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-500" />
                      Analytical
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {formatTuningValue(tuning?.analytical)}
                    </span>
                  </div>
                  <Slider
                    value={[tuning?.analytical || 0.5]}
                    min={0}
                    max={1}
                    step={0.01}
                    className="[&>span:first-child]:bg-indigo-500/20"
                    onValueChange={([value]) => updateTuning({ analytical: value })}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Logical, systematic thinking emphasis
                  </p>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <label className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-fuchsia-500" />
                      Intuitive
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {formatTuningValue(tuning?.intuitive)}
                    </span>
                  </div>
                  <Slider
                    value={[tuning?.intuitive || 0.5]}
                    min={0}
                    max={1}
                    step={0.01}
                    className="[&>span:first-child]:bg-fuchsia-500/20"
                    onValueChange={([value]) => updateTuning({ intuitive: value })}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pattern recognition and insight emphasis
                  </p>
                </div>
              </div>
              
              {/* Learning Focus */}
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium mb-3">Learning Focus</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Topics your neural extension will prioritize learning
                </p>
                
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    placeholder="Add a focus area..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddFocus} 
                    size="sm" 
                    disabled={!newFocus || isPending}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {tuning?.learningFocus.map((focus) => (
                    <Badge 
                      key={focus} 
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {focus}
                      <button 
                        onClick={() => handleRemoveFocus(focus)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                        disabled={isPending}
                      >
                        <span className="sr-only">Remove</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </Badge>
                  ))}
                  {tuning?.learningFocus.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No focus areas added yet
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => updateTuning({
                  creativity: tuning?.creativity,
                  precision: tuning?.precision,
                  speed: tuning?.speed,
                  analytical: tuning?.analytical,
                  intuitive: tuning?.intuitive
                })}
                disabled={isPending}
              >
                {isPending ? 'Updating...' : 'Save Neural Parameters'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Specialties Tab */}
        <TabsContent value="specialties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-purple-500" />
                Specialty Focus
              </CardTitle>
              <CardDescription>
                Customize your neural extension's domain expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm">
                  Adjust how much your neural extension prioritizes different knowledge domains.
                  Higher values mean better performance in that specialty area.
                </p>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Domain</label>
                    <Select 
                      value={selectedDomain} 
                      onValueChange={handleDomainChange}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Knowledge</SelectItem>
                        <SelectItem value="business">Business & Leadership</SelectItem>
                        <SelectItem value="technology">Technology & Engineering</SelectItem>
                        <SelectItem value="science">Science & Research</SelectItem>
                        <SelectItem value="arts">Arts & Creativity</SelectItem>
                        <SelectItem value="personal">Personal Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">
                        Domain Focus Level
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {formatTuningValue(specialtyValue)}
                      </span>
                    </div>
                    <Slider
                      value={[specialtyValue]}
                      min={0}
                      max={1}
                      step={0.01}
                      className="[&>span:first-child]:bg-purple-500/20"
                      onValueChange={([value]) => setSpecialtyValue(value)}
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <h3 className="text-sm font-medium mb-2">Current Specialty Levels</h3>
                <div className="space-y-2">
                  {tuning && Object.entries(tuning.specialties).map(([domain, value]) => (
                    <div key={domain} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{domain.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={value * 100} 
                          className="h-2 w-24 bg-muted" 
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {Math.round(value * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full"
                onClick={handleSpecialtyUpdate}
                disabled={isPending}
              >
                {isPending ? 'Updating...' : 'Update Specialty Focus'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Neural Achievements
              </CardTitle>
              <CardDescription>
                Track your neural extension's growth and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-sm font-medium mb-2">Neural Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Messages Processed</div>
                      <div className="text-lg font-semibold">{gameElements?.stats.messagesProcessed || 0}</div>
                    </div>
                    <div className="bg-background rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Insights Generated</div>
                      <div className="text-lg font-semibold">{gameElements?.stats.insightsGenerated || 0}</div>
                    </div>
                    <div className="bg-background rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Connections Formed</div>
                      <div className="text-lg font-semibold">{gameElements?.stats.connectionsFormed || 0}</div>
                    </div>
                    <div className="bg-background rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Adaptation Score</div>
                      <div className="text-lg font-semibold">{gameElements?.stats.adaptationScore || 0}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-3">Unlocked Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {gameElements?.unlockedCapabilities.map((capability) => (
                      <Badge 
                        key={capability} 
                        className="capitalize"
                      >
                        {capability.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-3">Achievement Progress</h3>
                  <div className="space-y-4">
                    {gameElements?.achievements.map((achievement) => (
                      <div key={achievement.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {achievement.unlocked ? (
                              <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="12" 
                                  height="12" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="3"
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  className="text-green-500"
                                >
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20" />
                            )}
                            <span className="text-sm font-medium">{achievement.name}</span>
                          </div>
                          <Badge 
                            variant={achievement.unlocked ? "default" : "outline"}
                            className={achievement.unlocked ? "bg-green-500" : ""}
                          >
                            {achievement.unlocked ? "Completed" : `${Math.round(achievement.progress * 100)}%`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground pl-7">
                          {achievement.description}
                        </p>
                        {!achievement.unlocked && (
                          <Progress 
                            value={achievement.progress * 100} 
                            className="h-1.5 ml-7 mr-1" 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}