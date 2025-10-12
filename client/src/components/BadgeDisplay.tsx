import { Info } from 'lucide-react';
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
                    : 'bg-gray-200 border-gray-300 opacity-50 hover:opacity-70'
                }`}
              >
                <span className="text-2xl">{badge.icon || '🏆'}</span>
                
                {/* Info icon for locked badges */}
                {!badge.earned && badge.lockedHint && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Info className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold text-amber-700">{badge.name}</p>
                <p className="text-sm text-gray-600">
                  {badge.earned ? badge.description : badge.lockedHint || badge.description}
                </p>
                {badge.earned && badge.earnedAt && (
                  <p className="text-xs text-gray-400">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
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
