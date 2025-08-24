import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Save, Minimize2, Maximize2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface DashboardFloatingDotProps {
  onDotCreated?: () => void;
}

export const DashboardFloatingDot: React.FC<DashboardFloatingDotProps> = ({ onDotCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [formData, setFormData] = useState({
    summary: '',
    anchor: '',
    pulse: '',
    wheelId: ''
  });

  const dotRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create dot mutation
  const createDotMutation = useMutation({
    mutationFn: async (dotData: any) => {
      console.log('🔄 Dashboard Floating Dot: Creating dot with data:', dotData);
      
      const response = await fetch('/api/user-content/dots', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dotData)
      });
      
      console.log('📊 Dashboard Floating Dot: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dashboard Floating Dot: Failed to create dot:', errorText);
        throw new Error(`Failed to create dot: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Dashboard Floating Dot: Dot created successfully:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('✅ Dashboard Floating Dot: Creation mutation succeeded:', result);
      
      toast({
        title: 'Success!',
        description: 'Dot created successfully from dashboard.'
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/user-content/dots'],
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
        wheelId: ''
      });
      
      // Close the floating dot
      setIsOpen(false);
      setIsMinimized(false);
      
      // Call callback
      onDotCreated?.();
      
      console.log('🔄 Dashboard Floating Dot: Cache invalidated and form reset');
    },
    onError: (error) => {
      console.error('❌ Dashboard Floating Dot: Creation failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create dot',
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
    
    if (!formData.summary.trim() || !formData.pulse.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Summary and pulse are required.',
        variant: 'destructive'
      });
      return;
    }

    createDotMutation.mutate({
      summary: formData.summary,
      anchor: formData.anchor || '',
      pulse: formData.pulse,
      wheelId: formData.wheelId || null,
      sourceType: 'text',
      captureMode: 'natural'
    });
  };

  const emotions = ['excited', 'curious', 'focused', 'happy', 'calm', 'inspired', 'confident', 'grateful', 'motivated'];

  if (!isOpen) {
    return (
      <div
        ref={dotRef}
        className="fixed z-50 cursor-pointer"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg border-2 border-white/20 backdrop-blur-sm"
          size="sm"
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={dotRef}
      className="fixed z-50"
      style={{ left: position.x, top: position.y }}
    >
      <Card className={`w-96 bg-white/95 backdrop-blur-sm border border-orange-200 shadow-xl ${isMinimized ? 'h-auto' : ''}`}>
        <CardHeader className="pb-2 drag-handle cursor-move" onMouseDown={handleMouseDown}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-orange-800">
              📍 Dashboard Dot Creator
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-orange-600 hover:bg-orange-100"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Summary Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-700">
                  Summary *
                </label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="What's your key insight?"
                  className="min-h-[60px] resize-none border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              {/* Anchor Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-700">
                  Anchor (Context)
                </label>
                <Input
                  value={formData.anchor}
                  onChange={(e) => setFormData({ ...formData, anchor: e.target.value })}
                  placeholder="Where does this connect?"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              {/* Pulse Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-700">
                  Pulse (Emotion) *
                </label>
                <Select
                  value={formData.pulse}
                  onValueChange={(value) => setFormData({ ...formData, pulse: value })}
                >
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
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

              {/* Wheel ID Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-700">
                  Wheel ID (Optional)
                </label>
                <Input
                  value={formData.wheelId}
                  onChange={(e) => setFormData({ ...formData, wheelId: e.target.value })}
                  placeholder="Connect to a wheel (optional)"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createDotMutation.isPending}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                {createDotMutation.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Dot to Grid
                  </>
                )}
              </Button>
            </form>

            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              🧪 Dashboard Test: This is a duplicate floating dot to test saving functionality in user mode.
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DashboardFloatingDot;