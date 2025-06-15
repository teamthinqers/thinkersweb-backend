import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Type, X, ArrowLeft, Minimize2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { isRunningAsStandalone } from "@/lib/pwaUtils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Position {
  x: number;
  y: number;
}

interface GlobalFloatingDotProps {
  isActive: boolean;
}

export function GlobalFloatingDot({ isActive }: GlobalFloatingDotProps) {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('floatingDotPosition');
    return saved ? JSON.parse(saved) : { x: 320, y: 180 };
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'voice' | 'text' | null>(null);
  const [userCaptureMode, setUserCaptureMode] = useState<'voice' | 'text' | 'hybrid'>('hybrid');
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [textInput, setTextInput] = useState("");
  const [structuredInput, setStructuredInput] = useState({
    summary: '',
    anchor: '',
    pulse: ''
  });
  const [voiceSteps, setVoiceSteps] = useState({
    summary: '',
    anchor: '',
    pulse: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isFirstActivation, setIsFirstActivation] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load user's capture mode preference
  useEffect(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setUserCaptureMode(settings.captureMode ?? 'hybrid');
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    e.preventDefault();
    setIsDragging(true);
    
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(0, Math.min(window.innerWidth - 48, e.clientX - startX));
      const newY = Math.max(0, Math.min(window.innerHeight - 48, e.clientY - startY));
      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);
      // Save position immediately during drag
      localStorage.setItem('global-floating-dot-position', JSON.stringify(newPosition));
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
      const newX = Math.max(0, Math.min(window.innerWidth - 48, touch.clientX - startX));
      const newY = Math.max(0, Math.min(window.innerHeight - 48, touch.clientY - startY));
      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);
      // Save position immediately during drag
      localStorage.setItem('global-floating-dot-position', JSON.stringify(newPosition));
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
      
      // Auto-select mode based on user preference
      if (userCaptureMode === 'voice') {
        setCaptureMode('voice');
        startRecording();
      } else if (userCaptureMode === 'text') {
        setCaptureMode('text');
      }
      // For hybrid mode, show selection screen (captureMode remains null)
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (captureMode === 'text') {
      return structuredInput.summary.trim() || structuredInput.anchor.trim() || structuredInput.pulse.trim();
    } else if (captureMode === 'voice') {
      return voiceSteps.summary.trim() || voiceSteps.anchor.trim() || voiceSteps.pulse.trim();
    }
    return false;
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowExitWarning(true);
    } else {
      confirmClose();
    }
  };

  const confirmClose = () => {
    setIsExpanded(false);
    setCaptureMode(null);
    setTextInput("");
    setStructuredInput({ summary: '', anchor: '', pulse: '' });
    setVoiceSteps({ summary: '', anchor: '', pulse: '' });
    setCurrentStep(1);
    setIsRecording(false);
    setShowExitWarning(false);
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
      let dotData;
      
      if (captureMode === 'text') {
        // Use structured input for text mode
        dotData = {
          summary: structuredInput.summary.substring(0, 220),
          anchor: structuredInput.anchor.substring(0, 300),
          pulse: structuredInput.pulse.split(' ')[0] || 'captured',
          sourceType: 'text'
        };
      } else {
        // Use voice steps for voice mode
        dotData = {
          summary: voiceSteps.summary.substring(0, 220),
          anchor: voiceSteps.anchor.substring(0, 300),
          pulse: voiceSteps.pulse.split(' ')[0] || 'captured',
          sourceType: 'voice'
        };
      }
      
      // Submit to real API endpoint
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dotData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create dot');
      }
      
      toast({
        title: "Dot Saved",
        description: "Your thought has been captured as a three-layer dot!",
      });
      
      // Reset all states
      setTextInput("");
      setStructuredInput({ summary: '', anchor: '', pulse: '' });
      setVoiceSteps({ summary: '', anchor: '', pulse: '' });
      setCurrentStep(1);
      handleClose();
    } catch (error) {
      console.error('Failed to submit dot capture:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save your dot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceStep = (step: 1 | 2 | 3) => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      
      // Simulate voice processing
      setTimeout(() => {
        const mockTranscript = step === 1 ? "voice input" :
                             step === 2 ? "voice input" :
                             "excited";
        
        setVoiceSteps(prev => ({
          ...prev,
          [step === 1 ? 'summary' : step === 2 ? 'anchor' : 'pulse']: mockTranscript
        }));
        
        if (step < 3) {
          setCurrentStep((step + 1) as 1 | 2 | 3);
        }
      }, 2000);
    } else {
      // Start recording
      setIsRecording(true);
      setCurrentStep(step);
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
        
        // Auto-select mode based on user preference
        if (userCaptureMode === 'voice') {
          setCaptureMode('voice');
          startRecording();
        } else if (userCaptureMode === 'text') {
          setCaptureMode('text');
        }
        // For hybrid mode, show selection screen
      }
    };

    // Listen for settings changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dotspark-settings' && e.newValue) {
        const settings = JSON.parse(e.newValue);
        setUserCaptureMode(settings.captureMode ?? 'hybrid');
      }
    };

    window.addEventListener('triggerFloatingDot', handleTriggerDot);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('triggerFloatingDot', handleTriggerDot);
      window.removeEventListener('storage', handleStorageChange);
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
            "fixed z-[9999] transition-all duration-150 ease-out",
            isDragging ? "cursor-grabbing scale-110" : "cursor-grab hover:scale-105"
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
            {/* Multiple pulsing rings for enhanced visibility */}
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-500/40 animate-ping"></div>
            <div className="absolute inset-1 w-10 h-10 rounded-full bg-orange-500/50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-2 w-8 h-8 rounded-full bg-yellow-500/60 animate-ping" style={{ animationDelay: '1s' }}></div>
            
            {/* Main dot with intense blinking */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              
              {/* Attention-grabbing blinking indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.7s' }}></div>
            </div>
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

                  {/* Mode Selection Buttons - Conditional based on user preference */}
                  <div className="space-y-4">
                    {(userCaptureMode === 'hybrid' || userCaptureMode === 'voice') && (
                      <Button
                        onClick={() => handleModeSelect('voice')}
                        className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg text-lg font-semibold transition-all duration-200"
                      >
                        <Mic className="w-6 h-6 mr-3" />
                        Voice
                      </Button>
                    )}
                    {(userCaptureMode === 'hybrid' || userCaptureMode === 'text') && (
                      <Button
                        onClick={() => handleModeSelect('text')}
                        className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg text-lg font-semibold transition-all duration-200"
                      >
                        <Type className="w-6 h-6 mr-3" />
                        Text
                      </Button>
                    )}
                  </div>

                  {/* Close/Back buttons */}
                  <div className="pt-4 border-t">
                    {isRunningAsStandalone() ? (
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          onClick={() => window.location.href = '/dot'}
                          className="w-full text-gray-500 hover:text-gray-700"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Dot Interface
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleClose}
                          className="w-full text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Close
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={handleClose}
                        className="w-full text-gray-500 hover:text-gray-700"
                      >
                        <Minimize2 className="w-4 h-4 mr-2" />
                        Close
                      </Button>
                    )}
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
                      onClick={isRunningAsStandalone() ? () => window.location.href = '/dot' : handleClose}
                      className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                    >
                      {isRunningAsStandalone() ? <ArrowLeft className="w-4 h-4" /> : <X className="w-4 h-4" />}
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
      
      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Your Dot is unsaved
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit? Your progress will be lost if you haven't saved your dot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Continue editing
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClose}
              className="bg-red-500 hover:bg-red-600"
            >
              Exit without saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}