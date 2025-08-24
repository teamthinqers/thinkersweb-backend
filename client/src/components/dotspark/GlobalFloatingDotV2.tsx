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
  
  // Wheel fields  
  heading: string;
  goals: string;
  timeline: string;
  category: string;
  chakraId: string;
  
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
    return saved ? JSON.parse(saved) : { x: 20, y: 100 };
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
          wheelId: formData.wheelId ? parseInt(formData.wheelId) : null
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
          {/* Enhanced pulsing rings - preserving original visual design */}
          {!isDragging && (
            <>
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-500/40 animate-ping pointer-events-none"></div>
              <div className="absolute inset-1 w-10 h-10 rounded-full bg-orange-500/50 animate-ping pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-2 w-8 h-8 rounded-full bg-yellow-500/60 animate-ping pointer-events-none" style={{ animationDelay: '1s' }}></div>
            </>
          )}
          
          {/* Main dot with original gradient and styling */}
          <Button
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
            className={cn(
              "w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl p-0 pointer-events-none",
              isDragging 
                ? "shadow-2xl ring-4 ring-amber-300/50 scale-110" 
                : isSpinning 
                ? "animate-spin scale-110" 
                : "hover:scale-110 animate-pulse"
            )}
          >
            {/* Inner white dot - preserving original design */}
            <div className={cn(
              "w-4 h-4 rounded-full bg-white transition-all duration-300",
              isDragging ? "scale-125" : "animate-pulse"
            )} style={{ animationDelay: isDragging ? '0s' : '0.3s' }} />
            
            {/* Attention-grabbing indicators - preserving original design */}
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
          </Button>
          
          {/* Invisible click area for when button has pointer-events-none */}
          <div 
            className="absolute inset-0 w-12 h-12 rounded-full cursor-pointer"
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
          />
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
        <Card className="w-96 bg-white border-2 border-amber-300 shadow-2xl">
          <div className="p-6">
            <div className="flex justify-end items-center mb-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
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
                          placeholder="What's your insight?"
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
                          placeholder="Context"
                          className="w-full p-2 text-sm border border-amber-200 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-amber-700 block mb-1">Pulse *</label>
                        <select
                          value={formData.pulse}
                          onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                          className="w-full p-2 text-sm border border-amber-200 rounded"
                          required
                        >
                          <option value="">Select emotion</option>
                          {emotions.map((emotion) => (
                            <option key={emotion} value={emotion}>
                              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                            </option>
                          ))}
                        </select>
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
                          placeholder="Life purpose"
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