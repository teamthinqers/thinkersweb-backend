import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useNeuralTuning } from '@/hooks/useNeuralTuning';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Save, Shield } from 'lucide-react';

export default function CognitiveShieldConfig() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Neural Tuning hook
  const { 
    status, 
    isLoading: isTuningLoading, 
    updateTuning,
    isUpdating
  } = useNeuralTuning();
  
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Local state for unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    creativity?: number;
    precision?: number;
    speed?: number;
    analytical?: number;
    intuitive?: number;
    contextualThinking?: number;
    memoryBandwidth?: number;
    thoughtComplexity?: number;
  }>({});
  
  // Extract values from status for rendering
  const { tuning: neuralTuning } = status || { 
    tuning: {
      creativity: 0.7,
      precision: 0.8,
      speed: 0.5,
      analytical: 0.8,
      intuitive: 0.6,
      contextualThinking: 0.6,
      memoryBandwidth: 0.7,
      thoughtComplexity: 0.5,
    }
  };
  
  // Function to handle slider value changes
  const handleParameterChange = (paramName: string, value: number) => {
    // Update the pending changes object with the new parameter value
    setPendingChanges(prev => ({
      ...prev,
      [paramName]: value
    }));
    
    // Mark that we have unsaved changes
    setUnsavedChanges(true);
  };
  
  // Save pending changes to Neural tuning
  const saveChanges = async () => {
    if (!unsavedChanges) {
      toast({
        title: "No changes to save",
        description: "Make some adjustments first.",
        variant: "default",
      });
      return;
    }

    try {
      updateTuning(pendingChanges);
      
      toast({
        title: "Shield Updated",
        description: "Your cognitive shield settings have been saved successfully.",
        variant: "default",
      });
      
      // Clear pending changes and unsaved state
      setPendingChanges({});
      setUnsavedChanges(false);
      
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (isTuningLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setLocation('/my-neura')} className="p-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Cognitive Shield</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-t-amber-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading cognitive parameters...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setLocation('/my-neura')} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Cognitive Shield</h1>
        </div>
        {unsavedChanges && (
          <Button 
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
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
                Save Shield Settings
              </span>
            )}
          </Button>
        )}
      </div>
      
      {/* Main Content Card */}
      <Card className="bg-white dark:bg-gray-950 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Cognitive Shield Configuration</CardTitle>
              <CardDescription>
                Configure these parameters to shield you from biases while using AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-8">
          {/* Core Tuning Section */}
          <div className="space-y-6">
            <div className="border-b border-amber-200 dark:border-amber-800 pb-2">
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Core Tuning</h3>
            </div>
            
            {/* Creativity Parameter - Color Palette Selector */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <div className="flex items-center justify-between relative z-10">
                <Label className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-md"></div>
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300">Creativity Level</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-700 rounded-full">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                    {Math.round((pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Color palette selector */}
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => {
                  const value = (i + 1) / 10;
                  const isSelected = Math.abs(value - (pendingChanges.creativity ?? neuralTuning?.creativity ?? 0.5)) < 0.05;
                  return (
                    <button
                      key={i}
                      onClick={() => handleParameterChange('creativity', value)}
                      className={`
                        w-8 h-8 rounded-lg border-2 transition-all duration-300 transform hover:scale-110
                        ${isSelected 
                          ? 'border-amber-600 dark:border-amber-400 shadow-lg scale-110' 
                          : 'border-amber-300 dark:border-amber-600 hover:border-amber-500'
                        }
                      `}
                      style={{
                        background: `linear-gradient(135deg, 
                          hsl(${20 + i * 4}, ${60 + i * 4}%, ${50 + i * 2}%),
                          hsl(${30 + i * 3}, ${70 + i * 3}%, ${60 + i * 1}%)
                        )`
                      }}
                    />
                  );
                })}
              </div>
              
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                Select creativity intensity by choosing a color palette
              </p>
            </div>

            {/* Precision Parameter - Targeting Dial */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <div className="flex items-center justify-between relative z-10">
                <Label className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm shadow-md border border-amber-600 dark:border-amber-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300">Precision Focus</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-700 rounded-lg border border-amber-300 dark:border-amber-600">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                    {Math.round((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Targeting Dial */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  {/* Dial background */}
                  <div className="absolute inset-0 rounded-full border-4 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800"></div>
                  
                  {/* Precision markers */}
                  {Array.from({ length: 10 }, (_, i) => {
                    const angle = (i * 36) - 90; // 0-360 degrees, starting from top
                    const isQuarter = i % 2.5 === 0;
                    return (
                      <div
                        key={i}
                        className={`absolute w-0.5 ${isQuarter ? 'h-4 bg-amber-600' : 'h-2 bg-amber-400'} top-1 left-1/2 origin-bottom transform -translate-x-0.5`}
                        style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                      />
                    );
                  })}
                  
                  {/* Targeting needle */}
                  <div
                    className="absolute w-1 h-12 bg-amber-700 dark:bg-amber-300 top-2 left-1/2 origin-bottom transform -translate-x-0.5 transition-transform duration-300"
                    style={{
                      transform: `translateX(-50%) rotate(${((pendingChanges.precision ?? neuralTuning?.precision ?? 0.5) * 180) - 90}deg)`
                    }}
                  >
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-amber-600 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
                  </div>
                  
                  {/* Center dot */}
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-amber-600 dark:bg-amber-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white"></div>
                  
                  {/* Click zones for precision adjustment */}
                  <button
                    className="absolute inset-0 rounded-full cursor-pointer opacity-0 hover:opacity-10 bg-amber-500 transition-opacity"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                      let normalizedAngle = (angle + Math.PI / 2) / Math.PI;
                      if (normalizedAngle < 0) normalizedAngle += 2;
                      if (normalizedAngle > 1) normalizedAngle = 1;
                      handleParameterChange('precision', Math.max(0, Math.min(1, normalizedAngle)));
                    }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                Click on the dial to adjust precision targeting
              </p>
            </div>

            {/* Processing Speed Parameter - Speed Burst Buttons */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <div className="flex items-center justify-between relative z-10">
                <Label className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-md shadow-md transform rotate-45"></div>
                    <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                      <div className="w-2 h-0.5 bg-white"></div>
                    </div>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300">Processing Speed</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-700 rounded-lg border border-amber-300 dark:border-amber-600">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                    {Math.round((pendingChanges.speed ?? neuralTuning?.speed ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Speed Burst Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {['Slow', 'Steady', 'Moderate', 'Fast', 'Burst'].map((speed, index) => {
                  const value = (index + 1) / 5;
                  const currentValue = pendingChanges.speed ?? neuralTuning?.speed ?? 0.5;
                  const isActive = Math.abs(value - currentValue) < 0.1;
                  const intensity = index + 1;
                  
                  return (
                    <button
                      key={speed}
                      onClick={() => handleParameterChange('speed', value)}
                      className={`
                        relative h-16 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 group
                        ${isActive 
                          ? 'border-amber-600 dark:border-amber-400 bg-amber-200 dark:bg-amber-800 shadow-lg scale-105' 
                          : 'border-amber-300 dark:border-amber-600 bg-amber-100 dark:bg-amber-900 hover:border-amber-500'
                        }
                      `}
                    >
                      {/* Speed lines effect */}
                      <div className="absolute inset-0 rounded-lg overflow-hidden">
                        {Array.from({ length: intensity }, (_, i) => (
                          <div
                            key={i}
                            className={`absolute w-full h-0.5 bg-amber-500 opacity-60 transform -skew-x-12 transition-transform duration-500 ${isActive ? 'animate-pulse' : ''}`}
                            style={{
                              top: `${20 + i * 15}%`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                          {speed}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          {Math.round(value * 100)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                Select processing speed intensity level
              </p>
            </div>
          </div>

          {/* Cognitive Style Section */}
          <div className="space-y-6">
            <div className="border-b border-amber-200 dark:border-amber-800 pb-2">
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Cognitive Style</h3>
            </div>
            
            {/* Analytical Thinking Parameter - Toggle Switches */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <div className="flex items-center justify-between relative z-10">
                <Label className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-sm shadow-md border border-amber-600 dark:border-amber-400"></div>
                    <div className="absolute inset-1 grid grid-cols-2 gap-0.5">
                      <div className="w-1 h-1 bg-amber-200 rounded-sm"></div>
                      <div className="w-1 h-1 bg-amber-300 rounded-sm"></div>
                      <div className="w-1 h-1 bg-amber-300 rounded-sm"></div>
                      <div className="w-1 h-1 bg-amber-200 rounded-sm"></div>
                    </div>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300">Analytical Thinking</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-700 rounded-lg border border-amber-300 dark:border-amber-600">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                    {Math.round((pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Logic Toggle Switches */}
              <div className="space-y-3">
                {['Basic Logic', 'Pattern Analysis', 'System Thinking', 'Deep Analysis', 'Expert Logic'].map((level, index) => {
                  const threshold = (index + 1) / 5;
                  const currentValue = pendingChanges.analytical ?? neuralTuning?.analytical ?? 0.5;
                  const isActive = currentValue >= threshold;
                  
                  return (
                    <div key={level} className="flex items-center justify-between p-3 rounded-lg bg-amber-100 dark:bg-amber-900 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          {level}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          {Math.round(threshold * 100)}%+
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          const newValue = isActive ? Math.max(0, threshold - 0.01) : threshold;
                          handleParameterChange('analytical', newValue);
                        }}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
                          ${isActive ? 'bg-amber-600' : 'bg-amber-300 dark:bg-amber-700'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                            ${isActive ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                Toggle analytical thinking levels on or off
              </p>
            </div>

            {/* Intuitive Processing Parameter - Flow Range Selector */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <div className="flex items-center justify-between relative z-10">
                <Label className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-md border border-amber-600 dark:border-amber-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-amber-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300">Intuitive Processing</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-700 rounded-full border border-amber-300 dark:border-amber-600">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                    {Math.round((pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Flow Range Selector */}
              <div className="space-y-4">
                <div className="text-center text-sm font-medium text-amber-700 dark:text-amber-300 mb-3">
                  Select intuition flow range
                </div>
                
                <div className="relative">
                  {/* Flow visualization background */}
                  <div className="h-20 bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg border border-amber-300 dark:border-amber-600 overflow-hidden">
                    {/* Flowing lines effect */}
                    {Array.from({ length: 6 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-full h-1 bg-amber-400 opacity-30 transform skew-x-12 animate-pulse"
                        style={{
                          top: `${15 + i * 12}%`,
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: '2s'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Range selection zones */}
                  <div className="absolute inset-0 grid grid-cols-5 gap-1 p-2">
                    {['Logic', 'Balanced', 'Intuitive', 'Flow', 'Pure'].map((mode, index) => {
                      const value = (index + 1) / 5;
                      const currentValue = pendingChanges.intuitive ?? neuralTuning?.intuitive ?? 0.5;
                      const isSelected = Math.abs(value - currentValue) < 0.1;
                      
                      return (
                        <button
                          key={mode}
                          onClick={() => handleParameterChange('intuitive', value)}
                          className={`
                            relative h-full rounded-md border-2 transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center gap-1
                            ${isSelected 
                              ? 'border-amber-600 dark:border-amber-400 bg-amber-300 dark:bg-amber-700 shadow-lg scale-105' 
                              : 'border-amber-400 dark:border-amber-600 bg-amber-200 dark:bg-amber-800 hover:border-amber-500'
                            }
                          `}
                        >
                          <div className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                            {mode}
                          </div>
                          <div className="text-xs text-amber-600 dark:text-amber-400">
                            {Math.round(value * 100)}%
                          </div>
                          
                          {/* Flow intensity indicator */}
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            {Array.from({ length: index + 1 }, (_, i) => (
                              <div
                                key={i}
                                className={`w-1 h-1 bg-amber-600 rounded-full inline-block mr-0.5 ${isSelected ? 'animate-pulse' : ''}`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                Choose your intuitive processing flow mode
              </p>
            </div>

            {/* Contextual Thinking Parameter - Step Selector */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <div className="flex items-center justify-between relative z-10">
                <Label className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-md shadow-md border border-amber-600 dark:border-amber-400"></div>
                    <div className="absolute inset-1">
                      <div className="w-1 h-1 bg-amber-200 rounded-full absolute top-0 left-0"></div>
                      <div className="w-1 h-1 bg-amber-300 rounded-full absolute top-0 right-0"></div>
                      <div className="w-1 h-1 bg-amber-300 rounded-full absolute bottom-0 left-1"></div>
                      <div className="w-px h-2 bg-amber-200 absolute top-0.5 left-1.5"></div>
                    </div>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300">Contextual Thinking</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-700 rounded-lg border border-amber-300 dark:border-amber-600">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                    {Math.round((pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Step Selector with Context Levels */}
              <div className="space-y-3">
                <div className="text-center text-sm font-medium text-amber-700 dark:text-amber-300">
                  Select context awareness level
                </div>
                
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Step track */}
                    <div className="h-2 w-64 bg-amber-200 dark:bg-amber-800 rounded-full relative">
                      {/* Progress fill */}
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300"
                        style={{ width: `${(pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5) * 100}%` }}
                      />
                      
                      {/* Step indicators */}
                      {[0, 0.25, 0.5, 0.75, 1].map((step, index) => {
                        const currentValue = pendingChanges.contextualThinking ?? neuralTuning?.contextualThinking ?? 0.5;
                        const isActive = currentValue >= step;
                        const isSelected = Math.abs(currentValue - step) < 0.05;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleParameterChange('contextualThinking', step)}
                            className={`
                              absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-300 hover:scale-125
                              ${isSelected 
                                ? 'bg-amber-600 border-amber-800 dark:border-amber-400 shadow-lg scale-125' 
                                : isActive 
                                  ? 'bg-amber-500 border-amber-700 dark:border-amber-500' 
                                  : 'bg-amber-200 border-amber-400 dark:bg-amber-700 dark:border-amber-600'
                              }
                            `}
                            style={{ left: `${step * 100}%`, marginLeft: '-8px' }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Step labels */}
                    <div className="flex justify-between mt-3 text-xs text-amber-600 dark:text-amber-400">
                      <span className="text-center w-12 -ml-6">Local</span>
                      <span className="text-center w-12 -ml-6">Situational</span>
                      <span className="text-center w-12 -ml-6">Balanced</span>
                      <span className="text-center w-12 -ml-6">Broad</span>
                      <span className="text-center w-12 -ml-6">Universal</span>
                    </div>
                  </div>
                </div>
                
                {/* Current level description */}
                <div className="text-center p-3 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
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
              </div>
              
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                Click on the steps to adjust contextual thinking level
              </p>
            </div>

            {/* Memory Bandwidth Parameter - Memory Bank Selector */}
            <div className="relative overflow-hidden space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
              <div className="flex items-center justify-between relative z-10">
                <Label className="text-base font-semibold flex items-center gap-3">
                  <div className="relative">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md border border-amber-600 dark:border-amber-400"></div>
                    <div className="absolute inset-1 grid grid-cols-3 gap-0.5">
                      <div className="w-0.5 h-1 bg-amber-200 rounded-sm"></div>
                      <div className="w-0.5 h-1 bg-amber-300 rounded-sm"></div>
                      <div className="w-0.5 h-1 bg-amber-200 rounded-sm"></div>
                      <div className="w-0.5 h-1 bg-amber-300 rounded-sm"></div>
                      <div className="w-0.5 h-1 bg-amber-400 rounded-sm"></div>
                      <div className="w-0.5 h-1 bg-amber-300 rounded-sm"></div>
                    </div>
                  </div>
                  <span className="text-amber-700 dark:text-amber-300">Memory Bandwidth</span>
                </Label>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-800 dark:to-amber-700 rounded-lg border border-amber-300 dark:border-amber-600">
                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200 font-mono">
                    {Math.round((pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) * 100)}%
                  </span>
                </div>
              </div>
              
              {/* Memory Banks Grid */}
              <div className="space-y-3">
                <div className="text-center text-sm font-medium text-amber-700 dark:text-amber-300">
                  Configure memory storage banks
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {['Cache', 'Buffer', 'Store', 'Archive'].map((bank, index) => {
                    const threshold = (index + 1) / 4;
                    const currentValue = pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5;
                    const isActive = currentValue >= threshold;
                    const capacity = Math.min(currentValue * 4 - index, 1);
                    
                    return (
                      <button
                        key={bank}
                        onClick={() => handleParameterChange('memoryBandwidth', threshold)}
                        className={`
                          relative h-20 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center gap-1
                          ${isActive 
                            ? 'border-amber-600 dark:border-amber-400 bg-amber-200 dark:bg-amber-800 shadow-lg' 
                            : 'border-amber-400 dark:border-amber-600 bg-amber-100 dark:bg-amber-900 hover:border-amber-500'
                          }
                        `}
                      >
                        {/* Memory bank visualization */}
                        <div className="flex flex-col gap-1 mb-2">
                          {Array.from({ length: 3 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-8 h-1 rounded-sm transition-all duration-300 ${
                                isActive && capacity > i / 3 ? 'bg-amber-600' : 'bg-amber-300'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <div className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                          {bank}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          {Math.round(threshold * 100)}%
                        </div>
                        
                        {/* Activity indicator */}
                        {isActive && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Memory utilization display */}
                <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Memory Utilization</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 8 }, (_, i) => {
                        const isUsed = (pendingChanges.memoryBandwidth ?? neuralTuning?.memoryBandwidth ?? 0.5) > i / 8;
                        return (
                          <div
                            key={i}
                            className={`w-2 h-4 rounded-sm transition-all duration-300 ${
                              isUsed ? 'bg-amber-600' : 'bg-amber-300'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium text-center">
                Click to activate memory banks and adjust bandwidth
              </p>
            </div>

            {/* Thought Complexity Parameter */}
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800">
              <div className="flex items-center justify-between">
                <Label htmlFor="thoughtComplexity" className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-400 to-pink-400"></div>
                  Thought Complexity
                </Label>
                <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
                  {Math.round((pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100)}%
                </span>
              </div>
              
              {/* Visual complexity meter with layered pattern */}
              <div className="relative">
                <div className="h-3 bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300 relative"
                    style={{ width: `${(pendingChanges.thoughtComplexity ?? neuralTuning?.thoughtComplexity ?? 0.5) * 100}%` }}
                  >
                    {/* Layered complexity effect */}
                    <div className="absolute inset-0 flex items-center justify-end pr-1">
                      <div className="w-1 h-1 bg-pink-200 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                  </div>
                </div>
                {/* Complexity layer indicators */}
                <div className="absolute -top-1 left-1/2 w-0.5 h-0.5 bg-rose-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute -bottom-1 right-1/5 w-1 h-1 bg-pink-400 rounded-full opacity-55 animate-bounce"></div>
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-amber-200 dark:border-amber-800">
            <Button 
              variant="outline"
              className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
              onClick={() => setLocation('/my-neura')}
            >
              Back to Overview
            </Button>
            <Button 
              disabled={isUpdating || !unsavedChanges}
              variant="default" 
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              onClick={saveChanges}
            >
              <Save className="mr-1 h-4 w-4" />
              {isUpdating ? 'Saving...' : 'Save Shield Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}