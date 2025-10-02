import { useState, useEffect } from "react";
import { Plus, X, Sparkles, Users, User, Image, Upload, Trash2 } from "lucide-react";
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
import { useAuth } from '@/hooks/use-auth-new';

type VisibilityMode = 'social' | 'personal';

export default function SimplifiedFloatingDot() {
  const { user, isLoading } = useAuth();
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
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create thought mutation
  const createMutation = useMutation({
    mutationFn: async (data: { heading: string; summary: string; emotion?: string; imageUrl?: string; visibility: string }) => {
      const response = await fetch('/api/thoughts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to create thought');
      }
      return response.json();
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
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
      setIsOpen(false);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error && error.message.includes('401')
        ? "Please sign in to create thoughts"
        : "Failed to create thought. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Create thought error:', error);
    },
  });

  // Don't render if user is not authenticated
  if (isLoading) {
    return null; // Don't show anything while checking auth
  }

  if (!user) {
    return null; // Don't show floating dot for unauthenticated users
  }

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

  useEffect(() => {
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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, WebP, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear URL input if file is selected
      setImageUrl('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

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
      imageUrl: imageUrl.trim() || undefined,
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
          className="relative w-14 h-14 cursor-pointer"
          onClick={handleDotClick}
        >
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 opacity-30 animate-pulse" 
               style={{ transform: 'scale(1.4)' }} />
          
          {/* Middle glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 blur-md opacity-40" />
          
          {/* DotSpark Logo */}
          <img 
            src="/dotspark-logo-transparent.png?v=1" 
            alt="DotSpark" 
            className={`w-14 h-14 transition-all duration-300 hover:scale-110 ${
              isSpinning ? 'animate-spin-slow' : ''
            }`}
          />
          
          {/* Sparkle effects */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse opacity-60" />
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

              {/* Image Upload/URL (Optional) */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Add Image (Optional)
                </Label>

                {/* Image Preview */}
                {(imagePreview || imageUrl) && (
                  <div className="relative">
                    <img
                      src={imagePreview || imageUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg border-2 border-amber-200"
                      onError={(e) => { 
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* File Upload Button */}
                {!imagePreview && !imageUrl && (
                  <div className="space-y-2">
                    <label
                      htmlFor="image-file"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">Upload from device</span>
                    </label>
                    <input
                      id="image-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    
                    <div className="relative flex items-center gap-2">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="text-xs text-gray-500">or</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL..."
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      type="url"
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  {imageFile ? `Selected: ${imageFile.name} (${(imageFile.size / 1024).toFixed(1)}KB)` : 'Upload an image or paste a URL'}
                </p>
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
