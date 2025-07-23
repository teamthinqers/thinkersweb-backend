import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface WheelFlashCardProps {
  wheel: Wheel;
  position?: { x: number; y: number };
  onClose: () => void;
  onViewFull?: () => void;
  onClick?: () => void;
}

const WheelFlashCard: React.FC<WheelFlashCardProps> = ({ wheel, position, onClose, onViewFull, onClick }) => {
  const handleCardClick = () => {
    if (onViewFull) {
      onViewFull();
    } else if (onClick) {
      onClick();
    }
  };

  const isChakra = wheel.chakraId === undefined;
  const wheelType = isChakra ? "Chakra" : "Wheel";
  const description = isChakra ? wheel.purpose : wheel.goals;

  return (
    <div 
      className="fixed z-[100] pointer-events-auto wheel-flash-card"
      style={{
        left: position ? `${Math.min(position.x, window.innerWidth - 200)}px` : '50%',
        top: position ? `${Math.min(position.y, window.innerHeight - 140)}px` : '50%',
        transform: position ? 'none' : 'translate(-50%, -50%)',
        maxWidth: '180px'
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <Card 
        className={`bg-white border-2 ${isChakra ? 'border-amber-300' : 'border-indigo-300'} shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-200 transform hover:scale-105`}
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
      >
        <CardContent className="p-2">
          <div className="flex justify-between items-start mb-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${isChakra ? 'border-amber-300 text-amber-700 bg-amber-50/80' : 'border-indigo-300 text-indigo-700 bg-indigo-50/80'}`}
            >
              <div className={`w-3 h-3 rounded-full ${isChakra ? 'bg-amber-500' : 'bg-indigo-500'} mr-1`}></div>
              {wheelType}
            </Badge>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
          
          <h3 className={`font-bold text-sm mb-1 ${isChakra ? 'text-amber-800 border-b border-amber-200' : 'text-indigo-800 border-b border-indigo-200'} pb-1`}>
            {wheel.heading || wheel.name}
          </h3>
          
          {description && (
            <p className="text-xs text-gray-700 leading-relaxed mb-2 line-clamp-2">
              {description}
            </p>
          )}
          
          {wheel.timeline && (
            <Badge className={`bg-gradient-to-r ${isChakra ? 'from-amber-100 to-orange-100 text-amber-800 border-amber-200' : 'from-indigo-100 to-blue-100 text-indigo-800 border-indigo-200'} text-xs mb-2`}>
              {wheel.timeline}
            </Badge>
          )}
          
          <div className={`text-xs ${isChakra ? 'text-amber-600' : 'text-indigo-600'} mt-1 font-medium`}>
            Click for full view
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WheelFlashCard;