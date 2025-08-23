import React from 'react';
import { Brain, Plus, User } from 'lucide-react';
import UserGrid from './UserGrid';
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
  userWheels: Wheel[];
  dots: Dot[];
  setViewFullWheel: (wheel: Wheel | null) => void;
  setViewFlashCard: (dot: Dot | null) => void;
  setViewFullDot: (dot: Dot | null) => void;
}

export const UserContentGrid: React.FC<UserContentGridProps> = ({
  user,
  userWheels,
  dots,
  setViewFullWheel,
  setViewFlashCard,
  setViewFullDot
}) => {
  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4 min-h-[500px] border-2 border-amber-200 shadow-lg overflow-hidden">
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
          <span className="bg-red-100 text-red-800 px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium">
            Not Signed In
          </span>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-2xl font-bold text-amber-800 mb-2">Sign In Required</h3>
            <p className="text-amber-600 mb-6 max-w-md mx-auto">
              Please sign in to create and save your personal Dots, Wheels, and Chakras.
            </p>
            
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={() => window.location.href = '/auth'}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <User className="w-4 h-4 md:w-5 md:h-5" />
                Sign In to DotSpark
              </button>
              
              <p className="text-xs text-amber-600">
                Or try Preview Map to see examples
              </p>
            </div>
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
            
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                onClick={() => {
                  // Check if DotSpark is activated
                  const isDotSparkActivated = neuraStorage.isActivated();
                  
                  if (isDotSparkActivated) {
                    // User has activated DotSpark - trigger floating dot
                    const event = new CustomEvent('triggerFloatingDot');
                    window.dispatchEvent(event);
                  } else {
                    // User hasn't activated DotSpark - redirect to My Neura activation section
                    window.location.href = '/my-neura';
                  }
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Dot/Wheel/Spark
              </button>
              
              <p className="text-xs text-amber-600 text-center">
                Or try Preview Map to see examples
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user has content, show their actual grid
  return (
    <UserGrid 
      userId={user?.id} 
      mode="real"
      wheels={userWheels}
      dots={dots}
      setViewFullWheel={setViewFullWheel}
      setViewFullDot={setViewFullDot}
      previewMode={false}
      setPreviewMode={() => {}}
    />
  );
};