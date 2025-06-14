import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mic, Type, X, ArrowLeft, Minimize2, AlertTriangle } from "lucide-react";
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

interface StructuredFloatingDotProps {
  isActive: boolean;
}

export function StructuredFloatingDot({ isActive }: StructuredFloatingDotProps) {
  const [position, setPosition] = useState<Position>({ x: 320, y: 180 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'select' | 'text' | 'voice'>('select');
  const [userCaptureMode, setUserCaptureMode] = useState<'voice' | 'text' | 'hybrid'>('hybrid');
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [voiceSteps, setVoiceSteps] = useState({
    summary: '',
    anchor: '',
    pulse: ''
  });
  
  // Text input states
  const [structuredInput, setStructuredInput] = useState({
    summary: '',
    anchor: '',
    pulse: ''
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isFirstActivation, setIsFirstActivation] = useState(false);
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
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem('global-floating-dot-position', JSON.stringify(position));
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
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      localStorage.setItem('global-floating-dot-position', JSON.stringify(position));
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleClick = () => {
    if (!isDragging && !isExpanded) {
      setIsExpanded(true);
      setIsFirstActivation(false);
      
      // Auto-select mode based on user preference
      if (userCaptureMode === 'voice') {
        setCaptureMode('voice');
      } else if (userCaptureMode === 'text') {
        setCaptureMode('text');
      } else {
        setCaptureMode('select'); // Show selection for hybrid mode
      }
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setCaptureMode('select');
    setStructuredInput({ summary: '', anchor: '', pulse: '' });
    setVoiceSteps({ summary: '', anchor: '', pulse: '' });
    setCurrentStep(1);
    setIsRecording(false);
  };

  const handleVoiceStep = (step: 1 | 2 | 3) => {
    if (isRecording) {
      setIsRecording(false);
      
      // Simulate voice processing
      setTimeout(() => {
        const mockTranscript = step === 1 ? "Simulated summary from voice input" :
                             step === 2 ? "Simulated anchor context from voice input" :
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
      setIsRecording(true);
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    try {
      let dotData;
      
      if (captureMode === 'text') {
        // Validate text inputs
        if (!structuredInput.summary || !structuredInput.anchor || !structuredInput.pulse) {
          toast({
            title: "Please complete all three layers",
            variant: "destructive"
          });
          return;
        }
        
        dotData = {
          summary: structuredInput.summary.substring(0, 220),
          anchor: structuredInput.anchor.substring(0, 300),
          pulse: structuredInput.pulse.split(' ')[0],
          sourceType: 'text'
        };
      } else {
        // Validate voice inputs
        if (!voiceSteps.summary || !voiceSteps.anchor || !voiceSteps.pulse) {
          toast({
            title: "Please complete all three voice recordings",
            variant: "destructive"
          });
          return;
        }
        
        dotData = {
          summary: voiceSteps.summary.substring(0, 220),
          anchor: voiceSteps.anchor.substring(0, 300),
          pulse: voiceSteps.pulse.split(' ')[0],
          sourceType: 'voice'
        };
      }
      
      // Submit to API endpoint
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
        title: "Dot Saved Successfully!",
        description: "Your three-layer dot has been captured.",
      });
      
      handleClose();
    } catch (error) {
      console.error('Failed to submit dot:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save your dot. Please try again.",
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
        
        if (userCaptureMode === 'voice') {
          setCaptureMode('voice');
        } else if (userCaptureMode === 'text') {
          setCaptureMode('text');
        }
      }
    };

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
  }, [isDragging, isExpanded, userCaptureMode]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Floating Dot */}
      <div
        ref={dotRef}
        className={cn(
          "absolute pointer-events-auto cursor-move transition-all duration-150 ease-out",
          isExpanded ? "hidden" : "block",
          isDragging ? "scale-110 z-60" : "hover:scale-105"
        )}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transform: isDragging ? 'scale(1.1)' : undefined,
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

      {/* Expanded Interface */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-0">
              {captureMode === 'select' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8"></div>
                    <h3 className="text-xl font-semibold text-gray-800">Save a Dot</h3>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <p className="text-gray-600">How would you like to capture your Dot?</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setCaptureMode('voice')}
                      className="h-28 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <Mic className="w-10 h-10" />
                      <span className="text-xl font-semibold">Voice</span>
                    </Button>
                    <Button
                      onClick={() => setCaptureMode('text')}
                      className="h-28 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <Type className="w-10 h-10" />
                      <span className="text-xl font-semibold">Text</span>
                    </Button>
                  </div>

                  {isRunningAsStandalone() && (
                    <Button
                      variant="ghost"
                      onClick={() => window.location.href = '/dot'}
                      className="w-full text-gray-500 hover:text-gray-700 mt-4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dot Interface
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="w-full text-gray-500 hover:text-gray-700 mt-2"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              )}

              {captureMode === 'text' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode('select')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="font-medium">Text Input</h3>
                    
                    {/* Gamified Progress Meter */}
                    <div className="relative w-10 h-10 group">
                      {/* Motivational tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                        {Object.values(structuredInput).filter(Boolean).length === 0 && "Start your dot journey! 🚀"}
                        {Object.values(structuredInput).filter(Boolean).length === 1 && "Great start! 2 more layers 💪"}
                        {Object.values(structuredInput).filter(Boolean).length === 2 && "Almost there! Final layer 🔥"}
                        {Object.values(structuredInput).filter(Boolean).length === 3 && "Perfect dot completed! ⭐"}
                      </div>
                      
                      {/* Outer glow ring with intensity levels */}
                      <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
                        Object.values(structuredInput).filter(Boolean).length === 3 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-xl shadow-green-400/60' 
                          : Object.values(structuredInput).filter(Boolean).length === 2
                          ? 'bg-gradient-to-r from-orange-400 to-red-500 shadow-lg shadow-orange-400/50'
                          : Object.values(structuredInput).filter(Boolean).length === 1
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-md shadow-amber-400/40'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-sm shadow-gray-300/20'
                      }`} style={{
                        filter: `blur(${
                          Object.values(structuredInput).filter(Boolean).length === 3 ? '3px' : 
                          Object.values(structuredInput).filter(Boolean).length === 2 ? '2px' : 
                          Object.values(structuredInput).filter(Boolean).length === 1 ? '1.5px' : '1px'
                        })`
                      }}></div>
                      
                      {/* Main progress ring */}
                      <svg className="w-10 h-10 transform -rotate-90 relative z-10" viewBox="0 0 40 40">
                        {/* Background circle */}
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-gray-200/50"
                        />
                        
                        {/* Progress circle with gradient */}
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="url(#progressGradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 16}`}
                          strokeDashoffset={`${2 * Math.PI * 16 * (1 - (Object.values(structuredInput).filter(Boolean).length / 3))}`}
                          className="transition-all duration-700 ease-out"
                          strokeLinecap="round"
                          style={{
                            filter: Object.values(structuredInput).filter(Boolean).length === 3 ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' : 'none'
                          }}
                        />
                        
                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={Object.values(structuredInput).filter(Boolean).length === 3 ? "#10b981" : "#f59e0b"} />
                            <stop offset="50%" stopColor={Object.values(structuredInput).filter(Boolean).length === 3 ? "#22c55e" : "#f97316"} />
                            <stop offset="100%" stopColor={Object.values(structuredInput).filter(Boolean).length === 3 ? "#34d399" : "#ea580c"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Center content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {Object.values(structuredInput).filter(Boolean).length === 3 ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-bounce shadow-lg"></div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className={`text-xs font-bold transition-all duration-300 ${
                              Object.values(structuredInput).filter(Boolean).length === 0 ? 'text-gray-400' :
                              Object.values(structuredInput).filter(Boolean).length === 1 ? 'text-amber-600' :
                              'text-orange-600'
                            }`}>
                              {Object.values(structuredInput).filter(Boolean).length}/3
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Achievement celebration when complete */}
                      {Object.values(structuredInput).filter(Boolean).length === 3 && (
                        <>
                          {/* Victory sparkles */}
                          <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping shadow-lg"></div>
                          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-green-400 rounded-full animate-ping shadow-md" style={{animationDelay: '0.3s'}}></div>
                          <div className="absolute top-0 -left-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                          <div className="absolute -top-1 left-0 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
                          <div className="absolute bottom-0 -right-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
                          
                          {/* Success burst effect */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-300 to-emerald-400 animate-ping opacity-20"></div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <label className="text-sm font-semibold text-amber-700">
                          Layer 1: Dot (max 220 chars)
                        </label>
                      </div>
                      <Textarea
                        value={structuredInput.summary}
                        onChange={(e) => setStructuredInput(prev => ({...prev, summary: e.target.value}))}
                        placeholder="Enter your thoughts here"
                        maxLength={220}
                        className="min-h-16 text-sm border-amber-300 focus:border-amber-500 focus:ring-amber-400 bg-white/80 backdrop-blur-sm"
                      />
                      <div className="text-xs text-amber-600 mt-2 flex justify-between items-center">
                        <span>Sharp thoughts spark better insights</span>
                        <span className="font-medium">{structuredInput.summary.length}/220</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl border-2 border-amber-300 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-700 to-orange-700 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <label className="text-sm font-semibold text-amber-800">
                          Layer 2: Anchor (max 300 chars)
                        </label>
                      </div>
                      <Textarea
                        value={structuredInput.anchor}
                        onChange={(e) => setStructuredInput(prev => ({...prev, anchor: e.target.value}))}
                        placeholder="Context or memory anchor"
                        maxLength={300}
                        className="min-h-20 text-sm border-amber-400 focus:border-amber-600 focus:ring-amber-500 bg-white/80 backdrop-blur-sm"
                      />
                      <div className="text-xs text-amber-700 mt-2 flex justify-between items-center">
                        <span>Context that helps you remember later</span>
                        <span className="font-medium">{structuredInput.anchor.length}/300</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-orange-50/30 to-amber-50/30 rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <label className="text-sm font-semibold text-orange-700">
                          Layer 3: Pulse (One word emotion)
                        </label>
                      </div>
                      
                      {/* Emotion Selection Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'].map((emotion) => (
                          <button
                            key={emotion}
                            onClick={() => setStructuredInput(prev => ({...prev, pulse: emotion}))}
                            className={`px-2 py-1 text-xs rounded-lg border transition-all duration-200 ${
                              structuredInput.pulse === emotion
                                ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                                : 'bg-white/80 text-orange-700 border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                            }`}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                      
                      <Input
                        value={structuredInput.pulse}
                        onChange={(e) => setStructuredInput(prev => ({...prev, pulse: e.target.value}))}
                        placeholder="Or type your own..."
                        maxLength={20}
                        className="text-center border-2 border-orange-300 focus:border-orange-500 focus:ring-orange-400 bg-white/80 backdrop-blur-sm font-medium text-sm"
                      />
                      <div className="text-xs text-orange-600 mt-2 text-center">
                        Select or type your emotional state
                      </div>
                    </div>

                    <Button 
                      onClick={handleSubmit}
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                      disabled={!structuredInput.summary || !structuredInput.anchor || !structuredInput.pulse}
                    >
                      Save a Dot
                    </Button>
                  </div>
                </div>
              )}

              {captureMode === 'voice' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode('select')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="font-medium">Voice Input</h3>
                    
                    {/* Gamified Progress Meter */}
                    <div className="relative w-10 h-10 group">
                      {/* Motivational tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                        {Object.values(voiceSteps).filter(Boolean).length === 0 && "Start recording! 🎤"}
                        {Object.values(voiceSteps).filter(Boolean).length === 1 && "Keep going! 2 more steps 🔊"}
                        {Object.values(voiceSteps).filter(Boolean).length === 2 && "Final step! Almost done 🎯"}
                        {Object.values(voiceSteps).filter(Boolean).length === 3 && "Voice dot mastered! 🏆"}
                      </div>
                      
                      {/* Outer glow ring with intensity levels */}
                      <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
                        Object.values(voiceSteps).filter(Boolean).length === 3 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-xl shadow-green-400/60' 
                          : Object.values(voiceSteps).filter(Boolean).length === 2
                          ? 'bg-gradient-to-r from-orange-400 to-red-500 shadow-lg shadow-orange-400/50'
                          : Object.values(voiceSteps).filter(Boolean).length === 1
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-md shadow-amber-400/40'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400 shadow-sm shadow-gray-300/20'
                      }`} style={{
                        filter: `blur(${
                          Object.values(voiceSteps).filter(Boolean).length === 3 ? '3px' : 
                          Object.values(voiceSteps).filter(Boolean).length === 2 ? '2px' : 
                          Object.values(voiceSteps).filter(Boolean).length === 1 ? '1.5px' : '1px'
                        })`
                      }}></div>
                      
                      {/* Main progress ring */}
                      <svg className="w-10 h-10 transform -rotate-90 relative z-10" viewBox="0 0 40 40">
                        {/* Background circle */}
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          className="text-gray-200/50"
                        />
                        
                        {/* Progress circle with gradient */}
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke="url(#voiceProgressGradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 16}`}
                          strokeDashoffset={`${2 * Math.PI * 16 * (1 - (Object.values(voiceSteps).filter(Boolean).length / 3))}`}
                          className="transition-all duration-700 ease-out"
                          strokeLinecap="round"
                          style={{
                            filter: Object.values(voiceSteps).filter(Boolean).length === 3 ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' : 'none'
                          }}
                        />
                        
                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="voiceProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={Object.values(voiceSteps).filter(Boolean).length === 3 ? "#10b981" : "#f59e0b"} />
                            <stop offset="50%" stopColor={Object.values(voiceSteps).filter(Boolean).length === 3 ? "#22c55e" : "#f97316"} />
                            <stop offset="100%" stopColor={Object.values(voiceSteps).filter(Boolean).length === 3 ? "#34d399" : "#ea580c"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Center content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {Object.values(voiceSteps).filter(Boolean).length === 3 ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-bounce shadow-lg"></div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className={`text-xs font-bold transition-all duration-300 ${
                              Object.values(voiceSteps).filter(Boolean).length === 0 ? 'text-gray-400' :
                              Object.values(voiceSteps).filter(Boolean).length === 1 ? 'text-amber-600' :
                              'text-orange-600'
                            }`}>
                              {Object.values(voiceSteps).filter(Boolean).length}/3
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Achievement celebration when complete */}
                      {Object.values(voiceSteps).filter(Boolean).length === 3 && (
                        <>
                          {/* Victory sparkles */}
                          <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping shadow-lg"></div>
                          <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-green-400 rounded-full animate-ping shadow-md" style={{animationDelay: '0.3s'}}></div>
                          <div className="absolute top-0 -left-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                          <div className="absolute -top-1 left-0 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
                          <div className="absolute bottom-0 -right-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
                          
                          {/* Success burst effect */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-300 to-emerald-400 animate-ping opacity-20"></div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className="text-sm font-semibold text-amber-700">Layer 1: Dot (20-30 sec)</h5>
                        {voiceSteps.summary && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-amber-600 mb-3">
                        "Start with your core insight. What's the main thought?"
                      </p>
                      <Button
                        variant={isRecording && currentStep === 1 ? 'destructive' : 'default'}
                        onClick={() => handleVoiceStep(1)}
                        className="w-full h-10 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording && currentStep === 1 ? 'Recording...' : 'Record Dot'}
                      </Button>
                      {voiceSteps.summary && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-amber-200">
                          {voiceSteps.summary.substring(0, 50)}... ({voiceSteps.summary.length}/220)
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl border-2 border-amber-300 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-700 to-orange-700 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className="text-sm font-semibold text-amber-800">Layer 2: Anchor (30-40 sec)</h5>
                        {voiceSteps.anchor && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-amber-700 mb-3">
                        "Now provide context. What will help you remember this?"
                      </p>
                      <Button
                        variant={isRecording && currentStep === 2 ? 'destructive' : 'default'}
                        onClick={() => handleVoiceStep(2)}
                        className="w-full h-10 text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                        disabled={!voiceSteps.summary}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording && currentStep === 2 ? 'Recording...' : 'Record Anchor'}
                      </Button>
                      {voiceSteps.anchor && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-amber-200">
                          {voiceSteps.anchor.substring(0, 50)}... ({voiceSteps.anchor.length}/300)
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gradient-to-br from-orange-50/30 to-amber-50/30 rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h5 className="text-sm font-semibold text-orange-700">Layer 3: Pulse (5 sec)</h5>
                        {voiceSteps.pulse && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-orange-600 mb-3">
                        "Finally, say one emotion word that captures how you feel."
                      </p>
                      <Button
                        variant={isRecording && currentStep === 3 ? 'destructive' : 'default'}
                        onClick={() => handleVoiceStep(3)}
                        className="w-full h-10 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        disabled={!voiceSteps.anchor}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording && currentStep === 3 ? 'Recording...' : 'Record Pulse'}
                      </Button>
                      {voiceSteps.pulse && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-orange-200 text-center font-medium">
                          Pulse: "{voiceSteps.pulse}"
                        </div>
                      )}
                    </div>

                    {voiceSteps.summary && voiceSteps.anchor && voiceSteps.pulse && (
                      <Button 
                        onClick={handleSubmit}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                      >
                        Save Voice Dot
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}