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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [textEnabled, setTextEnabled] = useState(true);
  const { toast } = useToast();
  
  // Check if DotSpark is activated - floating dot appears automatically when DotSpark is active
  const isDotSparkActivated = neuraStorage.isActivated();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setVoiceEnabled(settings.voiceEnabled ?? true);
      setTextEnabled(settings.textEnabled ?? true);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: any) => {
    const settings = {
      voiceEnabled,
      textEnabled,
      ...newSettings
    };
    localStorage.setItem('dotspark-settings', JSON.stringify(settings));
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    saveSettings({ voiceEnabled: enabled });
    
    toast({
      title: enabled ? "Voice capture enabled" : "Voice capture disabled",
      description: enabled ? "You can now capture thoughts using voice input" : "Voice input has been disabled",
    });
  };

  const handleTextToggle = (enabled: boolean) => {
    setTextEnabled(enabled);
    saveSettings({ textEnabled: enabled });
    
    toast({
      title: enabled ? "Text capture enabled" : "Text capture disabled",
      description: enabled ? "You can now capture thoughts using text input" : "Text input has been disabled",
    });
  };

  return (
    <div className="space-y-6">
      {/* Dot capture status */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Dot capture status</h3>
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

        {/* Capture method toggles - only show when DotSpark is activated */}
        {isDotSparkActivated && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-blue-600" />
                  <Label htmlFor="text-capture">Text capture</Label>
                </div>
                <Switch
                  id="text-capture"
                  checked={textEnabled}
                  onCheckedChange={handleTextToggle}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-purple-600" />
                  <Label htmlFor="voice-capture">Voice capture</Label>
                </div>
                <Switch
                  id="voice-capture"
                  checked={voiceEnabled}
                  onCheckedChange={handleVoiceToggle}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg mt-4">
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