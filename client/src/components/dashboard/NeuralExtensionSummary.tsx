import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Star, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { useDotSpark } from '@/hooks/useNeuralExtension';
import { cn } from '@/lib/utils';

/**
 * Summary card for DotSpark to be displayed on the dashboard
 * This provides an overview of the DotSpark status
 */
export function DotSparkSummary() {
  const [_, setLocation] = useLocation();
  const { status, isLoading, isError } = useDotSpark();
  
  const handleTuneClick = () => {
    setLocation('/dotspark-tuning');
  };
  
  if (isLoading) {
    return (
      <Card className="w-full mb-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-950 border border-purple-100 dark:border-purple-900/50 animate-pulse overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-700 dark:text-purple-400" />
            <span>Cognitive OS</span>
          </CardTitle>
          <CardDescription>Loading Cognitive OS data...</CardDescription>
        </CardHeader>
        <CardContent className="opacity-50">
          <div className="h-24 rounded-md bg-purple-100 dark:bg-purple-900/30"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !status) {
    return (
      <Card className="w-full mb-8 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <BrainCircuit className="h-5 w-5" />
            <span>Cognitive OS</span>
          </CardTitle>
          <CardDescription>Unable to load Cognitive OS data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            There was an error connecting to your Cognitive OS. This could be due to network issues.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const { gameElements, tuning } = status;
  const adaptationLevel = gameElements?.stats?.adaptationScore || 0;
  const { level, experience, experienceRequired, unlockedCapabilities = [] } = gameElements || {};
  const progressPercentage = (experience / experienceRequired) * 100;
  
  // Take the top 3 tracked topics for display
  const topTopics = status.topicsTracked?.slice(0, 3) || [];
  
  return (
    <Card className="w-full mb-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-950 border border-purple-100 dark:border-purple-900/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-700 dark:text-purple-400" />
            <span>Cognitive OS</span>
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/50">
            Level {level}
          </Badge>
        </div>
        <CardDescription>Your personalized Cognitive OS</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1.5 text-sm font-medium">
            <span>Experience</span>
            <span>{experience} / {experienceRequired} XP</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-purple-100 dark:bg-purple-950" />
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-purple-50 dark:bg-purple-950/40 rounded-md p-2 text-center">
            <Sparkles className="h-4 w-4 mx-auto mb-1 text-purple-700 dark:text-purple-400" />
            <p className="text-xs font-medium">Creativity</p>
            <p className="text-lg font-semibold">{Math.floor(tuning.creativity * 100)}%</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 rounded-md p-2 text-center">
            <Zap className="h-4 w-4 mx-auto mb-1 text-purple-700 dark:text-purple-400" />
            <p className="text-xs font-medium">Precision</p>
            <p className="text-lg font-semibold">{Math.floor(tuning.precision * 100)}%</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 rounded-md p-2 text-center">
            <Star className="h-4 w-4 mx-auto mb-1 text-purple-700 dark:text-purple-400" />
            <p className="text-xs font-medium">Adaptation</p>
            <p className="text-lg font-semibold">{Math.floor(adaptationLevel)}%</p>
          </div>
        </div>
        
        {unlockedCapabilities.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Unlocked Capabilities</h4>
            <div className="flex flex-wrap gap-1.5">
              {unlockedCapabilities.map((capability, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50/50 dark:bg-purple-950/20">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {topTopics.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Top Topics</h4>
            <div className="flex flex-wrap gap-1.5">
              {topTopics.map((topic, index) => (
                <Badge key={index} className={cn(
                  "bg-gradient-to-r",
                  index === 0 ? "from-amber-500 to-orange-500" : 
                  index === 1 ? "from-blue-500 to-indigo-500" : 
                  "from-green-500 to-emerald-500"
                )}>
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleTuneClick}
          className="w-full bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-800 hover:to-purple-600">
          Tune Your Cognitive OS
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}