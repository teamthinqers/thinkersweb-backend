import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface WheelCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onSuccess?: () => void; // Called when wheel is successfully created
  onCancel?: () => void; // Called when creation is cancelled
}

interface WheelFormData {
  heading: string;
  purpose: string;
  timeline: string;
}

export function WheelCreationModal({ isOpen, onClose, position, onSuccess, onCancel }: WheelCreationModalProps) {
  const [formData, setFormData] = useState<WheelFormData>({
    heading: '',
    purpose: '',
    timeline: ''
  });
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        heading: '',
        purpose: '',
        timeline: ''
      });
      setSaved(false);
    }
  }, [isOpen]);

  const createWheelMutation = useMutation({
    mutationFn: async (data: WheelFormData) => {
      const response = await fetch('/api/wheels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: data.heading,
          purpose: data.purpose,
          timeline: data.timeline,
          positionX: position.x,
          positionY: position.y,
          color: '#f59e0b' // Default amber color
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create wheel');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['/api/wheels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dots'] });
      onSuccess?.(); // Notify parent component
      toast({
        title: "Wheel Created",
        description: "Your wheel has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create wheel. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.heading || !formData.purpose || !formData.timeline) {
      toast({
        title: "Missing Information",
        description: "Please fill all three fields.",
        variant: "destructive",
      });
      return;
    }

    createWheelMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!saved && (formData.heading || formData.purpose || formData.timeline)) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onCancel?.(); // Remove pending wheel if cancelled
        onClose();
      }
    } else {
      if (!saved) {
        onCancel?.(); // Remove pending wheel if closed without saving
      }
      onClose();
    }
  };

  const getCompletedFields = () => {
    let count = 0;
    if (formData.heading) count++;
    if (formData.purpose) count++;
    if (formData.timeline) count++;
    return count;
  };

  const completedFields = getCompletedFields();
  const isComplete = completedFields === 3;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-orange-600 flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <span>Create New Wheel</span>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {/* Progress indicator */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div 
                  className={`absolute inset-0 rounded-full border-4 border-orange-500 transition-all duration-300 ${
                    isComplete ? 'border-green-500' : ''
                  }`}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + (completedFields * 33.33)}% 0%, ${50 + (completedFields * 33.33)}% 100%, 50% 100%)`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {isComplete ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <span className="text-xs font-bold text-gray-600">{completedFields}/3</span>
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
          {/* Layer 1: Heading */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                Layer 1
              </Badge>
              <h3 className="font-semibold text-amber-700">Heading</h3>
              <span className="text-xs text-amber-600">
                {formData.heading.length}/100 chars
              </span>
            </div>
            <Textarea
              placeholder="Enter a descriptive heading for your wheel"
              value={formData.heading}
              onChange={(e) => setFormData(prev => ({...prev, heading: e.target.value.slice(0, 100)}))}
              className="bg-white border-amber-200 focus:border-amber-400 min-h-[60px]"
              maxLength={100}
            />
          </div>

          {/* Layer 2: Purpose */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Layer 2
              </Badge>
              <h3 className="font-semibold text-blue-700">Purpose</h3>
              <span className="text-xs text-blue-600">
                {formData.purpose.length}/200 chars
              </span>
            </div>
            <Textarea
              placeholder="What is the purpose or goal of this wheel?"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({...prev, purpose: e.target.value.slice(0, 200)}))}
              className="bg-white border-blue-200 focus:border-blue-400 min-h-[80px]"
              maxLength={200}
            />
          </div>

          {/* Layer 3: Timeline */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400">
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Layer 3
              </Badge>
              <h3 className="font-semibold text-purple-700">Timeline</h3>
              <span className="text-xs text-purple-600">
                {formData.timeline.length}/100 chars
              </span>
            </div>
            <Input
              placeholder="Enter expected timeline or duration"
              value={formData.timeline}
              onChange={(e) => setFormData(prev => ({...prev, timeline: e.target.value.slice(0, 100)}))}
              className="bg-white border-purple-200 focus:border-purple-400"
              maxLength={100}
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
                  disabled={!isComplete || createWheelMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {createWheelMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Wheel'
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