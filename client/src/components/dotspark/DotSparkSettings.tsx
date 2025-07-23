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
  const [chatPreference, setChatPreference] = useState<'whatsapp' | 'direct' | 'both'>('both');
  const [naturalPreference, setNaturalPreference] = useState<'voice' | 'text' | 'both'>('both');
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCaptureMode(settings.captureMode ?? 'hybrid');
      setChatPreference(settings.chatPreference ?? 'both');
      setNaturalPreference(settings.naturalPreference ?? 'both');
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: any) => {
    const settings = {
      captureMode,
      chatPreference,
      naturalPreference,
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

  const handleChatPreferenceChange = (preference: 'whatsapp' | 'direct' | 'both') => {
    setChatPreference(preference);
    saveSettings({ chatPreference: preference });
  };

  const handleNaturalPreferenceChange = (preference: 'voice' | 'text' | 'both') => {
    setNaturalPreference(preference);
    saveSettings({ naturalPreference: preference });
    
    const preferenceLabels = {
      whatsapp: "WhatsApp Only",
      direct: "Direct Chat Only",
      both: "Both Options"
    };
    
    toast({
      title: `Chat preference updated`,
      description: `AI assistance available via ${preferenceLabels[preference]}`,
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
                    Direct capture using voice or text only. You create dots by speaking or typing your insights exactly as they come to you. No AI assistance available.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border-2 border-purple-200/50 shadow-sm">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    AI Mode
                  </h4>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    AI-assisted capture through chat or WhatsApp only. The AI guides you through creating perfect three-layer dots with Summary, Anchor, and Pulse components.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200/50 shadow-sm">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Hybrid Mode (Default)
                  </h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Full flexibility - switch between any mode anytime. Access both natural capture (voice/text) and AI assistance whenever you need it. Perfect for adaptive thinking.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200/50 shadow-sm">
                  <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Visual Distinction
                  </h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    Natural mode dots appear in orange/amber colors, while AI mode dots appear in purple gradients. Voice and text icons still show the input method used.
                  </p>
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
                    <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-full p-1">
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
                ? 'bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 text-white shadow-xl shadow-purple-500/30 ring-2 ring-purple-300/50'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/15'
            }`}
          >
            <div className="relative flex flex-col items-center gap-3">
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                captureMode === 'ai' 
                  ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                  : 'bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30'
              }`}>
                <BrainCircuit className={`h-6 w-6 transition-colors duration-300 ${
                  captureMode === 'ai' 
                    ? 'text-white drop-shadow-sm' 
                    : 'text-purple-600 dark:text-purple-400'
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
                  AI assistance via chat/WhatsApp only
                </p>
              </div>
              
              {captureMode === 'ai' && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-white rounded-full p-1 shadow-lg">
                    <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-full p-1">
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
                ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 ring-2 ring-blue-300/50'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/15'
            }`}
          >
            <div className="relative flex flex-col items-center gap-3">
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                captureMode === 'hybrid' 
                  ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                  : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'
              }`}>
                <div className="flex items-center gap-1">
                  <Mic className={`h-3 w-3 transition-colors duration-300 ${
                    captureMode === 'hybrid' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <Type className={`h-3 w-3 transition-colors duration-300 ${
                    captureMode === 'hybrid' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <BrainCircuit className={`h-4 w-4 transition-colors duration-300 ${
                    captureMode === 'hybrid' 
                      ? 'text-white drop-shadow-sm' 
                      : 'text-blue-600 dark:text-blue-400'
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

        {/* Chat Preference Settings - Only show when AI or Hybrid mode is selected */}
        {(captureMode === 'ai' || captureMode === 'hybrid') && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              AI Chat Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WhatsApp Only */}
              <div
                onClick={() => handleChatPreferenceChange('whatsapp')}
                className={`cursor-pointer rounded-xl p-3 transition-all duration-300 transform hover:scale-102 ${
                  chatPreference === 'whatsapp'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg ring-2 ring-green-300/50'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    chatPreference === 'whatsapp' 
                      ? 'bg-white/20' 
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <svg className={`h-5 w-5 ${
                      chatPreference === 'whatsapp' 
                        ? 'text-white' 
                        : 'text-green-600'
                    }`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087"/>
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${
                    chatPreference === 'whatsapp' 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    WhatsApp Only
                  </span>
                </div>
              </div>

              {/* Direct Chat Only */}
              <div
                onClick={() => handleChatPreferenceChange('direct')}
                className={`cursor-pointer rounded-xl p-3 transition-all duration-300 transform hover:scale-102 ${
                  chatPreference === 'direct'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg ring-2 ring-blue-300/50'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    chatPreference === 'direct' 
                      ? 'bg-white/20' 
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    <BrainCircuit className={`h-5 w-5 ${
                      chatPreference === 'direct' 
                        ? 'text-white' 
                        : 'text-blue-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    chatPreference === 'direct' 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    Direct Chat Only
                  </span>
                </div>
              </div>

              {/* Both Options */}
              <div
                onClick={() => handleChatPreferenceChange('both')}
                className={`cursor-pointer rounded-xl p-3 transition-all duration-300 transform hover:scale-102 ${
                  chatPreference === 'both'
                    ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg ring-2 ring-purple-300/50'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    chatPreference === 'both' 
                      ? 'bg-white/20' 
                      : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    <div className="flex items-center gap-1">
                      <svg className={`h-4 w-4 ${
                        chatPreference === 'both' 
                          ? 'text-white' 
                          : 'text-purple-600'
                      }`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087"/>
                      </svg>
                      <BrainCircuit className={`h-4 w-4 ${
                        chatPreference === 'both' 
                          ? 'text-white' 
                          : 'text-purple-600'
                      }`} />
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    chatPreference === 'both' 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    Both Options
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Natural Input Preference Settings - Only show when Natural or Hybrid mode is selected */}
        {(captureMode === 'natural' || captureMode === 'hybrid') && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Natural Input Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Voice Only */}
              <div
                onClick={() => handleNaturalPreferenceChange('voice')}
                className={`cursor-pointer rounded-xl p-3 transition-all duration-300 transform hover:scale-102 ${
                  naturalPreference === 'voice'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg ring-2 ring-amber-300/50'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    naturalPreference === 'voice' 
                      ? 'bg-white/20' 
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    <Mic className={`h-5 w-5 ${
                      naturalPreference === 'voice' 
                        ? 'text-white' 
                        : 'text-amber-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    naturalPreference === 'voice' 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    Voice Only
                  </span>
                </div>
              </div>

              {/* Text Only */}
              <div
                onClick={() => handleNaturalPreferenceChange('text')}
                className={`cursor-pointer rounded-xl p-3 transition-all duration-300 transform hover:scale-102 ${
                  naturalPreference === 'text'
                    ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg ring-2 ring-orange-300/50'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    naturalPreference === 'text' 
                      ? 'bg-white/20' 
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    <Type className={`h-5 w-5 ${
                      naturalPreference === 'text' 
                        ? 'text-white' 
                        : 'text-orange-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    naturalPreference === 'text' 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    Text Only
                  </span>
                </div>
              </div>

              {/* Both Options */}
              <div
                onClick={() => handleNaturalPreferenceChange('both')}
                className={`cursor-pointer rounded-xl p-3 transition-all duration-300 transform hover:scale-102 ${
                  naturalPreference === 'both'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg ring-2 ring-amber-300/50'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    naturalPreference === 'both' 
                      ? 'bg-white/20' 
                      : 'bg-amber-100 dark:bg-amber-900/30'
                  }`}>
                    <div className="flex items-center gap-1">
                      <Mic className={`h-4 w-4 ${
                        naturalPreference === 'both' 
                          ? 'text-white' 
                          : 'text-amber-600'
                      }`} />
                      <Type className={`h-4 w-4 ${
                        naturalPreference === 'both' 
                          ? 'text-white' 
                          : 'text-amber-600'
                      }`} />
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    naturalPreference === 'both' 
                      ? 'text-white' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    Both Options
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