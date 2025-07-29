import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mic, Type, X, ArrowLeft, Minimize2, AlertTriangle, BrainCircuit, Settings, Brain } from "lucide-react";
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
  const [captureMode, setCaptureMode] = useState<'select' | 'create-type' | 'text' | 'voice' | 'wheel-text' | 'wheel-voice' | 'chakra-text' | 'chakra-voice' | 'direct-chat' | 'whatsapp'>('select');
  const [userCaptureMode, setUserCaptureMode] = useState<'natural' | 'ai' | 'hybrid'>('hybrid');
  const [naturalPreference, setNaturalPreference] = useState<'voice' | 'text' | 'both'>('both');
  const [chatPreference, setChatPreference] = useState<'whatsapp' | 'direct' | 'both'>('both');
  const [createType, setCreateType] = useState<'dot' | 'wheel' | 'chakra' | null>(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [voiceSteps, setVoiceSteps] = useState({
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: null as number | null
  });
  
  // Voice recording states for wheels
  const [wheelVoiceSteps, setWheelVoiceSteps] = useState({
    heading: '',
    goals: '',
    timeline: '',
    chakraId: null as number | null
  });
  const [audioRecordings, setAudioRecordings] = useState<{
    summary?: string;
    anchor?: string;
    pulse?: string;
  }>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Text input states for dots
  const [structuredInput, setStructuredInput] = useState({
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: null as number | null
  });
  
  // Text input states for wheels
  const [wheelInput, setWheelInput] = useState({
    heading: '',
    goals: '',
    timeline: '',
    chakraId: null as number | null
  });

  // Text input states for chakras
  const [chakraInput, setChakraInput] = useState({
    heading: '',
    purpose: '',
    timeline: ''
  });

  // Voice recording states for chakras
  const [chakraVoiceSteps, setChakraVoiceSteps] = useState({
    heading: '',
    purpose: '',
    timeline: ''
  });
  
  // Available wheels for Chakra selection
  const [availableWheels, setAvailableWheels] = useState<Array<{
    id: number;
    heading: string;
    goals: string;
  }>>([]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isFirstActivation, setIsFirstActivation] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load user's capture mode preference and listen for real-time changes
  useEffect(() => {
    const loadCaptureMode = () => {
      const directMode = localStorage.getItem('dotCaptureMode');
      if (directMode) {
        setUserCaptureMode(directMode as 'natural' | 'ai' | 'hybrid');
      }
      
      const savedSettings = localStorage.getItem('dotspark-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setUserCaptureMode(settings.captureMode ?? 'hybrid');
        setNaturalPreference(settings.naturalPreference ?? 'both');
        setChatPreference(settings.chatPreference ?? 'both');
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
        setUserCaptureMode(storageEvent.newValue as 'natural' | 'ai' | 'hybrid');
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

  // Fetch available wheels when wheel creation modes are accessed
  const fetchAvailableWheels = async () => {
    try {
      const response = await fetch('/api/wheels');
      if (response.ok) {
        const wheels = await response.json();
        setAvailableWheels(wheels.map((wheel: any) => ({
          id: wheel.id,
          heading: wheel.heading,
          goals: wheel.goals
        })));
      }
    } catch (error) {
      console.error('Failed to fetch wheels:', error);
    }
  };

  // Fetch wheels when entering wheel or dot creation modes
  useEffect(() => {
    if (captureMode === 'wheel-text' || captureMode === 'wheel-voice' || 
        captureMode === 'text' || captureMode === 'voice') {
      fetchAvailableWheels();
    }
  }, [captureMode]);

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
      
      // Auto-navigate based on user preferences
      if (userCaptureMode === 'natural') {
        if (naturalPreference === 'voice') {
          setCaptureMode('voice');
          return;
        } else if (naturalPreference === 'text') {
          setCaptureMode('text');
          return;
        }
      } else if (userCaptureMode === 'ai') {
        if (chatPreference === 'direct') {
          setIsExpanded(false);
          window.location.href = '/chat';
          return;
        } else if (chatPreference === 'whatsapp') {
          setIsExpanded(false);
          handleWhatsAppNavigation();
          return;
        }
      }
      
      // If no specific preference or 'both' is selected, show selection screen
      setCaptureMode('select');
    }
  };

  const handleWhatsAppNavigation = async () => {
    try {
      const response = await fetch('/api/whatsapp/contact');
      const data = await response.json();
      const defaultMessage = encodeURIComponent("Hi DotSpark, I would need your assistance in saving a dot");
      const whatsappUrl = `https://wa.me/${data.phoneNumber}?text=${defaultMessage}`;
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error('Failed to get WhatsApp contact:', error);
      window.location.href = 'https://web.whatsapp.com/';
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    // If already saved, no unsaved changes
    if (isSaved) return false;
    
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
    setCaptureMode('select');
    setStructuredInput({ summary: '', anchor: '', pulse: '', wheelId: null });
    setVoiceSteps({ summary: '', anchor: '', pulse: '', wheelId: null });
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
      const layerKey = currentStep === 1 ? 'summary' : currentStep === 2 ? 'anchor' : 'pulse';
      
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
      if (currentStep < 3) {
        setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
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

  const handleVoiceStep = (step: 1 | 2 | 3) => {
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
            title: "Please complete all three layers",
            variant: "destructive"
          });
          return;
        }
        
        dotData = {
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

  const handleCreateChakra = async () => {
    try {
      setIsSaving(true);
      
      const chakraData = {
        heading: chakraInput.heading,
        purpose: chakraInput.purpose,
        timeline: chakraInput.timeline,
        sourceType: 'text'
      };
      
      // Submit to API endpoint
      const response = await fetch('/api/chakras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chakraData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create Chakra');
      }
      
      toast({
        title: "Chakra Created Successfully!",
        description: `"${chakraInput.heading}" has been successfully created.`,
      });
      
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to create Chakra:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create Chakra. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
                      
                      {/* Settings Icon */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsExpanded(false);
                          window.location.href = '/my-neura';
                        }}
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
                        title="Go to settings to set default mode"
                      >
                        <Settings className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {userCaptureMode === 'ai' ? (
                    // AI Mode - Direct options
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-700 to-violet-700 bg-clip-text text-transparent">
                          How would you like to get AI assistance?
                        </h2>
                      </div>
                      
                      {/* AI Mode Options */}
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
                              window.location.href = 'https://web.whatsapp.com/';
                            }
                          }}
                          className="h-28 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105"
                        >
                          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.063" />
                          </svg>
                          <span className="text-xl font-semibold">WhatsApp</span>
                        </Button>
                      </div>
                    </>
                  ) : (
                    // Natural Mode - Creation type selection
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                          What would you like to create?
                        </h2>
                      </div>
                      
                      {/* Creation Type Selection */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <Button
                          onClick={() => {
                            setCreateType('dot');
                            setCaptureMode('create-type');
                          }}
                          className="h-28 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl flex flex-col items-center justify-center space-y-2 shadow-lg transform transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm font-semibold">Save a Dot</span>
                          <span className="text-xs opacity-80">Capture insight</span>
                        </Button>
                        <Button
                          onClick={() => {
                            setCreateType('wheel');
                            setCaptureMode('create-type');
                          }}
                          className="h-28 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl flex flex-col items-center justify-center space-y-2 shadow-lg transform transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <div className="relative w-6 h-6">
                              <div className="absolute inset-0 w-6 h-6 border-2 border-white rounded-full animate-spin"></div>
                              <div className="absolute inset-1 w-4 h-4 border-2 border-white/70 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold">Create Wheel</span>
                          <span className="text-xs opacity-80">Organize dots</span>
                        </Button>
                        <Button
                          onClick={() => {
                            setCreateType('chakra');
                            setCaptureMode('create-type');
                          }}
                          className="h-28 bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white rounded-xl flex flex-col items-center justify-center space-y-2 shadow-lg transform transition-all duration-200 hover:scale-105"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Settings className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '4s' }} />
                          </div>
                          <span className="text-sm font-semibold">Create Chakra</span>
                          <span className="text-xs opacity-80">Group wheels</span>
                        </Button>
                      </div>
                    </>
                  )}
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
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          // Navigate to settings page to change preferences
                          setIsExpanded(false);
                          window.location.href = '/my-neura';
                        }}
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                        title="Change capture preferences"
                      >
                        <Settings className="w-4 h-4 text-gray-600" />
                      </Button>
                      <div className="text-sm text-gray-600 font-medium">
                        {userCaptureMode === 'natural' ? (
                          naturalPreference === 'voice' ? 'Voice Only' :
                          naturalPreference === 'text' ? 'Text Only' : 'Natural Mode'
                        ) : userCaptureMode === 'ai' ? (
                          chatPreference === 'direct' ? 'Direct Chat Only' :
                          chatPreference === 'whatsapp' ? 'WhatsApp Only' : 'AI Mode'
                        ) : (
                          'Hybrid Mode'
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {createType === 'wheel' ? 'Create a Wheel' : createType === 'chakra' ? 'Create a Chakra' : 'Save a Dot'}
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
                        ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                        : createType === 'chakra'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-700'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600'
                    }`}>
                      {createType === 'wheel' ? (
                        <div className="relative w-8 h-8">
                          <div className="absolute inset-0 w-8 h-8 border-3 border-white rounded-full animate-spin"></div>
                          <div className="absolute inset-1.5 w-5 h-5 border-2 border-white/70 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                        </div>
                      ) : createType === 'chakra' ? (
                        <Settings className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '4s' }} />
                      ) : (
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600">
                      How would you like to {createType === 'wheel' ? 'create your Wheel' : createType === 'chakra' ? 'create your Chakra' : 'capture your Dot'}?
                    </p>
                  </div>
                  
                  {userCaptureMode === 'natural' || userCaptureMode === 'hybrid' ? (
                    naturalPreference === 'both' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          onClick={() => setCaptureMode(
                            createType === 'wheel' ? 'wheel-voice' : 
                            createType === 'chakra' ? 'chakra-voice' : 'voice'
                          )}
                          className={`h-28 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105 ${
                            createType === 'chakra'
                              ? 'bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800'
                              : createType === 'wheel'
                              ? 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                              : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                          }`}
                        >
                          <Mic className="w-10 h-10" />
                          <span className="text-xl font-semibold">Voice</span>
                        </Button>
                        <Button
                          onClick={() => setCaptureMode(
                            createType === 'wheel' ? 'wheel-text' : 
                            createType === 'chakra' ? 'chakra-text' : 'text'
                          )}
                          className={`h-28 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105 ${
                            createType === 'chakra'
                              ? 'bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800'
                              : createType === 'wheel'
                              ? 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                              : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                          }`}
                        >
                          <Type className="w-10 h-10" />
                          <span className="text-xl font-semibold">Text</span>
                        </Button>
                      </div>
                    ) : naturalPreference === 'voice' ? (
                      <div className="grid grid-cols-1 gap-4">
                        <Button
                          onClick={() => setCaptureMode(
                            createType === 'wheel' ? 'wheel-voice' : 
                            createType === 'chakra' ? 'chakra-voice' : 'voice'
                          )}
                          className={`h-28 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105 ${
                            createType === 'chakra'
                              ? 'bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800'
                              : createType === 'wheel'
                              ? 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                              : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                          }`}
                        >
                          <Mic className="w-10 h-10" />
                          <span className="text-xl font-semibold">Voice</span>
                        </Button>
                      </div>
                    ) : naturalPreference === 'text' ? (
                      <div className="grid grid-cols-1 gap-4">
                        <Button
                          onClick={() => setCaptureMode(
                            createType === 'wheel' ? 'wheel-text' : 
                            createType === 'chakra' ? 'chakra-text' : 'text'
                          )}
                          className={`h-28 text-white rounded-xl flex flex-col items-center justify-center space-y-3 shadow-lg transform transition-all duration-200 hover:scale-105 ${
                            createType === 'chakra'
                              ? 'bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800'
                              : createType === 'wheel'
                              ? 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                              : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                          }`}
                        >
                          <Type className="w-10 h-10" />
                          <span className="text-xl font-semibold">Text</span>
                        </Button>
                      </div>
                    ) : null
                  ) : null}
                  
                  {userCaptureMode === 'ai' || userCaptureMode === 'hybrid' ? (
                    chatPreference === 'both' ? (
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
                                  : createType === 'chakra'
                                  ? "Hi DotSpark, I would need your assistance in creating a chakra"
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
                    ) : chatPreference === 'direct' ? (
                      <div className="grid grid-cols-1 gap-4">
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
                      </div>
                    ) : chatPreference === 'whatsapp' ? (
                      <div className="grid grid-cols-1 gap-4">
                        <Button
                          onClick={async () => {
                            setIsExpanded(false);
                            try {
                              const response = await fetch('/api/whatsapp/contact');
                              const data = await response.json();
                              const defaultMessage = encodeURIComponent(
                                createType === 'wheel' 
                                  ? "Hi DotSpark, I would need your assistance in creating a wheel"
                                  : createType === 'chakra'
                                  ? "Hi DotSpark, I would need your assistance in creating a chakra"
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
                    ) : null
                  ) : null}

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
                      onClick={() => setCaptureMode('create-type')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="font-medium">Save Dot - Text</h3>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Three Layer Dot Input */}
                  <div className="space-y-6">
                    {/* Layer 1: Summary */}
                    <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/60 rounded-xl border-2 border-amber-400 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className="text-sm font-semibold text-amber-800">Layer 1: Summary</h5>
                        {structuredInput.summary && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Textarea
                        value={structuredInput.summary}
                        onChange={(e) => setStructuredInput(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Describe your thoughts and insights..."
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 min-h-[80px]"
                        maxLength={220}
                      />
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-amber-600">Core insight or thought</span>
                        <span className="text-amber-500">{structuredInput.summary.length}/220</span>
                      </div>
                    </div>

                    {/* Layer 3: Anchor */}
                    <div className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl border-2 border-blue-300 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className="text-sm font-semibold text-blue-700">Layer 2: Anchor</h5>
                        {structuredInput.anchor && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Textarea
                        value={structuredInput.anchor}
                        onChange={(e) => setStructuredInput(prev => ({ ...prev, anchor: e.target.value }))}
                        placeholder="Memory anchor - what helps you remember this..."
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 min-h-[80px]"
                        maxLength={300}
                      />
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-blue-600">Context that makes this memorable</span>
                        <span className="text-blue-500">{structuredInput.anchor.length}/300</span>
                      </div>
                    </div>

                    {/* Layer 4: Pulse */}
                    <div className="p-4 bg-gradient-to-br from-purple-50/30 to-pink-50/30 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h5 className="text-sm font-semibold text-purple-700">Layer 3: Pulse</h5>
                        {structuredInput.pulse && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'].map((emotion) => (
                          <button
                            key={emotion}
                            onClick={() => setStructuredInput(prev => ({ ...prev, pulse: emotion }))}
                            className={`p-2 text-xs rounded-lg transition-all duration-200 ${
                              structuredInput.pulse === emotion
                                ? 'bg-purple-200 text-purple-800 ring-2 ring-purple-400'
                                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                      <Input
                        value={structuredInput.pulse}
                        onChange={(e) => setStructuredInput(prev => ({ ...prev, pulse: e.target.value }))}
                        placeholder="One word emotion"
                        className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 text-center"
                      />
                      <p className="text-xs text-purple-600 mt-2 text-center">
                        The emotion driving this thought
                      </p>
                    </div>

                    {/* Wheel Selection (Optional) */}
                    <div className="p-4 bg-gradient-to-br from-slate-50/30 to-gray-50/30 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="w-5 h-5 text-slate-600" />
                        <h5 className="text-sm font-semibold text-slate-700">Wheel (Optional)</h5>
                        {structuredInput.wheelId && <span className="text-xs text-green-600 ml-auto">✓ Selected</span>}
                      </div>
                      <select
                        value={structuredInput.wheelId || ''}
                        onChange={(e) => setStructuredInput(prev => ({ 
                          ...prev, 
                          wheelId: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        className="w-full p-2 border-slate-200 rounded-lg focus:border-slate-400 focus:ring-slate-400"
                      >
                        <option value="">Save as standalone dot</option>
                        {availableWheels.map(wheel => (
                          <option key={wheel.id} value={wheel.id}>
                            {wheel.heading} - {wheel.goals.substring(0, 30)}...
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-600 mt-2">
                        Choose which wheel this dot belongs to
                      </p>
                    </div>

                    {structuredInput.summary && structuredInput.anchor && structuredInput.pulse && (
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Dot Saved!",
                            description: "Your dot has been successfully saved.",
                          });
                          setIsSaved(true);
                        }}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                      >
                        Save Dot
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {captureMode === 'voice' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode('create-type')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="font-medium">Save Dot - Voice</h3>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Three Layer Voice Dot Input */}
                  <div className="space-y-4">
                    {/* Layer 1: Summary */}
                    <div className="p-4 bg-gradient-to-br from-amber-50/60 to-orange-50/60 rounded-xl border-2 border-amber-400 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className="text-sm font-semibold text-amber-800">Layer 1: Summary</h5>
                        {voiceSteps.summary && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Button
                        onClick={async () => {
                          if (isRecording && currentStep === 1) {
                            stopRecording();
                          } else {
                            setCurrentStep(1);
                            await startRecording();
                          }
                        }}
                        className="w-full h-12 text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-lg"
                        disabled={isRecording && currentStep !== 1}
                      >
                        <Mic className="h-5 w-5 mr-2" />
                        {isRecording && currentStep === 1 ? 'Stop Recording' : 'Record Summary'}
                      </Button>
                      {voiceSteps.summary && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-sm border border-amber-200">
                          {voiceSteps.summary.substring(0, 220)}
                          <span className="text-amber-500 text-xs ml-2">({voiceSteps.summary.length}/220 chars)</span>
                        </div>
                      )}
                    </div>

                    {/* Layer 2: Anchor */}
                    <div className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl border-2 border-blue-300 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className="text-sm font-semibold text-blue-700">Layer 2: Anchor</h5>
                        {voiceSteps.anchor && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Button
                        onClick={async () => {
                          if (isRecording && currentStep === 2) {
                            stopRecording();
                          } else {
                            setCurrentStep(2);
                            await startRecording();
                          }
                        }}
                        className="w-full h-12 text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg"
                        disabled={!voiceSteps.summary || (isRecording && currentStep !== 2)}
                      >
                        <Mic className="h-5 w-5 mr-2" />
                        {isRecording && currentStep === 2 ? 'Stop Recording' : 'Record Anchor'}
                      </Button>
                      {voiceSteps.anchor && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-sm border border-blue-200">
                          {voiceSteps.anchor.substring(0, 300)}
                          <span className="text-blue-500 text-xs ml-2">({voiceSteps.anchor.length}/300 chars)</span>
                        </div>
                      )}
                    </div>

                    {/* Layer 3: Pulse */}
                    <div className="p-4 bg-gradient-to-br from-purple-50/30 to-pink-50/30 rounded-xl border-2 border-purple-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h5 className="text-sm font-semibold text-purple-700">Layer 3: Pulse</h5>
                        {voiceSteps.pulse && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Button
                        onClick={async () => {
                          if (isRecording && currentStep === 3) {
                            stopRecording();
                          } else {
                            setCurrentStep(3);
                            await startRecording();
                          }
                        }}
                        className="w-full h-12 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg"
                        disabled={!voiceSteps.anchor || (isRecording && currentStep !== 3)}
                      >
                        <Mic className="h-5 w-5 mr-2" />
                        {isRecording && currentStep === 3 ? 'Stop Recording' : 'Record Pulse'}
                      </Button>
                      {voiceSteps.pulse && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-sm border border-purple-200 text-center">
                          Emotion: "{voiceSteps.pulse.split(' ')[0]}"
                        </div>
                      )}
                    </div>

                    {/* Wheel Selection (Optional) */}
                    <div className="p-4 bg-gradient-to-br from-slate-50/30 to-gray-50/30 rounded-xl border-2 border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="w-5 h-5 text-slate-600" />
                        <h5 className="text-sm font-semibold text-slate-700">Wheel (Optional)</h5>
                        {voiceSteps.wheelId && <span className="text-xs text-green-600 ml-auto">✓ Selected</span>}
                      </div>
                      <select
                        value={voiceSteps.wheelId || ''}
                        onChange={(e) => setVoiceSteps(prev => ({ 
                          ...prev, 
                          wheelId: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        className="w-full p-2 border-slate-200 rounded-lg focus:border-slate-400 focus:ring-slate-400"
                      >
                        <option value="">Save as standalone dot</option>
                        {availableWheels.map(wheel => (
                          <option key={wheel.id} value={wheel.id}>
                            {wheel.heading} - {wheel.goals.substring(0, 30)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    {voiceSteps.summary && voiceSteps.anchor && voiceSteps.pulse && (
                      <Button 
                        onClick={async () => {
                          try {
                            const dotData = {
                              summary: voiceSteps.summary.substring(0, 220),
                              anchor: voiceSteps.anchor.substring(0, 300),
                              pulse: voiceSteps.pulse.split(' ')[0] || 'captured',
                              sourceType: 'voice',
                              wheelId: voiceSteps.wheelId
                            };
                            
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
                              title: "Voice Dot Saved!",
                              description: "Your voice dot has been successfully saved.",
                            });
                            
                            // Reset form
                            setVoiceSteps({ summary: '', anchor: '', pulse: '', wheelId: null });
                            setIsExpanded(false);
                          } catch (error) {
                            console.error('Error saving voice dot:', error);
                            toast({
                              title: "Save Error",
                              description: error instanceof Error ? error.message : "Failed to save voice dot",
                              variant: "destructive"
                            });
                          }
                        }}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                      >
                        Save Voice Dot
                      </Button>
                    )}
                  </div>
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
                    <h3 className="font-medium">Create Wheel - Text</h3>
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
                    <div className={`p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 ${
                      userCaptureMode === 'ai' 
                        ? 'bg-gradient-to-br from-purple-50/50 to-violet-50/50 border-purple-300'
                        : 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600'
                        }`}>
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className={`text-sm font-semibold ${
                          userCaptureMode === 'ai' ? 'text-purple-700' : 'text-amber-700'
                        }`}>Layer 1: Heading</h5>
                        {wheelInput.heading && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Input
                        value={wheelInput.heading}
                        onChange={(e) => setWheelInput(prev => ({ ...prev, heading: e.target.value }))}
                        placeholder="Enter wheel heading (e.g., Morning Clarity)"
                        className={userCaptureMode === 'ai' 
                          ? 'border-purple-200 focus:border-purple-400 focus:ring-purple-400'
                          : 'border-amber-200 focus:border-amber-400 focus:ring-amber-400'
                        }
                      />
                      <p className={`text-xs mt-2 ${
                        userCaptureMode === 'ai' ? 'text-purple-600' : 'text-amber-600'
                      }`}>
                        Give your wheel a clear, memorable name
                      </p>
                    </div>

                    {/* Layer 2: Purpose */}
                    <div className={`p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 ${
                      userCaptureMode === 'ai' 
                        ? 'bg-gradient-to-br from-purple-50/60 to-violet-50/60 border-purple-400'
                        : 'bg-gradient-to-br from-amber-50/60 to-orange-50/60 border-amber-400'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-violet-700'
                            : 'bg-gradient-to-r from-amber-600 to-orange-700'
                        }`}>
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className={`text-sm font-semibold ${
                          userCaptureMode === 'ai' ? 'text-purple-800' : 'text-amber-800'
                        }`}>Layer 2: Goals</h5>
                        {wheelInput.goals && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Textarea
                        value={wheelInput.goals}
                        onChange={(e) => setWheelInput(prev => ({ ...prev, goals: e.target.value }))}
                        placeholder="Describe the goals of this wheel..."
                        className={userCaptureMode === 'ai' 
                          ? 'border-purple-200 focus:border-purple-400 focus:ring-purple-400 min-h-[80px]'
                          : 'border-amber-200 focus:border-amber-400 focus:ring-amber-400 min-h-[80px]'
                        }
                        maxLength={300}
                      />
                      <div className="flex justify-between text-xs mt-2">
                        <span className={userCaptureMode === 'ai' ? 'text-purple-600' : 'text-amber-600'}>
                          Define what this wheel is meant to organize
                        </span>
                        <span className={userCaptureMode === 'ai' ? 'text-purple-500' : 'text-amber-500'}>
                          {wheelInput.goals.length}/300
                        </span>
                      </div>
                    </div>

                    {/* Layer 3: Timeline */}
                    <div className={`p-4 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 ${
                      userCaptureMode === 'ai' 
                        ? 'bg-gradient-to-br from-purple-50/30 to-violet-50/30 border-purple-200'
                        : 'bg-gradient-to-br from-orange-50/30 to-red-50/30 border-orange-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-violet-600'
                            : 'bg-gradient-to-r from-orange-600 to-red-600'
                        }`}>
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h5 className={`text-sm font-semibold ${
                          userCaptureMode === 'ai' ? 'text-purple-700' : 'text-orange-700'
                        }`}>Layer 3: Timeline</h5>
                        {wheelInput.timeline && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <Input
                        value={wheelInput.timeline}
                        onChange={(e) => setWheelInput(prev => ({ ...prev, timeline: e.target.value }))}
                        placeholder="Timeline (e.g., Daily, Weekly, Ongoing)"
                        className={userCaptureMode === 'ai' 
                          ? 'border-purple-200 focus:border-purple-400 focus:ring-purple-400'
                          : 'border-orange-200 focus:border-orange-400 focus:ring-orange-400'
                        }
                      />
                      <p className={`text-xs mt-2 ${
                        userCaptureMode === 'ai' ? 'text-purple-600' : 'text-orange-600'
                      }`}>
                        When will this wheel be most relevant?
                      </p>
                    </div>

                    {/* Parent Wheel Selection (Optional) */}
                    <div className="p-4 bg-gradient-to-br from-slate-50/30 to-gray-50/30 rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-slate-500 to-gray-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+</span>
                        </div>
                        <h5 className="text-sm font-semibold text-slate-700">Chakra (Optional)</h5>
                        {wheelInput.chakraId && <span className="text-xs text-green-600 ml-auto">✓ Selected</span>}
                      </div>
                      <select
                        value={wheelInput.chakraId || ''}
                        onChange={(e) => setWheelInput(prev => ({ 
                          ...prev, 
                          chakraId: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        className="w-full p-2 border-slate-200 rounded-lg focus:border-slate-400 focus:ring-slate-400"
                      >
                        <option value="">Create as standalone wheel</option>
                        {availableWheels.map(wheel => (
                          <option key={wheel.id} value={wheel.id}>
                            {wheel.heading} - {wheel.goals.substring(0, 30)}...
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-600 mt-2">
                        Choose a Chakra to create a hierarchical structure
                      </p>
                    </div>

                    {wheelInput.heading && wheelInput.goals && wheelInput.timeline && (
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Wheel Created!",
                            description: `"${wheelInput.heading}" has been successfully created.`,
                          });
                          setIsSaved(true);
                        }}
                        className={`w-full h-12 text-white rounded-xl text-lg font-semibold shadow-lg ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        }`}
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
                    <div className={`p-4 rounded-xl border-2 shadow-sm ${
                      userCaptureMode === 'ai' 
                        ? 'bg-gradient-to-br from-purple-50/50 to-violet-50/50 border-purple-300'
                        : 'bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600'
                        }`}>
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h5 className={`text-sm font-semibold ${
                          userCaptureMode === 'ai' ? 'text-purple-700' : 'text-amber-700'
                        }`}>Layer 1: Heading</h5>
                        {wheelVoiceSteps.heading && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className={`text-xs mb-3 ${
                        userCaptureMode === 'ai' ? 'text-purple-600' : 'text-amber-600'
                      }`}>
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
                        className={`w-full h-10 text-sm text-white ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        }`}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Heading
                      </Button>
                      {wheelVoiceSteps.heading && (
                        <div className={`mt-3 p-3 bg-white/80 rounded-lg text-xs border ${
                          userCaptureMode === 'ai' ? 'border-purple-200' : 'border-amber-200'
                        }`}>
                          "{wheelVoiceSteps.heading}"
                        </div>
                      )}
                    </div>

                    {/* Layer 2: Purpose */}
                    <div className={`p-4 rounded-xl border-2 shadow-sm ${
                      userCaptureMode === 'ai' 
                        ? 'bg-gradient-to-br from-purple-50/60 to-violet-50/60 border-purple-400'
                        : 'bg-gradient-to-br from-amber-50/60 to-orange-50/60 border-amber-400'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-violet-700'
                            : 'bg-gradient-to-r from-amber-600 to-orange-700'
                        }`}>
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h5 className={`text-sm font-semibold ${
                          userCaptureMode === 'ai' ? 'text-purple-800' : 'text-amber-800'
                        }`}>Layer 2: Goals</h5>
                        {wheelVoiceSteps.goals && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className={`text-xs mb-3 ${
                        userCaptureMode === 'ai' ? 'text-purple-700' : 'text-amber-700'
                      }`}>
                        "Describe the goals of this wheel. What will it organize?"
                      </p>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Voice recording simulation",
                            description: "Voice recording started for wheel goals",
                          });
                          setTimeout(() => {
                            setWheelVoiceSteps(prev => ({ ...prev, goals: 'A collection of morning routines and thoughts to start the day with clarity and focus' }));
                          }, 3000);
                        }}
                        className={`w-full h-10 text-sm text-white ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800'
                            : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800'
                        }`}
                        disabled={!wheelVoiceSteps.heading}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Goals
                      </Button>
                      {wheelVoiceSteps.goals && (
                        <div className={`mt-3 p-3 bg-white/80 rounded-lg text-xs border ${
                          userCaptureMode === 'ai' ? 'border-purple-200' : 'border-amber-200'
                        }`}>
                          {wheelVoiceSteps.goals.substring(0, 80)}... ({wheelVoiceSteps.goals.length}/300 charac)
                        </div>
                      )}
                    </div>

                    {/* Layer 3: Timeline */}
                    <div className={`p-4 rounded-xl border-2 shadow-sm ${
                      userCaptureMode === 'ai' 
                        ? 'bg-gradient-to-br from-purple-50/30 to-violet-50/30 border-purple-200'
                        : 'bg-gradient-to-br from-orange-50/30 to-red-50/30 border-orange-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-violet-600'
                            : 'bg-gradient-to-r from-orange-600 to-red-600'
                        }`}>
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h5 className={`text-sm font-semibold ${
                          userCaptureMode === 'ai' ? 'text-purple-700' : 'text-orange-700'
                        }`}>Layer 3: Timeline</h5>
                        {wheelVoiceSteps.timeline && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                      </div>
                      <p className={`text-xs mb-3 ${
                        userCaptureMode === 'ai' ? 'text-purple-600' : 'text-orange-600'
                      }`}>
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
                        className={`w-full h-10 text-sm text-white ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                        }`}
                        disabled={!wheelVoiceSteps.goals}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Timeline
                      </Button>
                      {wheelVoiceSteps.timeline && (
                        <div className={`mt-3 p-3 bg-white/80 rounded-lg text-xs text-center font-medium border ${
                          userCaptureMode === 'ai' ? 'border-purple-200' : 'border-orange-200'
                        }`}>
                          Timeline: "{wheelVoiceSteps.timeline}"
                        </div>
                      )}
                    </div>

                    {wheelVoiceSteps.heading && wheelVoiceSteps.goals && wheelVoiceSteps.timeline && (
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Wheel Created!",
                            description: `"${wheelVoiceSteps.heading}" has been successfully created.`,
                          });
                          setIsSaved(true);
                        }}
                        className={`w-full h-12 text-white rounded-xl text-lg font-semibold shadow-lg ${
                          userCaptureMode === 'ai'
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        }`}
                      >
                        Create Voice Wheel
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Chakra Text Input */}
              {captureMode === 'chakra-text' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode('create-type')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-xl font-semibold text-gray-800">Create Chakra - Text Input</h3>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-gray-600">Enter the three layers of your Chakra</p>
                  </div>

                  <div className="space-y-6">
                    {/* Layer 1: Chakra Heading */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <h5 className="text-sm font-semibold text-amber-800">Layer 1: Chakra Heading</h5>
                          {chakraInput.heading && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                        </div>
                      </div>
                      <Input
                        value={chakraInput.heading}
                        onChange={(e) => setChakraInput(prev => ({ ...prev, heading: e.target.value }))}
                        placeholder="Name your Chakra..."
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                        maxLength={100}
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-amber-600">A clear name for your Chakra theme</span>
                        <span className="text-amber-500">{chakraInput.heading.length}/100</span>
                      </div>
                    </div>

                    {/* Layer 2: Purpose */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-700 to-orange-800 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <h5 className="text-sm font-semibold text-amber-800">Layer 2: Purpose</h5>
                          {chakraInput.purpose && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                        </div>
                      </div>
                      <Textarea
                        value={chakraInput.purpose}
                        onChange={(e) => setChakraInput(prev => ({ ...prev, purpose: e.target.value }))}
                        placeholder="Describe the purpose of this Chakra..."
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 min-h-[80px]"
                        maxLength={300}
                      />
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-amber-600">Define the overarching purpose and theme</span>
                        <span className="text-amber-500">{chakraInput.purpose.length}/300</span>
                      </div>
                    </div>

                    {/* Layer 3: Timeline */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-700 to-red-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <h5 className="text-sm font-semibold text-orange-700">Layer 3: Timeline</h5>
                          {chakraInput.timeline && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                        </div>
                      </div>
                      <Input
                        value={chakraInput.timeline}
                        onChange={(e) => setChakraInput(prev => ({ ...prev, timeline: e.target.value }))}
                        placeholder="e.g., Ongoing, 5 years, Long-term..."
                        className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        maxLength={50}
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-orange-600">When will this Chakra be most relevant?</span>
                        <span className="text-orange-500">{chakraInput.timeline.length}/50</span>
                      </div>
                    </div>

                    {chakraInput.heading && chakraInput.purpose && chakraInput.timeline && (
                      <Button 
                        onClick={handleCreateChakra}
                        disabled={isSaving}
                        className="w-full h-12 text-white rounded-xl text-lg font-semibold shadow-lg bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 disabled:opacity-50"
                      >
                        {isSaving ? 'Creating...' : 'Create Chakra'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Chakra Voice Input */}
              {captureMode === 'chakra-voice' && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="ghost"
                      onClick={() => setCaptureMode('create-type')}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-xl font-semibold text-gray-800">Create Chakra - Voice Input</h3>
                    <Button
                      variant="ghost"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-gray-600">Record the three layers of your Chakra</p>
                  </div>

                  <div className="space-y-6">
                    {/* Layer 1: Chakra Heading */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <h5 className="text-sm font-semibold text-amber-800">Layer 1: Chakra Heading</h5>
                          {chakraVoiceSteps.heading && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                        </div>
                      </div>
                      <p className="text-xs mb-3 text-amber-700">
                        "What would you like to name this Chakra?"
                      </p>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Voice recording simulation",
                            description: "Voice recording started for chakra heading",
                          });
                          setTimeout(() => {
                            setChakraVoiceSteps(prev => ({ ...prev, heading: 'Personal Development Journey' }));
                          }, 2000);
                        }}
                        className="w-full h-10 text-sm text-white bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Heading
                      </Button>
                      {chakraVoiceSteps.heading && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-amber-200">
                          {chakraVoiceSteps.heading.substring(0, 50)}... ({chakraVoiceSteps.heading.length}/100 charac)
                        </div>
                      )}
                    </div>

                    {/* Layer 2: Purpose */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-700 to-orange-800 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <h5 className="text-sm font-semibold text-amber-800">Layer 2: Purpose</h5>
                          {chakraVoiceSteps.purpose && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                        </div>
                      </div>
                      <p className="text-xs mb-3 text-amber-700">
                        "Describe the overarching purpose of this Chakra. What theme does it represent?"
                      </p>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Voice recording simulation",
                            description: "Voice recording started for chakra purpose",
                          });
                          setTimeout(() => {
                            setChakraVoiceSteps(prev => ({ ...prev, purpose: 'A comprehensive framework for continuous personal growth encompassing mindfulness, skill development, and life balance to achieve long-term fulfillment and success' }));
                          }, 3000);
                        }}
                        className="w-full h-10 text-sm text-white bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-800 hover:to-orange-900"
                        disabled={!chakraVoiceSteps.heading}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Purpose
                      </Button>
                      {chakraVoiceSteps.purpose && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs border border-amber-200">
                          {chakraVoiceSteps.purpose.substring(0, 80)}... ({chakraVoiceSteps.purpose.length}/300 charac)
                        </div>
                      )}
                    </div>

                    {/* Layer 3: Timeline */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-700 to-red-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <h5 className="text-sm font-semibold text-orange-700">Layer 3: Timeline</h5>
                          {chakraVoiceSteps.timeline && <span className="text-xs text-green-600 ml-auto">✓ Done</span>}
                        </div>
                      </div>
                      <p className="text-xs mb-3 text-orange-600">
                        "When will this Chakra be most relevant? Is it ongoing, or does it have a specific timeframe?"
                      </p>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Voice recording simulation",
                            description: "Voice recording started for chakra timeline",
                          });
                          setTimeout(() => {
                            setChakraVoiceSteps(prev => ({ ...prev, timeline: 'Ongoing - Lifelong journey' }));
                          }, 1500);
                        }}
                        className="w-full h-10 text-sm text-white bg-gradient-to-r from-orange-700 to-red-600 hover:from-orange-800 hover:to-red-700"
                        disabled={!chakraVoiceSteps.purpose}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Record Timeline
                      </Button>
                      {chakraVoiceSteps.timeline && (
                        <div className="mt-3 p-3 bg-white/80 rounded-lg text-xs text-center font-medium border border-orange-200">
                          Timeline: "{chakraVoiceSteps.timeline}"
                        </div>
                      )}
                    </div>

                    {chakraVoiceSteps.heading && chakraVoiceSteps.purpose && chakraVoiceSteps.timeline && (
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Chakra Created!",
                            description: `"${chakraVoiceSteps.heading}" has been successfully created.`,
                          });
                          setIsSaved(true);
                        }}
                        className="w-full h-12 text-white rounded-xl text-lg font-semibold shadow-lg bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800"
                      >
                        Create Voice Chakra
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
                setStructuredInput({ summary: '', anchor: '', pulse: '', wheelId: null });
                setWheelInput({ heading: '', goals: '', timeline: '', chakraId: null });
                setWheelVoiceSteps({ heading: '', goals: '', timeline: '', chakraId: null });
                setChakraInput({ heading: '', purpose: '', timeline: '' });
                setChakraVoiceSteps({ heading: '', purpose: '', timeline: '' });
                setCreateType(null);
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
