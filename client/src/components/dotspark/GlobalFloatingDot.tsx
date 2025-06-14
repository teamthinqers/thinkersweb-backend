import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Type, X, ArrowLeft, Minimize2 } from "lucide-react";
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
  const [position, setPosition] = useState<Position>({ x: 320, y: 180 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'voice' | 'text' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isFirstActivation, setIsFirstActivation] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    e.preventDefault();
    setIsDragging(true);
    
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 40, e.clientX - startX));
      const newY = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - startY));
      setPosition({ x: newX, y: newY });
      localStorage.setItem('global-floating-dot-position', JSON.stringify({ x: newX, y: newY }));
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
    setIsDragging(true);
    
    const touch = e.touches[0];
    const startX = touch.clientX - position.x;
    const startY = touch.clientY - position.y;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(window.innerWidth - 40, touch.clientX - startX));
      const newY = Math.max(0, Math.min(window.innerHeight - 40, touch.clientY - startY));
      setPosition({ x: newX, y: newY });
      localStorage.setItem('global-floating-dot-position', JSON.stringify({ x: newX, y: newY }));
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleClick = () => {
    if (!isDragging && !isExpanded) {
      setIsExpanded(true);
      setIsFirstActivation(false);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setCaptureMode(null);
    setTextInput("");
    setIsRecording(false);
  };

  const handleModeSelect = (mode: 'voice' | 'text') => {
    setCaptureMode(mode);
    if (mode === 'voice') {
      startRecording();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Voice recording logic would go here
    setTimeout(() => {
      setIsRecording(false);
      // Simulate voice capture completion
    }, 3000);
  };

  const handleSubmit = async () => {
    try {
      if (captureMode === 'text' && textInput.trim()) {
        toast({
          title: "Dot Saved",
          description: "Your thought has been captured successfully!",
        });
        setTextInput("");
      } else if (captureMode === 'voice') {
        toast({
          title: "Voice Dot Saved",
          description: "Your voice recording has been captured successfully!",
        });
      }
      
      handleClose();
    } catch (error) {
      console.error('Failed to submit dot capture:', error);
      toast({
        title: "Error",
        description: "Failed to save your dot. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const savedPosition = localStorage.getItem('global-floating-dot-position');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (error) {
        console.error('Failed to parse saved position:', error);
      }
    } else {
      // Check if this is first activation
      const hasSeenDot = localStorage.getItem('has-seen-floating-dot');
      if (!hasSeenDot) {
        setIsFirstActivation(true);
        localStorage.setItem('has-seen-floating-dot', 'true');
      }
    }

    // Listen for custom event from "Save a Dot" button
    const handleTriggerDot = () => {
      if (!isDragging && !isExpanded) {
        setIsExpanded(true);
        setIsFirstActivation(false);
      }
    };

    window.addEventListener('triggerFloatingDot', handleTriggerDot);

    return () => {
      window.removeEventListener('triggerFloatingDot', handleTriggerDot);
    };
  }, [isDragging, isExpanded]);

  // Check if we're in PWA mode
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
               (window.navigator as any).standalone === true;

  if (!isActive) return null;

  return (
    <div>
      {!isExpanded ? (
        /* Collapsed Floating Dot */
        <div
          ref={dotRef}
          className={cn(
            "fixed z-[9999] transition-all duration-300 ease-in-out",
            isDragging ? "cursor-grabbing" : "cursor-grab",
            isFirstActivation ? "animate-pulse" : ""
          )}
          style={{
            left: position.x,
            top: position.y
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleClick}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
        </div>
      ) : (
        /* Expanded Interface - Centered on Screen */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <Card className="w-96 bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {!captureMode ? (
                /* Mode Selection - PWA Style */
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 rounded-full bg-white"></div>
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
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                /* Capture Interface */
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode(null)}
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {captureMode === 'voice' ? 'Voice Capture' : 'Text Capture'}
                    </h3>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {captureMode === 'voice' ? (
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                          isRecording 
                            ? "bg-red-500 animate-pulse" 
                            : "bg-gradient-to-br from-amber-500 to-orange-600"
                        )}>
                          {isRecording ? (
                            <MicOff className="w-8 h-8 text-white" />
                          ) : (
                            <Mic className="w-8 h-8 text-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {isRecording ? "Recording..." : "Tap to start recording"}
                      </p>
                      {!isRecording && (
                        <Button 
                          onClick={startRecording}
                          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                        >
                          Start Recording
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Enter your thoughts here"
                        className="min-h-32 text-base resize-none border-2 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
                      />
                      <Button 
                        onClick={handleSubmit}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                        disabled={!textInput.trim()}
                      >
                        Save a Dot
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}