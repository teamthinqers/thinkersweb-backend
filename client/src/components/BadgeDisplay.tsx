import { Info, Lock } from 'lucide-react';
import { Badge, UserBadge } from '@shared/schema';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BadgeWithStatus extends Badge {
  earned: boolean;
  earnedAt?: Date | null;
}

interface BadgeDisplayProps {
  badges: BadgeWithStatus[];
}

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {badges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all cursor-pointer ${
                  badge.earned
                    ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 border-amber-300 shadow-lg hover:shadow-xl hover:scale-110'
                    : 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 border-gray-400 opacity-40 hover:opacity-60 hover:scale-105'
                }`}
              >
                <span className={`text-2xl ${!badge.earned && 'grayscale'}`}>
                  {badge.icon || '🏆'}
                </span>
                
                {/* Lock icon overlay for locked badges */}
                {!badge.earned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <div className="space-y-1">
                <p className={`font-semibold ${badge.earned ? 'text-amber-700' : 'text-gray-600'}`}>
                  {badge.earned ? '✨ ' : '🔒 '}{badge.name}
                </p>
                <p className="text-sm text-gray-700">
                  {badge.earned ? badge.description : (badge.lockedHint || `Unlock this elite badge! ${badge.description}`)}
                </p>
                {badge.earned && badge.earnedAt && (
                  <p className="text-xs text-amber-600 font-medium">
                    ✅ Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
                {!badge.earned && (
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    💪 Start your journey to unlock this badge!
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
