import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, X, Minimize2, Maximize2, Target, Zap, Loader2, Plus, Mic, Type, BrainCircuit, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  // Dot fields
  summary: string;
  anchor: string;
  pulse: string;
  wheelId: string;
  dotChakraId: string;  // For direct dot-to-chakra mapping
  
  // Wheel fields  
  heading: string;
  goals: string;
  timeline: string;
  category: string;
  chakraId: string;  // For wheel-to-chakra mapping
  
  // Chakra fields
  purpose: string;
}

interface WheelOption {
  id: number;
  heading: string;
}

interface ChakraOption {
  id: number;
  heading: string;
}

function GlobalFloatingDotV2() {
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('global-floating-dot-v2-position');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default position: right side slightly above bottom (adjusted for smaller 12x12 size)
    const defaultX = window.innerWidth - 70; // 70px from right edge
    const defaultY = window.innerHeight - 100; // 100px from bottom
    return { x: defaultX, y: defaultY };
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSpinning, setIsSpinning] = useState(false);
  const [contentType, setContentType] = useState<'dot' | 'wheel' | 'chakra'>('dot');
  const [isLoading, setIsLoading] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [wheels, setWheels] = useState<WheelOption[]>([]);
  const [chakras, setChakras] = useState<ChakraOption[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [customEmotion, setCustomEmotion] = useState('');

  // Load capture mode from localStorage - default to hybrid
  const [captureMode, setCaptureMode] = useState<'natural' | 'ai' | 'hybrid'>(() => {
    const savedSettings = localStorage.getItem('dotspark-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.captureMode ?? 'hybrid';
    }
    return 'hybrid';
  });

  // Initialize form data
  const [formData, setFormData] = useState<FormData>({
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: '',
    dotChakraId: '',
    heading: '',
    goals: '',
    timeline: '',
    category: '',
    chakraId: '',
    purpose: ''
  });

  const dotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dotRef.current) return;
    
    const rect = dotRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      // Check if we've moved enough to consider it a drag (threshold of 5 pixels)
      const dragDistance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + 
        Math.pow(e.clientY - dragStartPos.y, 2)
      );
      
      if (dragDistance > 5 && !hasDragged) {
        setIsDragging(true);
        setHasDragged(true);
      }
      
      if (hasDragged || dragDistance > 5) {
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        const clampedX = Math.max(0, Math.min(window.innerWidth - 200, newX));
        const clampedY = Math.max(0, Math.min(window.innerHeight - 100, newY));
        
        setPosition({ x: clampedX, y: clampedY });
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      
      // Save position if dragged
      if (hasDragged) {
        const currentPosition = { 
          x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - offsetX)),
          y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - offsetY))
        };
        localStorage.setItem('global-floating-dot-v2-position', JSON.stringify(currentPosition));
      }
      
      setIsDragging(false);
      setHasDragged(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dragStartPos, hasDragged]);

  // Load wheels and chakras data when component opens
  useEffect(() => {
    if (isOpen && !loadingData) {
      loadWheelsAndChakras();
    }
  }, [isOpen]);

  // Reset form when content type changes
  useEffect(() => {
    setFormData({
      summary: '',
      anchor: '',
      pulse: '',
      wheelId: '',
      dotChakraId: '',
      heading: '',
      goals: '',
      timeline: '',
      category: '',
      chakraId: '',
      purpose: ''
    });
  }, [contentType]);

  // Update capture mode when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedSettings = localStorage.getItem('dotspark-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setCaptureMode(settings.captureMode ?? 'hybrid');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadWheelsAndChakras = async () => {
    setLoadingData(true);
    try {
      const [wheelsResponse, chakrasResponse] = await Promise.all([
        fetch('/api/user-content/wheels', {
          headers: { 'x-user-id': '5' },
          credentials: 'include'
        }),
        fetch('/api/user-content/chakras', {
          headers: { 'x-user-id': '5' },
          credentials: 'include'
        })
      ]);

      if (wheelsResponse.ok) {
        const wheelsData = await wheelsResponse.json();
        setWheels(wheelsData.map((w: any) => ({ id: w.id, heading: w.heading })));
      }

      if (chakrasResponse.ok) {
        const chakrasData = await chakrasResponse.json();
        setChakras(chakrasData.map((c: any) => ({ id: c.id, heading: c.heading })));
      }
    } catch (error) {
      console.error('Error loading wheels and chakras:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Base payload for all content types
      let payload: any = {
        userId: 5,
        captureMode: 'natural',
        sourceType: 'text'
      };

      if (contentType === 'dot') {
        payload = {
          ...payload,
          summary: formData.summary,
          anchor: formData.anchor,
          pulse: formData.pulse,
          wheelId: formData.wheelId ? parseInt(formData.wheelId) : null,
          chakraId: formData.dotChakraId ? parseInt(formData.dotChakraId) : null
        };
      } else if (contentType === 'wheel') {
        payload = {
          ...payload,
          heading: formData.heading,
          goals: formData.goals,
          timeline: formData.timeline,
          category: formData.category,
          chakraId: formData.chakraId ? parseInt(formData.chakraId) : null
        };
      } else if (contentType === 'chakra') {
        payload = {
          ...payload,
          heading: formData.heading,
          purpose: formData.purpose,
          timeline: formData.timeline
        };
      }

      const response = await fetch(`/api/user-content/${contentType}s`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '5'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Created!`,
          description: `Your ${contentType} has been successfully created.`
        });

        // Reset form and close
        setFormData({
          summary: '',
          anchor: '',
          pulse: '',
          wheelId: '',
          dotChakraId: '',
          heading: '',
          goals: '',
          timeline: '',
          category: '',
          chakraId: '',
          purpose: ''
        });
        
        // Invalidate all content caches to refresh the grid
        const { queryClient } = await import('@/lib/queryClient');
        queryClient.invalidateQueries({ queryKey: ['/api/user-content/dots'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user-content/wheels'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user-content/chakras'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user-content/stats'] });
        
        // Reload data for next time
        loadWheelsAndChakras();
        setIsOpen(false);
      } else {
        throw new Error('Failed to create content');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: 'Error',
        description: 'Failed to create content. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const emotions = ['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'];
  const categories = ['Personal', 'Professional', 'Health', 'Finance', 'Learning', 'Business'];

  if (!isOpen) {
    return (
      <div
        ref={dotRef}
        className="fixed z-[9999] select-none touch-none"
        style={{ 
          left: position.x, 
          top: position.y,
          pointerEvents: 'auto'
        }}
      >
        <div 
          className="relative cursor-move"
          onMouseDown={handleMouseDown}
        >
          {/* Brand-aligned pulsing rings that enhance the logo's dot concept */}
          {!isDragging && (
            <>
              <div className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-25 animate-ping pointer-events-none"></div>
              <div className="absolute inset-1 w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-500 opacity-35 animate-ping pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
              <div className="absolute inset-2 w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 opacity-45 animate-ping pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
              <div className="absolute inset-3 w-8 h-8 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 opacity-55 animate-ping pointer-events-none" style={{ animationDelay: '1.2s' }}></div>
            </>
          )}
          
          {/* DotSpark logo as the floating dot itself - slightly larger size */}
          <Button
            className="w-14 h-14 rounded-full bg-transparent p-0 border-0 hover:bg-transparent relative"
            onClick={(e) => {
              if (!hasDragged && !isDragging) {
                e.preventDefault();
                e.stopPropagation();
                setIsSpinning(true);
                setTimeout(() => {
                  setIsOpen(true);
                  setIsSpinning(false);
                }, 600);
              }
            }}
          >
            <img 
              src="/dotspark-logo-transparent.png?v=1" 
              alt="DotSpark" 
              className={cn(
                "w-14 h-14 transition-all duration-300",
                isDragging ? "" : "animate-pulse drop-shadow-lg",
                isSpinning ? "animate-spin" : ""
              )} 
              style={{ 
                animationDelay: isDragging ? '0s' : '0.3s',
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 1)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.6))'
              }}
            />
            
            {/* Brand-aligned sparking effects that highlight the logo's spark element */}
            {!isDragging && (
              <>
                <div className="absolute inset-0 w-14 h-14 animate-ping opacity-30" style={{ animationDelay: '0.2s' }}>
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-white to-yellow-200 opacity-80"></div>
                </div>
                <div className="absolute inset-0 w-14 h-14 animate-ping opacity-25" style={{ animationDelay: '0.7s' }}>
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 opacity-90"></div>
                </div>
              </>
            )}
            
            
            {/* Fast spinning wheel/chakra effect when dragging */}
            {isDragging && (
              <>
                {/* Outer wheel with fast spinning spokes */}
                <div className="absolute inset-0 w-14 h-14 rounded-full animate-spin" style={{ animationDuration: '0.6s' }}>
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-400 opacity-80"></div>
                  {/* Wheel spokes - 8 energy points */}
                  <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1.5 animate-pulse"></div>
                  <div className="absolute top-1/4 right-0 w-1.5 h-1.5 bg-yellow-300 rounded-full transform translate-x-1.5 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-amber-300 rounded-full transform translate-x-1.5 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute bottom-1/4 right-0 w-1.5 h-1.5 bg-orange-300 rounded-full transform translate-x-1.5 translate-y-1/2 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-red-300 rounded-full transform -translate-x-1/2 translate-y-1.5 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <div className="absolute bottom-1/4 left-0 w-1.5 h-1.5 bg-orange-300 rounded-full transform -translate-x-1.5 translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-amber-300 rounded-full transform -translate-x-1.5 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  <div className="absolute top-1/4 left-0 w-1.5 h-1.5 bg-yellow-300 rounded-full transform -translate-x-1.5 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
                </div>
                
                {/* Middle wheel spinning super fast in reverse */}
                <div className="absolute inset-2 w-10 h-10 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.4s' }}>
                  <div className="w-full h-full rounded-full border border-dashed border-yellow-400 opacity-70"></div>
                  {/* Inner energy points */}
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full transform -translate-x-1/2 animate-pulse"></div>
                  <div className="absolute right-0 top-1/2 w-1 h-1 bg-yellow-200 rounded-full transform -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                  <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-amber-200 rounded-full transform -translate-x-1/2 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute left-0 top-1/2 w-1 h-1 bg-orange-200 rounded-full transform -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.45s' }}></div>
                </div>
                
                {/* Core chakra with ultra fast spin */}
                <div className="absolute inset-3 w-8 h-8 rounded-full animate-spin" style={{ animationDuration: '0.2s' }}>
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-white via-yellow-100 to-amber-100 opacity-30"></div>
                  <div className="absolute top-1 left-1/2 w-0.5 h-0.5 bg-white rounded-full transform -translate-x-1/2"></div>
                  <div className="absolute bottom-1 left-1/2 w-0.5 h-0.5 bg-amber-300 rounded-full transform -translate-x-1/2"></div>
                </div>
              </>
            )}
          </Button>
          
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={() => setIsOpen(false)} />
      
      <div
        ref={dotRef}
        className="fixed z-[9999]"
        style={{ 
          left: Math.max(20, Math.min(position.x, window.innerWidth - 420)),
          top: Math.max(20, Math.min(position.y, window.innerHeight - 500)),
          pointerEvents: 'auto'
        }}
      >
        <Card className="w-96 bg-white border-2 border-amber-300 shadow-2xl cursor-move">
          <div className="p-6">
            <div 
              className="flex justify-between items-center mb-4"
              onMouseDown={handleMouseDown}
            >
              <div className="flex-1 cursor-move">
                <div className="text-xs text-gray-400">Drag to move</div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Simple working form */}
              <div className="space-y-4">
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setContentType('dot')}
                    className={`p-2 rounded text-xs font-medium ${
                      contentType === 'dot' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dot
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('wheel')}
                    className={`p-2 rounded text-xs font-medium ${
                      contentType === 'wheel' 
                        ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Wheel
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('chakra')}
                    className={`p-2 rounded text-xs font-medium ${
                      contentType === 'chakra' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Chakra
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {contentType === 'dot' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-amber-700 block mb-1">Summary *</label>
                        <textarea
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          placeholder="What's your thought?"
                          className="w-full p-2 text-sm border border-amber-200 rounded resize-none"
                          rows={2}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-amber-700 block mb-1">Anchor *</label>
                        <input
                          type="text"
                          value={formData.anchor}
                          onChange={(e) => setFormData({ ...formData, anchor: e.target.value })}
                          placeholder="What's the context that helps you recall?"
                          className="w-full p-2 text-sm border border-amber-200 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-amber-700 block mb-1">What's the emotion associated with your thought? *</label>
                        <div className="space-y-2">
                          {/* Emotion buttons */}
                          <div className="grid grid-cols-3 gap-1">
                            {emotions.map((emotion) => (
                              <button
                                key={emotion}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, pulse: emotion });
                                  setCustomEmotion('');
                                }}
                                className={`p-1.5 text-xs rounded border transition-all ${
                                  formData.pulse === emotion
                                    ? 'bg-amber-100 border-amber-300 text-amber-800 font-medium'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                              </button>
                            ))}
                          </div>
                          
                          {/* Custom emotion input */}
                          <div>
                            <input
                              type="text"
                              value={customEmotion}
                              onChange={(e) => {
                                setCustomEmotion(e.target.value);
                                if (e.target.value.trim()) {
                                  setFormData({ ...formData, pulse: e.target.value.trim() });
                                }
                              }}
                              placeholder="Or type your own..."
                              className="w-full p-1.5 text-xs border border-amber-200 rounded"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Optional wheel selection */}
                      <div>
                        <label className="text-xs font-medium text-amber-700 block mb-1">Which wheel does this belong to?</label>
                        <select
                          value={formData.wheelId}
                          onChange={(e) => setFormData({ ...formData, wheelId: e.target.value })}
                          className="w-full p-2 text-sm border border-amber-200 rounded"
                        >
                          <option value="">Select wheel (optional)</option>
                          {wheels.map((wheel) => (
                            <option key={wheel.id} value={wheel.id}>
                              {wheel.heading}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Optional direct chakra mapping */}
                      <div>
                        <label className="text-xs font-medium text-purple-700 block mb-1">Link directly to a Chakra</label>
                        <select
                          value={formData.dotChakraId}
                          onChange={(e) => setFormData({ ...formData, dotChakraId: e.target.value })}
                          className="w-full p-2 text-sm border border-purple-200 rounded"
                        >
                          <option value="">Select chakra (optional)</option>
                          {chakras.map((chakra) => (
                            <option key={chakra.id} value={chakra.id}>
                              {chakra.heading}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-purple-600 mt-1">For thoughts aligned with long-term vision</p>
                      </div>
                    </div>
                  )}

                  {contentType === 'wheel' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-orange-700 block mb-1">Heading *</label>
                        <input
                          type="text"
                          value={formData.heading}
                          onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                          placeholder="Wheel name"
                          className="w-full p-2 text-sm border border-orange-200 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-orange-700 block mb-1">Goals *</label>
                        <textarea
                          value={formData.goals}
                          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                          placeholder="Your goals"
                          className="w-full p-2 text-sm border border-orange-200 rounded resize-none"
                          rows={2}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-orange-700 block mb-1">Timeline *</label>
                        <input
                          type="text"
                          value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          placeholder="How long?"
                          className="w-full p-2 text-sm border border-orange-200 rounded"
                          required
                        />
                      </div>
                      
                      {/* Mandatory chakra selection */}
                      <div>
                        <label className="text-xs font-medium text-orange-700 block mb-1">Which chakra does this belong to? *</label>
                        <select
                          value={formData.chakraId}
                          onChange={(e) => setFormData({ ...formData, chakraId: e.target.value })}
                          className="w-full p-2 text-sm border border-orange-200 rounded"
                          required
                        >
                          <option value="">Select chakra or standalone...</option>
                          <option value="standalone">Standalone</option>
                          {chakras.map((chakra) => (
                            <option key={chakra.id} value={chakra.id}>
                              {chakra.heading}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {contentType === 'chakra' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-purple-700 block mb-1">Heading *</label>
                        <input
                          type="text"
                          value={formData.heading}
                          onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                          placeholder="Chakra name"
                          className="w-full p-2 text-sm border border-purple-200 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-purple-700 block mb-1">Purpose *</label>
                        <textarea
                          value={formData.purpose}
                          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                          placeholder="Vision or purpose"
                          className="w-full p-2 text-sm border border-purple-200 rounded resize-none"
                          rows={2}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-purple-700 block mb-1">Timeline *</label>
                        <input
                          type="text"
                          value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          placeholder="Timeline"
                          className="w-full p-2 text-sm border border-purple-200 rounded"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {isLoading ? 'Creating...' : `Create ${contentType}`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export default GlobalFloatingDotV2;