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
import { Crown, Star, Shield } from 'lucide-react';

interface BadgeUnlockModalProps {
  badge: Badge | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Elite badge icon for unlock modal
function UnlockBadgeIcon({ badgeKey }: { badgeKey: string }) {
  switch (badgeKey) {
    case 'explorer':
      return (
        <div className="relative w-full h-full flex items-center justify-center text-amber-500">
          <Star className="w-full h-full" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <SparkIcon className="w-12 h-12" fill="#f59e0b" />
          </div>
        </div>
      );
    case 'thinqer':
      return (
        <div className="relative w-full h-full flex items-center justify-center text-amber-500">
          <Crown className="w-full h-full" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <SparkIcon className="w-10 h-10 mt-4" fill="#f59e0b" />
          </div>
        </div>
      );
    default:
      return (
        <div className="relative w-full h-full flex items-center justify-center text-amber-500">
          <Shield className="w-full h-full" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <SparkIcon className="w-10 h-10" fill="#f59e0b" />
          </div>
        </div>
      );
  }
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
      <DialogContent className="sm:max-w-lg border-3 border-amber-300 shadow-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="relative py-6">
          {/* Floating DotSpark Logo Animations */}
          <div className="absolute -top-6 -right-6 text-amber-500 animate-pulse">
            <SparkIcon className="h-10 w-10" fill="#f59e0b" />
          </div>
          <div className="absolute -bottom-6 -left-6 text-amber-400 animate-pulse animation-delay-300">
            <SparkIcon className="h-8 w-8" fill="#fbbf24" />
          </div>
          <div className="absolute top-1/2 -left-4 text-orange-400 animate-pulse animation-delay-500">
            <SparkIcon className="h-6 w-6" fill="#fb923c" />
          </div>

          <DialogHeader className="text-center space-y-6">
            {/* Elite Badge Icon with Glow */}
            <div className="flex justify-center">
              <div className={`relative w-32 h-32 transition-all duration-700 ${
                showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
              }`}>
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                
                {/* Badge container */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
                    <UnlockBadgeIcon badgeKey={badge.badgeKey} />
                  </div>
                </div>

                {/* Sparkle accent */}
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <SparkIcon className="w-6 h-6" fill="#fbbf24" />
                </div>
              </div>
            </div>

            {/* "ACHIEVEMENT UNLOCKED" Label */}
            <div className={`transition-all duration-500 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-lg">
                <SparkIcon className="w-4 h-4" fill="white" />
                <span className="text-white font-bold text-sm uppercase tracking-widest">Achievement Unlocked</span>
                <SparkIcon className="w-4 h-4" fill="white" />
              </div>
            </div>

            {/* Badge Name */}
            <DialogTitle className={`text-3xl font-black bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700 bg-clip-text text-transparent transition-all duration-700 delay-100 tracking-tight ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {badge.name}
            </DialogTitle>

            {/* Unlock Message */}
            <DialogDescription className={`text-lg text-gray-700 font-medium whitespace-pre-line leading-relaxed px-4 transition-all duration-700 delay-200 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {badge.unlockMessage}
            </DialogDescription>

            {/* Decorative separator */}
            <div className={`flex items-center justify-center gap-2 transition-all duration-700 delay-300 ${
              showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}>
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500"></div>
              <SparkIcon className="w-5 h-5" fill="#f59e0b" />
              <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400"></div>
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            </div>
          </DialogHeader>

          {/* Floating particle effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-400 rounded-full animate-ping animation-delay-100"></div>
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping animation-delay-200"></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-amber-300 rounded-full animate-ping animation-delay-300"></div>
            <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-orange-300 rounded-full animate-ping animation-delay-400"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
