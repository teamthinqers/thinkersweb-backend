import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, Type, X, Volume2 } from "lucide-react";

interface Dot {
  id: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId: string;
  timestamp: Date;
  sourceType: 'voice' | 'text' | 'hybrid';
}

interface DotFullViewProps {
  dot: Dot;
  onClose: () => void;
}

const DotFullView: React.FC<DotFullViewProps> = ({ dot, onClose }) => {
  const handlePlayVoice = () => {
    // Placeholder for voice playback functionality
    console.log('Playing voice recording for dot:', dot.id);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-600 to-orange-700">
                <div className="w-2 h-2 rounded-full bg-white ml-1 mt-1"></div>
              </div>
              Dot Full View
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Type and Timestamp */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
              {dot.sourceType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : 
               dot.sourceType === 'text' ? <Type className="h-3 w-3 mr-1" /> : 
               <div className="flex gap-1"><Mic className="h-2 w-2" /><Type className="h-2 w-2" /></div>}
              {dot.sourceType}
            </Badge>
            <span className="text-sm text-gray-500">
              {dot.timestamp.toLocaleString()}
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
              {dot.sourceType === 'voice' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayVoice}
                  className="ml-auto text-amber-600 hover:text-amber-800"
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
              {dot.sourceType === 'voice' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayVoice}
                  className="ml-auto text-blue-600 hover:text-blue-800"
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
              {dot.sourceType === 'voice' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayVoice}
                  className="ml-auto text-purple-600 hover:text-purple-800"
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