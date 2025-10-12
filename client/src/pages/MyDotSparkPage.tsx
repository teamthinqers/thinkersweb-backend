import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Trophy, Target, Lightbulb, TrendingUp, ArrowRight, Brain, Users, Plus, FileText, Circle, Hexagon, Pencil, Zap, Fingerprint, Search, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth-new';
import { formatDistanceToNow } from 'date-fns';
import SharedAuthLayout from '@/components/layout/SharedAuthLayout';
import BadgeDisplay from '@/components/BadgeDisplay';
import BadgeUnlockModal from '@/components/BadgeUnlockModal';
import { useState, useEffect } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Badge } from '@shared/schema';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { generateCognitiveIdentityTags } from '@/lib/cognitiveIdentityTags';

interface DashboardData {
  neuralStrength: {
    percentage: number;
    milestones: {
      cognitiveIdentityCompleted: boolean;
      learningEngineCompleted: boolean;
      hasActivity: boolean;
    };
    stats: {
      thoughtsCount: number;
      savedSparksCount: number;
      userSparksCount: number;
      perspectivesCount: number;
    };
  };
  collectiveGrowth: {
    percentage: number;
  };
  stats: {
    dots: number;
    wheels: number;
    chakras: number;
    thoughts: number;
    savedSparks: number;
    perspectives: number;
  };
  recentActivity: Array<{
    type: 'dot' | 'wheel' | 'thought';
    data: any;
    timestamp: string;
  }>;
}

export default function MyDotSparkPage() {
  const { user } = useAuth();
  const [badgeToShow, setBadgeToShow] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const { data: dashboardData, isLoading } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ['/api/dashboard'],
    enabled: !!user,
  });

  // Get cognitive tuning parameters for identity tags
  const { tuning } = useDotSparkTuning();
  const cognitiveIdentityTags = generateCognitiveIdentityTags(tuning || {});

  // Fetch ALL badges with earned/locked status for gamification
  const { data: badgesData } = useQuery<{ success: boolean; badges: any[] }>({
    queryKey: [`/api/users/${(user as any)?.id}/badges`],
    enabled: !!(user as any)?.id,
  });

  // Always show all badges (earned and locked) for gamification
  const allBadgesForDisplay = badgesData?.badges || [];
  
  console.log('Badges data:', badgesData, 'User ID:', (user as any)?.id);

  // Fetch pending badge notifications
  const { data: pendingBadgesData } = useQuery<{ success: boolean; badges: any[] }>({
    queryKey: ['/api/badges/pending'],
    enabled: !!user,
    refetchInterval: 5000, // Check every 5 seconds for new badges
  });

  // Mark badge as notified mutation
  const markBadgeNotified = useMutation({
    mutationFn: async (userBadgeId: number) => {
      const response = await fetch(`/api/badges/${userBadgeId}/notified`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to mark badge as notified');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/badges/pending'] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${(user as any)?.id}/badges`] });
    },
  });

  // Show badge unlock modal when new badges are earned
  useEffect(() => {
    if (pendingBadgesData?.badges && pendingBadgesData.badges.length > 0) {
      const nextBadge = pendingBadgesData.badges[0];
      
      // Small delay for better UX (3 seconds after page load)
      const timer = setTimeout(() => {
        setBadgeToShow(nextBadge.badge);
        setShowBadgeModal(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [pendingBadgesData]);

  // Handle badge modal close
  const handleBadgeModalClose = (open: boolean) => {
    setShowBadgeModal(open);
    if (!open && badgeToShow && pendingBadgesData?.badges?.[0]) {
      // Mark as notified when modal is closed
      markBadgeNotified.mutate(pendingBadgesData.badges[0].id);
      setBadgeToShow(null);
    }
  };

  const dashboard = dashboardData?.data;

  if (isLoading) {
    return (
      <SharedAuthLayout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading your DotSpark...</p>
          </div>
        </div>
      </SharedAuthLayout>
    );
  }

  return (
    <SharedAuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Profile Section */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/user/${(user as any)?.id}`}>
              <Avatar className="h-12 w-12 border-3 border-amber-200 shadow-lg cursor-pointer hover:border-amber-300 transition-colors">
                <AvatarImage src={(user as any)?.avatar || (user as any)?.linkedinPhotoUrl || (user as any)?.photoURL || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-lg">
                  {(user as any)?.displayName?.[0]?.toUpperCase() || (user as any)?.fullName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent leading-tight">
                  {(user as any)?.displayName || (user as any)?.fullName || 'User'}
                </h1>
                <p className="text-amber-700 text-sm mt-0.5 font-semibold">
                  {(user as any)?.linkedinHeadline || 'Professional Headline'}
                </p>
              </div>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              {/* Badges Display - Always show all badges for gamification */}
              {allBadgesForDisplay.length > 0 && (
                <BadgeDisplay badges={allBadgesForDisplay} />
              )}
            </div>
          </div>
        </div>

        {/* Badge Unlock Modal */}
        <BadgeUnlockModal 
          badge={badgeToShow}
          open={showBadgeModal}
          onOpenChange={handleBadgeModalClose}
        />

        {/* ========================================
            MAIN DASHBOARD: 4 Core Sections
            1. My Neura - Personal thoughts with Neural Strength meter
            2. Social Neura - Collective intelligence with Growth meter
            3. My Thought Circle - TODO: To be built
            4. Learning Engine - TODO: To be built
            ======================================== */}
        
        {/* Cognitive Identity Box - Full Width - Links to both identity page and config */}
        <Link href="/cognitive-identity-config">
          <Card className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-[#a78bfa] via-[#9575cd] to-[#8b5cf6] relative overflow-hidden rounded-[32px] shadow-[0_8px_30px_rgba(139,92,246,0.2)] hover:shadow-[0_20px_60px_rgba(139,92,246,0.3)] mb-4">
            
            {/* Icon Badge */}
            <div className="absolute top-4 left-6">
              <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-white" />
                <Sparkles className="h-3.5 w-3.5 text-white/90" />
              </div>
            </div>
            
            {/* Content */}
            <div className="pt-14 pb-5 px-6">
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Cognitive Identity</h3>
              <p className="text-white/90 text-sm font-medium mb-4 drop-shadow-md">Your unique thought patterns and intellectual fingerprint</p>
              
              {/* Cognitive Identity Tags - Dynamic based on user settings */}
              <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                {cognitiveIdentityTags.length > 0 ? (
                  cognitiveIdentityTags.map((tag, index) => {
                    const sizeVariants = ['text-xs px-3 py-1', 'text-sm px-3.5 py-1.5', 'text-xs px-3 py-1', 'text-sm px-4 py-1.5'];
                    const opacityVariants = ['bg-white/30', 'bg-white/35', 'bg-white/30', 'bg-white/40'];
                    const fontVariants = ['font-semibold', 'font-bold', 'font-semibold', 'font-bold'];
                    
                    const sizeClass = sizeVariants[index % sizeVariants.length];
                    const opacityClass = opacityVariants[index % opacityVariants.length];
                    const fontClass = fontVariants[index % fontVariants.length];
                    
                    return (
                      <span 
                        key={index} 
                        className={`${sizeClass} ${opacityClass} ${fontClass} backdrop-blur-sm rounded-full text-white drop-shadow-md`}
                      >
                        {tag}
                      </span>
                    );
                  })
                ) : (
                  <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-white text-xs font-semibold drop-shadow-md">
                    Configure your identity to see tags
                  </span>
                )}
              </div>
            </div>
            
            {/* Arrow indicator */}
            <div className="absolute top-5 right-6">
              <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* 4 Main Dashboard Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* 1. My Neura Box */}
          <Link href="/myneura">
            <Card className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-amber-500 to-amber-600 relative overflow-hidden rounded-[32px] shadow-[0_8px_30px_rgba(245,158,11,0.25)] hover:shadow-[0_20px_60px_rgba(245,158,11,0.35)]">
              
              {/* Icon Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-white animate-pulse" />
                  <Zap className="h-3.5 w-3.5 text-white/90" />
                </div>
              </div>
              
              {/* Content */}
              <div className="pt-16 pb-5 px-6 text-center">
                <h3 className="text-xl font-bold text-white mb-1">My Neura</h3>
                <p className="text-white/90 text-sm font-medium mb-4">Personal thoughts & saved insights</p>
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Lightbulb className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.stats.dots || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Zap className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.stats.savedSparks || 0}</span>
                  </div>
                </div>
                
                {/* Neural Strength Meter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Neural Strength</span>
                    <span className="text-sm font-bold text-white">{dashboard?.neuralStrength.percentage || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${dashboard?.neuralStrength.percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4">
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 2. Social Neura Box */}
          <Link href="/social">
            <Card className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-red-500 to-orange-600 relative overflow-hidden rounded-[32px] shadow-[0_8px_30px_rgba(239,68,68,0.25)] hover:shadow-[0_20px_60px_rgba(239,68,68,0.35)]">
              
              {/* Icon Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-white animate-pulse" />
                  <Zap className="h-3.5 w-3.5 text-white/90" />
                </div>
              </div>
              
              {/* Content */}
              <div className="pt-16 pb-5 px-6 text-center">
                <h3 className="text-xl font-bold text-white mb-1">Social Neura</h3>
                <p className="text-white/90 text-sm font-medium mb-4">Collective intelligence & shared thoughts</p>
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Lightbulb className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.stats.thoughts || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Search className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.stats.perspectives || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Zap className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.stats.savedSparks || 0}</span>
                  </div>
                </div>
                
                {/* Collective Growth Meter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Collective Growth</span>
                    <span className="text-sm font-bold text-white">{dashboard?.collectiveGrowth?.percentage || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${dashboard?.collectiveGrowth?.percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4">
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 3. My Thought Circles Box */}
          <Link href="/thought-circle">
            <Card className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-purple-400 to-purple-500 relative overflow-hidden rounded-[32px] shadow-[0_8px_30px_rgba(168,85,247,0.25)] hover:shadow-[0_20px_60px_rgba(168,85,247,0.35)]">
              
              {/* Icon Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <Target className="h-4 w-4 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="pt-16 pb-5 px-6 text-center">
                <h3 className="text-xl font-bold text-white mb-1">My Thought Circles</h3>
                <p className="text-white/90 text-sm font-medium">Connect with your thinking network</p>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4">
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 4. Learning Engine Box */}
          <Link href="/learning-engine">
            <Card className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-blue-400 to-indigo-400 relative overflow-hidden rounded-[32px] shadow-[0_8px_30px_rgba(59,130,246,0.25)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.35)]">
              
              {/* Icon Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <Settings className="h-4 w-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
              </div>
              
              {/* Content */}
              <div className="pt-16 pb-5 px-6 text-center">
                <h3 className="text-xl font-bold text-white mb-1">Learning Engine</h3>
                <p className="text-white/90 text-sm font-medium">Optimize your learning journey</p>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4">
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardHeader className="bg-gradient-to-r from-amber-100/80 to-orange-100/80 border-b border-amber-200/50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-amber-700/70">Your latest actions and creations</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentActivity.map((activity, index) => (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    activity.type === 'dot' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-300' :
                    activity.type === 'wheel' ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300' :
                    'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:from-red-100 hover:to-orange-100 hover:border-red-300'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'dot' ? 'bg-amber-200' :
                      activity.type === 'wheel' ? 'bg-orange-200' :
                      'bg-red-200'
                    }`}>
                      {activity.type === 'dot' ? <Lightbulb className="h-4 w-4 text-amber-700" /> :
                       activity.type === 'wheel' ? <Target className="h-4 w-4 text-orange-700" /> :
                       <Lightbulb className="h-4 w-4 text-red-700" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold capitalize ${
                        activity.type === 'dot' ? 'text-amber-900' :
                        activity.type === 'wheel' ? 'text-orange-900' :
                        'text-red-900'
                      }`}>
                        {activity.type === 'dot' ? 'New Dot Created' :
                         activity.type === 'wheel' ? 'New Wheel Created' :
                         'New Thought Shared'}
                      </p>
                      <p className={`text-sm truncate ${
                        activity.type === 'dot' ? 'text-amber-700' :
                        activity.type === 'wheel' ? 'text-orange-700' :
                        'text-red-700'
                      }`}>
                        {activity.type === 'dot' ? activity.data.summary :
                         activity.type === 'wheel' ? activity.data.heading :
                         activity.data.heading}
                      </p>
                      <p className={`text-xs mt-1 ${
                        activity.type === 'dot' ? 'text-amber-600' :
                        activity.type === 'wheel' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activity</p>
                <p className="text-gray-400 text-xs mt-1">Start creating to see your progress here</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </SharedAuthLayout>
  );
}
