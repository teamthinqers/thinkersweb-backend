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
  const [captureMode, setCaptureMode] = useState<'natural' | 'ai'>('natural');
  const [naturalSubMode, setNaturalSubMode] = useState<'voice' | 'text' | 'both'>('both');
  const { toast } = useToast();
  
  // Check if DotSpark is activated - floating dot appears automatically when DotSpark is active
  const isDotSparkActivated = neuraStorage.isActivated();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      // Convert old hybrid mode to new natural mode
      if (settings.captureMode === 'hybrid') {
        setCaptureMode('natural');
        setNaturalSubMode('both');
      } else if (settings.captureMode === 'voice' || settings.captureMode === 'text') {
        setCaptureMode('natural');
        setNaturalSubMode(settings.captureMode);
      } else {
        setCaptureMode(settings.captureMode ?? 'natural');
        setNaturalSubMode(settings.naturalSubMode ?? 'both');
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: any) => {
    const settings = {
      captureMode,
      naturalSubMode,
      ...newSettings
    };
    localStorage.setItem('dotspark-settings', JSON.stringify(settings));
    
    // Also save in old format for backwards compatibility
    if (captureMode === 'natural') {
      const oldSettings = {
        captureMode: naturalSubMode === 'both' ? 'hybrid' : naturalSubMode
      };
      localStorage.setItem('dotspark-settings-legacy', JSON.stringify(oldSettings));
    }
  };

  const handleModeChange = (mode: 'natural' | 'ai') => {
    setCaptureMode(mode);
    saveSettings({ captureMode: mode });
    
    const modeLabels = {
      natural: "Natural Mode",
      ai: "AI Mode"
    };
    
    const modeDescriptions = {
      natural: "Direct capture with voice or text buttons",
      ai: "AI-assisted capture through chat or WhatsApp"
    };
    
    toast({
      title: `${modeLabels[mode]} selected`,
      description: modeDescriptions[mode],
    });
  };

  const handleNaturalSubModeChange = (subMode: 'voice' | 'text' | 'both') => {
    setNaturalSubMode(subMode);
    saveSettings({ naturalSubMode: subMode });
    
    const subModeLabels = {
      voice: "Voice only",
      text: "Text only", 
      both: "Voice & Text"
    };
    
    toast({
      title: `${subModeLabels[subMode]} selected`,
      description: `Natural mode will show ${subMode === 'both' ? 'both voice and text options' : subMode + ' option only'}`,
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Natural Mode */}
          <div
            onClick={() => handleModeChange('natural')}
            className={`group relative cursor-pointer rounded-lg p-6 transition-all duration-300 transform hover:scale-102 hover:shadow-md ${
              captureMode === 'natural'
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/25 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-full ${
                captureMode === 'natural' 
                  ? 'bg-white/20' 
                  : 'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                <div className="flex items-center gap-1">
                  <Mic className={`h-5 w-5 ${
                    captureMode === 'natural' 
                      ? 'text-white' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`} />
                  <Type className={`h-5 w-5 ${
                    captureMode === 'natural' 
                      ? 'text-white' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`} />
                </div>
              </div>
              
              <div className="text-center">
                <h5 className={`text-lg font-bold mb-2 ${
                  captureMode === 'natural' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Natural Mode
                </h5>
                <p className={`text-sm ${
                  captureMode === 'natural' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Direct capture with voice or text buttons
                </p>
              </div>
              
              {captureMode === 'natural' && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                  <div className="bg-amber-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Mode */}
          <div
            onClick={() => handleModeChange('ai')}
            className={`group relative cursor-pointer rounded-lg p-6 transition-all duration-300 transform hover:scale-102 hover:shadow-md ${
              captureMode === 'ai'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-full ${
                captureMode === 'ai' 
                  ? 'bg-white/20' 
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <BrainCircuit className={`h-6 w-6 ${
                  captureMode === 'ai' 
                    ? 'text-white' 
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              
              <div className="text-center">
                <h5 className={`text-lg font-bold mb-2 ${
                  captureMode === 'ai' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  AI Mode
                </h5>
                <p className={`text-sm ${
                  captureMode === 'ai' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  AI-assisted capture through chat or WhatsApp
                </p>
              </div>
              
              {captureMode === 'ai' && (
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
        </div>

        {/* Natural Mode Sub-options */}
        {captureMode === 'natural' && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h5 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-4">Natural Mode Options</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Voice Only */}
              <div
                onClick={() => handleNaturalSubModeChange('voice')}
                className={`cursor-pointer rounded-lg p-3 transition-all duration-200 ${
                  naturalSubMode === 'voice'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 hover:border-amber-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Mic className={`h-5 w-5 ${
                    naturalSubMode === 'voice' ? 'text-white' : 'text-amber-600 dark:text-amber-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    naturalSubMode === 'voice' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    Voice Only
                  </span>
                </div>
              </div>

              {/* Text Only */}
              <div
                onClick={() => handleNaturalSubModeChange('text')}
                className={`cursor-pointer rounded-lg p-3 transition-all duration-200 ${
                  naturalSubMode === 'text'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 hover:border-amber-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Type className={`h-5 w-5 ${
                    naturalSubMode === 'text' ? 'text-white' : 'text-amber-600 dark:text-amber-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    naturalSubMode === 'text' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    Text Only
                  </span>
                </div>
              </div>

              {/* Both */}
              <div
                onClick={() => handleNaturalSubModeChange('both')}
                className={`cursor-pointer rounded-lg p-3 transition-all duration-200 ${
                  naturalSubMode === 'both'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 hover:border-amber-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Mic className={`h-4 w-4 ${
                      naturalSubMode === 'both' ? 'text-white' : 'text-amber-600 dark:text-amber-400'
                    }`} />
                    <Type className={`h-4 w-4 ${
                      naturalSubMode === 'both' ? 'text-white' : 'text-amber-600 dark:text-amber-400'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    naturalSubMode === 'both' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    Voice & Text
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}