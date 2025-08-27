import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Calendar, Trash2, Circle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

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
  onDotClick?: (dot: any) => void;
  onWheelClick?: (wheel: any) => void;
}

const WheelFullView: React.FC<WheelFullViewProps> = ({ wheel, isOpen = true, onClose, onDelete, onDotClick, onWheelClick }) => {
  if (!wheel) return null;

  // A chakra is identified by having a 'purpose' field, while wheels have 'goals'
  const isChakra = !!wheel.purpose && !wheel.goals;
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
              <Badge variant="outline" className={`text-xs ${isChakra ? 'border-amber-300 text-amber-700 bg-amber-50/80' : 'border-orange-300 text-orange-700 bg-orange-50/80'}`}>
                <div className={`w-3 h-3 rounded-full ${isChakra ? 'bg-amber-500' : 'bg-orange-500'} mr-1`}></div>
                {wheelType}
              </Badge>
{/* Category badge removed - no category text needed */}
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

          {/* Associated Content */}
          <AssociatedContent wheel={wheel} isChakra={isChakra} onDotClick={onDotClick} onWheelClick={onWheelClick} />

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

// Component to handle associated content (dots for wheels, wheels/dots for chakras)
const AssociatedContent: React.FC<{
  wheel: Wheel;
  isChakra: boolean;
  onDotClick?: (dot: any) => void;
  onWheelClick?: (wheel: any) => void;
}> = ({ wheel, isChakra, onDotClick, onWheelClick }) => {
  // Fetch dots for this wheel (if it's a wheel)
  const { data: allDots } = useQuery({
    queryKey: ['/api/user-content/dots'],
    queryFn: async () => {
      const response = await fetch('/api/user-content/dots', { credentials: 'include' });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !isChakra && !!wheel.id
  });

  const wheelDots = allDots?.filter((dot: any) => 
    dot.wheelId && (dot.wheelId == wheel.id || dot.wheelId === String(wheel.id))
  ) || [];

  // Fetch wheels for this chakra (if it's a chakra)
  const { data: allWheels } = useQuery({
    queryKey: ['/api/user-content/wheels'],
    queryFn: async () => {
      if (!isChakra) return []; // Don't fetch wheels for regular wheels
      const response = await fetch('/api/user-content/wheels', { credentials: 'include' });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isChakra && !!wheel.id
  });

  const chakraWheels = allWheels?.filter((w: any) => 
    w.chakraId && (w.chakraId == wheel.id || w.chakraId === String(wheel.id))
  ) || [];

  // Fetch all dots for chakra wheels
  const { data: allChakraDots } = useQuery({
    queryKey: ['/api/user-content/dots', 'chakra', wheel.id, chakraWheels?.map((w: any) => w.id).sort()],
    queryFn: async () => {
      if (!isChakra || !chakraWheels?.length) return [];
      const response = await fetch('/api/user-content/dots', { credentials: 'include' });
      if (!response.ok) return [];
      const allDots = await response.json();
      const wheelIds = chakraWheels.map((w: any) => w.id);
      console.log('Filtering dots for chakra:', wheel.id, 'wheel IDs:', wheelIds);
      const filteredDots = allDots.filter((dot: any) => {
        const hasWheelId = dot.wheelId && wheelIds.some((id: any) => {
          const match = (dot.wheelId == id || dot.wheelId === String(id));
          if (match) console.log('Found matching dot:', dot.oneWordSummary, 'for wheel:', id);
          return match;
        });
        return hasWheelId;
      });
      console.log('Final filtered dots for chakra:', filteredDots.length);
      return filteredDots;
    },
    enabled: isChakra && !!chakraWheels?.length
  });

  if (isChakra) {
    return (
      <div className="space-y-4">
        {/* Associated Wheels */}
        {chakraWheels && chakraWheels.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/60 rounded-xl border-2 border-orange-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-amber-700 flex items-center justify-center">
                <Settings className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-amber-800">
                Associated Wheels ({chakraWheels.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 pl-8">
              {chakraWheels.map((associatedWheel: any) => (
                <Button
                  key={associatedWheel.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onWheelClick?.(associatedWheel)}
                  className="bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800 text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  {associatedWheel.heading || associatedWheel.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Associated Dots from all wheels */}
        {allChakraDots && allChakraDots.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/60 rounded-xl border-2 border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center">
                <Circle className="w-3 h-3 text-white animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-amber-800">
                All Associated Dots ({allChakraDots.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 pl-8">
              {allChakraDots.map((dot: any) => (
                <Button
                  key={dot.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onDotClick?.(dot)}
                  className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 text-xs"
                >
                  <Circle className="w-3 h-3 mr-1 animate-pulse" />
                  {dot.oneWordSummary || dot.summary?.split(' ')[0] || 'Insight'}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // For regular wheels, show associated dots
  return (
    <div>
      {wheelDots && wheelDots.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/60 rounded-xl border-2 border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-center">
              <Circle className="w-3 h-3 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800">
              Associated Dots ({wheelDots.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pl-8">
            {wheelDots.map((dot: any) => (
              <Button
                key={dot.id}
                variant="outline"
                size="sm"
                onClick={() => onDotClick?.(dot)}
                className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800 text-xs"
              >
                <Circle className="w-3 h-3 mr-1 animate-pulse" />
                {dot.oneWordSummary || dot.summary?.split(' ')[0] || 'Insight'}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WheelFullView;