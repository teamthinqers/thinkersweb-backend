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
  const [captureMode, setCaptureMode] = useState<'voice' | 'text' | 'hybrid' | 'ai'>('hybrid');
  const [aiSubMode, setAiSubMode] = useState<'direct' | 'whatsapp'>('direct');
  const { toast } = useToast();
  
  // Check if DotSpark is activated - floating dot appears automatically when DotSpark is active
  const isDotSparkActivated = neuraStorage.isActivated();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCaptureMode(settings.captureMode ?? 'hybrid');
      setAiSubMode(settings.aiSubMode ?? 'direct');
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: any) => {
    const settings = {
      captureMode,
      aiSubMode,
      ...newSettings
    };
    localStorage.setItem('dotspark-settings', JSON.stringify(settings));
  };

  const handleModeChange = (mode: 'voice' | 'text' | 'hybrid' | 'ai') => {
    setCaptureMode(mode);
    saveSettings({ captureMode: mode });
    
    const modeLabels = {
      voice: "Voice mode",
      text: "Text mode", 
      hybrid: "Natural mode",
      ai: "AI Mode"
    };
    
    const modeDescriptions = {
      voice: "Voice input only for thought capture",
      text: "Text input only for thought capture",
      hybrid: "Both voice and text input available",
      ai: "AI-assisted capture through chat or WhatsApp"
    };
    
    toast({
      title: `${modeLabels[mode]} selected`,
      description: modeDescriptions[mode],
    });
  };

  const handleAiSubModeChange = (subMode: 'direct' | 'whatsapp') => {
    setAiSubMode(subMode);
    saveSettings({ aiSubMode: subMode });
    
    const subModeLabels = {
      direct: "Direct Chat",
      whatsapp: "WhatsApp"
    };
    
    toast({
      title: `${subModeLabels[subMode]} selected`,
      description: `AI mode will use ${subMode === 'direct' ? 'direct chat interface' : 'WhatsApp integration'}`,
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Voice Only */}
          <div
            onClick={() => handleModeChange('voice')}
            className={`group relative cursor-pointer rounded-lg p-4 transition-all duration-300 transform hover:scale-102 hover:shadow-md ${
              captureMode === 'voice'
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/25 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-2 rounded-full ${
                captureMode === 'voice' 
                  ? 'bg-white/20' 
                  : 'bg-purple-100 dark:bg-purple-900/30'
              }`}>
                <Mic className={`h-6 w-6 ${
                  captureMode === 'voice' 
                    ? 'text-white' 
                    : 'text-purple-600 dark:text-purple-400'
                }`} />
              </div>
              
              <div className="text-center">
                <h5 className={`text-base font-bold mb-1 ${
                  captureMode === 'voice' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Voice Only
                </h5>
                <p className={`text-xs ${
                  captureMode === 'voice' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Speak your thoughts
                </p>
              </div>
              
              {captureMode === 'voice' && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                  <div className="bg-purple-500 rounded-full p-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
            className={`group relative cursor-pointer rounded-lg p-4 transition-all duration-300 transform hover:scale-102 hover:shadow-md ${
              captureMode === 'text'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-2 rounded-full ${
                captureMode === 'text' 
                  ? 'bg-white/20' 
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <Type className={`h-6 w-6 ${
                  captureMode === 'text' 
                    ? 'text-white' 
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              
              <div className="text-center">
                <h5 className={`text-base font-bold mb-1 ${
                  captureMode === 'text' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Text Only
                </h5>
                <p className={`text-xs ${
                  captureMode === 'text' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Type your thoughts
                </p>
              </div>
              
              {captureMode === 'text' && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                  <div className="bg-blue-500 rounded-full p-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
            className={`group relative cursor-pointer rounded-lg p-4 transition-all duration-300 transform hover:scale-102 hover:shadow-md ${
              captureMode === 'hybrid'
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/25 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-2 rounded-full ${
                captureMode === 'hybrid' 
                  ? 'bg-white/20' 
                  : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <div className="flex items-center gap-0.5">
                  <Mic className={`h-5 w-5 ${
                    captureMode === 'hybrid' 
                      ? 'text-white' 
                      : 'text-green-600 dark:text-green-400'
                  }`} />
                  <Type className={`h-5 w-5 ${
                    captureMode === 'hybrid' 
                      ? 'text-white' 
                      : 'text-green-600 dark:text-green-400'
                  }`} />
                </div>
              </div>
              
              <div className="text-center">
                <h5 className={`text-base font-bold mb-1 ${
                  captureMode === 'hybrid' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Natural Mode
                </h5>
                <p className={`text-xs ${
                  captureMode === 'hybrid' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Both voice & text
                </p>
              </div>
              
              {captureMode === 'hybrid' && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                  <div className="bg-green-500 rounded-full p-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
            className={`group relative cursor-pointer rounded-lg p-4 transition-all duration-300 transform hover:scale-102 hover:shadow-md ${
              captureMode === 'ai'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-2 rounded-full ${
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
                <h5 className={`text-base font-bold mb-1 ${
                  captureMode === 'ai' 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  AI Mode
                </h5>
                <p className={`text-xs ${
                  captureMode === 'ai' 
                    ? 'text-white/80' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  AI-assisted capture
                </p>
              </div>
              
              {captureMode === 'ai' && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                  <div className="bg-blue-500 rounded-full p-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Mode Sub-options */}
        {captureMode === 'ai' && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">AI Mode Options</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Direct Chat */}
              <div
                onClick={() => handleAiSubModeChange('direct')}
                className={`cursor-pointer rounded-lg p-4 transition-all duration-200 ${
                  aiSubMode === 'direct'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <BrainCircuit className={`h-6 w-6 ${
                    aiSubMode === 'direct' ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <div className="text-center">
                    <span className={`text-base font-semibold ${
                      aiSubMode === 'direct' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      Direct Chat
                    </span>
                    <p className={`text-sm mt-1 ${
                      aiSubMode === 'direct' ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Chat with AI to create dots
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div
                onClick={() => handleAiSubModeChange('whatsapp')}
                className={`cursor-pointer rounded-lg p-4 transition-all duration-200 ${
                  aiSubMode === 'whatsapp'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 hover:border-blue-400'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <svg className={`h-6 w-6 ${
                    aiSubMode === 'whatsapp' ? 'text-white' : 'text-green-600'
                  }`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.306"/>
                  </svg>
                  <div className="text-center">
                    <span className={`text-base font-semibold ${
                      aiSubMode === 'whatsapp' ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      WhatsApp
                    </span>
                    <p className={`text-sm mt-1 ${
                      aiSubMode === 'whatsapp' ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Message AI through WhatsApp
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}