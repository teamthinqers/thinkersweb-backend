import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth-new';
import { useToast } from '@/hooks/use-toast';
import { X, PenTool, Sparkles, Crown, ArrowLeft, Loader2, ImageIcon, Layers, ArrowDown } from 'lucide-react';
import { SiWhatsapp, SiLinkedin, SiOpenai } from 'react-icons/si';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface FloatingDotProps {
  onClick?: () => void;
  currentPage?: string;
}

export default function FloatingDot({ onClick, currentPage }: FloatingDotProps) {
  // Default position: bottom left corner (accounting for dot size and padding)
  const [position, setPosition] = useState({ 
    x: 40, 
    y: window.innerHeight - 100 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Set default target based on current page
  const getDefaultTarget = () => {
    if (currentPage === '/myneura') return 'myneura';
    if (currentPage === '/social') return 'social';
    return 'social'; // default fallback
  };
  
  const [targetNeura, setTargetNeura] = useState<'social' | 'myneura' | 'circle'>(getDefaultTarget());
  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);
  const [preserveTargetNeura, setPreserveTargetNeura] = useState(false); // Flag to prevent auto-reset when editing from circle
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [showLayersScreen, setShowLayersScreen] = useState(false);
  const [heading, setHeading] = useState('');
  const [summary, setSummary] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [anchor, setAnchor] = useState('');
  const [analogies, setAnalogies] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editThoughtId, setEditThoughtId] = useState<number | null>(null);

  // 10 predefined emotions for quick selection
  const emotionOptions = [
    'Joy', 'Curiosity', 'Excitement', 'Gratitude', 'Peace',
    'Frustration', 'Anxiety', 'Hope', 'Inspiration', 'Reflection'
  ];
  const dotRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's circles using useQuery
  const { data: circlesResponse } = useQuery<{
    success: boolean;
    circles: Array<{
      id: number;
      name: string;
      description?: string;
    }>;
  }>({
    queryKey: ['/api/thinq-circles/my-circles'],
    enabled: !!user,
  });
  
  const userCircles = circlesResponse?.circles || [];

  // Reset all form fields to initial state
  const resetForm = () => {
    setHeading('');
    setSummary('');
    setEmotion('');
    setKeywords('');
    setAnchor('');
    setAnalogies('');
    setShowWriteForm(false);
    setShowLayersScreen(false);
    setEditMode(false);
    setEditThoughtId(null);
    setSelectedCircleId(null);
    setPreserveTargetNeura(false);
  };

  // Update targetNeura when page changes OR when dialog opens
  useEffect(() => {
    if (isOpen && !preserveTargetNeura) {
      // Reset to page default whenever dialog opens (unless preserveTargetNeura is true)
      if (currentPage === '/myneura') {
        setTargetNeura('myneura');
      } else if (currentPage === '/social') {
        setTargetNeura('social');
      } else {
        setTargetNeura('social'); // default fallback
      }
    }
    // Reset the preserve flag after applying
    if (!isOpen) {
      setPreserveTargetNeura(false);
    }
  }, [currentPage, isOpen, preserveTargetNeura]);

  const handleSubmitThought = async () => {
    if (!heading.trim()) {
      toast({
        title: "Missing heading",
        description: "Please add a heading for your thought.",
        variant: "destructive",
      });
      return;
    }

    if (!summary.trim()) {
      toast({
        title: "Missing content",
        description: "Please write your thought before posting.",
        variant: "destructive",
      });
      return;
    }

    if (targetNeura === 'circle' && !selectedCircleId) {
      toast({
        title: "Select a circle",
        description: "Please select a circle to share your thought.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editMode && editThoughtId) {
        // Update existing thought
        await apiRequest('PATCH', `/api/thoughts/${editThoughtId}`, {
          heading: heading.trim(),
          summary: summary.trim(),
          emotions: emotion.trim() || null,
          keywords: keywords.trim() || null,
          anchor: anchor.trim() || null,
          analogies: analogies.trim() || null,
        });

        toast({
          title: "Thought updated!",
          description: "Your changes have been saved.",
        });
      } else if (targetNeura === 'circle' && selectedCircleId) {
        // Create and share to circle
        const thoughtResponse: any = await apiRequest('POST', '/api/thoughts', {
          heading: heading.trim(),
          summary: summary.trim(),
          emotion: emotion.trim() || null,
          visibility: 'personal',
          channel: 'write',
          keywords: keywords.trim() || null,
          anchor: anchor.trim() || null,
          analogies: analogies.trim() || null,
        });

        const thoughtData = await thoughtResponse.json();

        // Share to circle
        await apiRequest('POST', `/api/thinq-circles/${selectedCircleId}/share-thought`, {
          thoughtId: thoughtData.thought.id
        });

        const selectedCircle = userCircles.find((c: any) => c.id === selectedCircleId);
        toast({
          title: "Thought shared!",
          description: `Your thought has been shared to ${selectedCircle?.name || 'the circle'}.`,
        });
      } else {
        // Create new thought (My Neura or Social)
        await apiRequest('POST', '/api/thoughts', {
          heading: heading.trim(),
          summary: summary.trim(),
          emotion: emotion.trim() || null,
          visibility: targetNeura === 'social' ? 'social' : 'personal',
          channel: 'write',
          keywords: keywords.trim() || null,
          anchor: anchor.trim() || null,
          analogies: analogies.trim() || null,
        });

        toast({
          title: "Thought saved!",
          description: targetNeura === 'social' 
            ? "Your thought has been shared to Social Neura." 
            : "Your thought has been saved to My Neura.",
        });
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/thoughts/stats'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/thoughts/neural-strength'] });
      if (selectedCircleId) {
        await queryClient.invalidateQueries({ queryKey: [`/api/thinq-circles/${selectedCircleId}/thoughts`] });
        await queryClient.invalidateQueries({ queryKey: [`/api/thinq-circles/${selectedCircleId}`] });
      }

      // Reset form and close dialog
      resetForm();
      setSelectedCircleId(null);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error creating thought:', error);
      
      let errorMessage = "Failed to save your thought. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        errorMessage = error.errors[0].message || errorMessage;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingDotPosition');
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition);
      setPosition(parsed);
    } else {
      // Default to bottom right corner
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100
      });
    }
  }, []);

  // Listen for custom event to open the dialog
  useEffect(() => {
    const handleOpenDialog = (e: CustomEvent) => {
      setIsOpen(true);
      
      // Check if this is an edit request
      if (e.detail?.thought) {
        const thought = e.detail.thought;
        setEditMode(true);
        setEditThoughtId(thought.id);
        setHeading(thought.heading || '');
        setSummary(thought.summary || '');
        setEmotion(thought.emotions || '');
        setKeywords(thought.keywords || '');
        setAnchor(thought.anchor || '');
        setAnalogies(thought.analogies || '');
        setShowWriteForm(true); // Open directly to write form
      } else {
        // Reset for new thought
        setEditMode(false);
        setEditThoughtId(null);
        setHeading('');
        setSummary('');
        setEmotion('');
        setKeywords('');
        setAnchor('');
        setAnalogies('');
      }
      
      // Handle targetNeura and circleId from event detail
      if (e.detail?.targetNeura) {
        setTargetNeura(e.detail.targetNeura);
        setPreserveTargetNeura(true); // Prevent auto-reset
        
        // If circleId is provided, pre-select it
        if (e.detail?.targetNeura === 'circle' && e.detail?.circleId) {
          setSelectedCircleId(e.detail.circleId);
        }
      }
      // Center the dialog
      setDialogPosition({
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 - 200
      });
    };

    window.addEventListener('openFloatingDot' as any, handleOpenDialog);
    return () => {
      window.removeEventListener('openFloatingDot' as any, handleOpenDialog);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dotRef.current) return;
    
    const rect = dotRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setHasMoved(false);
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setHasMoved(true);
      setIsDragging(true);
      
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      const clampedX = Math.max(0, Math.min(maxX, newX));
      const clampedY = Math.max(0, Math.min(maxY, newY));
      
      setPosition({ x: clampedX, y: clampedY });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      
      if (hasMoved || isDragging) {
        const currentPosition = { 
          x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - offsetX)),
          y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - offsetY))
        };
        localStorage.setItem('floatingDotPosition', JSON.stringify(currentPosition));
      }
      
      setIsDragging(false);
      setTimeout(() => setHasMoved(false), 100);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!hasMoved && !isDragging) {
      setIsOpen(true);
      // Center the dialog
      setDialogPosition({
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 - 200
      });
    }
  };

  const handleDialogMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dialogRef.current) return;
    
    const rect = dialogRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setIsDraggingDialog(true);
      
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      
      const maxX = window.innerWidth - 600;
      const maxY = window.innerHeight - 400;
      
      const clampedX = Math.max(0, Math.min(maxX, newX));
      const clampedY = Math.max(0, Math.min(maxY, newY));
      
      setDialogPosition({ x: clampedX, y: clampedY });
    };
    
    const handleMouseUp = () => {
      setIsDraggingDialog(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const displayName = (user as any)?.fullName || "User";
  const userAvatar = (user as any)?.linkedinPhotoUrl || (user as any)?.avatar;

  return (
    <>
      {/* Floating Dot */}
      <div
        ref={dotRef}
        className={`fixed z-50 select-none ${isDragging ? 'cursor-move' : 'cursor-pointer'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <div className="relative w-14 h-14">
          {/* Arrow Indicator - Points to the floating dot */}
          {!hasMoved && !isDragging && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce">
              <ArrowDown className="h-8 w-8 text-amber-600" strokeWidth={3} />
            </div>
          )}
          
          {/* DotSpark logo - spins fast when dragging, pulses when idle */}
          <img 
            src="/dotspark-logo-transparent.png?v=1" 
            alt="DotSpark" 
            className={`w-14 h-14 transition-all duration-300 ${
              isDragging ? 'animate-spin' : 'animate-pulse drop-shadow-lg'
            }`}
            style={{ 
              animationDuration: isDragging ? '0.15s' : '2s',
              animationDelay: isDragging ? '0s' : '0.3s',
              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))'
            }}
          />
          
          {/* Tooltip on hover - only show when not dragging */}
          {!isDragging && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl group">
              Click to create
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creation Dialog */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={() => {
              resetForm();
              setIsOpen(false);
            }}
          />
          
          {/* Dialog */}
          <div 
            ref={dialogRef}
            className="fixed z-[70] w-full max-w-xl"
            style={{
              left: `${dialogPosition.x}px`,
              top: `${dialogPosition.y}px`,
            }}
          >
            <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 shadow-2xl border-2 border-amber-200">
              <CardContent className="p-6">
                {/* Header - Draggable */}
                <div 
                  className={`flex items-start justify-between mb-6 ${isDraggingDialog ? 'cursor-move' : ''}`}
                  onMouseDown={handleDialogMouseDown}
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={userAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                        {displayName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{displayName}</h3>
                    </div>
                  </div>

                  {/* Right Side: Toggle and Close */}
                  <div className="flex items-center gap-2">
                    {/* Share to Label + Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">Share to</span>
                      <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => setTargetNeura('social')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            targetNeura === 'social'
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Social
                        </button>
                        <button
                          onClick={() => setTargetNeura('myneura')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            targetNeura === 'myneura'
                              ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          My Neura
                        </button>
                        <button
                          onClick={() => setTargetNeura('circle')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            targetNeura === 'circle'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          My Circle
                        </button>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => {
                        resetForm();
                        setIsOpen(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Circle Selector - Show when My Circle is selected */}
                {targetNeura === 'circle' && (
                  <div className="mb-4 p-3 bg-white/60 rounded-lg border border-amber-200">
                    <label className="text-xs font-medium text-gray-700 block mb-2">Select Circle</label>
                    <select
                      value={selectedCircleId || ''}
                      onChange={(e) => setSelectedCircleId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">Choose a circle...</option>
                      {userCircles.map((circle: any) => (
                        <option key={circle.id} value={circle.id}>
                          {circle.name}
                        </option>
                      ))}
                    </select>
                    {userCircles.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">No circles available. Create one first!</p>
                    )}
                  </div>
                )}

                {/* Conditional Content: Write Form, Layers Screen, or Action Buttons */}
                {showWriteForm && !showLayersScreen ? (
                  <div className="space-y-4">
                    {/* Heading Input Section */}
                    <div className="space-y-2">
                      <Label htmlFor="heading" className="text-sm font-medium text-gray-700">
                        Heading <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="heading"
                        value={heading}
                        onChange={(e) => setHeading(e.target.value)}
                        placeholder="Give your thought a heading..."
                        className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Thought/Dot Input Section */}
                    <div className="space-y-2">
                      <Label htmlFor="thought" className="text-sm font-medium text-gray-700">
                        Thought/Dot
                      </Label>
                      <Textarea
                        id="thought"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="What's on your mind?"
                        className="min-h-[150px] resize-none border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 text-right">{summary.length} characters</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            resetForm();
                          }}
                          variant="ghost"
                          disabled={isSubmitting}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>

                        <Button
                          variant="outline"
                          disabled={isSubmitting}
                          className="text-gray-700 hover:text-gray-900"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Media
                        </Button>

                        <Button
                          onClick={() => setShowLayersScreen(true)}
                          variant="outline"
                          disabled={isSubmitting}
                          className="text-gray-700 hover:text-gray-900"
                        >
                          <Layers className="mr-2 h-4 w-4" />
                          Add Layers
                        </Button>
                      </div>

                      <Button
                        onClick={handleSubmitThought}
                        disabled={isSubmitting || !heading.trim() || !summary.trim()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editMode ? 'Updating...' : 'Saving...'}
                          </>
                        ) : (
                          editMode ? 'Update Thought' : 'Post Thought'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : showLayersScreen ? (
                  /* Layers Screen */
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {/* 1. Keywords */}
                      <div className="space-y-2">
                        <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">
                          Keywords
                        </Label>
                        <Input
                          id="keywords"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          placeholder="Enter the Keywords to search for later"
                          className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* 2. Anchor */}
                      <div className="space-y-2">
                        <Label htmlFor="anchor" className="text-sm font-medium text-gray-700">
                          Anchor
                        </Label>
                        <Input
                          id="anchor"
                          value={anchor}
                          onChange={(e) => setAnchor(e.target.value)}
                          placeholder="What context will help you recall this thought later?"
                          className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* 3. Analogies */}
                      <div className="space-y-2">
                        <Label htmlFor="analogies" className="text-sm font-medium text-gray-700">
                          Analogies
                        </Label>
                        <Input
                          id="analogies"
                          value={analogies}
                          onChange={(e) => setAnalogies(e.target.value)}
                          placeholder="What Analogies does this thought remind you of?"
                          className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* 4. Emotions Tag */}
                      <div className="space-y-2">
                        <Label htmlFor="emotion" className="text-sm font-medium text-gray-700">
                          Emotions Tag
                        </Label>
                        <Input
                          id="emotion"
                          value={emotion}
                          onChange={(e) => setEmotion(e.target.value)}
                          placeholder="What emotions are attached with this thought?"
                          className="border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          disabled={isSubmitting}
                        />
                        {/* Emotion Tag Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {emotionOptions.map((emotionOption) => (
                            <Button
                              key={emotionOption}
                              type="button"
                              onClick={() => setEmotion(emotionOption)}
                              variant="outline"
                              size="sm"
                              disabled={isSubmitting}
                              className={`${
                                emotion === emotionOption
                                  ? 'bg-amber-100 border-amber-400 text-amber-800'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {emotionOption}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => setShowLayersScreen(false)}
                        variant="ghost"
                        disabled={isSubmitting}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Thought
                      </Button>

                      <Button
                        onClick={handleSubmitThought}
                        disabled={isSubmitting || !heading.trim() || !summary.trim()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editMode ? 'Updating...' : 'Saving...'}
                          </>
                        ) : (
                          editMode ? 'Update Thought' : 'Post Thought'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons Grid */
                  <div className="grid grid-cols-5 gap-3">
                    {/* 1. Write - Premium with glittering crown */}
                    <button
                      onClick={() => setShowWriteForm(true)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#F59E0B] bg-[#F59E0B] hover:bg-[#D97706] transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="relative">
                        <PenTool className="h-6 w-6 text-white" strokeWidth={2.5} />
                        <Crown className="h-3.5 w-3.5 text-yellow-200 absolute -top-1.5 -right-1 animate-pulse" fill="currentColor" />
                        <Sparkles className="h-2 w-2 text-yellow-100 absolute -top-0.5 -right-0.5 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      </div>
                      <span className="text-xs font-semibold text-white">Write</span>
                    </button>

                    {/* 2. LinkedIn Import */}
                    <button
                      onClick={() => toast({ title: "Coming Soon", description: "LinkedIn import will be available soon!" })}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#0077B5] bg-[#0077B5] hover:bg-[#005885] transition-all group shadow-sm hover:shadow-md"
                    >
                      <SiLinkedin className="h-6 w-6 text-white" />
                      <span className="text-xs font-semibold text-white">Import</span>
                    </button>

                    {/* 3. ChatGPT Import - White bg, Black icon */}
                    <button
                      onClick={() => toast({ title: "Coming Soon", description: "ChatGPT import will be available soon!" })}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-all group shadow-sm hover:shadow-md"
                    >
                      <SiOpenai className="h-6 w-6 text-black" />
                      <span className="text-xs font-semibold text-black">Import</span>
                    </button>

                    {/* 4. WhatsApp */}
                    <button
                      onClick={() => toast({ title: "Coming Soon", description: "WhatsApp integration will be available soon!" })}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#25D366] bg-[#25D366] hover:bg-[#1EBE5B] transition-all group shadow-sm hover:shadow-md"
                    >
                      <SiWhatsapp className="h-6 w-6 text-white" />
                      <span className="text-xs font-semibold text-white">WhatsApp</span>
                    </button>

                    {/* 5. AI Help - Lighter Purple */}
                    <button
                      onClick={() => toast({ title: "Coming Soon", description: "AI assistance will be available soon!" })}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#A855F7] bg-[#A855F7] hover:bg-[#9333EA] transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="relative">
                        <Sparkles className="h-6 w-6 text-white animate-pulse" />
                        <div className="absolute inset-0 bg-purple-300 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      </div>
                      <span className="text-xs font-semibold text-white">AI Help</span>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
