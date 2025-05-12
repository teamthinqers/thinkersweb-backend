import React from 'react';
import { Link } from 'wouter';
import { Brain, Zap, Settings, ArrowRight, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNeuralExtension } from '@/hooks/useNeuralExtension';
import { useNeuralTuning } from '@/hooks/useNeuralTuning';
import { CompactInstallPrompt } from '@/components/pwa/InstallPrompt';

/**
 * Summary card for the Neural Extension to be displayed on the dashboard
 * This provides an overview of the neural extension status
 */
export function NeuralExtensionSummary() {
  const { status, insights, recommendations, formatAdaptationLevel } = useNeuralExtension();
  const { gameElements, calculateLevelProgress } = useNeuralTuning();
  
  const levelProgress = calculateLevelProgress() * 100;
  
  // No data available yet
  if (!status) {
    return (
      <Card className="border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Neural Extension
          </CardTitle>
          <CardDescription>
            Your personal neural extension is still initializing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Brain className="h-8 w-8 text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">Calibrating neural pathways...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Neural Extension
            </CardTitle>
            <CardDescription>
              Level {gameElements?.level || 1} • {status.topicsTracked} Topics • {formatAdaptationLevel(status.adaptationLevel)}
            </CardDescription>
          </div>
          <Link to="/neural-tuning">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Neural Settings</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          {/* Level Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-xs">Neural Level Progress</span>
              <span className="text-xs">
                {gameElements?.experience || 0}/{gameElements?.experienceRequired || 100} XP
              </span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
          
          {/* Capabilities */}
          <div className="bg-muted/30 rounded-md p-3">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Unlocked Capabilities
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {gameElements?.unlockedCapabilities.slice(0, 3).map((capability) => (
                <Badge 
                  key={capability} 
                  variant="secondary"
                  className="capitalize text-xs"
                >
                  {capability.replace(/-/g, ' ')}
                </Badge>
              ))}
              {(gameElements?.unlockedCapabilities.length || 0) > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(gameElements?.unlockedCapabilities.length || 0) - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          {/* Insights Preview */}
          {insights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Latest Neural Insight</h4>
              <p className="text-sm text-muted-foreground italic">
                "{insights[0].insight}"
              </p>
            </div>
          )}
          
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1.5">Recommended Topics</h4>
              <div className="flex flex-wrap gap-1.5">
                {recommendations.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex flex-col gap-2">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          asChild
        >
          <Link to="/neural-tuning">
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Tune Neural Extension</span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        
        <CompactInstallPrompt />
      </CardFooter>
    </Card>
  );
}