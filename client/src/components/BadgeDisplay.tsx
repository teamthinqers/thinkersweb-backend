import { Info, Lock, Shield, Crown, Award, Star } from 'lucide-react';
import { Badge, UserBadge } from '@shared/schema';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import SparkIcon from '@/components/ui/spark-icon';

interface BadgeWithStatus extends Badge {
  earned: boolean;
  earnedAt?: Date | null;
}

interface BadgeDisplayProps {
  badges: BadgeWithStatus[];
}

// Elite badge icon component
function EliteBadgeIcon({ badge, earned }: { badge: BadgeWithStatus; earned: boolean }) {
  // Map badge keys to elite icon designs
  const getBadgeIcon = () => {
    switch (badge.badgeKey) {
      case 'explorer':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Explorer: Compass/Navigation Star */}
            <div className="absolute inset-0">
              <Star className="w-full h-full" strokeWidth={1.5} />
            </div>
            <SparkIcon className="w-6 h-6" fill={earned ? '#f59e0b' : '#9ca3af'} />
          </div>
        );
      case 'thinqer':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* ThinQer: Crown of Knowledge */}
            <Crown className="w-full h-full" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <SparkIcon className="w-5 h-5 mt-2" fill={earned ? '#f59e0b' : '#9ca3af'} />
            </div>
          </div>
        );
      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <Shield className="w-full h-full" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <SparkIcon className="w-5 h-5" fill={earned ? '#f59e0b' : '#9ca3af'} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative w-16 h-16 transition-all ${
      earned 
        ? 'text-amber-600 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
        : 'text-gray-400'
    }`}>
      {getBadgeIcon()}
      
      {/* Lock overlay for locked badges */}
      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      {/* Glow effect for earned badges */}
      {earned && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-amber-600/20 blur-xl -z-10 animate-pulse"></div>
          <div className="absolute -top-1 -right-1">
            <SparkIcon className="w-4 h-4 animate-pulse" fill="#fbbf24" />
          </div>
        </>
      )}
    </div>
  );
}

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges.length === 0) return null;

  return (
    <Card className="inline-flex items-center gap-1 px-4 py-3 bg-gradient-to-br from-amber-50/80 via-orange-50/80 to-amber-100/80 border-2 border-amber-200/60 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-1 mr-2">
        <Award className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Achievements</span>
      </div>
      
      <div className="h-8 w-px bg-amber-300/50 mx-1"></div>
      
      <TooltipProvider>
        <div className="flex items-center gap-6">
          {badges.map((badge) => (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  {/* Elite Badge Icon */}
                  <div className={`relative transition-all duration-300 ${
                    badge.earned 
                      ? 'group-hover:scale-110 group-hover:-translate-y-1' 
                      : 'group-hover:scale-105 opacity-60'
                  }`}>
                    <EliteBadgeIcon badge={badge} earned={badge.earned} />
                  </div>
                  
                  {/* Badge Title */}
                  <div className="text-center">
                    <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                      badge.earned 
                        ? 'text-amber-700 group-hover:text-amber-800' 
                        : 'text-gray-500 group-hover:text-gray-600'
                    }`}>
                      {badge.name}
                    </p>
                    {badge.earned && (
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                        <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                        <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom"
                align="center"
                sideOffset={8}
                className="max-w-xs bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xl z-50"
              >
                <div className="space-y-2 p-1">
                  <div className="flex items-center gap-2">
                    <SparkIcon className="w-4 h-4" fill="#f59e0b" />
                    <p className={`font-bold text-sm ${badge.earned ? 'text-amber-700' : 'text-gray-700'}`}>
                      {badge.earned ? '✨ ' : '🔒 '}{badge.name}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {badge.earned ? badge.description : (badge.lockedHint || badge.description)}
                  </p>
                  {!badge.earned && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <Lock className="w-3 h-3 text-orange-600" />
                      <p className="text-xs text-orange-700 font-semibold">
                        Complete challenges to unlock
                      </p>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </Card>
  );
}
