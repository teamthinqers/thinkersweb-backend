import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div 
      className="fixed z-50 pointer-events-auto"
      style={{
        left: position ? `${Math.min(position.x, window.innerWidth - 300)}px` : '50%',
        top: position ? `${Math.min(position.y, window.innerHeight - 200)}px` : '50%',
        transform: position ? 'none' : 'translate(-50%, -50%)',
        maxWidth: '280px'
      }}
    >
      <Card 
        className="bg-white border-2 border-amber-300 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick();
        }}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <Badge 
              variant="outline" 
              className="text-xs border-purple-300 text-purple-700 bg-purple-50/80"
            >
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
              Wheel
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
          
          <h3 className="font-bold text-lg mb-2 text-purple-800 border-b border-purple-200 pb-2">
            {wheel.heading || wheel.name}
          </h3>
          
          {wheel.purpose && (
            <p className="text-sm text-gray-700 leading-relaxed mb-2 line-clamp-3">
              {wheel.purpose}
            </p>
          )}
          
          {wheel.timeline && (
            <Badge className="bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200 text-xs mb-2">
              {wheel.timeline}
            </Badge>
          )}
          
          <div className="text-xs text-amber-600 mt-2 font-medium">
            Click for full view
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {wheel.createdAt ? new Date(wheel.createdAt).toLocaleString() : 'Preview'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WheelFlashCard;