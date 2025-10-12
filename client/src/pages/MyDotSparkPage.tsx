import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Trophy, Target, Lightbulb, TrendingUp, ArrowRight, Brain, Users, Plus, FileText, Circle, Hexagon, Pencil } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/user/${(user as any)?.id}`}>
              <Avatar className="h-16 w-16 border-4 border-amber-200 shadow-xl cursor-pointer hover:border-amber-300 transition-colors">
                <AvatarImage src={(user as any)?.avatar || (user as any)?.linkedinPhotoUrl || (user as any)?.photoURL || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl">
                  {(user as any)?.displayName?.[0]?.toUpperCase() || (user as any)?.fullName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent leading-tight">
                  {(user as any)?.displayName || (user as any)?.fullName || 'User'}
                </h1>
                <p className="text-amber-700 text-base mt-0.5">
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
        
        {/* 4 Main Dashboard Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* 1. My Neura Box */}
          <Link href="/myneura">
            <Card className="group cursor-pointer border-amber-200 hover:border-amber-400 transition-all hover:shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">My Neura</CardTitle>
                      <CardDescription>Personal thoughts & saved insights</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Circle className="h-4 w-4" />
                    <span>{dashboard?.stats.dots || 0} dots</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>{dashboard?.stats.savedSparks || 0} sparks</span>
                  </div>
                </div>
                {/* Neural Strength Meter */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Neural Strength</span>
                    <span className="text-xs font-bold text-amber-600">{dashboard?.neuralStrength.percentage || 0}%</span>
                  </div>
                  <Progress value={dashboard?.neuralStrength.percentage || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 2. Social Neura Box */}
          <Link href="/social">
            <Card className="group cursor-pointer border-red-200 hover:border-red-400 transition-all hover:shadow-xl bg-gradient-to-br from-red-50 to-orange-50 relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Social Neura</CardTitle>
                      <CardDescription>Collective intelligence & shared thoughts</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-red-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{dashboard?.stats.thoughts || 0} dots</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{dashboard?.stats.perspectives || 0} perspectives</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>{dashboard?.stats.savedSparks || 0} sparks</span>
                  </div>
                </div>
                {/* Collective Growth Meter - TODO: Calculate from backend */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Collective Growth</span>
                    <span className="text-xs font-bold text-red-600">Coming Soon</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 3. My Thought Circle Box - PLACEHOLDER */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 opacity-60 cursor-not-allowed">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">My Thought Circle</CardTitle>
                    <CardDescription>Coming soon...</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Placeholder - Details to be defined</p>
            </CardContent>
          </Card>

          {/* 4. Learning Engine Box - PLACEHOLDER */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-60 cursor-not-allowed">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Learning Engine</CardTitle>
                    <CardDescription>Coming soon...</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Placeholder - Details to be defined</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest actions and creations</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'dot' ? 'bg-amber-100' :
                      activity.type === 'wheel' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      {activity.type === 'dot' ? <Circle className="h-4 w-4 text-amber-600" /> :
                       activity.type === 'wheel' ? <Target className="h-4 w-4 text-orange-600" /> :
                       <FileText className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {activity.type === 'dot' ? 'New Dot Created' :
                         activity.type === 'wheel' ? 'New Wheel Created' :
                         'New Thought Shared'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.type === 'dot' ? activity.data.summary :
                         activity.type === 'wheel' ? activity.data.heading :
                         activity.data.heading}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
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
