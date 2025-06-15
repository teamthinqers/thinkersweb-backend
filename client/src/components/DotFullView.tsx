import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic, FileText, Calendar, Volume2, Trash2, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Dot {
  id: number;
  summary: string;
  anchor: string;
  pulse: string;
  sourceType: 'voice' | 'text';
  originalAudioBlob?: string;
  transcriptionText?: string;
  createdAt: string;
}

interface DotFullViewProps {
  dot: Dot;
  onClose: () => void;
}

export function DotFullView({ dot, onClose }: DotFullViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  const playAudio = () => {
    if (dot.originalAudioBlob) {
      try {
        // Convert base64 to blob and play
        const byteCharacters = atob(dot.originalAudioBlob);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/wav' });
        
        const audio = new Audio();
        audio.src = URL.createObjectURL(blob);
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
          toast({
            title: "Audio Playback Error",
            description: "Unable to play the voice recording",
            variant: "destructive"
          });
        });
      } catch (error) {
        console.error('Error processing audio:', error);
        toast({
          title: "Audio Processing Error",
          description: "Unable to process the voice recording",
          variant: "destructive"
        });
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/dots/${dot.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete dot');
      }

      toast({
        title: "Dot Deleted",
        description: "Your dot has been permanently removed"
      });

      // Invalidate dots cache to refresh the dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/dots'] });
      
      onClose();
    } catch (error) {
      console.error('Error deleting dot:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unable to delete dot",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Dot Full View</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            {dot.sourceType === 'voice' ? (
              <Mic className="w-5 h-5 text-amber-600" />
            ) : (
              <FileText className="w-5 h-5 text-blue-600" />
            )}
            <Badge 
              variant="secondary" 
              className={`${
                dot.sourceType === 'voice' 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {dot.sourceType === 'voice' ? 'Voice Dot' : 'Text Dot'}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {new Date(dot.createdAt).toLocaleDateString()} at {new Date(dot.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Layer 1: Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-bold flex items-center justify-center">
                  1
                </div>
                Dot Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 leading-relaxed">{dot.summary}</p>
              <div className="mt-2 text-xs text-gray-500">
                {dot.summary.length}/220 characters
              </div>
            </CardContent>
          </Card>

          {/* Layer 2: Anchor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                  2
                </div>
                Memory Anchor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 leading-relaxed">{dot.anchor}</p>
              <div className="mt-2 text-xs text-gray-500">
                {dot.anchor.length}/300 characters
              </div>
            </CardContent>
          </Card>

          {/* Layer 3: Pulse */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold flex items-center justify-center">
                  3
                </div>
                Emotional Pulse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {dot.pulse}
                </Badge>
                <span className="text-sm text-gray-500">One word emotion</span>
              </div>
            </CardContent>
          </Card>

          {/* Voice Recording Section */}
          {dot.sourceType === 'voice' && (
            <>
              <Separator />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-amber-600" />
                    Voice Recording
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dot.originalAudioBlob && (
                    <Button
                      onClick={playAudio}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Play Original Recording
                    </Button>
                  )}
                  
                  {dot.transcriptionText && (
                    <div>
                      <h4 className="font-medium mb-2">Transcribed Text:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg italic">
                        "{dot.transcriptionText}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Dot
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-96 mx-4">
              <CardHeader>
                <CardTitle className="text-lg">Delete Dot?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to permanently delete this dot? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}