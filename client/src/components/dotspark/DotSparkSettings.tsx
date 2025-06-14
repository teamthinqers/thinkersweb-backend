import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Circle, 
  Settings, 
  Mic, 
  Type, 
  Move, 
  Zap,
  BrainCircuit
} from "lucide-react";
import { FloatingDot } from "./FloatingDot";
import { useToast } from "@/hooks/use-toast";
import { neuraStorage } from "@/lib/neuraStorage";

export function DotSparkSettings() {
  const [captureMode, setCaptureMode] = useState<'voice' | 'text' | 'hybrid'>('hybrid');
  const { toast } = useToast();
  
  // Check if DotSpark is activated - floating dot appears automatically when DotSpark is active
  const isDotSparkActivated = neuraStorage.isActivated();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCaptureMode(settings.captureMode ?? 'hybrid');
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: any) => {
    const settings = {
      captureMode,
      ...newSettings
    };
    localStorage.setItem('dotspark-settings', JSON.stringify(settings));
  };

  const handleModeChange = (mode: 'voice' | 'text' | 'hybrid') => {
    setCaptureMode(mode);
    saveSettings({ captureMode: mode });
    
    const modeLabels = {
      voice: "Voice mode",
      text: "Text mode", 
      hybrid: "Hybrid mode"
    };
    
    const modeDescriptions = {
      voice: "Voice input only for thought capture",
      text: "Text input only for thought capture",
      hybrid: "Both voice and text input available"
    };
    
    toast({
      title: `${modeLabels[mode]} selected`,
      description: modeDescriptions[mode],
    });
  };

  return (
    <div className="space-y-6">
      {/* Dot capture status */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Floating dot</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {isDotSparkActivated 
                ? "DotSpark is active - floating dot is available for thought capture"
                : "Activate DotSpark above to enable the floating dot"
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Circle 
              className={`h-4 w-4 ${
                isDotSparkActivated 
                  ? 'text-green-600 fill-green-600' 
                  : 'text-gray-400'
              }`} 
            />
            <Badge 
              variant={isDotSparkActivated ? "default" : "secondary"}
              className={isDotSparkActivated 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }
            >
              {isDotSparkActivated ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Capture mode selection - only show when DotSpark is activated */}
        {isDotSparkActivated && (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">Capture mode</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Voice Mode */}
                <button
                  onClick={() => handleModeChange('voice')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    captureMode === 'voice'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Mic className={`h-6 w-6 ${captureMode === 'voice' ? 'text-purple-600' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${captureMode === 'voice' ? 'text-purple-900 dark:text-purple-100' : 'text-gray-600 dark:text-gray-400'}`}>
                      Voice mode
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Voice input only
                    </span>
                  </div>
                </button>

                {/* Text Mode */}
                <button
                  onClick={() => handleModeChange('text')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    captureMode === 'text'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Type className={`h-6 w-6 ${captureMode === 'text' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${captureMode === 'text' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                      Text mode
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Text input only
                    </span>
                  </div>
                </button>

                {/* Hybrid Mode */}
                <button
                  onClick={() => handleModeChange('hybrid')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    captureMode === 'hybrid'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Mic className={`h-5 w-5 ${captureMode === 'hybrid' ? 'text-green-600' : 'text-gray-500'}`} />
                      <Type className={`h-5 w-5 ${captureMode === 'hybrid' ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <span className={`text-sm font-medium ${captureMode === 'hybrid' ? 'text-green-900 dark:text-green-100' : 'text-gray-600 dark:text-gray-400'}`}>
                      Hybrid mode
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Voice & text input
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-green-600" />
                <Label>Draggable positioning</Label>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Always enabled
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Additional Settings - always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <Label>Processing mode</Label>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Smart
            </Badge>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-purple-600" />
              <Label>Memory sync</Label>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Render floating dot when DotSpark is activated */}
      {isDotSparkActivated && (
        <FloatingDot 
          enabled={isDotSparkActivated}
          onToggle={() => {}} // No toggle needed - controlled by DotSpark activation
        />
      )}
    </div>
  );
}