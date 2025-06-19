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
  const [captureMode, setCaptureMode] = useState<'select' | 'text' | 'voice' | 'direct-chat' | 'whatsapp'>('select');
  const [userCaptureMode, setUserCaptureMode] = useState<'natural' | 'ai'>('natural');
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [voiceSteps, setVoiceSteps] = useState({
    heading: '',
    summary: '',
    anchor: '',
    pulse: ''
  });
  const [audioRecordings, setAudioRecordings] = useState<{
    heading?: string;
    summary?: string;
    anchor?: string;
    pulse?: string;
  }>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Text input states
  const [structuredInput, setStructuredInput] = useState({
    heading: '',
    summary: '',
    anchor: '',
    pulse: ''
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
                  
                  {userCaptureMode === 'natural' ? (
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
                            const defaultMessage = encodeURIComponent("Hi DotSpark, I would need your assistance in saving a dot");
                            const whatsappUrl = `https://wa.me/${data.phoneNumber}?text=${defaultMessage}`;
                            window.location.href = whatsappUrl;
                          } catch (error) {
                            console.error('Failed to get WhatsApp contact:', error);
                            // Fallback to direct WhatsApp web
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Text Input</h3>
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
                          strokeDashoffset={`${2 * Math.PI * 16 * (1 - (Object.values(structuredInput).filter(Boolean).length / 4))}`}
                          className="transition-all duration-700 ease-out"
                          strokeLinecap="round"
                          style={{
                            filter: Object.values(structuredInput).filter(Boolean).length === 4 ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' : 'none'
                          }}
                        />
                        
                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={Object.values(structuredInput).filter(Boolean).length === 4 ? "#10b981" : "#f59e0b"} />
                            <stop offset="50%" stopColor={Object.values(structuredInput).filter(Boolean).length === 4 ? "#22c55e" : "#f97316"} />
                            <stop offset="100%" stopColor={Object.values(structuredInput).filter(Boolean).length === 4 ? "#34d399" : "#ea580c"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Center content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {Object.values(structuredInput).filter(Boolean).length === 4 ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-bounce shadow-lg"></div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className={`text-xs font-bold transition-all duration-300 ${
                              Object.values(structuredInput).filter(Boolean).length === 0 ? 'text-gray-400' :
                              Object.values(structuredInput).filter(Boolean).length === 1 ? 'text-amber-600' :
                              Object.values(structuredInput).filter(Boolean).length < 4 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {Object.values(structuredInput).filter(Boolean).length}/4
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Achievement celebration when complete */}
                      {Object.values(structuredInput).filter(Boolean).length === 4 && (
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
                    {/* Heading Input */}
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-600 to-amber-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">H</span>
                        </div>
                        <label className="text-sm font-semibold text-yellow-700">
                          Heading (max 30 chars)
                        </label>
                      </div>
                      <Input
                        value={structuredInput.heading}
                        onChange={(e) => setStructuredInput(prev => ({...prev, heading: e.target.value}))}
                        placeholder="Enter a short heading for your dot"
                        maxLength={30}
                        className="text-sm border-yellow-300 focus:border-yellow-500 focus:ring-yellow-400 bg-white/80 backdrop-blur-sm font-medium"
                      />
                      <div className="text-xs text-yellow-600 mt-2 flex justify-between items-center">
                        <span>Short keyword or phrase to identify this dot</span>
                        <span className="font-medium">{structuredInput.heading.length}/30</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <label className="text-sm font-semibold text-amber-700">
                          Layer 1: Summary (max 220 chars)
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

                    {!isSaved ? (
                      <Button 
                        onClick={handleSubmit}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                        disabled={!structuredInput.heading || !structuredInput.summary || !structuredInput.anchor || !structuredInput.pulse}
                      >
                        Save a Dot
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-lg font-semibold shadow-lg cursor-default"
                          disabled
                        >
                          ✓ Saved
                        </Button>
                        <Button 
                          onClick={confirmClose}
                          variant="outline"
                          className="w-full h-10 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-medium"
                        >
                          Close
                        </Button>
                      </div>
                    )}
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Voice Input</h3>
                      {userCaptureMode === 'natural' ? (
                        <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full border border-orange-200">
                          Natural
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 rounded-full border border-purple-200">
                          AI
                        </span>
                      )}
                    </div>
                    
                    {/* Gamified Progress Meter */}
                    <div className="relative w-10 h-10 group">
                      {/* Motivational tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                        {Object.values(voiceSteps).filter(Boolean).length === 0 && "Start recording! 🎤"}
                        {Object.values(voiceSteps).filter(Boolean).length === 1 && "Keep going! 3 more steps 🔊"}
                        {Object.values(voiceSteps).filter(Boolean).length === 2 && "Halfway there! 2 more steps 🎯"}
                        {Object.values(voiceSteps).filter(Boolean).length === 3 && "Almost done! 1 more step 🏁"}
                        {Object.values(voiceSteps).filter(Boolean).length === 4 && "Voice dot mastered! 🏆"}
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
                          strokeDashoffset={`${2 * Math.PI * 16 * (1 - (Object.values(voiceSteps).filter(Boolean).length / 4))}`}
                          className="transition-all duration-700 ease-out"
                          strokeLinecap="round"
                          style={{
                            filter: Object.values(voiceSteps).filter(Boolean).length === 4 ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' : 'none'
                          }}
                        />
                        
                        {/* Gradient definitions */}
                        <defs>
                          <linearGradient id="voiceProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={Object.values(voiceSteps).filter(Boolean).length === 4 ? "#10b981" : "#f59e0b"} />
                            <stop offset="50%" stopColor={Object.values(voiceSteps).filter(Boolean).length === 4 ? "#22c55e" : "#f97316"} />
                            <stop offset="100%" stopColor={Object.values(voiceSteps).filter(Boolean).length === 4 ? "#34d399" : "#ea580c"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Center content */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {Object.values(voiceSteps).filter(Boolean).length === 4 ? (
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
                              {Object.values(voiceSteps).filter(Boolean).length}/4
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Achievement celebration when complete */}
                      {Object.values(voiceSteps).filter(Boolean).length === 4 && (
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
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className="text-sm font-semibold text-blue-700">Layer 1: Heading (10 sec)</h5>
                        {voiceSteps.heading && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-blue-600 mb-3">
                        "Start with a short heading for your dot"
                      </p>
                      <Button
                        variant={isRecording && currentStep === 1 ? 'destructive' : 'default'}
                        onClick={() => handleVoiceStep(1)}
                        className="w-full h-10 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording && currentStep === 1 ? 'Recording...' : 'Record Heading'}
                      </Button>
                      {voiceSteps.heading && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-blue-200">
                          {voiceSteps.heading.substring(0, 30)}... ({voiceSteps.heading.length}/100 charac)
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className="text-sm font-semibold text-amber-700">Layer 2: Dot (20-30 sec)</h5>
                        {voiceSteps.summary && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-amber-600 mb-3">
                        "Now explain your core insight. What's the main thought?"
                      </p>
                      <Button
                        variant={isRecording && currentStep === 2 ? 'destructive' : 'default'}
                        onClick={() => handleVoiceStep(2)}
                        className="w-full h-10 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        disabled={!voiceSteps.heading}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording && currentStep === 2 ? 'Recording...' : 'Record Dot'}
                      </Button>
                      {voiceSteps.summary && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-amber-200">
                          {voiceSteps.summary.substring(0, 50)}... ({voiceSteps.summary.length}/220 charac)
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl border-2 border-amber-300 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-700 to-orange-700 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h5 className="text-sm font-semibold text-amber-800">Layer 3: Anchor (30-40 sec)</h5>
                        {voiceSteps.anchor && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-amber-700 mb-3">
                        "Now provide context. What will help you remember this?"
                      </p>
                      <Button
                        variant={isRecording && currentStep === 3 ? 'destructive' : 'default'}
                        onClick={() => handleVoiceStep(3)}
                        className="w-full h-10 text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                        disabled={!voiceSteps.summary}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording && currentStep === 3 ? 'Recording...' : 'Record Anchor'}
                      </Button>
                      {voiceSteps.anchor && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-amber-200">
                          {voiceSteps.anchor.substring(0, 50)}... ({voiceSteps.anchor.length}/300 charac)
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gradient-to-br from-orange-50/30 to-amber-50/30 rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">4</span>
                        </div>
                        <h5 className="text-sm font-semibold text-orange-700">Layer 4: Pulse (5 sec)</h5>
                        {voiceSteps.pulse && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className="text-xs text-orange-600 mb-3">
                        "Finally, say one emotion word that captures how you feel."
                      </p>
                      <Button
                        variant={isRecording && currentStep === 4 ? 'destructive' : 'default'}
                        onClick={() => handleVoiceStep(4)}
                        className="w-full h-10 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        disabled={!voiceSteps.anchor}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {isRecording && currentStep === 4 ? 'Recording...' : 'Record Pulse'}
                      </Button>
                      {voiceSteps.pulse && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-orange-200 text-center font-medium">
                          Pulse: "{voiceSteps.pulse}"
                        </div>
                      )}
                    </div>

                    {voiceSteps.heading && voiceSteps.summary && voiceSteps.anchor && voiceSteps.pulse && (
                      !isSaved ? (
                        <Button 
                          onClick={handleSubmit}
                          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                        >
                          Save Voice Dot
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Button 
                            className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-lg font-semibold shadow-lg cursor-default"
                            disabled
                          >
                            ✓ Saved
                          </Button>
                          <Button 
                            onClick={confirmClose}
                            variant="outline"
                            className="w-full h-10 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-medium"
                          >
                            Close
                          </Button>
                        </div>
                      )
                    )}
                  </div>
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