import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDotSparkTuning } from "@/hooks/useDotSparkTuning";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CognitiveShieldConfig() {
  const { status, isLoading } = useDotSparkTuning();
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

                {/* Analytical Thinking Parameter - Circuit Board Interface */}
                <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-amber-100 dark:from-purple-950/30 dark:to-amber-900/20 border-2 border-purple-300 dark:border-purple-700 shadow-lg">
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-base font-semibold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-amber-600 rounded-sm shadow-md"></div>
                        <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Logic Circuit</span>
                    </Label>
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-200 to-amber-300 dark:from-amber-800 dark:to-purple-700 rounded-lg border border-purple-300 dark:border-amber-600">
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                        {Math.round((pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Circuit Board Layout */}
                  <div className="relative">
                    <div className="bg-green-900 dark:bg-green-950 rounded-lg p-4 border border-green-700">
                      {/* Circuit pathways */}
                      <div className="absolute inset-4">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div
                            key={i}
                            className={`absolute w-full h-0.5 bg-yellow-400 transition-all duration-500 ${
                              (pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) > (i + 1) / 4 ? 'opacity-100 shadow-lg shadow-yellow-400/50' : 'opacity-30'
                            }`}
                            style={{
                              top: `${20 + i * 25}%`,
                              left: '0%'
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Logic Gates */}
                      <div className="grid grid-cols-5 gap-2 relative z-10">
                        {['Input', 'Process', 'Analyze', 'Logic', 'Output'].map((gate, index) => {
                          const value = (index + 1) / 5;
                          const currentValue = pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5;
                          const isActive = currentValue >= value;
                          const isPowered = currentValue >= value - 0.1;
                          
                          return (
                            <button
                              key={gate}
                              onClick={() => handleParameterChange('analytical', value)}
                              className={`
                                relative h-16 rounded-md border-2 transition-all duration-300 transform hover:scale-105 group
                                ${isActive 
                                  ? 'border-yellow-400 bg-green-800 dark:bg-green-900 shadow-lg shadow-yellow-400/30' 
                                  : 'border-green-600 bg-green-700 dark:bg-green-800 hover:border-yellow-500'
                                }
                              `}
                            >
                              {/* LED indicator */}
                              <div className={`absolute top-1 right-1 w-2 h-2 rounded-full transition-all duration-300 ${
                                isPowered ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 'bg-gray-600'
                              }`} />
                              
                              {/* Gate symbol */}
                              <div className="flex flex-col items-center justify-center h-full text-xs">
                                <div className={`font-mono font-bold ${isActive ? 'text-yellow-200' : 'text-green-300'}`}>
                                  {gate}
                                </div>
                                <div className={`text-xs ${isActive ? 'text-yellow-300' : 'text-green-400'}`}>
                                  {Math.round(value * 100)}%
                                </div>
                              </div>
                              
                              {/* Connection pins */}
                              <div className="absolute left-0 top-1/2 w-1 h-1 bg-yellow-500 rounded-full transform -translate-y-1/2 -translate-x-1/2"></div>
                              <div className="absolute right-0 top-1/2 w-1 h-1 bg-yellow-500 rounded-full transform -translate-y-1/2 translate-x-1/2"></div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Processing status display */}
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/30 rounded border border-green-600">
                          <div className={`w-2 h-2 rounded-full ${
                            (pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) > 0.5 ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                          }`}></div>
                          <span className="text-green-300 text-xs font-mono">
                            {(pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) > 0.5 ? 'LOGIC ACTIVE' : 'INTUITIVE MODE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                    Configure your logical processing circuit
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="border-b border-amber-200 dark:border-amber-800 pb-2">
                  <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Advanced Settings</h3>
                </div>

                {/* Intuitive Processing Parameter - Wave Frequency Interface */}
                <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-amber-100 dark:from-indigo-950/30 dark:to-amber-900/20 border-2 border-indigo-300 dark:border-indigo-700 shadow-lg">
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-base font-semibold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-amber-600 rounded-full shadow-md">
                          <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-30"></div>
                        </div>
                        <div className="absolute inset-1 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Intuitive Waves</span>
                    </Label>
                    <div className="px-3 py-1 bg-gradient-to-r from-indigo-200 to-amber-300 dark:from-amber-800 dark:to-indigo-700 rounded-full border border-indigo-300 dark:border-amber-600">
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                        {Math.round((pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Wave Visualization */}
                  <div className="relative h-24 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg border border-indigo-600 overflow-hidden">
                    {/* Background grid */}
                    <div className="absolute inset-0 opacity-20">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="absolute h-full w-px bg-indigo-400" style={{ left: `${i * 12.5}%` }} />
                      ))}
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="absolute w-full h-px bg-indigo-400" style={{ top: `${i * 25}%` }} />
                      ))}
                    </div>
                    
                    {/* Animated waves */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 200 60">
                        {Array.from({ length: 5 }, (_, waveIndex) => {
                          const currentValue = pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5;
                          const amplitude = (waveIndex + 1) * 5 * currentValue;
                          const frequency = (waveIndex + 1) * 0.1;
                          const isActive = currentValue > waveIndex / 5;
                          
                          return (
                            <path
                              key={waveIndex}
                              d={`M 0 30 ${Array.from({ length: 200 }, (_, x) => 
                                `L ${x} ${30 + amplitude * Math.sin(x * frequency + Date.now() * 0.003)}`
                              ).join(' ')}`}
                              fill="none"
                              stroke={isActive ? '#60a5fa' : '#374151'}
                              strokeWidth="2"
                              opacity={isActive ? 1 : 0.3}
                              className="transition-all duration-300"
                            />
                          );
                        })}
                      </svg>
                    </div>
                    
                    {/* Frequency controls */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                      {['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'].map((wave, index) => {
                        const value = (index + 1) / 5;
                        const currentValue = pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5;
                        const isActive = Math.abs(value - currentValue) < 0.1;
                        
                        return (
                          <button
                            key={wave}
                            onClick={() => handleParameterChange('intuitive', value)}
                            className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
                              isActive 
                                ? 'bg-indigo-500 text-white shadow-lg' 
                                : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50'
                            }`}
                          >
                            {wave}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Frequency readout */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-lg border border-indigo-300 dark:border-indigo-700">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-mono text-indigo-700 dark:text-indigo-300">
                        {(pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 40 + 1}Hz
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                    Tune your intuitive frequency wavelength
                  </p>
                </div>

                {/* Contextual Thinking Parameter - Step Pyramid Interface */}
                <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-teal-50 to-amber-100 dark:from-teal-950/30 dark:to-amber-900/20 border-2 border-teal-300 dark:border-teal-700 shadow-lg">
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-base font-semibold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-teal-400 to-amber-600 shadow-md" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                        <div className="absolute inset-2 flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Context Scope</span>
                    </Label>
                    <div className="px-3 py-1 bg-gradient-to-r from-teal-200 to-amber-300 dark:from-amber-800 dark:to-teal-700 rounded-lg border border-teal-300 dark:border-amber-600">
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                        {Math.round((pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Step Pyramid */}
                  <div className="flex justify-center">
                    <div className="relative">
                      {['Local', 'Situational', 'Balanced', 'Broad', 'Universal'].map((level, index) => {
                        const value = (index + 1) / 5;
                        const currentValue = pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5;
                        const isActive = currentValue >= value - 0.1;
                        const width = 160 - (index * 25);
                        
                        return (
                          <button
                            key={level}
                            onClick={() => handleParameterChange('contextualThinking', value)}
                            className={`
                              block mx-auto mb-1 h-8 rounded transition-all duration-300 transform hover:scale-105
                              ${isActive 
                                ? 'bg-teal-500 dark:bg-teal-600 border-2 border-teal-700 dark:border-teal-400 shadow-lg' 
                                : 'bg-teal-200 dark:bg-teal-800 border-2 border-teal-400 dark:border-teal-600 hover:bg-teal-300'
                              }
                            `}
                            style={{ width: `${width}px` }}
                          >
                            <div className="flex items-center justify-center h-full">
                              <span className={`text-xs font-semibold ${
                                isActive ? 'text-white' : 'text-teal-700 dark:text-teal-300'
                              }`}>
                                {level}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Context description */}
                  <div className="text-center p-3 bg-teal-100 dark:bg-teal-900 rounded-lg border border-teal-200 dark:border-teal-800">
                    <div className="text-sm font-medium text-teal-700 dark:text-teal-300">
                      {(() => {
                        const value = pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5;
                        if (value < 0.2) return "Local Focus - Immediate context priority";
                        if (value < 0.4) return "Situational - Current environment aware";
                        if (value < 0.6) return "Balanced - Context and principles";
                        if (value < 0.8) return "Broad Perspective - Wide context view";
                        return "Universal - Principle-based thinking";
                      })()}
                    </div>
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                    Build your contextual awareness pyramid
                  </p>
                </div>

                {/* Memory Bandwidth Parameter - RAM Memory Banks Interface */}
                <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-pink-50 to-amber-100 dark:from-pink-950/30 dark:to-amber-900/20 border-2 border-pink-300 dark:border-pink-700 shadow-lg">
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-base font-semibold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-amber-600 rounded border border-gray-400 shadow-md">
                          <div className="absolute inset-0.5 grid grid-cols-2 gap-0.5">
                            <div className="bg-white rounded-sm"></div>
                            <div className="bg-white rounded-sm"></div>
                            <div className="bg-white rounded-sm"></div>
                            <div className="bg-white rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Memory Banks</span>
                    </Label>
                    <div className="px-3 py-1 bg-gradient-to-r from-pink-200 to-amber-300 dark:from-amber-800 dark:to-pink-700 rounded-lg border border-pink-300 dark:border-amber-600">
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                        {Math.round((pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Memory Banks Layout */}
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }, (_, index) => {
                      const bankLevel = Math.floor(index / 2);
                      const currentValue = pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5;
                      const isActive = currentValue > bankLevel / 5;
                      const value = (bankLevel + 1) / 5;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleParameterChange('memoryBandwidth', value)}
                          className={`
                            relative h-16 rounded border-2 transition-all duration-300 transform hover:scale-105
                            ${isActive 
                              ? 'border-pink-500 bg-pink-600 dark:bg-pink-700 shadow-lg shadow-pink-500/30' 
                              : 'border-gray-400 bg-gray-200 dark:bg-gray-700 hover:border-pink-400'
                            }
                          `}
                        >
                          {/* Memory bank indicator */}
                          <div className="absolute top-1 left-1 right-1 h-1 bg-gray-600 rounded-full">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isActive ? 'bg-green-400' : 'bg-red-400'
                              }`}
                              style={{ width: isActive ? '100%' : '20%' }}
                            />
                          </div>
                          
                          {/* Memory cells */}
                          <div className="grid grid-cols-2 gap-1 p-2 h-full">
                            {Array.from({ length: 4 }, (_, cellIndex) => (
                              <div
                                key={cellIndex}
                                className={`rounded transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-pink-300 dark:bg-pink-500' 
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              >
                                <div className={`w-full h-full rounded ${
                                  isActive && cellIndex < Math.floor(currentValue * 4) + 1
                                    ? 'bg-pink-200 dark:bg-pink-400 animate-pulse' 
                                    : ''
                                }`} />
                              </div>
                            ))}
                          </div>
                          
                          {/* Bank label */}
                          <div className="absolute bottom-0 left-0 right-0 text-xs text-center">
                            <div className={`px-1 py-0.5 rounded-t text-xs font-mono ${
                              isActive ? 'bg-pink-200 text-pink-800' : 'bg-gray-300 text-gray-600'
                            }`}>
                              {Math.round(value * 100)}%
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Memory type indicator */}
                  <div className="text-center p-3 bg-pink-100 dark:bg-pink-900 rounded-lg border border-pink-200 dark:border-pink-800">
                    <div className="text-sm font-medium text-pink-700 dark:text-pink-300">
                      {(() => {
                        const value = pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5;
                        if (value < 0.3) return "Cache Memory - Quick access patterns";
                        if (value < 0.7) return "Working Memory - Active processing";
                        return "Long-term Storage - Deep retention";
                      })()}
                    </div>
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                    Configure your memory architecture
                  </p>
                </div>

                {/* Thought Complexity Parameter - Neural Network Interface */}
                <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-violet-50 to-amber-100 dark:from-violet-950/30 dark:to-amber-900/20 border-2 border-violet-300 dark:border-violet-700 shadow-lg">
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-base font-semibold flex items-center gap-3">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-br from-violet-400 to-amber-600 shadow-md" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}></div>
                        <div className="absolute inset-1.5 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Neural Layers</span>
                    </Label>
                    <div className="px-3 py-1 bg-gradient-to-r from-violet-200 to-amber-300 dark:from-amber-800 dark:to-violet-700 rounded-lg border border-violet-300 dark:border-amber-600">
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                        {Math.round((pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Neural Network Visualization */}
                  <div className="relative">
                    <div className="bg-violet-900 dark:bg-violet-950 rounded-lg p-4 border border-violet-700">
                      {/* Neural layers */}
                      <div className="grid grid-cols-6 gap-3 h-32">
                        {Array.from({ length: 6 }, (_, layerIndex) => {
                          const currentValue = pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5;
                          const layerNodes = Math.max(1, Math.floor((currentValue * 5 + 1) * (layerIndex === 0 || layerIndex === 5 ? 1 : Math.sin(layerIndex) * 2 + 1)));
                          const isActive = currentValue > layerIndex / 6;
                          
                          return (
                            <div key={layerIndex} className="flex flex-col justify-center items-center gap-1">
                              {Array.from({ length: Math.min(5, layerNodes) }, (_, nodeIndex) => (
                                <button
                                  key={nodeIndex}
                                  onClick={() => handleParameterChange('thoughtComplexity', (layerIndex + 1) / 6)}
                                  className={`
                                    w-6 h-6 rounded-full border-2 transition-all duration-300 transform hover:scale-125
                                    ${isActive 
                                      ? 'border-violet-400 bg-violet-500 dark:bg-violet-600 shadow-lg shadow-violet-500/50' 
                                      : 'border-violet-600 bg-violet-700 dark:bg-violet-800 hover:border-violet-500'
                                    }
                                  `}
                                >
                                  <div className={`w-full h-full rounded-full ${
                                    isActive ? 'bg-violet-300 dark:bg-violet-400 animate-pulse' : ''
                                  }`} />
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Connections between layers */}
                      <div className="absolute inset-4 pointer-events-none">
                        <svg className="w-full h-full">
                          {Array.from({ length: 5 }, (_, connectionIndex) => {
                            const currentValue = pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5;
                            const isConnected = currentValue > connectionIndex / 5;
                            
                            return (
                              <line
                                key={connectionIndex}
                                x1={`${(connectionIndex + 0.5) * 16.67}%`}
                                y1="50%"
                                x2={`${(connectionIndex + 1.5) * 16.67}%`}
                                y2="50%"
                                stroke={isConnected ? '#8b5cf6' : '#374151'}
                                strokeWidth="2"
                                opacity={isConnected ? 1 : 0.3}
                                className="transition-all duration-300"
                              />
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Complexity levels */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    {['Linear', 'Branched', 'Networked'].map((type, index) => {
                      const value = (index + 1) / 3;
                      const currentValue = pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5;
                      const isActive = Math.abs(value - currentValue) < 0.2;
                      
                      return (
                        <button
                          key={type}
                          onClick={() => handleParameterChange('thoughtComplexity', value)}
                          className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                            isActive 
                              ? 'bg-violet-200 dark:bg-violet-800 text-violet-800 dark:text-violet-200 font-semibold' 
                              : 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400 hover:bg-violet-150'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Thought processing status */}
                  <div className="text-center p-3 bg-violet-100 dark:bg-violet-900 rounded-lg border border-violet-200 dark:border-violet-800">
                    <div className="text-sm font-medium text-violet-700 dark:text-violet-300">
                      {(() => {
                        const value = pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5;
                        if (value < 0.3) return "Direct Processing - Simple pathways";
                        if (value < 0.7) return "Multi-layer Thinking - Connected nodes";
                        return "Complex Networks - Deep integration";
                      })()}
                    </div>
                  </div>
                  
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                    Design your neural thought architecture
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