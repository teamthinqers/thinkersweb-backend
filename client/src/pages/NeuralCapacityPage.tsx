import React from 'react';
import { Link } from 'wouter';
import { useDotSpark } from '@/hooks/useNeuralExtension';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  BrainCircuit, 
  ChevronLeft, 
  Zap, 
  Database, 
  Network, 
  LineChart, 
  Gauge,
  History,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function DotSparkCapacityPage() {
  const { status, isLoading, isError } = useDotSpark();
  
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
          <Button variant="ghost" asChild className="p-2">
            <Link href="/"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">DotSpark Capacity</h1>
        </div>
        
        <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Connection Error</CardTitle>
            <CardDescription>Unable to connect to your DotSpark</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              There was an error connecting to your Cognitive OS. This could be due to network issues or your Cognitive OS may need to be reactivated.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { gameElements } = status || {};
  
  // Calculate efficiency metrics
  const processingEfficiency = Math.min(100, ((gameElements?.stats?.messagesProcessed || 0) / 100) * 80 + 20);
  const memoryUtilization = Math.min(100, ((gameElements?.stats?.connectionsFormed || 0) / 50) * 70 + 30);
  const learningRate = Math.min(100, ((gameElements?.stats?.insightsGenerated || 0) / 20) * 60 + 40);
  const adaptationScore = gameElements?.stats?.adaptationScore || 68;
  
  // List of unlocked and upcoming capabilities
  const unlockedCapabilities = gameElements?.unlockedCapabilities || [];
  const upcomingCapabilities = [
    "Semantic Search",
    "Multi-Hop Reasoning",
    "Knowledge Graph Generation",
    "Automated Connections"
  ].filter(cap => !unlockedCapabilities.includes(cap));
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with Back Button */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" asChild className="p-2">
          <Link href="/"><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">My Neural Capacity</h1>
      </div>
      
      {/* Main Capacity Card */}
      <Card className="mb-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-purple-950/40 dark:via-gray-950 dark:to-indigo-950/40 border border-purple-100 dark:border-purple-900/50 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-700 dark:text-purple-400" />
              <CardTitle>Neural Extension</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/50">
                Level {gameElements?.level || 1}
              </Badge>
            </div>
          </div>
          <CardDescription>Visualizing your neural extension's capacity and efficiency</CardDescription>
        </CardHeader>
        
        <div className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-purple-200/30 to-indigo-200/10 dark:from-purple-800/20 dark:to-indigo-800/5 rounded-full blur-3xl"></div>
        </div>
        
        <CardContent className="relative z-10">
          {/* Experience and Level */}
          <div className="mb-8">
            <div className="flex justify-between mb-1.5 text-sm font-medium">
              <span>Neural Extension Level</span>
              <span>{gameElements?.experience || 0} / {gameElements?.experienceRequired || 1000} XP</span>
            </div>
            <Progress 
              value={(gameElements?.experience || 0) / (gameElements?.experienceRequired || 1000) * 100} 
              className="h-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-950 dark:to-indigo-950"
            />
            <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
              <span>Current: Level {gameElements?.level || 1}</span>
              <span>Next: Level {(gameElements?.level || 1) + 1}</span>
            </div>
          </div>
          
          {/* Capacity Gauges in a 2x2 Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Processing Efficiency */}
            <Card className="border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-gray-950">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-500" />
                  <CardTitle className="text-base">Processing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-5 pt-1">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 mb-2 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-indigo-100 dark:text-indigo-950" 
                        strokeWidth="12" 
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-indigo-500" 
                        strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 54 * processingEfficiency / 100} ${2 * Math.PI * 54}`}
                        strokeDashoffset={(2 * Math.PI * 54) * 0.25}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{processingEfficiency}%</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-500">Efficiency</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {processingEfficiency > 75 ? 'Excellent' : processingEfficiency > 50 ? 'Good' : 'Developing'} processing based on your usage frequency
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Memory Utilization */}
            <Card className="border border-blue-100 dark:border-blue-900/30 bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-950">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-base">Memory</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-5 pt-1">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 mb-2 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-blue-100 dark:text-blue-950" 
                        strokeWidth="12" 
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-blue-500" 
                        strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 54 * memoryUtilization / 100} ${2 * Math.PI * 54}`}
                        strokeDashoffset={(2 * Math.PI * 54) * 0.25}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">{memoryUtilization}%</span>
                      <span className="text-xs text-blue-600 dark:text-blue-500">Utilization</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {memoryUtilization > 75 ? 'Advanced' : memoryUtilization > 50 ? 'Growing' : 'Basic'} memory linked to entries and storage
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Learning Rate */}
            <Card className="border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-950">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-base">Learning</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-5 pt-1">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 mb-2 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-emerald-100 dark:text-emerald-950" 
                        strokeWidth="12" 
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-emerald-500" 
                        strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 54 * learningRate / 100} ${2 * Math.PI * 54}`}
                        strokeDashoffset={(2 * Math.PI * 54) * 0.25}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{learningRate}%</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-500">Rate</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {learningRate > 75 ? 'Rapid' : learningRate > 50 ? 'Steady' : 'Gradual'} learning from WhatsApp interactions
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Adaptation Score */}
            <Card className="border border-amber-100 dark:border-amber-900/30 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/20 dark:to-gray-950">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-base">Implementation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-5 pt-1">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 mb-2 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-amber-100 dark:text-amber-950" 
                        strokeWidth="12" 
                      />
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-amber-500" 
                        strokeWidth="12" 
                        strokeDasharray={`${2 * Math.PI * 54 * adaptationScore / 100} ${2 * Math.PI * 54}`}
                        strokeDashoffset={(2 * Math.PI * 54) * 0.25}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{adaptationScore}%</span>
                      <span className="text-xs text-amber-600 dark:text-amber-500">Capability</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {adaptationScore > 75 ? 'Excellent' : adaptationScore > 50 ? 'Good' : 'Developing'} usage in decision making processes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Neural Extension Stats */}
          <div className="mb-8">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-purple-700 dark:text-purple-400" />
              Neural Extension Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {gameElements?.stats?.messagesProcessed || 0}
                </div>
                <div className="text-xs text-muted-foreground">Messages Processed</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {gameElements?.stats?.connectionsFormed || 0}
                </div>
                <div className="text-xs text-muted-foreground">Connections Formed</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {gameElements?.stats?.insightsGenerated || 0}
                </div>
                <div className="text-xs text-muted-foreground">Insights Generated</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {status?.topicsTracked?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Topics Tracked</div>
              </div>
            </div>
          </div>
          
          {/* Capabilities Section */}
          <div>
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-700 dark:text-purple-400" />
              Neural Capabilities
            </h3>
            
            {/* Unlocked Capabilities */}
            <div className="mb-4">
              <h4 className="text-xs text-muted-foreground mb-2">Unlocked Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {unlockedCapabilities.length > 0 ? (
                  unlockedCapabilities.map((capability, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                      {capability}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Complete tasks to unlock neural capabilities</p>
                )}
              </div>
            </div>
            
            {/* Upcoming Capabilities */}
            <div>
              <h4 className="text-xs text-muted-foreground mb-2">Upcoming Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {upcomingCapabilities.map((capability, index) => (
                  <Badge key={index} variant="outline" className="text-muted-foreground border-dashed">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/neural-tuning">
              Tune Neural Extension
            </Link>
          </Button>
          <Button variant="default" className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700">
            <span>Boost Neural Capacity</span>
            <ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}