import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Type, X, ArrowLeft, Brain, User, Settings, BrainCircuit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { neuraStorage } from "@/lib/neuraStorage";
import { isRunningAsStandalone } from "@/lib/pwaUtils";

interface Position {
  x: number;
  y: number;
}

export function GlobalFloatingDot() {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('global-floating-dot-position');
    return saved ? JSON.parse(saved) : { x: 320, y: 180 };
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'select' | 'create-type' | 'text' | 'voice' | 'wheel-text' | 'wheel-voice' | 'chakra-text' | 'chakra-voice' | 'direct-chat' | 'whatsapp'>('select');
  const [userCaptureMode, setUserCaptureMode] = useState<'natural' | 'ai' | 'hybrid'>('hybrid');
  const [naturalPreference, setNaturalPreference] = useState<'voice' | 'text' | 'both'>('both');
  const [chatPreference, setChatPreference] = useState<'whatsapp' | 'direct' | 'both'>('both');
  const [createType, setCreateType] = useState<'dot' | 'wheel' | 'chakra' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showActivationPrompt, setShowActivationPrompt] = useState(false);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [voiceSteps, setVoiceSteps] = useState({
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: null as number | null
  });
  
  // Text input states for dots
  const [structuredInput, setStructuredInput] = useState({
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: null as number | null
  });
  
  const dotRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if DotSpark is activated for signed-in users
  const isDotSparkActivated = user ? neuraStorage.isActivated() : false;

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

    loadCaptureMode();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dotCaptureMode' || e.key === 'dotspark-settings') {
        loadCaptureMode();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('global-floating-dot-position', JSON.stringify(position));
  }, [position]);

  // Listen for custom trigger events
  useEffect(() => {
    const handleTriggerFloatingDot = () => {
      setIsExpanded(true);
    };

    window.addEventListener('triggerFloatingDot', handleTriggerFloatingDot);
    return () => window.removeEventListener('triggerFloatingDot', handleTriggerFloatingDot);
  }, []);

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
        localStorage.setItem('global-floating-dot-position', JSON.stringify(position));
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
        localStorage.setItem('global-floating-dot-position', JSON.stringify(position));
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
    if (captureMode === 'text') {
      return structuredInput.summary.trim() || structuredInput.anchor.trim() || structuredInput.pulse.trim();
    } else if (captureMode === 'voice') {
      return voiceSteps.summary.trim() || voiceSteps.anchor.trim() || voiceSteps.pulse.trim();
    }
    return false;
  };

  const handleClose = () => {
    setIsExpanded(false);
    setCaptureMode('select');
    setStructuredInput({ summary: '', anchor: '', pulse: '', wheelId: null });
    setVoiceSteps({ summary: '', anchor: '', pulse: '', wheelId: null });
    setCurrentStep(1);
    setIsRecording(false);
  };

  const checkAuthAndActivation = (action: () => void) => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    if (!isDotSparkActivated) {
      setShowActivationPrompt(true);
      return;
    }

    action();
  };

  const handleSaveDot = async () => {
    if (!structuredInput.summary.trim()) {
      toast({
        title: "Summary required",
        description: "Please provide at least a summary for your dot",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oneWordSummary: structuredInput.summary.slice(0, 50),
          summary: structuredInput.summary,
          anchor: structuredInput.anchor,
          pulse: structuredInput.pulse,
          wheelId: structuredInput.wheelId,
          sourceType: 'text',
        }),
      });

      if (response.ok) {
        toast({
          title: "Dot saved successfully!",
          description: "Your insight has been captured",
        });
        
        // Reset form
        setStructuredInput({ summary: '', anchor: '', pulse: '', wheelId: null });
        setIsExpanded(false);
        setCaptureMode('select');
      } else {
        throw new Error('Failed to save dot');
      }
    } catch (error) {
      console.error('Error saving dot:', error);
      toast({
        title: "Error saving dot",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Authentication prompt modal
  const AuthPrompt = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000000]">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-6">
            Please sign in to create and save your dots, wheels, and chakras.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowAuthPrompt(false);
                window.location.href = '/auth';
              }}
              className="flex-1"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setShowAuthPrompt(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Activation prompt modal
  const ActivationPrompt = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000000]">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <div className="text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Activate DotSpark</h3>
          <p className="text-gray-600 mb-4">
            Enter activation code to start creating dots, wheels, and chakras.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-amber-800 font-medium">
              Activation Code: <span className="font-bold">DOTSPARKSOCIAL</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowActivationPrompt(false);
                window.location.href = '/my-neura';
              }}
              className="flex-1"
            >
              Go to Neura
            </Button>
            <Button
              onClick={() => setShowActivationPrompt(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
