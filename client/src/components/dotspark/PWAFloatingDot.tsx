import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Type, X, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Position {
  x: number;
  y: number;
}

interface PWAFloatingDotProps {
  isActive: boolean;
}

export function PWAFloatingDot({ isActive }: PWAFloatingDotProps) {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem('pwa-dot-position');
    return saved ? JSON.parse(saved) : { x: 20, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [captureMode, setCaptureMode] = useState<'voice' | 'text' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const { toast } = useToast();

  // Don't render if not active
  if (!isActive) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return;
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isExpanded) return;
    
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y))
    };
    
    setPosition(newPosition);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('pwa-dot-position', JSON.stringify(position));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || isExpanded) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 60, touch.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 60, touch.clientY - dragOffset.y))
    };
    
    setPosition(newPosition);
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('pwa-dot-position', JSON.stringify(position));
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  const handleClick = () => {
    if (!isDragging) {
      setIsExpanded(true);
    }
  };

  const handleModeSelect = (mode: 'voice' | 'text') => {
    setCaptureMode(mode);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const handleSubmit = () => {
    if (!textInput.trim()) {
      toast({
        title: "No content to save",
        description: "Please add some text or use voice recording",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Dot saved!",
      description: "Your insight has been captured",
    });

    // Reset interface
    setTextInput('');
    setCaptureMode(null);
    setIsExpanded(false);
  };

  return (
    <div
      className={cn(
        "fixed z-50 select-none",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {!isExpanded ? (
        /* Collapsed Dot Button */
        <div
          className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 animate-pulse"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label="Open DotSpark thought capture"
        >
          <div className="w-3 h-3 rounded-full bg-white"></div>
        </div>
      ) : (
        /* Expanded Interface - Fixed Position in Screen Center */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <Card className="w-80 bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {!captureMode ? (
                /* Mode Selection */
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
                      Save a Dot
                    </h2>
                    <p className="text-sm text-gray-600">How would you like to capture your Dot?</p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => handleModeSelect('voice')}
                      className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg text-lg font-semibold transition-all duration-200"
                    >
                      <Mic className="w-6 h-6 mr-3" />
                      Voice
                    </Button>
                    <Button
                      onClick={() => handleModeSelect('text')}
                      className="w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg text-lg font-semibold transition-all duration-200"
                    >
                      <Type className="w-6 h-6 mr-3" />
                      Text
                    </Button>
                  </div>
                  
                  {/* Close Button */}
                  <Button
                    onClick={() => setIsExpanded(false)}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Close
                  </Button>
                </div>
            ) : (
              /* Capture Interface */
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setCaptureMode(null)}
                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {captureMode === 'voice' ? 'Voice Capture' : 'Text Capture'}
                  </h3>
                  <div className="w-8"></div>
                </div>

                {captureMode === 'voice' && (
                  <div className="text-center space-y-4">
                    <Button
                      onClick={handleVoiceToggle}
                      className={cn(
                        "w-20 h-20 rounded-full transition-all duration-300 shadow-lg",
                        isRecording 
                          ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                          : "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      )}
                    >
                      {isRecording ? (
                        <MicOff className="w-8 h-8" />
                      ) : (
                        <Mic className="w-8 h-8" />
                      )}
                    </Button>
                    <p className="text-sm text-gray-600">
                      {isRecording ? 'Listening... Tap to stop' : 'Tap to start recording'}
                    </p>
                  </div>
                )}

                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={captureMode === 'voice' 
                    ? "Your speech will appear here..." 
                    : "Type your thoughts and insights..."
                  }
                  className="min-h-[120px] text-base resize-none rounded-xl border-2 border-gray-200 focus:border-amber-400 p-4"
                  readOnly={captureMode === 'voice' && isRecording}
                />

                <Button 
                  onClick={handleSubmit}
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-lg font-semibold shadow-lg"
                  disabled={!textInput.trim()}
                >
                  Save a Dot
                </Button>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}