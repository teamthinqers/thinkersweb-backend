import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DotCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

interface DotFormData {
  summary: string;
  anchor: string;
  pulse: string;
}

const EMOTIONS = [
  'excited', 'curious', 'focused', 'happy', 'calm', 
  'inspired', 'confident', 'grateful', 'motivated'
];

export function DotCreationModal({ isOpen, onClose, position }: DotCreationModalProps) {
  const [formData, setFormData] = useState<DotFormData>({
    summary: '',
    anchor: '',
    pulse: ''
  });
  const [currentLayer, setCurrentLayer] = useState(1);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        summary: '',
        anchor: '',
        pulse: ''
      });
      setCurrentLayer(1);
      setSaved(false);
    }
  }, [isOpen]);

  const createDotMutation = useMutation({
    mutationFn: async (data: DotFormData) => {
      const response = await fetch('/api/dots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: data.summary,
          anchor: data.anchor,
          pulse: data.pulse,
          sourceType: 'text',
          captureMode: 'natural'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create dot');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['/api/dots'] });
      toast({
        title: "Dot Created",
        description: "Your dot has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create dot. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.summary || !formData.anchor || !formData.pulse) {
      toast({
        title: "Missing Information",
        description: "Please fill all three layers.",
        variant: "destructive",
      });
      return;
    }

    createDotMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!saved && (formData.summary || formData.anchor || formData.pulse)) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getCompletedLayers = () => {
    let count = 0;
    if (formData.summary) count++;
    if (formData.anchor) count++;
    if (formData.pulse) count++;
    return count;
  };

  const completedLayers = getCompletedLayers();
  const isComplete = completedLayers === 3;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-amber-600">
              Create New Dot
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {/* Progress indicator */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div 
                  className={`absolute inset-0 rounded-full border-4 border-amber-500 transition-all duration-300 ${
                    isComplete ? 'border-green-500' : ''
                  }`}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + (completedLayers * 50)}% 0%, ${50 + (completedLayers * 50)}% 100%, 50% 100%)`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isComplete ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <span className="text-xs font-bold text-gray-600">{completedLayers}/3</span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Layer 1: Summary */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                Layer 2
              </Badge>
              <h3 className="font-semibold text-amber-700">Summary</h3>
              <span className="text-xs text-amber-600">
                {formData.summary.length}/220 chars
              </span>
            </div>
            <Textarea
              placeholder="Distill your thoughts. Sharply defined thoughts can spark better insights (max 220 characters)"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({...prev, summary: e.target.value.slice(0, 220)}))}
              className="bg-white border-amber-200 focus:border-amber-400 min-h-[80px]"
              maxLength={220}
            />
          </div>

          {/* Layer 2: Anchor */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Layer 2
              </Badge>
              <h3 className="font-semibold text-blue-700">Anchor</h3>
              <span className="text-xs text-blue-600">
                {formData.anchor.length}/300 chars
              </span>
            </div>
            <Textarea
              placeholder="What memory anchor will help you recall this insight?"
              value={formData.anchor}
              onChange={(e) => setFormData(prev => ({...prev, anchor: e.target.value.slice(0, 300)}))}
              className="bg-white border-blue-200 focus:border-blue-400 min-h-[80px]"
              maxLength={300}
            />
          </div>

          {/* Layer 3: Pulse (Emotion) */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Layer 3
              </Badge>
              <h3 className="font-semibold text-purple-700">Pulse</h3>
              <span className="text-xs text-purple-600">One word emotion</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {EMOTIONS.map((emotion) => (
                <Button
                  key={emotion}
                  variant={formData.pulse === emotion ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({...prev, pulse: emotion}))}
                  className={`text-xs ${
                    formData.pulse === emotion 
                      ? "bg-purple-500 hover:bg-purple-600" 
                      : "border-purple-200 text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  {emotion}
                </Button>
              ))}
            </div>
            <Input
              placeholder="Or enter custom emotion"
              value={formData.pulse && !EMOTIONS.includes(formData.pulse) ? formData.pulse : ''}
              onChange={(e) => setFormData(prev => ({...prev, pulse: e.target.value.slice(0, 20)}))}
              className="bg-white border-purple-200 focus:border-purple-400"
              maxLength={20}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <div className="space-x-2">
              {saved ? (
                <Button variant="outline" onClick={onClose} className="bg-green-50 border-green-200 text-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!isComplete || createDotMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {createDotMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Dot'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}