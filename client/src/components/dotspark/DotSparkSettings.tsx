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
  const [captureMode, setCaptureMode] = useState<'natural' | 'ai'>('natural');
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCaptureMode(settings.captureMode ?? 'natural');
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

  const handleModeChange = (mode: 'natural' | 'ai') => {
    setCaptureMode(mode);
    saveSettings({ captureMode: mode });
    
    const modeLabels = {
      natural: "Natural Mode",
      ai: "AI Mode"
    };
    
    const modeDescriptions = {
      natural: "Direct capture using voice, text, or both",
      ai: "AI-assisted capture through chat or WhatsApp"
    };
    
    toast({
      title: `${modeLabels[mode]} activated`,
      description: modeDescriptions[mode],
    });
  };

  return (
    <div className="space-y-8">
      {/* Stunning Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-950/50 dark:to-yellow-950/50 rounded-2xl p-6 border-2 border-amber-200/50 dark:border-amber-800/50 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-xl"></div>
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
            <Settings className="h-6 w-6 text-white drop-shadow-sm" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Dot Settings
            </h3>
            <p className="text-amber-700/80 dark:text-amber-300/80 font-medium">
              Choose your perfect capture experience
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900/30 rounded-xl transition-all duration-300 hover:scale-110"
              >
                <Info className="h-5 w-5" />
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
                        Capture your thoughts directly using voice, text, or both. You create dots by speaking or typing your insights exactly as they come to you. Perfect for quick, spontaneous thought capture without any AI intervention.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border-2 border-purple-200/50 shadow-sm">
                      <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        AI Mode
                      </h4>
                      <p className="text-sm text-purple-700 leading-relaxed">
                        Chat with DotSpark AI to help structure your thoughts into perfect three-layer dots. The AI guides you through creating Summary, Anchor, and Pulse components through conversation or WhatsApp messaging. Perfect for complex thoughts that need organization.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200/50 shadow-sm">
                      <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        Visual Distinction
                      </h4>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Natural mode dots appear in orange/amber colors, while AI mode dots appear in purple gradients. Voice and text icons still show the input method used, helping you understand your thinking patterns.
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stunning Mode Selection */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h4 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Choose Your Experience
          </h4>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Select how you want to capture your brilliant thoughts
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Natural Mode - Stunning Design */}
          <div
            onClick={() => handleModeChange('natural')}
            className={`group relative cursor-pointer rounded-2xl p-6 transition-all duration-500 transform hover:scale-102 hover:rotate-1 ${
              captureMode === 'natural'
                ? 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 text-white shadow-xl shadow-orange-500/30 ring-2 ring-orange-300/50'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/15'
            }`}
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className={`absolute top-4 left-4 w-2 h-2 rounded-full ${captureMode === 'natural' ? 'bg-white/30' : 'bg-orange-300'} animate-pulse`}></div>
              <div className={`absolute top-8 right-6 w-1 h-1 rounded-full ${captureMode === 'natural' ? 'bg-white/40' : 'bg-orange-400'} animate-bounce`}></div>
              <div className={`absolute bottom-6 left-8 w-1.5 h-1.5 rounded-full ${captureMode === 'natural' ? 'bg-white/20' : 'bg-orange-200'} animate-pulse delay-300`}></div>
            </div>
            
            <div className="relative flex flex-col items-center gap-4">
              <div className={`p-3 rounded-xl transition-all duration-300 ${
                captureMode === 'natural' 
                  ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                  : 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30'
              }`}>
                <div className="flex items-center gap-2">
                  <Mic className={`h-6 w-6 transition-colors duration-300 ${
                    captureMode === 'natural' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`} />
                  <Type className={`h-6 w-6 transition-colors duration-300 ${
                    captureMode === 'natural' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h5 className={`text-xl font-bold transition-colors duration-300 ${
                  captureMode === 'natural' 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Natural Mode
                </h5>
                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                  captureMode === 'natural' 
                    ? 'text-white/90 drop-shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Pure, unfiltered thought capture. Voice, text, or both - exactly as your mind creates them.
                </p>
              </div>
              
              {captureMode === 'natural' && (
                <div className="absolute -top-3 -right-3 animate-bounce">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-full p-2">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Mode - Stunning Design */}
          <div
            onClick={() => handleModeChange('ai')}
            className={`group relative cursor-pointer rounded-3xl p-8 transition-all duration-500 transform hover:scale-105 hover:-rotate-1 ${
              captureMode === 'ai'
                ? 'bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 text-white shadow-2xl shadow-purple-500/40 ring-4 ring-purple-300/50'
                : 'bg-white dark:bg-gray-800 border-3 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl hover:shadow-purple-500/20'
            }`}
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className={`absolute top-6 right-4 w-2 h-2 rounded-full ${captureMode === 'ai' ? 'bg-white/30' : 'bg-purple-300'} animate-pulse delay-150`}></div>
              <div className={`absolute top-4 left-8 w-1 h-1 rounded-full ${captureMode === 'ai' ? 'bg-white/40' : 'bg-purple-400'} animate-bounce delay-500`}></div>
              <div className={`absolute bottom-8 right-6 w-1.5 h-1.5 rounded-full ${captureMode === 'ai' ? 'bg-white/20' : 'bg-purple-200'} animate-pulse delay-700`}></div>
            </div>
            
            <div className="relative flex flex-col items-center gap-6">
              <div className={`p-4 rounded-2xl transition-all duration-300 ${
                captureMode === 'ai' 
                  ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                  : 'bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30'
              }`}>
                <BrainCircuit className={`h-10 w-10 transition-colors duration-300 ${
                  captureMode === 'ai' 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-purple-600 dark:text-purple-400'
                }`} />
              </div>
              
              <div className="text-center space-y-3">
                <h5 className={`text-2xl font-bold transition-colors duration-300 ${
                  captureMode === 'ai' 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  AI Mode
                </h5>
                <p className={`text-base leading-relaxed transition-colors duration-300 ${
                  captureMode === 'ai' 
                    ? 'text-white/90 drop-shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  AI-guided thought organization. Chat or WhatsApp to structure complex ideas into perfect dots.
                </p>
              </div>
              
              {captureMode === 'ai' && (
                <div className="absolute -top-3 -right-3 animate-bounce delay-200">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-full p-2">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
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