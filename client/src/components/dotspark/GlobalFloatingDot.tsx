import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Type, X, ArrowLeft, Minimize2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { isRunningAsStandalone } from "@/lib/pwaUtils";
import { useAuth } from '@/hooks/use-auth';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { useQueryClient } from '@tanstack/react-query';
import { PersistentActivationManager } from '@/lib/persistent-activation';
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
  forceExpanded?: boolean;
}

export function GlobalFloatingDot({ isActive, forceExpanded = false }: GlobalFloatingDotProps) {
  const { user, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize with persistent activation
  const [persistentUser, setPersistentUser] = useState(() => {
    const activated = PersistentActivationManager.getCurrentUser();
    if (activated) {
      console.log('🎯 Found persistently activated user:', activated.email);
      return activated;
    }
    return null;
  });
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('global-floating-dot-position');
    return saved ? JSON.parse(saved) : { x: 320, y: 180 };
  });
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  
  // Automatically expand when forceExpanded is true
  useEffect(() => {
    if (forceExpanded) {
      setIsExpanded(true);
    }
  }, [forceExpanded]);
  const [captureMode, setCaptureMode] = useState<'voice' | 'text' | null>(null);
  const [userCaptureMode, setUserCaptureMode] = useState<'voice' | 'text' | 'hybrid' | 'natural' | 'ai'>('hybrid');
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
  const [audioRecordings, setAudioRecordings] = useState({
    summary: '',
    anchor: '',
    pulse: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isFirstActivation, setIsFirstActivation] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load user's capture mode preference and listen for real-time changes
  useEffect(() => {
    const loadCaptureMode = () => {
      const directMode = localStorage.getItem('dotCaptureMode');
      if (directMode) {
        setUserCaptureMode(directMode as 'natural' | 'ai' | 'hybrid');
        return;
      }
      
      const savedSettings = localStorage.getItem('dotspark-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setUserCaptureMode(settings.captureMode ?? 'hybrid');
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

  // Save position whenever it changes
  useEffect(() => {
    localStorage.setItem('global-floating-dot-position', JSON.stringify(position));
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

    const handleTouchMove = (e: Event) => {
      e.preventDefault();
      hasMoved = true;
      
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches && touchEvent.touches.length > 0) {
        const touch = touchEvent.touches[0];
        
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
      
      // Only trigger click if not dragged
      if (!hasMoved) {
        setTimeout(() => handleClick(), 50);
      }
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
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
      mediaRecorderRef.current = mediaRecorder;
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

  const handleSubmit = async () => {
    console.log('🚀 Starting dot submission process...');
    console.log('🎯 Current textInput:', textInput);
    console.log('🎯 Current captureMode:', captureMode);
    console.log('🎯 Current structuredInput:', structuredInput);
    console.log('🎯 Current voiceSteps:', voiceSteps);
    
    try {
      let dotData;
      
      if (captureMode === 'text') {
        console.log('📝 Processing text mode - structured input:', structuredInput);
        // Use structured input for text mode
        dotData = {
          summary: structuredInput.summary.substring(0, 220),
          anchor: structuredInput.anchor.substring(0, 300),
          pulse: structuredInput.pulse.split(' ')[0] || 'captured',
          sourceType: 'text'
        };
      } else if (captureMode === 'voice') {
        console.log('🎤 Processing voice mode - voice steps:', voiceSteps);
        // Use voice steps for voice mode
        dotData = {
          summary: voiceSteps.summary.substring(0, 220),
          anchor: voiceSteps.anchor.substring(0, 300),
          pulse: voiceSteps.pulse.split(' ')[0] || 'captured',
          sourceType: 'voice'
        };
      } else {
        console.log('✏️ Processing simple text input:', textInput);
        // CRITICAL FIX: Handle simple text input from textarea
        // This is what gets called when user clicks "Save a Dot" with textInput
        if (!textInput.trim()) {
          throw new Error('No text provided');
        }
        
        dotData = {
          summary: textInput.trim().substring(0, 220),
          anchor: textInput.trim().substring(0, 300), // Use same text for anchor
          pulse: 'captured', // Default pulse
          sourceType: 'text'
        };
      }
      
      console.log('📊 Raw dot data prepared:', dotData);
      
      console.log('🔍 Starting dot creation process...');
      
      // PERSISTENT ACTIVATION: Use saved user or authenticate
      console.log('🔍 Starting dot save with persistent activation...');
      
      // Check for persistently activated user first
      let activeUser = persistentUser || PersistentActivationManager.getCurrentUser();
      
      // Optional: Allow specifying a different user ID for testing
      const testUserId = localStorage.getItem('test-user-id');
      
      if (!activeUser && !user) {
        console.log('🔑 No persistent user found - checking for authentication...');
        // Only try Firebase auth if no persistent user exists
        if (!testUserId) {
          try {
            await loginWithGoogle();
            await new Promise(resolve => setTimeout(resolve, 800));
            // After auth, the user should be available
          } catch (authError) {
            console.log('🔄 Auth failed - proceeding with anonymous activation');
          }
        }
      }
      
      // Determine final user for this session - prioritize authenticated user
      let finalUser;
      if (user && (user as any).id) {
        // Use authenticated Firebase user
        finalUser = user;
        console.log('👤 Using authenticated Firebase user:', user.email, 'ID:', (user as any).id);
      } else if (activeUser) {
        // Use persistent user
        finalUser = activeUser;
        console.log('👤 Using persistent user:', activeUser.email, 'ID:', activeUser.id);
      } else {
        // Fallback to default
        finalUser = PersistentActivationManager.getDefaultUser();
        console.log('👤 Using fallback default user:', finalUser.email, 'ID:', finalUser.id);
      }
      
      // Add required fields for dot creation - let backend generate oneWordSummary automatically
      const completeDotData = {
        ...dotData,
        // Remove oneWordSummary to let backend generate it using AI
        captureMode: 'natural',
        wheelId: ''
      };
      
      // Submit to correct API endpoint with comprehensive error handling
      console.log('Creating dot with data:', completeDotData);
      console.log('User authenticated as:', user?.email || 'backend-session');
      
      console.log('🌐 Making API request to /api/user-content/dots');
      console.log('📤 Request body:', JSON.stringify(completeDotData, null, 2));
      
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      // Add user ID header - prioritize testUserId, then persistent user, then default
      const userIdForRequest = testUserId || (finalUser as any).id?.toString() || '5';
      headers['x-user-id'] = userIdForRequest;
      console.log('🎯 Sending request with user ID:', userIdForRequest);
      
      const response = await fetch('/api/user-content/dots', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(completeDotData),
      });
      
      console.log('📥 Response received - Status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      console.log('🌐 Dot creation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK - Status:', response.status);
        console.error('❌ Error response body:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || 'Failed to create dot';
        } catch {
          errorMessage = errorText || 'Failed to create dot';
        }
        console.error('❌ Dot creation failed:', response.status, errorMessage);
        throw new Error(`${response.status}: ${errorMessage}`);
      }
      
      const result = await response.json();
      console.log('✅ Dot created successfully:', result);
      
      // PERSISTENT ACTIVATION: Save user as permanently activated after successful dot creation
      const userId = Number(userIdForRequest);
      const activatedUser = PersistentActivationManager.handleFirstDotCreation(
        userId, 
        finalUser.email || '', 
        (finalUser as any).name || (finalUser as any).displayName || ''
      );
      
      // Update local state
      setPersistentUser(activatedUser);
      console.log('🎉 User permanently activated in frontend:', activatedUser.email);
      
      toast({
        title: "Dot Saved Successfully",
        description: `Your "${result.dot?.oneWordSummary || 'new'}" dot has been captured!`,
      });
      
      // CRITICAL: Cache invalidation to match UserGrid fetch patterns exactly
      console.log('🔄 Starting comprehensive cache invalidation after dot creation');
      
      // UserGrid uses pattern: ['/api/user-content/dots', userId, mode]
      // We need to invalidate ALL variations of this pattern
      
      const realUserId = Number(userIdForRequest);
      const modes = ['preview', 'real'];
      
      // 1. Invalidate specific user+mode combinations
      modes.forEach(mode => {
        const queryKey = ['/api/user-content/dots', realUserId, mode];
        console.log('🔄 Invalidating specific query:', queryKey);
        queryClient.invalidateQueries({ queryKey, exact: true });
        queryClient.removeQueries({ queryKey, exact: true });
      });
      
      // 2. Invalidate base patterns (without userId/mode)
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/dots'],
        exact: false 
      });
      
      // 3. Invalidate ANY query that starts with /api/user-content/dots
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const firstKey = query.queryKey[0];
          return firstKey === '/api/user-content/dots';
        }
      });
      
      // 4. Also invalidate wheels and stats 
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/wheels'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/stats'],
        exact: false 
      });
      
      console.log('✅ Comprehensive cache invalidation completed for user:', realUserId);
      
      console.log('✅ All cache invalidated and refetched');
      
      // Reset all states
      setTextInput("");
      setStructuredInput({ summary: '', anchor: '', pulse: '' });
      setVoiceSteps({ summary: '', anchor: '', pulse: '' });
      setCurrentStep(1);
      handleClose();
    } catch (error) {
      console.error('💥 CRITICAL: Dot submission completely failed:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Provide specific error messages based on error type
      let errorTitle = "Save Failed";
      let errorDescription = "Please try again.";
      
      if (error instanceof Error) {
        console.error('💥 Error message:', error.message);
        if (error.message.includes('Authentication') || error.message.includes('401')) {
          errorTitle = "Authentication Error";
          errorDescription = "Please sign in and try again.";
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          errorTitle = "Network Error";  
          errorDescription = "Please check your connection and try again.";
        } else if (error.message.includes('500')) {
          errorTitle = "Server Error";
          errorDescription = "Server error occurred. Please try again.";
        } else {
          errorDescription = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: `ERROR: ${errorDescription}`,
        variant: "destructive",
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
                        onClick={async () => {
                          console.log('🎯 Save a Dot clicked - textInput:', textInput);
                          await handleSubmit();
                        }}
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
      
      {/* Sign-in prompt for unauthenticated users */}
      {showSignInPrompt && (
        <SignInPrompt 
          onClose={() => setShowSignInPrompt(false)}
          title="Sign In to Save Your Dot"
          description="Your dot is ready! Please sign in to save it to your personal DotSpark grid."
        />
      )}
    </div>
  );
}