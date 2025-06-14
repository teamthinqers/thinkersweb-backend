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
  Eye,
  EyeOff,
  Zap,
  BrainCircuit
} from "lucide-react";
import { FloatingDot } from "./FloatingDot";
import { useToast } from "@/hooks/use-toast";

export function DotSparkSettings() {
  const [floatingDotEnabled, setFloatingDotEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [textEnabled, setTextEnabled] = useState(true);
  const [dotVisible, setDotVisible] = useState(true);
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setFloatingDotEnabled(settings.floatingDotEnabled ?? false);
      setVoiceEnabled(settings.voiceEnabled ?? true);
      setTextEnabled(settings.textEnabled ?? true);
      setDotVisible(settings.dotVisible ?? true);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: any) => {
    const settings = {
      floatingDotEnabled,
      voiceEnabled,
      textEnabled,
      dotVisible,
      ...newSettings
    };
    localStorage.setItem('dotspark-settings', JSON.stringify(settings));
  };

  const handleFloatingDotToggle = (enabled: boolean) => {
    setFloatingDotEnabled(enabled);
    saveSettings({ floatingDotEnabled: enabled });
    
    if (enabled) {
      toast({
        title: "Floating Dot Activated",
        description: "You can now capture thoughts anywhere with the floating dot",
      });
    } else {
      toast({
        title: "Floating Dot Deactivated",
        description: "The floating dot has been hidden",
      });
    }
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    saveSettings({ voiceEnabled: enabled });
  };

  const handleTextToggle = (enabled: boolean) => {
    setTextEnabled(enabled);
    saveSettings({ textEnabled: enabled });
  };

  const handleVisibilityToggle = (visible: boolean) => {
    setDotVisible(visible);
    saveSettings({ dotVisible: visible });
  };

  const resetDotPosition = () => {
    localStorage.removeItem('dotspark-dot-position');
    toast({
      title: "Position Reset",
      description: "Floating dot position has been reset to default",
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Toggle Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Circle className="h-5 w-5 text-white fill-current" />
              </div>
              <div>
                <CardTitle className="text-lg">Floating Dot</CardTitle>
                <CardDescription>Quick thought capture anywhere on screen</CardDescription>
              </div>
            </div>
            <Switch
              checked={floatingDotEnabled}
              onCheckedChange={handleFloatingDotToggle}
              className="data-[state=checked]:bg-amber-600"
            />
          </div>
        </CardHeader>
        
        {floatingDotEnabled && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="dot-visibility">Show floating dot</Label>
                </div>
                <Switch
                  id="dot-visibility"
                  checked={dotVisible}
                  onCheckedChange={handleVisibilityToggle}
                />
              </div>

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

              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>Dot Position</Label>
                    <p className="text-xs text-muted-foreground">Drag the dot to reposition</p>
                  </div>
                </div>
                <Button
                  onClick={resetDotPosition}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Feature Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Floating Dot</span>
              </div>
              <Badge variant={floatingDotEnabled ? "default" : "secondary"}>
                {floatingDotEnabled ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Voice Recognition</span>
              </div>
              <Badge variant={
                'webkitSpeechRecognition' in window || 'SpeechRecognition' in window 
                  ? "default" 
                  : "destructive"
              }>
                {'webkitSpeechRecognition' in window || 'SpeechRecognition' in window 
                  ? "Supported" 
                  : "Not Supported"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Quick Capture</span>
              </div>
              <Badge variant={floatingDotEnabled && (textEnabled || voiceEnabled) ? "default" : "secondary"}>
                {floatingDotEnabled && (textEnabled || voiceEnabled) ? "Ready" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {floatingDotEnabled && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50">
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-200">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <p>• <strong>Click</strong> the floating dot to open the capture interface</p>
            <p>• <strong>Drag</strong> the dot to reposition it anywhere on screen</p>
            <p>• <strong>Choose</strong> between text or voice input for your thoughts</p>
            <p>• <strong>Captured thoughts</strong> are automatically saved to your DotSpark entries</p>
          </CardContent>
        </Card>
      )}

      {/* Floating Dot Component */}
      <FloatingDot 
        enabled={floatingDotEnabled && dotVisible} 
        onToggle={handleFloatingDotToggle}
      />
    </div>
  );
}