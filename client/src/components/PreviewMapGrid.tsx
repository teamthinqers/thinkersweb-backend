import React from 'react';
import UserGrid from './UserGrid';
// Using local interfaces that match Dashboard component types
interface Dot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId?: string;
  timestamp: Date;
  sourceType: 'voice' | 'text';
  captureMode: 'natural' | 'ai';
  voiceData?: {
    summaryVoiceUrl?: string;
    anchorVoiceUrl?: string;
    pulseVoiceUrl?: string;
  } | null;
}

interface Wheel {
  id: string;
  name: string;
  heading?: string;
  goals?: string;
  purpose?: string;
  timeline?: string;
  category: string;
  color: string;
  dots: Dot[];
  connections: string[];
  position: { x: number; y: number };
  chakraId?: string;
  createdAt?: Date;
}

interface PreviewMapGridProps {
  setViewFullWheel: (wheel: Wheel | null) => void;
  setViewFlashCard: (dot: Dot | null) => void;
}

export const PreviewMapGrid: React.FC<PreviewMapGridProps> = ({
  setViewFullWheel,
  setViewFlashCard
}) => {
  // Always show preview mode grid with demo data - no creation functions
  return (
    <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
        <span className="bg-purple-100 text-purple-800 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
          Preview Mode
        </span>
      </div>
      
      <UserGrid 
        userId={undefined} // No user ID for preview mode
        mode="preview"
      />
    </div>
  );
};