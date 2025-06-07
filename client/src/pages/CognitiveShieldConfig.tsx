import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useNeuralTuning } from "@/hooks/useNeuralTuning";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CognitiveShieldConfig() {
  const { status, isLoading } = useNeuralTuning();
  const neuralTuning = status?.tuning;
  const { toast } = useToast();
  const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({});

  const saveMutation = useMutation({
    mutationFn: async (changes: Record<string, number>) => {
      const response = await apiRequest("POST", "/api/neural-tuning", changes);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/neural-tuning"] });
      setPendingChanges({});
      toast({
        title: "Configuration Saved",
        description: "Your cognitive shield parameters have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleParameterChange = (parameter: string, value: number) => {
    setPendingChanges(prev => ({ ...prev, [parameter]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(pendingChanges);
  };

  const handleReset = () => {
    setPendingChanges({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="border-2 border-amber-300 dark:border-amber-700 shadow-xl bg-white/90 dark:bg-amber-950/90 backdrop-blur-sm">
          <CardHeader className="border-b border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800">
            <CardTitle className="text-3xl font-bold text-center">
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
                Cognitive Shield Configuration
              </span>
            </CardTitle>
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-200 dark:bg-amber-800 rounded-full border border-amber-300 dark:border-amber-700">
                <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Neural Protection System Active
                </span>
              </div>
            </div>
          </CardHeader>
        
          <CardContent className="pt-6 space-y-8">
            {/* Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="border-b border-amber-200 dark:border-amber-800 pb-2">
                  <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Core Parameters</h3>
                </div>
              
                {/* Creativity Parameter - Spark Intensity Selector */}
                <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-base font-semibold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full shadow-md animate-pulse"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                        </div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Creative Spark</span>
                    </Label>
                    <div className="px-3 py-1 bg-gradient-to-r from-orange-200 to-amber-300 dark:from-amber-800 dark:to-orange-700 rounded-full border border-amber-300 dark:border-amber-600">
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                        {Math.round((pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Spark Intensity Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {['Logic', 'Stable', 'Balanced', 'Dynamic', 'Explosive'].map((intensity, index) => {
                      const value = index / 4;
                      const currentValue = pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5;
                      const isSelected = Math.abs(value - currentValue) < 0.125;
                      const sparkCount = index + 1;
                      
                      return (
                        <button
                          key={intensity}
                          onClick={() => handleParameterChange('creativity', value)}
                          className={`
                            relative h-16 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 group overflow-hidden
                            ${isSelected 
                              ? 'border-orange-500 dark:border-orange-400 bg-orange-200 dark:bg-orange-800 shadow-lg scale-105' 
                              : 'border-amber-300 dark:border-amber-600 bg-amber-100 dark:bg-amber-900 hover:border-orange-400'
                            }
                          `}
                        >
                          {/* Animated sparks background */}
                          <div className="absolute inset-0 overflow-hidden">
                            {Array.from({ length: sparkCount }, (_, i) => (
                              <div
                                key={i}
                                className={`absolute w-1 h-1 bg-orange-400 rounded-full ${isSelected ? 'animate-ping' : 'opacity-60'}`}
                                style={{
                                  top: `${20 + (i * 15) % 60}%`,
                                  left: `${30 + (i * 25) % 40}%`,
                                  animationDelay: `${i * 0.3}s`,
                                  animationDuration: '2s'
                                }}
                              />
                            ))}
                          </div>
                          
                          <div className="relative z-10 flex flex-col items-center justify-center h-full">
                            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                              {intensity}
                            </div>
                            <div className="text-xs text-orange-600 dark:text-orange-400">
                              {Math.round(value * 100)}%
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                    Select your creative spark intensity level
                  </p>
                </div>

                {/* Precision Parameter - Target Accuracy Selector */}
                <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-amber-100 dark:from-emerald-950/30 dark:to-amber-900/20 border-2 border-emerald-300 dark:border-emerald-700 shadow-lg">
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-base font-semibold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-emerald-400 to-amber-600 rounded-sm shadow-md"></div>
                        <div className="absolute inset-1 flex items-center justify-center">
                          <div className="w-1 h-3 bg-white rounded-full"></div>
                          <div className="w-3 h-1 bg-white rounded-full absolute"></div>
                        </div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Target Precision</span>
                    </Label>
                    <div className="px-3 py-1 bg-gradient-to-r from-emerald-200 to-amber-300 dark:from-amber-800 dark:to-emerald-700 rounded-lg border border-emerald-300 dark:border-amber-600">
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                        {Math.round((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Target Bullseye Interface */}
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32">
                      {/* Concentric circles */}
                      {[1, 0.8, 0.6, 0.4, 0.2].map((ring, index) => {
                        const size = ring * 128;
                        const currentValue = pendingChanges.precision ?? neuralTuning?.precision ?? 0.5;
                        const ringValue = (5 - index) / 5;
                        const isActiveRing = currentValue >= ringValue - 0.1;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleParameterChange('precision', ringValue)}
                            className={`
                              absolute rounded-full border-2 transition-all duration-300 transform hover:scale-105
                              ${isActiveRing 
                                ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-200/50 dark:bg-emerald-800/50' 
                                : 'border-emerald-300 dark:border-emerald-600 bg-emerald-100/30 dark:bg-emerald-900/30'
                              }
                            `}
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                              top: `${(128 - size) / 2}px`,
                              left: `${(128 - size) / 2}px`,
                            }}
                          >
                            {index === 4 && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                      
                      {/* Precision indicator */}
                      <div 
                        className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg transition-all duration-300"
                        style={{
                          top: `${50 + Math.cos((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * Math.PI * 2) * 45}%`,
                          left: `${50 + Math.sin((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * Math.PI * 2) * 45}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Precision labels */}
                  <div className="grid grid-cols-5 gap-1 text-xs text-center">
                    {['Broad', 'Wide', 'Focus', 'Sharp', 'Laser'].map((label, index) => {
                      const value = (index + 1) / 5;
                      const currentValue = pendingChanges.precision ?? neuralTuning?.precision ?? 0.5;
                      const isActive = Math.abs(value - currentValue) < 0.1;
                      
                      return (
                        <div
                          key={label}
                          className={`px-2 py-1 rounded-md transition-all duration-300 ${
                            isActive 
                              ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold' 
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                    Aim for your optimal precision target
                  </p>
                </div>

                {/* Processing Speed Parameter - Speedometer Interface */}
                <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-amber-100 dark:from-blue-950/30 dark:to-amber-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-lg">
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-base font-semibold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-amber-600 transform rotate-45 shadow-md"></div>
                        <div className="absolute inset-1 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full transform -rotate-45"></div>
                        </div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Processing Velocity</span>
                    </Label>
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-200 to-amber-300 dark:from-amber-800 dark:to-blue-700 rounded-lg border border-blue-300 dark:border-amber-600">
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                        {Math.round((pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Speedometer Gauge */}
                  <div className="flex justify-center">
                    <div className="relative w-40 h-24">
                      {/* Semi-circle gauge background */}
                      <div className="absolute inset-0 border-8 border-blue-200 dark:border-blue-800 rounded-t-full border-b-0"></div>
                      
                      {/* Speed zones */}
                      {['Crawl', 'Walk', 'Jog', 'Run', 'Sprint'].map((zone, index) => {
                        const angle = -90 + (index / 4) * 180;
                        const currentValue = pendingChanges.speed ?? neuralTuning?.speed ?? 0.5;
                        const zoneValue = index / 4;
                        const isActive = currentValue >= zoneValue;
                        
                        return (
                          <button
                            key={zone}
                            onClick={() => handleParameterChange('speed', (index + 1) / 5)}
                            className={`
                              absolute w-6 h-6 rounded-full border-2 transition-all duration-300 transform hover:scale-125 z-10
                              ${isActive 
                                ? 'bg-blue-500 border-blue-700 dark:border-blue-400 shadow-lg' 
                                : 'bg-blue-200 border-blue-400 dark:bg-blue-800 dark:border-blue-600'
                              }
                            `}
                            style={{
                              top: `${50 + Math.sin((angle * Math.PI) / 180) * 30}%`,
                              left: `${50 + Math.cos((angle * Math.PI) / 180) * 35}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        );
                      })}
                      
                      {/* Speedometer needle */}
                      <div 
                        className="absolute bottom-0 left-1/2 origin-bottom w-1 h-16 bg-red-500 rounded-full transition-all duration-500 shadow-lg"
                        style={{
                          transform: `translateX(-50%) rotate(${-90 + (pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 180}deg)`
                        }}
                      >
                        <div className="w-3 h-3 bg-red-600 rounded-full absolute -top-1 -left-1"></div>
                      </div>
                      
                      {/* Center pivot */}
                      <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2 z-20 border-2 border-white"></div>
                      
                      {/* Speed readout */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="text-xs font-mono text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                          {Math.round((pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100)} mph
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Speed zone labels */}
                  <div className="grid grid-cols-5 gap-1 text-xs text-center">
                    {['Deliberate', 'Methodical', 'Balanced', 'Rapid', 'Lightning'].map((label, index) => {
                      const value = (index + 1) / 5;
                      const currentValue = pendingChanges.speed ?? neuralTuning?.speed ?? 0.5;
                      const isActive = Math.abs(value - currentValue) < 0.1;
                      
                      return (
                        <div
                          key={label}
                          className={`px-2 py-1 rounded-md transition-all duration-300 ${
                            isActive 
                              ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-semibold' 
                              : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                    Adjust your cognitive processing velocity
                  </p>
                </div>

                {/* Analytical Thinking Parameter */}
                <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="analytical" className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-sm"></div>
                      Analytical Thinking
                    </Label>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {Math.round((pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100)}%
                    </span>
                  </div>
                  
                  <Slider
                    id="analytical"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[(pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5)]}
                    onValueChange={(value) => handleParameterChange('analytical', value[0])}
                    className="analytical-slider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Intuitive responses (left) vs logical analysis (right)
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="border-b border-amber-200 dark:border-amber-800 pb-2">
                  <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Advanced Settings</h3>
                </div>

                {/* Intuitive Processing Parameter */}
                <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="intuitive" className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
                      Intuitive Processing
                    </Label>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {Math.round((pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100)}%
                    </span>
                  </div>
                  
                  <Slider
                    id="intuitive"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[(pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5)]}
                    onValueChange={(value) => handleParameterChange('intuitive', value[0])}
                    className="intuitive-slider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pattern recognition (left) vs insight emphasis (right)
                  </p>
                </div>

                {/* Contextual Thinking Parameter */}
                <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contextualThinking" className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                      Contextual Thinking
                    </Label>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {Math.round((pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5) * 100)}%
                    </span>
                  </div>
                  
                  <Slider
                    id="contextualThinking"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[(pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5)]}
                    onValueChange={(value) => handleParameterChange('contextualThinking', value[0])}
                    className="contextual-slider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contextual considerations (left) vs universal principles (right)
                  </p>
                </div>

                {/* Memory Bandwidth Parameter */}
                <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="memoryBandwidth" className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                      Memory Bandwidth
                    </Label>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {Math.round((pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100)}%
                    </span>
                  </div>
                  
                  <Slider
                    id="memoryBandwidth"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[(pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5)]}
                    onValueChange={(value) => handleParameterChange('memoryBandwidth', value[0])}
                    className="memory-slider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Short burst memory (left) vs deep retainer memory (right)
                  </p>
                </div>

                {/* Thought Complexity Parameter */}
                <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="thoughtComplexity" className="text-sm font-medium flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                      Thought Complexity
                    </Label>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {Math.round((pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100)}%
                    </span>
                  </div>
                  
                  <Slider
                    id="thoughtComplexity"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[(pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5)]}
                    onValueChange={(value) => handleParameterChange('thoughtComplexity', value[0])}
                    className="complexity-slider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Simple direct thinking (left) vs complex layered thinking (right)
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-amber-200 dark:border-amber-800">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || Object.keys(pendingChanges).length === 0}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Applying Changes...
                  </>
                ) : (
                  <>Save Configuration</>
                )}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={saveMutation.isPending || Object.keys(pendingChanges).length === 0}
                className="flex-1 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Reset Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}