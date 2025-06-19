import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Type, Eye, X } from "lucide-react";

interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai';
  timestamp: Date;
}

interface DotFlashCardProps {
  dot: Dot;
  onClose: () => void;
  onViewFull: () => void;
}

const DotFlashCard: React.FC<DotFlashCardProps> = ({ dot, onClose, onViewFull }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <DialogHeader>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50/80">
                {dot.sourceType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : <Type className="h-3 w-3 mr-1" />}
                {dot.sourceType}
              </Badge>
              {dot.captureMode === 'ai' && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                  AI
                </Badge>
              )}
            </div>
            <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200">
              {dot.pulse}
            </Badge>
          </div>
          
          {/* Flash Card Heading */}
          <DialogTitle className="text-2xl font-bold text-amber-800 text-center mb-6 border-b-2 border-amber-300 pb-3">
            {dot.oneWordSummary}
          </DialogTitle>
        </DialogHeader>
        
        {/* Flash Card Content */}
        <div className="space-y-4">
          <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-800 text-sm mb-2">Summary</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{dot.summary}</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-amber-200">
            <h4 className="font-semibold text-amber-800 text-sm mb-2">Anchor</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{dot.anchor}</p>
          </div>
          
          <div className="text-xs text-amber-700 text-center">
            {dot.timestamp.toLocaleString()}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button 
            onClick={onClose}
            variant="outline" 
            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button 
            onClick={onViewFull}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            Full View
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DotFlashCard;