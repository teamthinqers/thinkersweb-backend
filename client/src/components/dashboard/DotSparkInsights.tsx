import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Brain, LightbulbIcon, Zap, RefreshCw } from 'lucide-react';
import { useDotSpark } from '@/hooks/useDotSpark';

export function DotSparkInsights() {
  const { 
    status, 
    insights, 
    recommendations, 
    isLoading, 
    formatAdaptationLevel,
    refresh 
  } = useDotSpark();
  
  const handleRefresh = () => {
    refresh();
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            DotSpark Insights
          </CardTitle>
          <CardDescription>
            Loading neural extension data...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Analyzing your neural patterns</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If no status or not active
  if (!status || !status.isActive) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            DotSpark Insights
          </CardTitle>
          <CardDescription>
            Your neural extension is not yet fully activated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-muted-foreground" />
              <p className="text-lg font-medium">Continue interacting to activate</p>
            </div>
            <p className="text-center text-muted-foreground">
              Your neural extension needs more interaction data to start generating insights.
              Continue chatting on WhatsApp or through the dashboard to activate.
            </p>
            <Progress value={status?.adaptationLevel ? status.adaptationLevel * 100 : 0} className="w-full max-w-md mt-4" />
            <p className="text-sm text-muted-foreground">
              DotSpark Adaptation Level: {formatAdaptationLevel(status?.adaptationLevel)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            DotSpark Insights
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Your neural extension has discovered the following insights based on your interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="font-medium">DotSpark Insights</h3>
            </div>
            {insights && insights.length > 0 ? (
              <div className="space-y-3 mt-2">
                {insights.map((insight, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex gap-2 items-start">
                      <LightbulbIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">{insight.insight}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {insight.topics.map((topic, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No insights generated yet. Continue interacting to gather more data.
              </p>
            )}
          </div>

          <Separator className="my-2" />
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <Zap className="h-4 w-4 text-violet-500" />
              <h3 className="font-medium">Recommended Topics</h3>
            </div>
            {recommendations && recommendations.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {recommendations.map((topic, i) => (
                  <Badge key={i} variant="outline" className="text-sm py-1">
                    {topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No topic recommendations available yet.
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-3">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-muted-foreground">
            Tracking {status.topicsTracked} topics · {status.patternsDetected} patterns detected
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Adaptation Level:</span>
            <Badge variant="secondary">{formatAdaptationLevel(status.adaptationLevel)}</Badge>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}