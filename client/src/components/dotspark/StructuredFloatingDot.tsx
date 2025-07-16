import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mic, Type, X, ArrowLeft, Minimize2, AlertTriangle, BrainCircuit } from "lucide-react";
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
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('structured-floating-dot-position');
    return saved ? JSON.parse(saved) : { x: 320, y: 180 };
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'select' | 'create-type' | 'text' | 'voice' | 'wheel-text' | 'wheel-voice' | 'direct-chat' | 'whatsapp'>('select');
  const [userCaptureMode, setUserCaptureMode] = useState<'natural' | 'ai'>('natural');
  const [createType, setCreateType] = useState<'dot' | 'wheel' | null>(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [voiceSteps, setVoiceSteps] = useState({
    heading: '',
    summary: '',
    anchor: '',
    pulse: ''
  });
  
  // Voice recording states for wheels
  const [wheelVoiceSteps, setWheelVoiceSteps] = useState({
    heading: '',
    purpose: '',
    timeline: ''
  });
  const [audioRecordings, setAudioRecordings] = useState<{
    heading?: string;
    summary?: string;
    anchor?: string;
    pulse?: string;
  }>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Text input states for dots
  const [structuredInput, setStructuredInput] = useState({
    heading: '',
    summary: '',
    anchor: '',
    pulse: ''
  });
  
  // Text input states for wheels
  const [wheelInput, setWheelInput] = useState({
    heading: '',
    purpose: '',
    timeline: ''
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isFirstActivation, setIsFirstActivation] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load user's capture mode preference and listen for real-time changes
  useEffect(() => {
    const loadCaptureMode = () => {
      const directMode = localStorage.getItem('dotCaptureMode');
      if (directMode) {
        setUserCaptureMode(directMode as 'natural' | 'ai');
        return;
      }
      
      const savedSettings = localStorage.getItem('dotspark-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setUserCaptureMode(settings.captureMode ?? 'natural');
      }
    };

    // Initial load
    loadCaptureMode();

    // Listen for storage changes to sync across components and tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dotCaptureMode' || e.key === 'dotspark-settings') {
        loadCaptureMode();
      }
    };

    // Listen for custom storage events (same-page updates)
    const handleCustomStorageChange = (e: Event) => {
      const storageEvent = e as StorageEvent;
      if (storageEvent.key === 'dotCaptureMode') {
        setUserCaptureMode(storageEvent.newValue as 'natural' | 'ai');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorageChange);
    };
  }, []);

  // Save position immediately when it changes
  useEffect(() => {
    localStorage.setItem('structured-floating-dot-position', JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = dotRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    let hasMoved = false;
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      hasMoved = true;
      
      // Calculate new position with viewport boundaries
      const newX = Math.max(0, Math.min(window.innerWidth - rect.width, e.clientX - offsetX));
      const newY = Math.max(0, Math.min(window.innerHeight - rect.height, e.clientY - offsetY));
      
      const newPosition = { x: newX, y: newY };
      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Force save position immediately after drag
      if (hasMoved) {
        localStorage.setItem('structured-floating-dot-position', JSON.stringify(position));
      }
      
      // Only trigger click if not dragged
      if (!hasMoved) {
        setTimeout(() => handleClick(), 50);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const rect = dotRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    let hasMoved = false;
    setIsDragging(true);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      hasMoved = true;
      
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        
        // Calculate new position with viewport boundaries
        const newX = Math.max(0, Math.min(window.innerWidth - rect.width, touch.clientX - offsetX));
        const newY = Math.max(0, Math.min(window.innerHeight - rect.height, touch.clientY - offsetY));
        
        const newPosition = { x: newX, y: newY };
        setPosition(newPosition);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      // Force save position immediately after drag
      if (hasMoved) {
        localStorage.setItem('structured-floating-dot-position', JSON.stringify(position));
      }
      
      // Only trigger click if not dragged
      if (!hasMoved) {
        setTimeout(() => handleClick(), 50);
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleClick = () => {
    if (!isDragging && !isExpanded) {
      setIsExpanded(true);
      setIsFirstActivation(false);
      
      // Show options based on user's capture mode preference
      if (userCaptureMode === 'ai') {
        setCaptureMode('select'); // Show AI mode options (Direct Chat & WhatsApp)
      } else {
        setCaptureMode('select'); // Show Natural mode options (Voice & Text)
      }
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    // If already saved, no unsaved changes
    if (isSaved) return false;
    
    if (captureMode === 'text') {
      return structuredInput.heading.trim() || structuredInput.summary.trim() || structuredInput.anchor.trim() || structuredInput.pulse.trim();
    } else if (captureMode === 'voice') {
      return voiceSteps.heading.trim() || voiceSteps.summary.trim() || voiceSteps.anchor.trim() || voiceSteps.pulse.trim();
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
    setCaptureMode('select');
    setStructuredInput({ heading: '', summary: '', anchor: '', pulse: '' });
    setVoiceSteps({ heading: '', summary: '', anchor: '', pulse: '' });
    setCurrentStep(1);
    setIsRecording(false);
    setShowExitWarning(false);
    setIsSaved(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          processVoiceRecording(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to record voice dots.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceRecording = async (base64Audio: string) => {
    try {
      const layerKey = currentStep === 1 ? 'heading' : currentStep === 2 ? 'summary' : currentStep === 3 ? 'anchor' : 'pulse';
      
      // Store the audio recording
      setAudioRecordings(prev => ({
        ...prev,
        [layerKey]: base64Audio
      }));
      
      // Send to backend for OpenAI transcription
      const response = await fetch('/api/transcribe-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: base64Audio,
          layer: layerKey
        })
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const { transcription } = await response.json();
      
      // Update voice steps with transcribed text
      setVoiceSteps(prev => ({
        ...prev,
        [layerKey]: transcription
      }));
      
      // Move to next step if not at the end
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process voice recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVoiceStep = (step: 1 | 2 | 3 | 4) => {
    setCurrentStep(step);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = async () => {
    try {
      let dotData;
      
      if (captureMode === 'text') {
        // Validate text inputs
        if (!structuredInput.heading || !structuredInput.summary || !structuredInput.anchor || !structuredInput.pulse) {
          toast({
            title: "Please complete all fields including heading",
            variant: "destructive"
          });
          return;
        }
        
        dotData = {
          oneWordSummary: structuredInput.heading.substring(0, 30),
          summary: structuredInput.summary.substring(0, 220),
          anchor: structuredInput.anchor.substring(0, 300),
          pulse: structuredInput.pulse.split(' ')[0],
          sourceType: 'text'
        };
      } else {
        // Validate voice inputs
        if (!voiceSteps.heading || !voiceSteps.summary || !voiceSteps.anchor || !voiceSteps.pulse) {
          toast({
            title: "Please complete all fields including heading",
            variant: "destructive"
          });
          return;
        }
        
        dotData = {
          oneWordSummary: voiceSteps.heading.substring(0, 30),
          summary: voiceSteps.summary.substring(0, 220),
          anchor: voiceSteps.anchor.substring(0, 300),
          pulse: voiceSteps.pulse.split(' ')[0],
          sourceType: 'voice',
          summaryVoiceUrl: audioRecordings.summary ? `data:audio/wav;base64,${audioRecordings.summary}` : null,
          anchorVoiceUrl: audioRecordings.anchor ? `data:audio/wav;base64,${audioRecordings.anchor}` : null,
          pulseVoiceUrl: audioRecordings.pulse ? `data:audio/wav;base64,${audioRecordings.pulse}` : null
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
        description: "Your dot has been captured.",
      });
      
      setIsSaved(true);
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
    // Only set first activation flag, don't override position as it's already loaded in useState
    const hasSeenDot = localStorage.getItem('has-seen-floating-dot');
    if (!hasSeenDot) {
      setIsFirstActivation(true);
      localStorage.setItem('has-seen-floating-dot', 'true');
    }

    // Listen for custom event from "Save a Dot" button
    const handleTriggerDot = () => {
      if (!isDragging && !isExpanded) {
        setIsExpanded(true);
        setIsFirstActivation(false);
        
        // For natural mode, show voice/text selection
        // For AI mode, show direct chat/whatsapp selection
        setCaptureMode('select');
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
          "absolute pointer-events-auto transition-all duration-150 ease-out",
          "will-change-transform touch-none user-select-none -webkit-user-select-none",
          isExpanded ? "hidden" : "block",
          isDragging ? "cursor-grabbing scale-110 z-60" : "cursor-grab hover:scale-105"
        )}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transform: isDragging ? 'scale(1.1)' : undefined,
          transition: isDragging ? 'none' : 'all 0.15s ease-out',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        role="button"
        aria-label="DotSpark floating capture button - Drag to reposition"
        tabIndex={0}
      >
        <div className="relative">
          {/* Multiple pulsing rings for enhanced visibility - hidden when dragging */}
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
            <div className={cn(
              "w-4 h-4 rounded-full bg-white transition-all duration-300",
              isDragging ? "scale-125" : "animate-pulse"
            )} style={{ animationDelay: isDragging ? '0s' : '0.3s' }}></div>
            
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

      {/* Expanded Interface */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent className="p-0">
              {captureMode === 'select' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {userCaptureMode === 'natural' ? (
                        <button
                          onClick={() => {
                            setUserCaptureMode('ai');
                            localStorage.setItem('dotCaptureMode', 'ai');
                            // Trigger storage event for cross-component sync
                            window.dispatchEvent(new StorageEvent('storage', {
                              key: 'dotCaptureMode',
                              newValue: 'ai'
                            }));
                          }}
                          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full border border-orange-200 hover:from-orange-200 hover:to-amber-200 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105"
                        >
                          Natural Mode ↻
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUserCaptureMode('natural');
                            localStorage.setItem('dotCaptureMode', 'natural');
                            // Trigger storage event for cross-component sync
                            window.dispatchEvent(new StorageEvent('storage', {
                              key: 'dotCaptureMode',
                              newValue: 'natural'
                            }));
                          }}
                          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 rounded-full border border-purple-200 hover:from-purple-200 hover:to-violet-200 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105"
                        >
                          AI Mode ↻
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Create or Save</h3>
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
                    <p className="text-gray-600">What would you like to create?</p>
                  </div>
                  
                  {/* Creation Type Selection */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Button
                      onClick={() => {
                        setCreateType('wheel');
                        setCaptureMode('create-type');
                      }}
                      className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                      </div>
                      <span className="text-xl font-semibold">Create a Wheel</span>
                      <span className="text-xs opacity-80">Organize your thoughts</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setCreateType('dot');
                        setCaptureMode('create-type');
                      }}
                      className="h-32 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <span className="text-xl font-semibold">Save a Dot</span>
                      <span className="text-xs opacity-80">Capture your insight</span>
                    </Button>
                  </div>
                </div>
              )}

              {captureMode === 'create-type' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode('select')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      {userCaptureMode === 'natural' ? (
                        <button
                          onClick={() => {
                            setUserCaptureMode('ai');
                            localStorage.setItem('dotCaptureMode', 'ai');
                            window.dispatchEvent(new StorageEvent('storage', {
                              key: 'dotCaptureMode',
                              newValue: 'ai'
                            }));
                          }}
                          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full border border-orange-200 hover:from-orange-200 hover:to-amber-200 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105"
                        >
                          Natural Mode ↻
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUserCaptureMode('natural');
                            localStorage.setItem('dotCaptureMode', 'natural');
                            window.dispatchEvent(new StorageEvent('storage', {
                              key: 'dotCaptureMode',
                              newValue: 'natural'
                            }));
                          }}
                          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 rounded-full border border-purple-200 hover:from-purple-200 hover:to-violet-200 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105"
                        >
                          AI Mode ↻
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {createType === 'wheel' ? 'Create a Wheel' : 'Save a Dot'}
                    </h3>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      createType === 'wheel' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-600'
                    }`}>
                      {createType === 'wheel' ? (
                        <div className="w-8 h-8 rounded-full bg-indigo-500"></div>
                      ) : (
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600">
                      How would you like to {createType === 'wheel' ? 'create your Wheel' : 'capture your Dot'}?
                    </p>
                  </div>
                  
                  {userCaptureMode === 'natural' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => setCaptureMode(createType === 'wheel' ? 'wheel-voice' : 'voice')}
                        className={`h-28 ${createType === 'wheel' 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700' 
                          : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        } text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105`}
                      >
                        <Mic className="w-10 h-10" />
                        <span className="text-xl font-semibold">Voice</span>
                      </Button>
                      <Button
                        onClick={() => setCaptureMode(createType === 'wheel' ? 'wheel-text' : 'text')}
                        className={`h-28 ${createType === 'wheel' 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700' 
                          : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        } text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105`}
                      >
                        <Type className="w-10 h-10" />
                        <span className="text-xl font-semibold">Text</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => {
                          setIsExpanded(false);
                          window.location.href = '/chat';
                        }}
                        className="h-28 bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105"
                      >
                        <BrainCircuit className="w-10 h-10" />
                        <span className="text-xl font-semibold">Direct Chat</span>
                      </Button>
                      <Button
                        onClick={async () => {
                          setIsExpanded(false);
                          try {
                            const response = await fetch('/api/whatsapp/contact');
                            const data = await response.json();
                            const defaultMessage = encodeURIComponent(
                              createType === 'wheel' 
                                ? "Hi DotSpark, I would need your assistance in creating a wheel"
                                : "Hi DotSpark, I would need your assistance in saving a dot"
                            );
                            const whatsappUrl = `https://wa.me/${data.phoneNumber}?text=${defaultMessage}`;
                            window.location.href = whatsappUrl;
                          } catch (error) {
                            console.error('Failed to get WhatsApp contact:', error);
                            window.location.href = 'https://web.whatsapp.com/';
                          }
                        }}
                        className="h-28 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105"
                      >
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087z"/>
                        </svg>
                        <span className="text-xl font-semibold">WhatsApp</span>
                      </Button>
                    </div>
                  )}

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

              {captureMode === 'wheel-text' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode('create-type')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Create Wheel - Text</h3>
                      {userCaptureMode === 'natural' ? (
                        <button
                          onClick={() => {
                            setUserCaptureMode('ai');
                            localStorage.setItem('dotCaptureMode', 'ai');
                            window.dispatchEvent(new StorageEvent('storage', {
                              key: 'dotCaptureMode',
                              newValue: 'ai'
                            }));
                          }}
                          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full border border-orange-200 hover:from-orange-200 hover:to-amber-200 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105"
                        >
                          Natural Mode ↻
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setUserCaptureMode('natural');
                            localStorage.setItem('dotCaptureMode', 'natural');
                            window.dispatchEvent(new StorageEvent('storage', {
                              key: 'dotCaptureMode',
                              newValue: 'natural'
                            }));
                          }}
                          className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 rounded-full border border-purple-200 hover:from-purple-200 hover:to-violet-200 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105"
                        >
                          AI Mode ↻
                        </button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Three Layer Wheel Input */}
                  <div className="space-y-6">
                    {/* Layer 1: Heading */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border-2 border-indigo-300 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className="text-sm font-semibold text-indigo-700">Layer 1: Heading</h5>
                        {wheelInput.heading && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Input
                        value={wheelInput.heading}
                        onChange={(e) => setWheelInput(prev => ({ ...prev, heading: e.target.value }))}
                        placeholder="Enter wheel heading (e.g., Morning Clarity)"
                        className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                      />
                      <p className="text-xs text-indigo-600 mt-2">
                        Give your wheel a clear, memorable name
                      </p>
                    </div>

                    {/* Layer 2: Purpose */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 rounded-xl border-2 border-indigo-400 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className="text-sm font-semibold text-indigo-800">Layer 2: Purpose</h5>
                        {wheelInput.purpose && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Textarea
                        value={wheelInput.purpose}
                        onChange={(e) => setWheelInput(prev => ({ ...prev, purpose: e.target.value }))}
                        placeholder="Describe the purpose of this wheel..."
                        className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 min-h-[80px]"
                        maxLength={300}
                      />
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-indigo-600">Define what this wheel is meant to organize</span>
                        <span className="text-indigo-500">{wheelInput.purpose.length}/300</span>
                      </div>
                    </div>

                    {/* Layer 3: Timeline */}
                    <div className="p-4 bg-gradient-to-br from-purple-50/30 to-indigo-50/30 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h5 className="text-sm font-semibold text-purple-700">Layer 3: Timeline</h5>
                        {wheelInput.timeline && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Input
                        value={wheelInput.timeline}
                        onChange={(e) => setWheelInput(prev => ({ ...prev, timeline: e.target.value }))}
                        placeholder="Timeline (e.g., Daily, Weekly, Ongoing)"
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                      <p className="text-xs text-purple-600 mt-2">
                        When will this wheel be most relevant?
                      </p>
                    </div>

                    {wheelInput.heading && wheelInput.purpose && wheelInput.timeline && (
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Wheel Created!",
                            description: `"${wheelInput.heading}" has been successfully created.`,
                          });
                          setIsSaved(true);
                        }}
                        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                      >
                        Create Wheel
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {captureMode === 'wheel-voice' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode('create-type')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="font-medium">Create Wheel - Voice</h3>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Three Layer Voice Wheel Input */}
                  <div className="space-y-4">
                    {/* Layer 1: Heading */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl border-2 border-indigo-300 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className="text-sm font-semibold text-indigo-700">Layer 1: Heading</h5>
                        {wheelVoiceSteps.heading && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-indigo-600 mb-3">
                        "What would you like to name this wheel?"
                      </p>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Voice recording simulation",
                            description: "Voice recording started for wheel heading",
                          });
                          setTimeout(() => {
                            setWheelVoiceSteps(prev => ({ ...prev, heading: 'Morning Clarity' }));
                          }, 2000);
                        }}
                        className="w-full h-10 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Heading
                      </Button>
                      {wheelVoiceSteps.heading && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-indigo-200">
                          "{wheelVoiceSteps.heading}"
                        </div>
                      )}
                    </div>

                    {/* Layer 2: Purpose */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 rounded-xl border-2 border-indigo-400 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className="text-sm font-semibold text-indigo-800">Layer 2: Purpose</h5>
                        {wheelVoiceSteps.purpose && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-indigo-700 mb-3">
                        "Describe the purpose of this wheel. What will it organize?"
                      </p>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Voice recording simulation",
                            description: "Voice recording started for wheel purpose",
                          });
                          setTimeout(() => {
                            setWheelVoiceSteps(prev => ({ ...prev, purpose: 'A collection of morning routines and thoughts to start the day with clarity and focus' }));
                          }, 3000);
                        }}
                        className="w-full h-10 text-sm bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white"
                        disabled={!wheelVoiceSteps.heading}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Purpose
                      </Button>
                      {wheelVoiceSteps.purpose && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-indigo-200">
                          {wheelVoiceSteps.purpose.substring(0, 80)}... ({wheelVoiceSteps.purpose.length}/300 charac)
                        </div>
                      )}
                    </div>

                    {/* Layer 3: Timeline */}
                    <div className="p-4 bg-gradient-to-br from-purple-50/30 to-indigo-50/30 rounded-xl border-2 border-purple-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h5 className="text-sm font-semibold text-purple-700">Layer 3: Timeline</h5>
                        {wheelVoiceSteps.timeline && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-purple-600 mb-3">
                        "When will this wheel be most relevant? Daily, weekly, or ongoing?"
                      </p>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Voice recording simulation",
                            description: "Voice recording started for wheel timeline",
                          });
                          setTimeout(() => {
                            setWheelVoiceSteps(prev => ({ ...prev, timeline: 'Daily' }));
                          }, 1500);
                        }}
                        className="w-full h-10 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        disabled={!wheelVoiceSteps.purpose}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Timeline
                      </Button>
                      {wheelVoiceSteps.timeline && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-purple-200 text-center font-medium">
                          Timeline: "{wheelVoiceSteps.timeline}"
                        </div>
                      )}
                    </div>

                    {wheelVoiceSteps.heading && wheelVoiceSteps.purpose && wheelVoiceSteps.timeline && (
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Wheel Created!",
                            description: `"${wheelVoiceSteps.heading}" has been successfully created.`,
                          });
                          setIsSaved(true);
                        }}
                        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                      >
                        Create Voice Wheel
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Saved state UI */}
              {isSaved && (
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Saved Successfully!</h3>
                  <p className="text-gray-600 mb-4">Your {createType} has been created and saved.</p>
                  <Button 
                    onClick={handleClose}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Close
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exit Warning Dialog */}
      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you continue. Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowExitWarning(false);
                setIsExpanded(false);
                setStructuredInput({ heading: '', summary: '', anchor: '', pulse: '' });
                setWheelInput({ heading: '', purpose: '', timeline: '' });
                setWheelVoiceSteps({ heading: '', purpose: '', timeline: '' });
                setCurrentStep(1);
                setCaptureMode('select');
                setIsSaved(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Exit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
