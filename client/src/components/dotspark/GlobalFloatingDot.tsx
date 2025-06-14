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
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border">
            <img 
              src="/attached_assets/dot_spark_logo-03_1749842817686.jpg" 
              alt="DotSpark" 
              className="w-full h-full object-cover"
              draggable={false}
              onError={(e) => {
                // Fallback to public directory logo
                const target = e.target as HTMLImageElement;
                target.src = "/dotspark-brown-bg-icon.jpeg";
                target.onerror = () => {
                  // Final fallback
                  target.src = "/dotspark-logo-icon.jpeg";
                };
              }}
            />
          </div>
        </div>
      ) : (
        /* Expanded Interface - PWA Style */
        <Card className="w-96 bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {!captureMode ? (
              /* Mode Selection - PWA Style */
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center overflow-hidden shadow-sm">
                      <img 
                        src="/attached_assets/dot_spark_logo-03_1749842817686.jpg" 
                        alt="DotSpark" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/dotspark-brown-bg-icon.jpeg";
                          target.onerror = () => {
                            target.src = "/dotspark-logo-icon.jpeg";
                          };
                        }}
                      />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                    Save a Dot
                  </h2>
                  <p className="text-sm text-gray-600">How would you like to capture your Dot?</p>
                </div>

                {/* Mode Selection Buttons */}
                <div className="space-y-4">
                  <Button
                    onClick={() => handleModeSelect('voice')}
                    className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg text-lg font-semibold transition-all duration-200"
                  >
                    <Mic className="w-6 h-6 mr-3" />
                    Voice
                  </Button>
                  <Button
                    onClick={() => handleModeSelect('text')}
                    className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg text-lg font-semibold transition-all duration-200"
                  >
                    <Type className="w-6 h-6 mr-3" />
                    Text
                  </Button>
                </div>

                {/* Close button */}
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="w-full text-gray-500 hover:text-gray-700"
                  >
                    <Minimize2 className="w-4 h-4 mr-2" />
                    Minimize
                  </Button>
                </div>
              </div>
            ) : (
              /* Capture Interface - PWA Style */
              <div className="p-6 space-y-6">
                {/* Header with back button */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setCaptureMode(null)}
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {captureMode === 'voice' ? 'Voice Capture' : 'Text Capture'}
                  </h3>
                  <div className="w-8"></div>
                </div>

                {/* Voice Recording Interface */}
                {captureMode === 'voice' && (
                  <div className="text-center space-y-4">
                    <Button
                      onClick={handleVoiceToggle}
                      className={cn(
                        "w-20 h-20 rounded-full transition-all duration-300 shadow-lg",
                        isRecording 
                          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                          : "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      )}
                    >
                      {isRecording ? (
                        <MicOff className="w-8 h-8" />
                      ) : (
                        <Mic className="w-8 h-8" />
                      )}
                    </Button>
                    <p className="text-sm text-gray-600">
                      {isRecording ? 'Listening... Tap to stop' : 'Tap to start recording'}
                    </p>
                  </div>
                )}

                {/* Text Input */}
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={captureMode === 'voice' 
                    ? "Your speech will appear here..." 
                    : "Type your thoughts and insights..."
                  }
                  className="min-h-[120px] text-base resize-none rounded-xl border-2 border-gray-200 focus:border-amber-400 p-4"
                  readOnly={captureMode === 'voice' && isRecording}
                />

                {/* Save Button */}
                <Button 
                  onClick={handleSubmit}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                  disabled={!textInput.trim()}
                >
                  Save Dot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}