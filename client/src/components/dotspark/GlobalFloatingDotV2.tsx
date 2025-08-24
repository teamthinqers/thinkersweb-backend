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
  summary: string;
  anchor: string;
  pulse: string;
  wheelId: string;
  name: string;
  heading: string;
  goals: string;
  timeline: string;
  category: string;
  chakraId: string;
  lifePurpose: string;
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
    name: '',
    heading: '',
    goals: '',
    timeline: '',
    category: '',
    chakraId: '',
    lifePurpose: ''
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

  // Reset form when content type changes
  useEffect(() => {
    setFormData({
      summary: '',
      anchor: '',
      pulse: '',
      wheelId: '',
      name: '',
      heading: '',
      goals: '',
      timeline: '',
      category: '',
      chakraId: '',
      lifePurpose: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captureMode === 'ai') return; // AI mode doesn't submit yet

    setIsLoading(true);

    try {
      const endpoint = contentType === 'dot' ? '/api/user-content/dots' : 
                     contentType === 'wheel' ? '/api/user-content/wheels' : 
                     '/api/user-content/chakras';

      let payload: any = {
        captureMode: 'natural',
        sourceType: 'text'
      };

      if (contentType === 'dot') {
        payload = {
          ...payload,
          summary: formData.summary,
          anchor: formData.anchor,
          pulse: formData.pulse,
          wheelId: formData.wheelId || undefined
        };
      } else if (contentType === 'wheel') {
        payload = {
          ...payload,
          name: formData.name,
          heading: formData.heading || formData.name,
          goals: formData.goals || '',
          timeline: formData.timeline || '',
          category: formData.category,
          chakraId: contentType === 'wheel' && formData.chakraId ? formData.chakraId : null
        };
      } else if (contentType === 'chakra') {
        payload = {
          ...payload,
          name: formData.name,
          heading: formData.heading || formData.name,
          lifePurpose: formData.lifePurpose || '',
          category: formData.category
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '5'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
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
          name: '',
          heading: '',
          goals: '',
          timeline: '',
          category: '',
          chakraId: '',
          lifePurpose: ''
        });
        setIsOpen(false);
      } else {
        throw new Error('Failed to create content');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create ${contentType}. Please try again.`,
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
        style={{ left: position.x, top: position.y }}
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
                e.stopPropagation();
                setIsSpinning(true);
                setTimeout(() => {
                  setIsOpen(true);
                  setIsSpinning(false);
                }, 600);
              }
            }}
            className={cn(
              "w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl p-0 cursor-move",
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
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dotRef}
      className="fixed z-[9999]"
      style={{ left: position.x, top: position.y }}
    >
      <Card className={`w-96 bg-white/95 backdrop-blur-sm border border-amber-200 shadow-xl ${isMinimized ? 'h-auto' : ''}`}>
        <CardHeader className="pb-2 drag-handle cursor-move" onMouseDown={handleMouseDown}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Global Content Creator
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-100"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-100"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-4">
            {/* Capture Mode Toggle Button */}
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                {captureMode === 'natural' ? (
                  <>
                    <Mic className="w-4 h-4 text-orange-600" />
                    <Type className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Natural Mode</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">AI Mode</span>
                  </>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCaptureMode(captureMode === 'natural' ? 'ai' : 'natural')}
                className="h-8 px-3 bg-white/50 hover:bg-white/80 border-amber-300 text-amber-700 hover:text-amber-800"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Flip
              </Button>
            </div>

            {captureMode === 'natural' ? (
              /* Natural Mode - Show creation buttons like v1 */
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-700 text-center">Choose what to create:</p>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setContentType('dot')}
                    className={`w-full h-12 justify-start gap-3 ${
                      contentType === 'dot' 
                        ? 'bg-amber-100 border-amber-300 text-amber-800' 
                        : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Create Dot</div>
                      <div className="text-xs opacity-80">Capture a single insight</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setContentType('wheel')}
                    className={`w-full h-12 justify-start gap-3 ${
                      contentType === 'wheel' 
                        ? 'bg-orange-100 border-orange-300 text-orange-800' 
                        : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50'
                    }`}
                  >
                    <Target className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Create Wheel</div>
                      <div className="text-xs opacity-80">Set goals and organize dots</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setContentType('chakra')}
                    className={`w-full h-12 justify-start gap-3 ${
                      contentType === 'chakra' 
                        ? 'bg-purple-100 border-purple-300 text-purple-800' 
                        : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Create Chakra</div>
                      <div className="text-xs opacity-80">Define life purpose areas</div>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              /* AI Mode - Keep tabs for future AI integration */
              <Tabs value={contentType} onValueChange={(value) => setContentType(value as 'dot' | 'wheel' | 'chakra')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dot" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Dot
                  </TabsTrigger>
                  <TabsTrigger value="wheel" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Wheel
                  </TabsTrigger>
                  <TabsTrigger value="chakra" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Chakra
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {captureMode === 'ai' ? (
                /* AI Mode - Show dummy buttons */
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium text-center">AI Assistance Mode</p>
                  <p className="text-xs text-blue-600 text-center mb-4">AI interaction options coming soon...</p>
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                      disabled
                    >
                      <BrainCircuit className="w-4 h-4 mr-2" />
                      Start AI Conversation (Coming Soon)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                      disabled
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI-Assisted Creation (Coming Soon)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                      disabled
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Smart Suggestions (Coming Soon)
                    </Button>
                  </div>
                  
                  <div className="text-center pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCaptureMode('natural')}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Switch to Natural Mode for manual entry
                    </Button>
                  </div>
                </div>
              ) : (
                /* Natural Mode - Show form fields based on selected content type */
                <>
                  {contentType === 'dot' && (
                    /* Dot Fields */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-amber-700">Summary *</label>
                        <Textarea
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          placeholder="What's your key insight?"
                          className="min-h-[60px] resize-none border-amber-200 focus:border-amber-400"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-amber-700">Anchor (Context)</label>
                        <Input
                          value={formData.anchor}
                          onChange={(e) => setFormData({ ...formData, anchor: e.target.value })}
                          placeholder="Where does this connect?"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-amber-700">Pulse (Emotion) *</label>
                        <Select
                          value={formData.pulse}
                          onValueChange={(value) => setFormData({ ...formData, pulse: value })}
                        >
                          <SelectTrigger className="border-amber-200 focus:border-amber-400">
                            <SelectValue placeholder="How do you feel?" />
                          </SelectTrigger>
                          <SelectContent>
                            {emotions.map((emotion) => (
                              <SelectItem key={emotion} value={emotion}>
                                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-amber-700">Wheel ID (Optional)</label>
                        <Input
                          value={formData.wheelId}
                          onChange={(e) => setFormData({ ...formData, wheelId: e.target.value })}
                          placeholder="Connect to a wheel (optional)"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'wheel' && (
                    /* Wheel Fields */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-700">Name *</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Wheel name"
                          className="border-orange-200 focus:border-orange-400"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-700">Heading</label>
                        <Input
                          value={formData.heading}
                          onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                          placeholder="Brief heading"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-700">Goals</label>
                        <Textarea
                          value={formData.goals}
                          onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                          placeholder="What are your goals?"
                          className="min-h-[60px] resize-none border-orange-200 focus:border-orange-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-700">Timeline</label>
                        <Input
                          value={formData.timeline}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                          placeholder="How long will this take?"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-700">Category</label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="border-orange-200 focus:border-orange-400">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-orange-700">Chakra ID (Optional)</label>
                        <Input
                          value={formData.chakraId}
                          onChange={(e) => setFormData({ ...formData, chakraId: e.target.value })}
                          placeholder="Connect to a chakra (optional)"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'chakra' && (
                    /* Chakra Fields */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-700">Name *</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Chakra name"
                          className="border-purple-200 focus:border-purple-400"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-700">Heading</label>
                        <Input
                          value={formData.heading}
                          onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                          placeholder="Brief heading"
                          className="border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-700">Life Purpose</label>
                        <Textarea
                          value={formData.lifePurpose}
                          onChange={(e) => setFormData({ ...formData, lifePurpose: e.target.value })}
                          placeholder="What's your life purpose in this area?"
                          className="min-h-[60px] resize-none border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-purple-700">Category</label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="border-purple-200 focus:border-purple-400">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Submit Button - Show only in natural mode */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default GlobalFloatingDotV2;