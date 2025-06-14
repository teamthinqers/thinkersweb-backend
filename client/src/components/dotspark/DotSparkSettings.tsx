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
      {/* Dot Settings header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Dot Settings</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Configure your dot capture settings
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selection - always visible */}
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Choose your capture mode</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Select how you prefer to capture your thoughts with DotSpark</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Voice Only */}
          <div
            onClick={() => handleModeChange('voice')}
            className={`group relative cursor-pointer rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              captureMode === 'voice'
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/25 shadow-xl'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-full ${
                captureMode === 'voice' 
                  ? 'bg-white/20' 
                  : 'bg-purple-100 dark:bg-purple-900/30'
              }`}>
                <Mic className={`h-8 w-8 ${
                  captureMode === 'voice' 
                    ? 'text-white' 
                    : 'text-purple-600 dark:text-purple-400'
                }`} />
              </div>
              
              <div className="text-center">
                <h5 className={`text-lg font-bold mb-1 ${
                  captureMode === 'voice' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Voice Only
                </h5>
                <p className={`text-sm ${
                  captureMode === 'voice' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Speak your thoughts naturally
                </p>
              </div>
              
              {captureMode === 'voice' && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                  <div className="bg-purple-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Text Only */}
          <div
            onClick={() => handleModeChange('text')}
            className={`group relative cursor-pointer rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              captureMode === 'text'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25 shadow-xl'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-full ${
                captureMode === 'text' 
                  ? 'bg-white/20' 
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <Type className={`h-8 w-8 ${
                  captureMode === 'text' 
                    ? 'text-white' 
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              
              <div className="text-center">
                <h5 className={`text-lg font-bold mb-1 ${
                  captureMode === 'text' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Text Only
                </h5>
                <p className={`text-sm ${
                  captureMode === 'text' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Type your thoughts precisely
                </p>
              </div>
              
              {captureMode === 'text' && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                  <div className="bg-blue-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hybrid Mode */}
          <div
            onClick={() => handleModeChange('hybrid')}
            className={`group relative cursor-pointer rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              captureMode === 'hybrid'
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/25 shadow-xl'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-full ${
                captureMode === 'hybrid' 
                  ? 'bg-white/20' 
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <div className="flex items-center gap-1">
                  <Mic className={`h-6 w-6 ${
                    captureMode === 'hybrid' 
                      ? 'text-white' 
                      : 'text-green-600 dark:text-green-400'
                  }`} />
                  <Type className={`h-6 w-6 ${
                    captureMode === 'hybrid' 
                      ? 'text-white' 
                      : 'text-green-600 dark:text-green-400'
                  }`} />
                </div>
              </div>
              
              <div className="text-center">
                <h5 className={`text-lg font-bold mb-1 ${
                  captureMode === 'hybrid' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Hybrid Mode
                </h5>
                <p className={`text-sm ${
                  captureMode === 'hybrid' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Switch between voice & text
                </p>
              </div>
              
              {captureMode === 'hybrid' && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                  <div className="bg-green-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}