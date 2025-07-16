import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Eye, X, Settings } from "lucide-react";

interface Wheel {
  id: string;
  name: string;
  heading?: string;
  purpose?: string;
  timeline?: string;
  category?: string;
  color?: string;
  createdAt?: Date;
  parentWheelId?: string;
}

interface WheelFlashCardProps {
  wheel: Wheel;
  onClose: () => void;
  onViewFull: () => void;
}

const WheelFlashCard: React.FC<WheelFlashCardProps> = ({ wheel, onClose, onViewFull }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200">
        <DialogHeader>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 bg-purple-50/80">
                <Settings className="h-3 w-3 mr-1" />
                Wheel
              </Badge>
              {wheel.category && (
                <Badge className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200 text-xs">
                  {wheel.category}
                </Badge>
              )}
            </div>
            {wheel.timeline && (
              <Badge className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200">
                {wheel.timeline}
              </Badge>
            )}
          </div>
          
          {/* Flash Card Heading */}
          <DialogTitle className="text-2xl font-bold text-purple-800 text-center mb-6 border-b-2 border-purple-300 pb-3">
            {wheel.heading || wheel.name}
          </DialogTitle>
        </DialogHeader>
        
        {/* Flash Card Content */}
        <div className="space-y-4">
          {wheel.purpose && (
            <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 text-sm mb-2">Purpose</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{wheel.purpose}</p>
            </div>
          )}
          
          {wheel.createdAt && (
            <div className="text-xs text-purple-700 text-center">
              Created: {wheel.createdAt.toLocaleString()}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button 
            onClick={onClose}
            variant="outline" 
            className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button 
            onClick={onViewFull}
            className="flex-1 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            Full View
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WheelFlashCard;