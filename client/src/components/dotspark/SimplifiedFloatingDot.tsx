import { useState } from "react";
import { Plus, X, Sparkles, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type VisibilityMode = 'social' | 'personal';

export default function SimplifiedFloatingDot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Form state
  const [visibility, setVisibility] = useState<VisibilityMode>('social');
  const [heading, setHeading] = useState('');
  const [summary, setSummary] = useState('');
  const [emotion, setEmotion] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create thought mutation
  const createMutation = useMutation({
    mutationFn: async (data: { heading: string; summary: string; emotion?: string; visibility: string }) => {
      return await apiRequest('/api/thoughts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Thought created!",
        description: variables.visibility === 'social' 
          ? "Your thought is now visible in the community"
          : "Saved to your personal MyNeura cloud",
      });
      
      // Invalidate relevant queries
      if (variables.visibility === 'social') {
        queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] });
      }
      
      // Reset form
      setHeading('');
      setSummary('');
      setEmotion('');
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create thought. Please try again.",
        variant: "destructive",
      });
      console.error('Create thought error:', error);
    },
  });

  const handleDotClick = () => {
    if (!isDragging) {
      setIsSpinning(true);
      setTimeout(() => {
        setIsSpinning(false);
        setIsOpen(!isOpen);
      }, 600);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 10);
  };

  useState(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!heading.trim() || !summary.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both heading and thought summary",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      heading: heading.trim(),
      summary: summary.trim(),
      emotion: emotion.trim() || undefined,
      visibility,
    });
  };

  return (
    <>
      {/* Floating Dot Button */}
      <div
        className="fixed z-[9999] cursor-move select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`relative w-20 h-20 cursor-pointer transition-transform duration-300 ${
            isSpinning ? 'animate-spin-slow' : ''
          }`}
          onClick={handleDotClick}
        >
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 opacity-30 animate-pulse" 
               style={{ transform: 'scale(1.2)' }} />
          
          {/* Middle glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 blur-lg opacity-50" />
          
          {/* Main dot */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white via-amber-50 to-orange-50 border-4 border-amber-400 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
            <Plus className="h-8 w-8 text-amber-600" />
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute top-1 right-3 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />
          <div className="absolute bottom-3 left-2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse opacity-60" />
        </div>
      </div>

      {/* Creation Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                <h2 className="text-xl font-bold">Capture Your Thought</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visibility Toggle */}
            <div className="px-6 pt-6">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Visibility
              </Label>
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setVisibility('social')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                    visibility === 'social'
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Social
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('personal')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                    visibility === 'personal'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <User className="h-4 w-4" />
                  Personal
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {visibility === 'social' 
                  ? 'Visible to all users in the community cloud' 
                  : 'Private to your MyNeura cloud only'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              {/* Heading */}
              <div>
                <Label htmlFor="heading" className="text-sm font-semibold text-gray-700">
                  Heading *
                </Label>
                <Input
                  id="heading"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="What's the main idea?"
                  className="mt-2 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{heading.length}/100</p>
              </div>

              {/* Summary */}
              <div>
                <Label htmlFor="summary" className="text-sm font-semibold text-gray-700">
                  Thought Summary *
                </Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Elaborate on your thought..."
                  className="mt-2 border-amber-200 focus:border-amber-400 focus:ring-amber-400 min-h-[120px]"
                  maxLength={500}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{summary.length}/500</p>
              </div>

              {/* Emotion (Optional) */}
              <div>
                <Label htmlFor="emotion" className="text-sm font-semibold text-gray-700">
                  Emotion (Optional)
                </Label>
                <Select value={emotion} onValueChange={setEmotion}>
                  <SelectTrigger className="mt-2 border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                    <SelectValue placeholder="Select an emotion..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joy">😊 Joy</SelectItem>
                    <SelectItem value="curiosity">🤔 Curiosity</SelectItem>
                    <SelectItem value="excitement">🎉 Excitement</SelectItem>
                    <SelectItem value="calm">😌 Calm</SelectItem>
                    <SelectItem value="frustration">😤 Frustration</SelectItem>
                    <SelectItem value="confusion">😕 Confusion</SelectItem>
                    <SelectItem value="inspiration">✨ Inspiration</SelectItem>
                    <SelectItem value="gratitude">🙏 Gratitude</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Thought'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 0.6s linear;
        }
      `}</style>
    </>
  );
}
