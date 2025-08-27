import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Type, X, Volume2, Trash2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

interface Dot {
  id: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId: string;
  timestamp: Date;
  sourceType: 'voice' | 'text';
  voiceData?: {
    summaryVoiceUrl?: string;
    anchorVoiceUrl?: string;
    pulseVoiceUrl?: string;
  } | null;
}

interface DotFullViewProps {
  dot: Dot;
  onClose: () => void;
  onDelete?: (dotId: string) => void;
  onWheelClick?: (wheel: any) => void;
}

// Associated Wheel Component
const AssociatedWheel: React.FC<{
  wheelId: string;
  onWheelClick?: (wheel: any) => void;
}> = ({ wheelId, onWheelClick }) => {
  const { data: allWheels } = useQuery({
    queryKey: ['/api/user-content/wheels'],
    queryFn: async () => {
      const response = await fetch('/api/user-content/wheels', { credentials: 'include' });
      if (!response.ok) return [];
      return response.json();
    }
  });

  const associatedWheel = allWheels?.find((wheel: any) => 
    wheel.id && (wheel.id == wheelId || wheel.id === String(wheelId))
  );

  if (!associatedWheel) return null;

  return (
    <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/60 rounded-xl border-2 border-orange-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-amber-700 flex items-center justify-center">
          <Target className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-orange-800">
          Associated Wheel
        </h3>
      </div>
      <div className="pl-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWheelClick?.(associatedWheel)}
          className="bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800 text-sm"
        >
          <Target className="w-4 h-4 mr-2" />
          {associatedWheel.heading || associatedWheel.name || 'Wheel'}
        </Button>
      </div>
    </div>
  );
};

const DotFullView: React.FC<DotFullViewProps> = ({ dot, onClose, onDelete, onWheelClick }) => {
  const { toast } = useToast();

  const handlePlayVoice = (audioUrl: string, layer: string) => {
    if (!audioUrl) {
      toast({
        title: "Audio not available",
        description: `No voice recording found for ${layer} layer.`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Create audio element and play
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Playback failed",
          description: "Unable to play the voice recording. The audio file may be unavailable.",
          variant: "destructive"
        });
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
      toast({
        title: "Audio error",
        description: "Failed to load the voice recording.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/user-content/dots/${dot.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete dot');
      }

      toast({
        title: "Dot Deleted",
        description: "Your dot has been successfully deleted.",
      });

      onDelete?.(dot.id);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete dot. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-3xl w-[95vw] h-[90vh] flex flex-col [&>button]:hidden"
        aria-describedby="dot-full-view-description"
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-600 to-orange-700">
                <div className="w-2 h-2 rounded-full bg-white ml-1 mt-1"></div>
              </div>
              Dot Full View
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div id="dot-full-view-description" className="sr-only">
          View complete details of your saved dot including summary, anchor, and pulse layers
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Source Type and Timestamp */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
              {dot.sourceType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : 
               <Type className="h-3 w-3 mr-1" />}
              {dot.sourceType}
            </Badge>
            <span className="text-sm text-gray-500">
              {dot.timestamp instanceof Date ? dot.timestamp.toLocaleString() : new Date(dot.timestamp).toLocaleString()}
            </span>
          </div>

          {/* Layer 1: Dot Summary */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                1
              </span>
              <h3 className="font-semibold text-amber-800">Dot Summary</h3>
              <span className="text-xs text-amber-600">({dot.summary.length}/220 chars)</span>
              {dot.sourceType === 'voice' && dot.voiceData?.summaryVoiceUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePlayVoice(dot.voiceData!.summaryVoiceUrl!, 'summary');
                  }}
                  className="ml-auto text-amber-600 hover:text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-gray-800 leading-relaxed">{dot.summary}</p>
          </div>

          {/* Layer 2: Anchor */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                2
              </span>
              <h3 className="font-semibold text-blue-800">Memory Anchor</h3>
              <span className="text-xs text-blue-600">({dot.anchor.length}/300 chars)</span>
              {dot.sourceType === 'voice' && dot.voiceData?.anchorVoiceUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePlayVoice(dot.voiceData!.anchorVoiceUrl!, 'anchor');
                  }}
                  className="ml-auto text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-gray-800 leading-relaxed">{dot.anchor}</p>
          </div>

          {/* Layer 3: Pulse */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                3
              </span>
              <h3 className="font-semibold text-purple-800">Pulse (Emotion)</h3>
              {dot.sourceType === 'voice' && dot.voiceData?.pulseVoiceUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePlayVoice(dot.voiceData!.pulseVoiceUrl!, 'pulse');
                  }}
                  className="ml-auto text-purple-600 hover:text-purple-800 hover:bg-purple-100 transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-lg px-4 py-2">
                {dot.pulse}
              </Badge>
            </div>
          </div>

          {/* Associated Wheel Section */}
          {dot.wheelId && (
            <AssociatedWheel 
              wheelId={dot.wheelId} 
              onWheelClick={(wheel) => {
                onClose(); // Close dot view
                onWheelClick?.(wheel); // Use prop callback
              }} 
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DotFullView;