import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Type, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Position {
  x: number;
  y: number;
}

interface PWAFloatingDotProps {
  isActive: boolean;
}

export function PWAFloatingDot({ isActive }: PWAFloatingDotProps) {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('pwa-floating-dot-position');
    return saved ? JSON.parse(saved) : { x: 320, y: 180 };
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'voice' | 'text' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleClick = () => {
    if (!isDragging && !isExpanded) {
      setIsExpanded(true);
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

  // Save position whenever it changes, but avoid saving on initial load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('pwa-floating-dot-position', JSON.stringify(position));
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [position]);

  if (!isActive) return null;

  return (
    <div>
      {!isExpanded ? (
        /* Collapsed Floating Dot */
        <div
          ref={dotRef}
          className={cn(
            "fixed z-[9999] select-none touch-none",
            isDragging 
              ? "cursor-grabbing scale-110 shadow-2xl" 
              : "cursor-grab hover:scale-105 transition-all duration-150 ease-out"
          )}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transition: isDragging ? 'none' : 'all 0.15s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleClick}
        >
          <div className="relative">
            {/* Multiple pulsing rings for enhanced visibility - only when not dragging */}
            {!isDragging && (
              <>
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-500/40 animate-ping"></div>
                <div className="absolute inset-1 w-10 h-10 rounded-full bg-orange-500/50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute inset-2 w-8 h-8 rounded-full bg-yellow-500/60 animate-ping" style={{ animationDelay: '1s' }}></div>
              </>
            )}
            
            {/* Main dot with enhanced dragging feedback */}
            <div className={cn(
              "relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center transition-all duration-300",
              isDragging 
                ? "shadow-2xl ring-4 ring-amber-300/50 scale-110" 
                : "shadow-lg hover:shadow-xl hover:scale-110 animate-pulse"
            )}>
              <img 
                src="/dotspark-logo-transparent.png?v=1" 
                alt="DotSpark" 
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isDragging ? "scale-125" : "animate-pulse"
                )} 
                style={{ animationDelay: isDragging ? '0s' : '0.3s' }} 
              />
              
              {/* Attention-grabbing blinking indicator - hidden when dragging */}
              {!isDragging && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.7s' }}></div>
                </>
              )}
              
              {/* Dragging state indicator */}
              {isDragging && (
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-dashed border-amber-300 animate-spin"></div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Expanded Interface - Centered on Screen */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <Card className="w-80 bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {!captureMode ? (
                /* Mode Selection */
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
                        <img 
                          src="/dotspark-logo-transparent.png?v=1" 
                          alt="DotSpark" 
                          className="w-8 h-8"
                        />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                      Save a Dot
                    </h2>
                    <p className="text-sm text-gray-600">How would you like to capture your Dot?</p>
                  </div>

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
                  
                  {/* Close Button */}
                  <Button
                    onClick={() => setIsExpanded(false)}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Close
                  </Button>
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