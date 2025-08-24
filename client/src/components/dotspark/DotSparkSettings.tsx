import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Mic, 
  Type,
  BrainCircuit,
  Info,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";
import { neuraStorage } from "@/lib/neuraStorage";

export function DotSparkSettings() {
  const [captureMode, setCaptureMode] = useState<'natural' | 'ai' | 'hybrid'>('hybrid');
  const { toast } = useToast();

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
    
    // Trigger storage event for cross-component sync
    window.dispatchEvent(new Event('storage'));
  };

  const handleModeChange = (mode: 'natural' | 'ai' | 'hybrid') => {
    setCaptureMode(mode);
    saveSettings({ captureMode: mode });
    
    const modeLabels = {
      natural: "Natural Mode",
      ai: "AI Mode",
      hybrid: "Hybrid Mode"
    };
    
    const modeDescriptions = {
      natural: "Direct capture using voice or text only",
      ai: "AI-assisted capture through chat or WhatsApp only",
      hybrid: "Full flexibility - switch between any mode anytime"
    };
    
    toast({
      title: `${modeLabels[mode]} activated`,
      description: modeDescriptions[mode],
    });
  };

  return (
    <div className="space-y-8">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900/30 rounded-xl transition-all duration-300 hover:scale-110 mb-4"
          >
            <Info className="h-5 w-5 mr-2" />
            Mode Information
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl text-amber-900">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                <Info className="h-6 w-6 text-white" />
              </div>
              Capture Mode Guide
            </DialogTitle>
            <DialogDescription className="text-left space-y-6 pt-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200/50 shadow-sm">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Natural Mode
                  </h4>
                  <p className="text-sm text-green-700 leading-relaxed">
                    <strong>Pure, direct capture</strong> of your thoughts without AI assistance. Your words stay exactly as you speak or type them. Perfect for personal journaling, authentic reflection, and when you want complete control over your content.
                  </p>
                  <div className="mt-2 text-xs text-green-600 bg-green-100 rounded-lg px-3 py-1 inline-block">
                    ✨ Best for: Personal reflection, original thoughts, creative expression
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200/50 shadow-sm">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    AI Mode
                  </h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    <strong>AI-powered conversation</strong> to help you develop and capture insights. The AI asks clarifying questions, helps organize your thoughts, and suggests improvements while preserving your core ideas.
                  </p>
                  <div className="mt-2 text-xs text-blue-600 bg-blue-100 rounded-lg px-3 py-1 inline-block">
                    ✨ Best for: Complex topics, learning, structured thinking
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200/50 shadow-sm">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Hybrid Mode (Recommended)
                  </h4>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    <strong>Complete flexibility</strong> to switch between natural and AI modes based on your needs. Start with natural capture and engage AI assistance when needed, or begin with AI conversation and switch to direct input.
                  </p>
                  <div className="mt-2 text-xs text-purple-600 bg-purple-100 rounded-lg px-3 py-1 inline-block">
                    ✨ Best for: Maximum adaptability, mixed workflows, evolving needs
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Mode Selection */}
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Natural Mode */}
          <div
            onClick={() => handleModeChange('natural')}
            className={`group relative cursor-pointer rounded-2xl p-4 transition-all duration-500 transform hover:scale-102 ${
              captureMode === 'natural'
                ? 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 text-white shadow-xl shadow-orange-500/30 ring-2 ring-orange-300/50'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/15'
            }`}
          >
            <div className="relative flex flex-col items-center gap-3">
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                captureMode === 'natural' 
                  ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                  : 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30'
              }`}>
                <div className="flex items-center gap-1">
                  <Mic className={`h-4 w-4 transition-colors duration-300 ${
                    captureMode === 'natural' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`} />
                  <Type className={`h-4 w-4 transition-colors duration-300 ${
                    captureMode === 'natural' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <h5 className={`text-lg font-bold transition-colors duration-300 ${
                  captureMode === 'natural' 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Natural Mode
                </h5>
                <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                  captureMode === 'natural' 
                    ? 'text-white/90 drop-shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Direct voice/text capture only
                </p>
              </div>
              
              {captureMode === 'natural' && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-white rounded-full p-1 shadow-lg">
                    <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full p-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Mode */}
          <div
            onClick={() => handleModeChange('ai')}
            className={`group relative cursor-pointer rounded-2xl p-4 transition-all duration-500 transform hover:scale-102 ${
              captureMode === 'ai'
                ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-300/50'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/15'
            }`}
          >
            <div className="relative flex flex-col items-center gap-3">
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                captureMode === 'ai' 
                  ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                  : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
              }`}>
                <BrainCircuit className={`h-5 w-5 transition-colors duration-300 ${
                  captureMode === 'ai' 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              
              <div className="text-center space-y-1">
                <h5 className={`text-lg font-bold transition-colors duration-300 ${
                  captureMode === 'ai' 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  AI Mode
                </h5>
                <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                  captureMode === 'ai' 
                    ? 'text-white/90 drop-shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  AI-assisted conversation only
                </p>
              </div>
              
              {captureMode === 'ai' && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-white rounded-full p-1 shadow-lg">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hybrid Mode */}
          <div
            onClick={() => handleModeChange('hybrid')}
            className={`group relative cursor-pointer rounded-2xl p-4 transition-all duration-500 transform hover:scale-102 ${
              captureMode === 'hybrid'
                ? 'bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 text-white shadow-xl shadow-purple-500/30 ring-2 ring-purple-300/50'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/15'
            }`}
          >
            <div className="relative flex flex-col items-center gap-3">
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                captureMode === 'hybrid' 
                  ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                  : 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30'
              }`}>
                <div className="flex items-center gap-1">
                  <Sparkles className={`h-4 w-4 transition-colors duration-300 ${
                    captureMode === 'hybrid' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-purple-600 dark:text-purple-400'
                  }`} />
                  <BrainCircuit className={`h-4 w-4 transition-colors duration-300 ${
                    captureMode === 'hybrid' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <h5 className={`text-lg font-bold transition-colors duration-300 ${
                  captureMode === 'hybrid' 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Hybrid Mode
                </h5>
                <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                  captureMode === 'hybrid' 
                    ? 'text-white/90 drop-shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Switch between any mode anytime
                </p>
              </div>
              
              {captureMode === 'hybrid' && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-white rounded-full p-1 shadow-lg">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simplified settings - chat and input preferences removed per user request */}
      </div>
    </div>
  );
}