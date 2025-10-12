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
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                  {(user as any)?.displayName || (user as any)?.fullName || 'User'}
                </h1>
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
              <p className="text-amber-700 text-base">
                {(user as any)?.linkedinHeadline || 'Professional Headline'}
              </p>
            </div>
          </div>

          {/* Badge Unlock Modal */}
          <BadgeUnlockModal 
            badge={badgeToShow}
            open={showBadgeModal}
            onOpenChange={handleBadgeModalClose}
          />

          {/* Neural Strength Progress */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-600" />
                    Neural Strength
                  </CardTitle>
                  <CardDescription>Your cognitive growth and engagement level</CardDescription>
                </div>
                <div className="text-3xl font-bold text-amber-600">
                  {dashboard?.neuralStrength.percentage || 0}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={dashboard?.neuralStrength.percentage || 0} className="h-3 mb-4" />
              <div className="flex flex-wrap gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dashboard?.neuralStrength.milestones.cognitiveIdentityCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {dashboard?.neuralStrength.milestones.cognitiveIdentityCompleted ? '✓' : '○'} Cognitive Identity
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dashboard?.neuralStrength.milestones.learningEngineCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {dashboard?.neuralStrength.milestones.learningEngineCompleted ? '✓' : '○'} Learning Engine
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dashboard?.neuralStrength.milestones.hasActivity 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {dashboard?.neuralStrength.milestones.hasActivity ? '✓' : '○'} First Activity
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards - Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Social Neura Card */}
          <Link href="/social">
            <Card className="group cursor-pointer border-red-200 hover:border-red-400 transition-all hover:shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Social Neura</CardTitle>
                      <CardDescription>Collective intelligence & shared thoughts</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-red-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{dashboard?.stats.thoughts || 0} thoughts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{dashboard?.stats.perspectives || 0} perspectives</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* My Neura Card */}
          <Link href="/myneura">
            <Card className="group cursor-pointer border-amber-200 hover:border-amber-400 transition-all hover:shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">My Neura</CardTitle>
                      <CardDescription>Personal thoughts & saved insights</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>{dashboard?.stats.savedSparks || 0} saved sparks</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Dots</CardTitle>
                <Circle className="h-5 w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {dashboard?.stats.dots || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Single insights captured</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Wheels</CardTitle>
                <Target className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {dashboard?.stats.wheels || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Goal-oriented projects</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chakras</CardTitle>
                <Hexagon className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {dashboard?.stats.chakras || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">Life purposes defined</p>
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

        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-amber-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                AI Insights
              </CardTitle>
              <CardDescription>Personalized recommendations for your growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.neuralStrength.percentage === 0 ? (
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-900 mb-2">🎯 Get Started</p>
                    <p className="text-sm text-gray-700">
                      Welcome to DotSpark! Start by creating your first dot to capture an insight, or share a thought on Social Neura to connect with the community.
                    </p>
                  </div>
                ) : dashboard?.stats.dots === 0 ? (
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-900 mb-2">💡 Capture Your Insights</p>
                    <p className="text-sm text-gray-700">
                      You haven't created any dots yet. Dots are powerful tools for capturing single insights and building your personal knowledge base.
                    </p>
                  </div>
                ) : dashboard?.stats.wheels === 0 ? (
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-900 mb-2">🎯 Set Your Goals</p>
                    <p className="text-sm text-gray-700">
                      You have {dashboard?.stats.dots} dots. Consider creating a wheel to organize them around a specific goal or learning objective.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-2">🚀 Great Progress!</p>
                    <p className="text-sm text-gray-700">
                      You're building a strong knowledge network! Keep connecting your insights and engaging with the community to grow your neural strength.
                    </p>
                  </div>
                )}
                
                {!dashboard?.neuralStrength.milestones.cognitiveIdentityCompleted && (
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-900 mb-2">📋 Complete Your Profile</p>
                    <p className="text-sm text-gray-700">
                      Complete your cognitive identity to boost your neural strength and unlock personalized recommendations.
                    </p>
                  </div>
                )}
                
                {dashboard && dashboard.stats.savedSparks > 0 && (
                  <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-900 mb-2">✨ Sparks to Explore</p>
                    <p className="text-sm text-gray-700">
                      You have {dashboard.stats.savedSparks} saved sparks from the community. Review them in My Neura and integrate the insights into your knowledge base.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Next Steps
              </CardTitle>
              <CardDescription>Actions to accelerate your growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/social">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-900">Explore Social Neura</p>
                        <p className="text-xs text-gray-600 mt-1">Discover collective intelligence and shared thoughts</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-red-500" />
                    </div>
                  </div>
                </Link>

                <Link href="/myneura">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 hover:border-amber-300 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-900">Review My Neura</p>
                        <p className="text-xs text-gray-600 mt-1">Organize personal thoughts and saved insights</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-amber-500" />
                    </div>
                  </div>
                </Link>

                {dashboard && dashboard.stats.dots > 0 && dashboard.stats.wheels === 0 && (
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-900">Create Your First Wheel</p>
                        <p className="text-xs text-gray-600 mt-1">Organize your {dashboard.stats.dots} dots into goal-oriented projects</p>
                      </div>
                      <Target className="h-4 w-4 text-orange-500" />
                    </div>
                  </div>
                )}

                {dashboard && dashboard.stats.thoughts === 0 && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-900">Share Your First Thought</p>
                        <p className="text-xs text-gray-600 mt-1">Contribute to collective intelligence on Social Neura</p>
                      </div>
                      <Users className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Banner */}
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl shadow-xl text-white">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold mb-2">Ready to grow your intelligence?</h3>
            <p className="text-amber-50">Capture insights, set goals, and connect with the community</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/social">
              <Button 
                variant="secondary" 
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <Brain className="h-4 w-4 mr-2" />
                Share Thought
              </Button>
            </Link>
            <Link href="/myneura">
              <Button 
                variant="secondary" 
                className="bg-white text-amber-600 hover:bg-amber-50"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                My Neura
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </SharedAuthLayout>
  );
}
