import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Type, X, Send, Minimize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Position {
  x: number;
  y: number;
}

interface GlobalFloatingDotProps {
  isActive: boolean;
}

export function GlobalFloatingDot({ isActive }: GlobalFloatingDotProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'text' | 'voice' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [position, setPosition] = useState<Position>(() => {
    // Load position from localStorage or use default near activation area
    const saved = localStorage.getItem('floating-dot-position');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Position near activation section by default
    const defaultX = Math.min(window.innerWidth - 80, 300); // Left side near content
    const defaultY = 200; // Near where activation sections typically appear
    return { x: defaultX, y: defaultY };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  const dotRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Save position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('floating-dot-position', JSON.stringify(position));
  }, [position]);

  // Position dot near activation section when first activated
  useEffect(() => {
    if (isActive) {
      const isFirstActivation = !localStorage.getItem('dotspark-dot-positioned');
      if (isFirstActivation) {
        // Position near activation area for first-time visibility
        const newPosition = {
          x: Math.min(window.innerWidth - 100, 320),
          y: 180
        };
        setPosition(newPosition);
        localStorage.setItem('dotspark-dot-positioned', 'true');
      }
    }
  }, [isActive]);

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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Handle window resize to keep dot within bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse/Touch event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    
    setIsDragging(true);
    const rect = dotRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    
    setIsDragging(true);
    const touch = e.touches[0];
    const rect = dotRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragStart.y));
      
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(window.innerWidth - 60, touch.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, touch.clientY - dragStart.y));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleVoiceToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    if (!textInput.trim()) {
      toast({
        title: "No content to capture",
        description: "Please add some text or use voice recording",
        variant: "destructive"
      });
      return;
    }

    try {
      // Here you would call your API to save the entry
      // For now, just show success toast
      toast({
        title: "Thought captured!",
        description: "Your insight has been saved to DotSpark",
      });

      // Clear and reset
      setTextInput('');
      setCaptureMode(null);
      setIsExpanded(false);
      if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your thought. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDotClick = () => {
    if (isDragging) return;
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setCaptureMode(null);
    setTextInput('');
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  };

  const handleModeSelect = (mode: 'text' | 'voice') => {
    setCaptureMode(mode);
    if (mode === 'voice') {
      handleVoiceToggle();
    }
  };

  if (!isActive) return null;

  return (
    <div
      ref={dotRef}
      className={cn(
        "fixed z-[9999] transition-all duration-300 ease-in-out",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        isExpanded ? "cursor-auto" : ""
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: isExpanded ? 'none' : 'translate(0, 0)'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {!isExpanded ? (
        /* Collapsed Dot */
        <div
          onClick={handleDotClick}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg cursor-pointer transition-all duration-200",
            "bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-500 hover:border-amber-600",
            "flex items-center justify-center hover:scale-110",
            "shadow-amber-500/20 hover:shadow-amber-600/30",
            isDragging ? "scale-95" : "",
            // Add a subtle pulse animation for newly activated dots
            !localStorage.getItem('dotspark-dot-interacted') ? "animate-pulse" : ""
          )}
          role="button"
          tabIndex={0}
          aria-label="Open DotSpark thought capture"
          onMouseEnter={() => {
            // Remove pulse animation after first interaction
            localStorage.setItem('dotspark-dot-interacted', 'true');
          }}
        >
          <img 
            src="/dotspark-logo-icon.jpeg" 
            alt="DotSpark" 
            className="w-10 h-10 rounded-full object-cover"
            draggable={false}
            onError={(e) => {
              // Fallback to another logo if this one fails
              const target = e.target as HTMLImageElement;
              target.src = "/dotspark-brown-bg-icon.jpeg";
            }}
          />
        </div>
      ) : (
        /* Expanded Interface */
        <Card className="w-80 bg-white/95 backdrop-blur shadow-xl border-amber-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src="/dotspark-pwa-final.png" 
                  alt="DotSpark" 
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium text-gray-800">Capture Thought</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!captureMode ? (
              /* Mode Selection */
              <div className="space-y-2">
                <p className="text-sm text-gray-600">How would you like to capture?</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleModeSelect('voice')}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    size="sm"
                  >
                    <Mic className="w-4 h-4 mr-1" />
                    Voice
                  </Button>
                  <Button
                    onClick={() => handleModeSelect('text')}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <Type className="w-4 h-4 mr-1" />
                    Text
                  </Button>
                </div>
              </div>
            ) : (
              /* Capture Interface */
              <div className="space-y-3">
                {captureMode === 'voice' && (
                  <div className="text-center">
                    <Button
                      onClick={handleVoiceToggle}
                      className={cn(
                        "w-12 h-12 rounded-full transition-all duration-300",
                        isRecording 
                          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                          : "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      )}
                    >
                      {isRecording ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRecording ? 'Listening...' : 'Tap to record'}
                    </p>
                  </div>
                )}

                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={captureMode === 'voice' 
                    ? "Your speech will appear here..." 
                    : "Type your thoughts..."
                  }
                  className="min-h-[80px] text-sm resize-none"
                  readOnly={captureMode === 'voice' && isRecording}
                />

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1 h-8"
                    disabled={!textInput.trim()}
                    size="sm"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button 
                    onClick={() => setCaptureMode(null)}
                    variant="outline"
                    className="h-8 px-3"
                    size="sm"
                  >
                    <Minimize2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}