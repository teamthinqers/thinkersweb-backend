import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Wheel {
  id: string;
  name: string;
  heading?: string;
  goals?: string; // For regular wheels
  purpose?: string; // For Chakras (top-level)
  timeline?: string;
  category?: string;
  color?: string;
  createdAt?: Date;
  chakraId?: string; // References the Chakra (larger wheel) this wheel belongs to
}

interface WheelFullViewProps {
  wheel: Wheel | null;
  isOpen?: boolean;
  onClose: () => void;
  onDelete?: (wheelId: string) => void;
}

const WheelFullView: React.FC<WheelFullViewProps> = ({ wheel, isOpen = true, onClose, onDelete }) => {
  if (!wheel) return null;

  const isChakra = wheel.chakraId === undefined;
  const wheelType = isChakra ? "Chakra" : "Wheel";
  const description = isChakra ? wheel.purpose : wheel.goals;

  const handleDelete = () => {
    if (onDelete && wheel.id) {
      onDelete(wheel.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${isChakra ? 'border-amber-300 text-amber-700 bg-amber-50/80' : 'border-indigo-300 text-indigo-700 bg-indigo-50/80'}`}>
                <div className={`w-3 h-3 rounded-full ${isChakra ? 'bg-amber-500' : 'bg-indigo-500'} mr-1`}></div>
                {wheelType}
              </Badge>
              {wheel.category && (
                <Badge className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200 text-xs">
                  {wheel.category}
                </Badge>
              )}
            </div>
            {/* Spacer to push close button away from content */}
            <div className="w-8"></div>
          </div>
          <DialogTitle className="text-2xl font-bold text-amber-800 border-b border-amber-200 pb-3">
            {wheel.heading || wheel.name}
          </DialogTitle>
          {/* Delete button moved below title for better separation */}
          {onDelete && (
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 mr-8"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete {wheelType}
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Layer 1: Heading */}
          <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/60 rounded-xl border-2 border-amber-400 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                Heading
              </h3>
            </div>
            <p className="text-amber-700 font-medium text-lg pl-8">
              {wheel.heading || wheel.name}
            </p>
          </div>

          {/* Layer 2: Goals/Purpose */}
          {description && (
            <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/60 rounded-xl border-2 border-amber-400 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  {isChakra ? 'Purpose' : 'Goals'}
                </h3>
              </div>
              <p className="text-amber-700 leading-relaxed pl-8">
                {description}
              </p>
            </div>
          )}

          {/* Layer 3: Timeline */}
          {wheel.timeline && (
            <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/30 rounded-xl border-2 border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Timeline
                </h3>
              </div>
              <p className="text-amber-700 font-medium text-lg pl-8">
                {wheel.timeline}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {wheel.createdAt 
                  ? `Created: ${new Date(wheel.createdAt).toLocaleString()}`
                  : 'Preview Mode'
                }
              </span>
            </div>
            {wheel.chakraId && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Part of:</span> Chakra
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WheelFullView;