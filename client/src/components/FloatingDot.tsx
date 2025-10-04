import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth-new';
import { useToast } from '@/hooks/use-toast';
import { X, PenTool, Sparkles, Crown, ArrowLeft, Loader2 } from 'lucide-react';
import { SiWhatsapp, SiLinkedin, SiOpenai } from 'react-icons/si';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface FloatingDotProps {
  onClick?: () => void;
}

export default function FloatingDot({ onClick }: FloatingDotProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [targetNeura, setTargetNeura] = useState<'social' | 'myneura'>('social');
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [heading, setHeading] = useState('');
  const [summary, setSummary] = useState('');
  const [emotion, setEmotion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitThought = async () => {
    if (!summary.trim()) {
      toast({
        title: "Missing content",
        description: "Please write your thought before posting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Auto-generate heading from first 50 characters of summary
      const autoHeading = summary.trim().substring(0, 50) + (summary.trim().length > 50 ? '...' : '');
      
      await apiRequest('POST', '/api/thoughts', {
        heading: autoHeading,
        summary: summary.trim(),
        emotion: emotion.trim() || null,
        visibility: targetNeura === 'social' ? 'social' : 'personal',
      });

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['/api/thoughts/myneura'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });

      toast({
        title: "Thought saved!",
        description: targetNeura === 'social' 
          ? "Your thought has been shared to Social Neura." 
          : "Your thought has been saved to My Neura.",
      });

      // Reset form and close dialog
      setHeading('');
      setSummary('');
      setEmotion('');
      setShowWriteForm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating thought:', error);
      toast({
        title: "Error",
        description: "Failed to save your thought. Please try again.",
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
      setPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight / 2
      });
    }
  }, []);

  // Listen for custom event to open the dialog
  useEffect(() => {
    const handleOpenDialog = (e: CustomEvent) => {
      setIsOpen(true);
      if (e.detail?.targetNeura) {
        setTargetNeura(e.detail.targetNeura);
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

  const displayName = (user as any)?.fullName || (user as any)?.displayName || "User";
  const userAvatar = (user as any)?.avatar || (user as any)?.linkedinPhotoUrl || (user as any)?.photoURL;

  return (
    <>
      {/* Floating Dot */}
      <div
        ref={dotRef}
        className="fixed z-50 cursor-move select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <div className="relative cursor-move">
          {/* Brand-aligned pulsing rings that enhance the logo's dot concept - only show when NOT dragging */}
          {!isDragging && (
            <>
              <div className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-25 animate-ping pointer-events-none"></div>
              <div className="absolute inset-1 w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-500 opacity-35 animate-ping pointer-events-none" style={{ animationDelay: '0.4s' }}></div>
              <div className="absolute inset-2 w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 opacity-45 animate-ping pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
              <div className="absolute inset-3 w-8 h-8 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 opacity-55 animate-ping pointer-events-none" style={{ animationDelay: '1.2s' }}></div>
            </>
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
            onClick={() => setIsOpen(false)}
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
                  className="flex items-start justify-between mb-6 cursor-move"
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
                      <p className="text-sm text-gray-500">{targetNeura === 'social' ? 'Share to Social Neura' : 'Save to My Neura'}</p>
                    </div>
                  </div>

                  {/* Right Side: Toggle and Close */}
                  <div className="flex items-center gap-2">
                    {/* Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() => setTargetNeura('social')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                          targetNeura === 'social'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Share to Social Neura
                      </button>
                      <button
                        onClick={() => setTargetNeura('myneura')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                          targetNeura === 'myneura'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Save to My Neura
                      </button>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Conditional Content: Write Form or Action Buttons */}
                {showWriteForm ? (
                  <div className="space-y-4">
                    {/* Header with User Info and Toggle */}
                    <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                      {/* Left: User Info */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={userAvatar} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                            {displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{displayName}</h3>
                          <p className="text-xs text-gray-500">Share your thoughts...</p>
                        </div>
                      </div>

                      {/* Right: Toggle */}
                      <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button
                          onClick={() => setTargetNeura('social')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            targetNeura === 'social'
                              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Social Neura
                        </button>
                        <button
                          onClick={() => setTargetNeura('myneura')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            targetNeura === 'myneura'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          My Neura
                        </button>
                      </div>
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
                        className="min-h-[180px] resize-none border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-gray-500 text-right">{summary.length} characters</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => {
                          setShowWriteForm(false);
                          setSummary('');
                          setHeading('');
                          setEmotion('');
                        }}
                        variant="ghost"
                        disabled={isSubmitting}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>

                      <Button
                        onClick={handleSubmitThought}
                        disabled={isSubmitting || !summary.trim()}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Post Thought
                          </>
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

                    {/* 3. WhatsApp */}
                    <button
                      onClick={() => toast({ title: "Coming Soon", description: "WhatsApp integration will be available soon!" })}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-[#25D366] bg-[#25D366] hover:bg-[#1EBE5B] transition-all group shadow-sm hover:shadow-md"
                    >
                      <SiWhatsapp className="h-6 w-6 text-white" />
                      <span className="text-xs font-semibold text-white">WhatsApp</span>
                    </button>

                    {/* 4. AI Help - Lighter Purple */}
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

                    {/* 5. ChatGPT Import - White bg, Black icon */}
                    <button
                      onClick={() => toast({ title: "Coming Soon", description: "ChatGPT import will be available soon!" })}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 transition-all group shadow-sm hover:shadow-md"
                    >
                      <SiOpenai className="h-6 w-6 text-black" />
                      <span className="text-xs font-semibold text-black">Import</span>
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
