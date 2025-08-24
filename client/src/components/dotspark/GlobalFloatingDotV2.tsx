import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Save, Minimize2, Maximize2, Sparkles, Target, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

interface GlobalFloatingDotV2Props {
  // No authentication dependencies - works on all pages
}

export const GlobalFloatingDotV2: React.FC<GlobalFloatingDotV2Props> = () => {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('global-floating-dot-v2-position');
    return saved ? JSON.parse(saved) : { x: 20, y: 100 };
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [contentType, setContentType] = useState<'dot' | 'wheel' | 'chakra'>('dot');
  
  // Form data for all content types
  const [formData, setFormData] = useState({
    // Dot fields
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: '',
    // Wheel/Chakra fields  
    name: '',
    heading: '',
    goals: '',
    timeline: '',
    category: 'Personal',
    chakraId: ''
  });

  const dotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Save position when changed
  useEffect(() => {
    localStorage.setItem('global-floating-dot-v2-position', JSON.stringify(position));
  }, [position]);

  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = contentType === 'dot' ? '/api/user-content/dots' : '/api/user-content/wheels';
      
      console.log(`🔄 GlobalFloatingDotV2: Creating ${contentType} with data:`, data);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      console.log(`📊 GlobalFloatingDotV2: Response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ GlobalFloatingDotV2: Failed to create ${contentType}:`, errorText);
        throw new Error(`Failed to create ${contentType}: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`✅ GlobalFloatingDotV2: ${contentType} created successfully:`, result);
      return result;
    },
    onSuccess: (result) => {
      console.log(`✅ GlobalFloatingDotV2: Creation mutation succeeded:`, result);
      
      toast({
        title: 'Success!',
        description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} created successfully.`
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/dots'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/wheels'],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/stats'],
        exact: false 
      });
      
      // Reset form
      setFormData({
        summary: '',
        anchor: '',
        pulse: '',
        wheelId: '',
        name: '',
        heading: '',
        goals: '',
        timeline: '',
        category: 'Personal',
        chakraId: ''
      });
      
      // Close the floating dot
      setIsOpen(false);
      setIsMinimized(false);
      
      console.log('🔄 GlobalFloatingDotV2: Cache invalidated and form reset');
    },
    onError: (error) => {
      console.error('❌ GlobalFloatingDotV2: Creation failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create content',
        variant: 'destructive'
      });
    }
  });

  // Handle drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      const rect = dotRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contentType === 'dot') {
      if (!formData.summary.trim() || !formData.pulse.trim()) {
        toast({
          title: 'Missing Fields',
          description: 'Summary and pulse are required.',
          variant: 'destructive'
        });
        return;
      }

      createContentMutation.mutate({
        summary: formData.summary,
        anchor: formData.anchor || '',
        pulse: formData.pulse,
        wheelId: formData.wheelId || null,
        sourceType: 'text',
        captureMode: 'natural'
      });
    } else {
      if (!formData.name.trim()) {
        toast({
          title: 'Missing Fields',
          description: 'Name is required.',
          variant: 'destructive'
        });
        return;
      }

      createContentMutation.mutate({
        name: formData.name,
        heading: formData.heading || formData.name,
        goals: formData.goals || '',
        timeline: formData.timeline || '',
        category: formData.category,
        chakraId: contentType === 'wheel' && formData.chakraId ? formData.chakraId : null
      });
    }
  };

  const emotions = ['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'];
  const categories = ['Personal', 'Professional', 'Health', 'Finance', 'Learning', 'Business'];

  if (!isOpen) {
    return (
      <div
        ref={dotRef}
        className="fixed z-[9999] select-none touch-none cursor-pointer"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <div className="relative">
          {/* Enhanced pulsing rings - preserving original visual design */}
          {!isDragging && (
            <>
              <div className="absolute inset-0 w-12 h-12 rounded-full bg-amber-500/40 animate-ping"></div>
              <div className="absolute inset-1 w-10 h-10 rounded-full bg-orange-500/50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-2 w-8 h-8 rounded-full bg-yellow-500/60 animate-ping" style={{ animationDelay: '1s' }}></div>
            </>
          )}
          
          {/* Main dot with original gradient and styling */}
          <Button
            onClick={() => setIsOpen(true)}
            className={cn(
              "w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl p-0",
              isDragging 
                ? "shadow-2xl ring-4 ring-amber-300/50 scale-110" 
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
            {/* Content Type Selection */}
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

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <TabsContent value="dot" className="space-y-4">
                  {/* Dot Fields */}
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
                </TabsContent>

                <TabsContent value="wheel" className="space-y-4">
                  {/* Wheel Fields */}
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
                        <SelectValue />
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
                </TabsContent>

                <TabsContent value="chakra" className="space-y-4">
                  {/* Chakra Fields (same as wheel but without chakraId) */}
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
                    <label className="text-sm font-medium text-purple-700">Goals</label>
                    <Textarea
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      placeholder="What is your life purpose?"
                      className="min-h-[60px] resize-none border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-purple-700">Timeline</label>
                    <Input
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      placeholder="Lifetime journey timeframe"
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-purple-700">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="border-purple-200 focus:border-purple-400">
                        <SelectValue />
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
                </TabsContent>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={createContentMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {createContentMutation.isPending ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save {contentType.charAt(0).toUpperCase() + contentType.slice(1)} to Grid
                    </>
                  )}
                </Button>
              </form>
            </Tabs>

            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              🌟 Global Content Creator V2: Works on all pages, creates dots/wheels/chakras in natural mode.
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default GlobalFloatingDotV2;