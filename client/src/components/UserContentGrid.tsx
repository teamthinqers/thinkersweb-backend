import React from 'react';
import { Brain, Plus, User } from 'lucide-react';
import UserGrid from './UserGrid';
import { PreviewMapGrid } from './PreviewMapGrid';
import { neuraStorage } from '@/lib/neuraStorage';
// Using local interfaces that match Dashboard component types
interface DashboardUser {
  id: number;
  username?: string;
  email?: string;
  firebaseUid?: string;
  fullName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

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

interface UserContentGridProps {
  user: DashboardUser | null;
  stableUserId: string | null;
  userWheels: Wheel[];
  dots: Dot[];
  setViewFullWheel: (wheel: Wheel | null) => void;
  setViewFlashCard: (dot: Dot | null) => void;
  setViewFullDot?: (dot: Dot | null) => void;
}

export const UserContentGrid: React.FC<UserContentGridProps> = ({
  user,
  stableUserId,
  userWheels,
  dots,
  setViewFullWheel,
  setViewFlashCard,
  setViewFullDot
}) => {
  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="relative bg-gradient-to-br from-slate-50/50 to-gray-50/50 rounded-xl p-4 min-h-[500px] border-2 border-slate-200 shadow-lg overflow-hidden">
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
          <span className="bg-slate-100 text-slate-800 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
            User Mode
          </span>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Sign In to Create Content</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Sign in with your Google account to create and manage your personal dots, wheels, and chakras.
            </p>
            
            <p className="text-xs text-slate-600 text-center">
              Switch to Preview Mode to see demo content
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is authenticated but has no content, show creation prompt
  if (userWheels.length === 0 && dots.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
          <span className="bg-amber-100 text-amber-800 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
            Empty
          </span>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-2xl font-bold text-amber-800 mb-2">Your DotSpark Grid is Empty</h3>
            <p className="text-amber-600 mb-6 max-w-md mx-auto">
              Create your first dot, wheel, or chakra to start organizing your thoughts.
            </p>
            
            <p className="text-xs text-amber-600 text-center">
              Try Preview Map to see examples
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user has content, show their actual grid
  return (
    <UserGrid 
      userId={stableUserId} 
      mode="real"
      isDemoMode={false}
    />
  );
};