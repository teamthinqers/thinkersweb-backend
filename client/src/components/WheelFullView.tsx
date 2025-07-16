import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface WheelFullViewProps {
  wheel: Wheel | null;
  isOpen?: boolean;
  onClose: () => void;
  onDelete?: (wheelId: string) => void;
}

const WheelFullView: React.FC<WheelFullViewProps> = ({ wheel, isOpen = true, onClose, onDelete }) => {
  if (!wheel) return null;

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
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 bg-purple-50/80">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                Wheel
              </Badge>
              {wheel.category && (
                <Badge className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200 text-xs">
                  {wheel.category}
                </Badge>
              )}
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-purple-800 border-b border-purple-200 pb-3">
            {wheel.heading || wheel.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Layer 1: Heading */}
          <div className="bg-gradient-to-br from-purple-50/60 to-violet-50/60 rounded-xl border-2 border-purple-400 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-violet-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Heading
              </h3>
            </div>
            <p className="text-purple-700 font-medium text-lg pl-8">
              {wheel.heading || wheel.name}
            </p>
          </div>

          {/* Layer 2: Purpose */}
          {wheel.purpose && (
            <div className="bg-gradient-to-br from-purple-50/60 to-violet-50/60 rounded-xl border-2 border-purple-400 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-violet-700 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Purpose
                </h3>
              </div>
              <p className="text-purple-700 leading-relaxed pl-8">
                {wheel.purpose}
              </p>
            </div>
          )}

          {/* Layer 3: Timeline */}
          {wheel.timeline && (
            <div className="bg-gradient-to-br from-purple-50/30 to-violet-50/30 rounded-xl border-2 border-purple-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Timeline
                </h3>
              </div>
              <p className="text-purple-600 font-medium text-lg pl-8">
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
            {wheel.parentWheelId && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Part of:</span> Parent Wheel
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WheelFullView;