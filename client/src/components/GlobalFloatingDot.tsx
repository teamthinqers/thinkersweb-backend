import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Type, X, Send, Brain, User, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { neuraStorage } from "@/lib/neuraStorage";

interface Position {
  x: number;
  y: number;
}

export function GlobalFloatingDot() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'text' | 'voice' | null>(null);
  const [aiMode, setAiMode] = useState<'natural' | 'ai'>('natural');
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('global-floating-dot-position');
    return saved ? JSON.parse(saved) : { x: 320, y: 180 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showActivationPrompt, setShowActivationPrompt] = useState(false);
  
  const dotRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if DotSpark is activated for signed-in users
  const isDotSparkActivated = user ? neuraStorage.isActivated() : false;

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('global-floating-dot-position', JSON.stringify(position));
  }, [position]);

  // Listen for custom trigger events
  useEffect(() => {
    const handleTriggerFloatingDot = () => {
      setIsExpanded(true);
    };

    window.addEventListener('triggerFloatingDot', handleTriggerFloatingDot);
    return () => window.removeEventListener('triggerFloatingDot', handleTriggerFloatingDot);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setTextInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or use text input",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const rect = dotRef.current?.getBoundingClientRect();
    const startX = e.clientX - (rect?.left || position.x);
    const startY = e.clientY - (rect?.top || position.y);

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const newX = Math.max(12, Math.min(window.innerWidth - 60, e.clientX - startX));
      const newY = Math.max(12, Math.min(window.innerHeight - 60, e.clientY - startY));
      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    const touch = e.touches[0];
    const rect = dotRef.current?.getBoundingClientRect();
    const startX = touch.clientX - (rect?.left || position.x);
    const startY = touch.clientY - (rect?.top || position.y);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const newX = Math.max(12, Math.min(window.innerWidth - 60, touch.clientX - startX));
      const newY = Math.max(12, Math.min(window.innerHeight - 60, touch.clientY - startY));
      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleDotClick = () => {
    if (isDragging) return;
    setIsExpanded(true);
  };

  const handleStartRecording = () => {
    // Check authentication and activation
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    if (!isDotSparkActivated) {
      setShowActivationPrompt(true);
      return;
    }

    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSaveContent = async () => {
    // Check authentication and activation
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    if (!isDotSparkActivated) {
      setShowActivationPrompt(true);
      return;
    }

    if (!textInput.trim()) {
      toast({
        title: "No content to save",
        description: "Please enter some text or record audio first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: textInput,
          sourceType: captureMode,
          captureMode: aiMode,
        }),
      });

      if (response.ok) {
        toast({
          title: "Dot saved successfully!",
          description: "Your insight has been captured",
        });
        
        // Reset form
        setTextInput('');
        setCaptureMode(null);
        setIsExpanded(false);
      } else {
        throw new Error('Failed to save dot');
      }
    } catch (error) {
      console.error('Error saving dot:', error);
      toast({
        title: "Error saving dot",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleModeSelection = (mode: 'voice' | 'text') => {
    // Check authentication and activation for any action
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    if (!isDotSparkActivated) {
      setShowActivationPrompt(true);
      return;
    }

    setCaptureMode(mode);
    if (mode === 'voice') {
      handleStartRecording();
    }
  };

  // Authentication prompt modal
  const AuthPrompt = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000000]">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6">
            Please sign in to create and save your dots, wheels, and chakras.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowAuthPrompt(false);
                window.location.href = '/auth';
              }}
              className="flex-1"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setShowAuthPrompt(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Activation prompt modal
  const ActivationPrompt = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000000]">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Activate DotSpark</h3>
          <p className="text-gray-600 mb-4">
            Enter activation code to start creating dots, wheels, and chakras.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-amber-800 font-medium">
              Activation Code: <span className="font-bold">DOTSPARKSOCIAL</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowActivationPrompt(false);
                window.location.href = '/my-neura';
              }}
              className="flex-1"
            >
              Go to Neura
            </Button>
            <Button
              onClick={() => setShowActivationPrompt(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Dot */}
      <div
        ref={dotRef}
        className={cn(
          "fixed w-12 h-12 rounded-full cursor-pointer transition-all duration-300 z-[999999]",
          isDragging ? "scale-110 shadow-2xl" : "shadow-lg hover:scale-105",
          "bg-gradient-to-br from-amber-400 to-orange-500"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleDotClick}
      >
        {/* Multiple pulsing rings for visibility */}
        <div className="absolute inset-0 rounded-full bg-amber-400 opacity-50 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute inset-0 rounded-full bg-yellow-400 opacity-20 animate-ping" style={{ animationDelay: '1s' }} />
        
        {/* Main dot with brain icon only for DotSpark activated users */}
        <div className="relative w-full h-full rounded-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            {user && isDotSparkActivated ? (
              <div className="relative">
                <Brain className="w-4 h-4 text-white" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              </div>
            ) : (
              <div className="w-3 h-3 rounded-full bg-white" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Interface */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[999998]">
          <Card className="w-96 mx-4 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img 
                    src="/dotspark-logo-icon.jpeg" 
                    alt="DotSpark" 
                    className="w-8 h-8 rounded-full"
                  />
                  <h3 className="text-lg font-bold text-amber-800">DotSpark</h3>
                </div>
                <Button
                  onClick={() => {
                    setIsExpanded(false);
                    setCaptureMode(null);
                    setTextInput('');
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {!captureMode ? (
                <div className="space-y-4">
                  <p className="text-center text-gray-600 mb-4">
                    How would you like to capture your thoughts?
                  </p>
                  
                  {/* Mode Toggle */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={() => setAiMode('natural')}
                      variant={aiMode === 'natural' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      Natural Mode
                    </Button>
                    <Button
                      onClick={() => setAiMode('ai')}
                      variant={aiMode === 'ai' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                    >
                      AI Mode
                    </Button>
                  </div>

                  {/* Capture Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleModeSelection('voice')}
                      className="h-20 flex flex-col gap-2 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Mic className="w-6 h-6" />
                      <span>Voice</span>
                    </Button>
                    <Button
                      onClick={() => handleModeSelection('text')}
                      className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      <Type className="w-6 h-6" />
                      <span>Text</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Back button */}
                  <Button
                    onClick={() => setCaptureMode(null)}
                    variant="ghost"
                    size="sm"
                    className="mb-2"
                  >
                    ← Back
                  </Button>

                  {captureMode === 'voice' ? (
                    <div className="text-center space-y-4">
                      <div className="text-lg font-medium">Voice Input</div>
                      <div className="flex justify-center">
                        <Button
                          onClick={isRecording ? handleStopRecording : handleStartRecording}
                          className={cn(
                            "w-20 h-20 rounded-full",
                            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"
                          )}
                        >
                          {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                        </Button>
                      </div>
                      {isRecording && (
                        <div className="text-sm text-gray-600">Listening...</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-lg font-medium">Text Input</div>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter your thoughts here"
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                        rows={4}
                      />
                    </div>
                  )}

                  {textInput && (
                    <Button
                      onClick={handleSaveContent}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Save a Dot
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auth and Activation Prompts */}
      {showAuthPrompt && <AuthPrompt />}
      {showActivationPrompt && <ActivationPrompt />}
    </>
  );
}