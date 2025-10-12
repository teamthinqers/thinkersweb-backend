import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@shared/schema';
import SparkIcon from '@/components/ui/spark-icon';

interface BadgeUnlockModalProps {
  badge: Badge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BadgeUnlockModal({ badge, open, onOpenChange }: BadgeUnlockModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      // Slight delay for animation
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [open]);

  if (!badge) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-amber-200">
        <div className="relative">
          {/* DotSpark Logo Animation */}
          <div className="absolute -top-4 -right-4 text-amber-500 animate-pulse">
            <SparkIcon className="h-8 w-8" fill="#f59e0b" />
          </div>
          <div className="absolute -bottom-4 -left-4 text-amber-400 animate-pulse animation-delay-300">
            <SparkIcon className="h-6 w-6" fill="#fbbf24" />
          </div>

          <DialogHeader className="text-center space-y-4">
            {/* Badge Icon */}
            <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-5xl shadow-xl transform transition-all duration-500 ${
              showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}>
              {badge.icon || '🏆'}
            </div>

            {/* Badge Name */}
            <DialogTitle className={`text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent transition-all duration-700 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {badge.name} Badge Unlocked!
            </DialogTitle>

            {/* Unlock Message */}
            <DialogDescription className={`text-base text-gray-700 whitespace-pre-line transition-all duration-700 delay-200 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {badge.unlockMessage}
            </DialogDescription>
          </DialogHeader>

          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping animation-delay-100"></div>
            <div className="absolute top-0 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping animation-delay-200"></div>
            <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-amber-300 rounded-full animate-ping animation-delay-300"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
