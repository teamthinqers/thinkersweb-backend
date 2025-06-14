import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Type, X, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FloatingDotProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

interface Position {
  x: number;
  y: number;
}

export function FloatingDot({ enabled, onToggle, className }: FloatingDotProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'text' | 'voice' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [position, setPosition] = useState<Position>({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  const dotRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

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
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);

  // Load saved position and handle PWA/home screen positioning
  useEffect(() => {
    const savedPosition = localStorage.getItem('dotspark-dot-position');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    } else {
      // Default position for PWA - bottom right with some margin
      const defaultX = Math.max(0, window.innerWidth - 80);
      const defaultY = Math.max(0, window.innerHeight - 120);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, []);

  // Save position when it changes
  useEffect(() => {
    localStorage.setItem('dotspark-dot-position', JSON.stringify(position));
  }, [position]);

  // Handle window resize to keep dot in viewport
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY))
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return; // Don't drag when expanded
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return; // Don't drag when expanded
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    setPosition({
      x: Math.max(0, Math.min(newPosition.x, maxX)),
      y: Math.max(0, Math.min(newPosition.y, maxY))
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const newPosition = {
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    };
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    setPosition({
      x: Math.max(0, Math.min(newPosition.x, maxX)),
      y: Math.max(0, Math.min(newPosition.y, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart]);

  const handleDotClick = () => {
    if (isDragging) return;
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setCaptureMode(null);
    setTextInput('');
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice not supported",
        description: "Speech recognition is not available in your browser",
        variant: "destructive"
      });
      return;
    }

    setCaptureMode('voice');
    setIsRecording(true);
    setTextInput('');
    recognitionRef.current.start();
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = async () => {
    if (!textInput.trim()) return;

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textInput.trim(),
          source: 'floating_dot',
          captureMode: captureMode || 'text'
        })
      });

      if (response.ok) {
        toast({
          title: "Thought captured",
          description: "Your insight has been saved to DotSpark",
        });
        handleClose();
      } else {
        throw new Error('Failed to save thought');
      }
    } catch (error) {
      toast({
        title: "Error saving thought",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  if (!enabled) return null;

  return (
    <>
      {/* Floating Dot - PWA Optimized */}
      <div
        ref={dotRef}
        className={cn(
          "fixed z-[9999] transition-all duration-300 cursor-pointer select-none",
          "will-change-transform touch-none",
          "user-select-none -webkit-user-select-none", // Prevent text selection on mobile
          isDragging ? "cursor-grabbing" : "cursor-grab",
          isExpanded ? "pointer-events-none" : "pointer-events-auto",
          className
        )}
        style={{
          left: position.x,
          top: position.y,
          transform: isExpanded ? 'scale(0)' : 'scale(1)',
          WebkitTransform: isExpanded ? 'scale(0)' : 'scale(1)',
          position: 'fixed',
          zIndex: 9999,
          // PWA-specific optimizations
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleDotClick}
        role="button"
        aria-label="DotSpark floating capture button - Drag to reposition"
        tabIndex={0}
      >
        <div className={cn(
          "w-14 h-14 transition-all duration-300",
          "flex items-center justify-center",
          "hover:scale-110 active:scale-95",
          "drop-shadow-lg hover:drop-shadow-xl"
        )}>
          <img 
            src="/dotspark-pwa-final.png" 
            alt="DotSpark" 
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            draggable={false}
          />
        </div>
      </div>

      {/* Expanded Capture Interface */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  Capture Thought
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!captureMode && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    How would you like to capture your thought?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setCaptureMode('text')}
                      className="flex flex-col h-16 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <Type className="h-5 w-5 mb-1" />
                      <span className="text-xs">Text</span>
                    </Button>
                    <Button
                      onClick={startVoiceRecording}
                      className="flex flex-col h-16 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    >
                      <Mic className="h-5 w-5 mb-1" />
                      <span className="text-xs">Voice</span>
                    </Button>
                  </div>
                </div>
              )}

              {captureMode === 'text' && (
                <div className="space-y-4">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCaptureMode(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!textInput.trim()}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              )}

              {captureMode === 'voice' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                      isRecording 
                        ? "bg-red-500 animate-pulse" 
                        : "bg-purple-500"
                    )}>
                      {isRecording ? (
                        <MicOff className="h-8 w-8 text-white" />
                      ) : (
                        <Mic className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isRecording ? "Listening..." : "Tap to start recording"}
                    </p>
                  </div>

                  {textInput && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm">{textInput}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCaptureMode(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    {isRecording ? (
                      <Button
                        onClick={stopVoiceRecording}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                      >
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!textInput.trim()}
                        className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}