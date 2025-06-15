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
  BrainCircuit,
  Info
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
  
  // Check if DotSpark is activated - floating dot appears automatically when DotSpark is active
  const isDotSparkActivated = neuraStorage.isActivated();

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
    <div className="space-y-6">
      {/* Dot Settings header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Dot Settings</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Configure your dot capture settings
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900/50"
              >
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-amber-900">
                  <Info className="h-5 w-5 text-amber-600" />
                  Capture Mode Guide
                </DialogTitle>
                <DialogDescription className="text-left space-y-4 pt-2">
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Natural Mode</h4>
                      <p className="text-sm text-green-700">
                        Capture your thoughts directly using voice, text, or both. You create dots by speaking or typing your insights exactly as they come to you. Perfect for quick, spontaneous thought capture.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">AI Mode</h4>
                      <p className="text-sm text-purple-700">
                        Chat with DotSpark AI to help structure your thoughts into perfect three-layer dots. The AI guides you through creating Summary, Anchor, and Pulse components through conversation or WhatsApp messaging.
                      </p>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-800 mb-2">Visual Distinction</h4>
                      <p className="text-sm text-amber-700">
                        Natural mode dots appear in orange/amber colors, while AI mode dots appear in purple. Voice and text icons still show the input method used.
                      </p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
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
                ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/25 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-full ${
                captureMode === 'natural' 
                  ? 'bg-white/20' 
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                <div className="flex items-center gap-1">
                  <Mic className={`h-6 w-6 ${
                    captureMode === 'natural' 
                      ? 'text-white' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`} />
                  <Type className={`h-6 w-6 ${
                    captureMode === 'natural' 
                      ? 'text-white' 
                      : 'text-orange-600 dark:text-orange-400'
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
                    ? 'text-white/90' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Direct capture using voice, text, or both. Quick and spontaneous thought capture.
                </p>
              </div>
              
              {captureMode === 'natural' && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1">
                  <div className="bg-orange-500 rounded-full p-1">
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
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/25 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-3 rounded-full ${
                captureMode === 'ai' 
                  ? 'bg-white/20' 
                  : 'bg-purple-100 dark:bg-purple-900/30'
              }`}>
                <BrainCircuit className={`h-8 w-8 ${
                  captureMode === 'ai' 
                    ? 'text-white' 
                    : 'text-purple-600 dark:text-purple-400'
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
                    ? 'text-white/90' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Chat with DotSpark AI to help structure your thoughts into perfect three-layer dots.
                </p>
              </div>
              
              {captureMode === 'ai' && (
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
        </div>
      </div>
    </div>
  );
}