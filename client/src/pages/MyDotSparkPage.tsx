import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Trophy, Target, Lightbulb, TrendingUp, ArrowRight, Brain, Users, Plus, FileText, Circle, Hexagon, Pencil, Zap, Fingerprint, Search, Settings } from 'lucide-react';
import SparkIcon from '@/components/ui/spark-icon';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth-new';
import { formatDistanceToNow } from 'date-fns';
import SharedAuthLayout from '@/components/layout/SharedAuthLayout';
import BadgeDisplay from '@/components/BadgeDisplay';
import BadgeUnlockModal from '@/components/BadgeUnlockModal';
import { useState, useEffect, useMemo } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Badge } from '@shared/schema';
import { useDotSparkTuning } from '@/hooks/useDotSparkTuning';
import { generateCognitiveIdentityTags } from '@/lib/cognitiveIdentityTags';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';

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
  myNeuraStats: {
    thoughts: number;
    sparks: number;
  };
  socialStats: {
    thoughts: number;
    sparks: number;
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
  const { toast } = useToast();
  const [badgeToShow, setBadgeToShow] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const { data: dashboardData, isLoading } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ['/api/dashboard'],
    enabled: !!user,
  });

  // Fetch cognitive identity configuration from database
  const { data: cognitiveConfig } = useQuery<{ success: boolean; data: any; configured: boolean }>({
    queryKey: ['/api/cognitive-identity/config'],
    enabled: !!user,
  });

  const cognitiveIdentityConfigured = cognitiveConfig?.configured || false;

  // Get cognitive identity tags from saved configuration
  const cognitiveIdentityTags = useMemo(() => {
    if (!cognitiveConfig?.data) {
      return [];
    }
    
    const tuning = {
      cognitivePace: parseFloat(cognitiveConfig.data.cognitivePace || '0.5'),
      signalFocus: parseFloat(cognitiveConfig.data.signalFocus || '0.5'),
      impulseControl: parseFloat(cognitiveConfig.data.impulseControl || '0.5'),
      mentalEnergyFlow: parseFloat(cognitiveConfig.data.mentalEnergyFlow || '0.5'),
      analytical: parseFloat(cognitiveConfig.data.analytical || '0.8'),
      intuitive: parseFloat(cognitiveConfig.data.intuitive || '0.6'),
      contextualThinking: parseFloat(cognitiveConfig.data.contextualThinking || '0.5'),
      memoryBandwidth: parseFloat(cognitiveConfig.data.memoryBandwidth || '0.5'),
      thoughtComplexity: parseFloat(cognitiveConfig.data.thoughtComplexity || '0.5'),
      mentalModelDensity: parseFloat(cognitiveConfig.data.mentalModelDensity || '0.5'),
      patternDetectionSensitivity: parseFloat(cognitiveConfig.data.patternDetectionSensitivity || '0.5'),
      decisionMakingIndex: parseFloat(cognitiveConfig.data.decisionMakingIndex || '0.5'),
    };
    
    return generateCognitiveIdentityTags(tuning);
  }, [cognitiveConfig]);

  // Fetch ALL badges with earned/locked status for gamification
  const { data: badgesData } = useQuery<{ success: boolean; badges: any[] }>({
    queryKey: [`/api/users/${(user as any)?.id}/badges`],
    enabled: !!(user as any)?.id,
  });

  // Always show all badges (earned and locked) for gamification
  const allBadgesForDisplay = badgesData?.badges || [];
  
  // Fetch user's ThinQ Circles to determine indicator status
  const { data: circlesData } = useQuery<{ success: boolean; circles: any[] }>({
    queryKey: ['/api/thinq-circles/my-circles'],
    enabled: !!user,
  });

  const hasCircles = (circlesData?.circles?.length ?? 0) > 0;
  
  // Fetch pending circle invites
  const { data: pendingInvitesData } = useQuery<{ success: boolean; invites: any[] }>({
    queryKey: ['/api/thinq-circles/pending-invites'],
    enabled: !!user,
  });
  
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  
  // Show popup when there are pending invites
  useEffect(() => {
    if (pendingInvitesData?.invites && pendingInvitesData.invites.length > 0) {
      setShowInvitePopup(true);
    }
  }, [pendingInvitesData]);
  
  // Accept circle invite mutation
  const acceptInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      return apiRequest("POST", `/api/thinq-circles/invites/${inviteId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thinq-circles/pending-invites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/thinq-circles/my-circles'] });
      toast({
        title: 'Invite accepted!',
        description: 'You have joined the circle successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Reject circle invite mutation
  const rejectInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      return apiRequest("POST", `/api/thinq-circles/invites/${inviteId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thinq-circles/pending-invites'] });
      toast({
        title: 'Invite declined',
        description: 'The invitation has been declined',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
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
            <Link href={`/user/${(user as any)?.id}`} className="hover:scale-110 transition-transform duration-200">
              <Avatar className="h-12 w-12 border-3 border-amber-200 shadow-lg cursor-pointer hover:border-amber-400 hover:shadow-xl transition-all duration-200">
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
                <div className="flex-1">
                  <BadgeDisplay badges={allBadgesForDisplay} />
                </div>
              )}
              
              {/* Contributions Card */}
              <Card className="flex-1 inline-flex flex-col gap-2 px-4 py-3 bg-gradient-to-br from-amber-50/80 via-orange-50/80 to-amber-100/80 border-2 border-amber-200/60 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Contributions</span>
                </div>
                
                <div className="h-px w-full bg-amber-300/50 my-1"></div>
                
                <div className="flex items-center justify-around">
                  {/* Thoughts (Total contributions) */}
                  <div className="flex flex-col items-center gap-1">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">{dashboard?.stats?.thoughts || 0}</span>
                  </div>
                  {/* Sparks (Total sparks saved) */}
                  <div className="flex flex-col items-center gap-1">
                    <SparkIcon className="h-5 w-5" fill="#d97706" />
                    <span className="text-sm font-bold text-amber-700">{dashboard?.stats?.savedSparks || 0}</span>
                  </div>
                  {/* Perspectives (Total perspective messages) */}
                  <div className="flex flex-col items-center gap-1">
                    <Search className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">{dashboard?.stats?.perspectives || 0}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Badge Unlock Modal */}
        <BadgeUnlockModal 
          badge={badgeToShow}
          open={showBadgeModal}
          onOpenChange={handleBadgeModalClose}
        />

        {/* Circle Invite Popup Modal */}
        <Dialog open={showInvitePopup} onOpenChange={setShowInvitePopup}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6" style={{ color: '#F59E0B' }} />
                ThinQ Circle Invitations
              </DialogTitle>
              <DialogDescription>
                You have been invited to join the following circles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {pendingInvitesData?.invites?.map((invite: any) => (
                <div 
                  key={invite.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={invite.inviter.linkedinPhotoUrl || invite.inviter.avatar} />
                      <AvatarFallback className="text-white" style={{ backgroundColor: '#F59E0B' }}>
                        {invite.inviter.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{invite.circle.name}</h3>
                      <p className="text-sm text-gray-600">
                        Invited by <span className="font-medium">{invite.inviter.fullName}</span>
                      </p>
                      {invite.circle.description && (
                        <p className="text-sm text-gray-500 mt-1">{invite.circle.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptInviteMutation.mutate(invite.id)}
                      disabled={acceptInviteMutation.isPending}
                      className="text-white"
                      style={{ backgroundColor: '#F59E0B' }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectInviteMutation.mutate(invite.id)}
                      disabled={rejectInviteMutation.isPending}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================
            MAIN DASHBOARD: 4 Core Sections
            1. My Neura - Personal thoughts with Neural Strength meter
            2. Social Neura - Collective intelligence with Growth meter
            3. My Thought Circle - TODO: To be built
            4. Learning Engine - TODO: To be built
            ======================================== */}
        
        {/* Cognitive Identity Box - Full Width - Links conditionally based on config status */}
        <Link href={cognitiveIdentityConfigured ? "/cognitive-identity-config" : "/cognitive-identity"}>
          <Card className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-[#a78bfa] via-[#9575cd] to-[#8b5cf6] relative overflow-hidden rounded-[32px] shadow-[0_8px_30px_rgba(139,92,246,0.2)] hover:shadow-[0_20px_60px_rgba(139,92,246,0.3)] mb-3">
            
            {/* Icon Badge */}
            <div className="absolute top-3 left-6">
              <div className="relative px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full flex items-center">
                <Fingerprint className="h-4 w-4 text-white" />
                {/* Status Indicator */}
                <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${cognitiveIdentityConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
            
            {/* Content */}
            <div className="pt-12 pb-3 px-6">
              <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg">Cognitive Identity</h3>
              <p className="text-white/90 text-xs font-medium mb-2 drop-shadow-md">Your unique thought patterns and intellectual fingerprint</p>
              
              {/* Cognitive Identity Tags - Dynamic based on user settings */}
              <div className="flex flex-wrap gap-1.5 items-center justify-center md:justify-start">
                {cognitiveIdentityTags.length > 0 ? (
                  cognitiveIdentityTags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="text-xs px-3 py-1 bg-white/35 font-bold backdrop-blur-sm rounded-full text-white drop-shadow-md"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <div className="text-center w-full">
                    <p className="text-xs text-white/90 italic">
                      ✨ Set up your Cognitive Identity based on your unique thought patterns and intellectual fingerprint
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Arrow indicator */}
            <div className="absolute top-4 right-6">
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
                <div className="relative px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full flex items-center">
                  <Brain className="h-4 w-4 text-white animate-pulse" />
                  {/* Status Indicator - Green if has thoughts, Red if not */}
                  <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${(dashboard?.myNeuraStats?.thoughts || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
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
                    <span className="text-white font-semibold text-xs">{dashboard?.myNeuraStats?.thoughts || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Zap className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.myNeuraStats?.sparks || 0}</span>
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
                <div className="relative px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full flex items-center">
                  <Brain className="h-4 w-4 text-white animate-pulse" />
                  {/* Status Indicator - Always Green (Social is always active) */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                </div>
              </div>
              
              {/* Content */}
              <div className="pt-16 pb-5 px-6 text-center">
                <h3 className="text-xl font-bold text-white mb-1">Social Neura</h3>
                <p className="text-white/90 text-sm font-medium mb-4">Collective intelligence & shared thoughts</p>
                
                {/* Stats - Platform-wide for collective brain feeling */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Lightbulb className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.socialStats?.thoughts || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Search className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.socialStats?.perspectives || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Zap className="h-3 w-3 text-white" />
                    <span className="text-white font-semibold text-xs">{dashboard?.socialStats?.sparks || 0}</span>
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

          {/* 3. My ThinQ Circles Box */}
          <Link href="/thinq-circle">
            <Card className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.01] relative overflow-hidden rounded-[32px] shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.35)]" style={{ backgroundColor: '#F59E0B' }}>
              
              {/* Icon Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="relative px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <Target className="h-4 w-4 text-white" />
                  {/* Status Indicator - Green when user has circles, Red otherwise */}
                  <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${hasCircles ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>
              
              {/* Content */}
              <div className="pt-16 pb-5 px-6 text-center">
                <h3 className="text-xl font-bold text-white mb-1">My ThinQ Circles</h3>
                <p className="text-white/90 text-sm font-medium">Form your own think circles</p>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4">
                <ArrowRight className="h-4 w-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* 4. Learning Engine Box */}
          <Link href="/learning-engine">
            <Card className="group cursor-pointer border-0 transition-all duration-300 hover:scale-[1.01] relative overflow-hidden rounded-[32px] shadow-[0_4px_16px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.35)]" style={{ backgroundColor: '#F59E0B' }}>
              
              {/* Icon Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="relative px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <Settings className="h-4 w-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
                  {/* Status Indicator - Red (not yet active) */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-red-500"></div>
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
        <Card className="border-0 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-500 mt-2 text-sm">Your latest actions and creations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-amber-200 bg-white hover:bg-gradient-to-br hover:from-amber-50/50 hover:to-orange-50/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className={`relative p-3 rounded-xl shadow-sm ${
                      activity.type === 'dot' ? 'bg-gradient-to-br from-amber-100 to-yellow-100' :
                      activity.type === 'wheel' ? 'bg-gradient-to-br from-orange-100 to-amber-100' :
                      'bg-gradient-to-br from-rose-100 to-orange-100'
                    }`}>
                      {activity.type === 'dot' ? <Lightbulb className="h-5 w-5 text-amber-700" /> :
                       activity.type === 'wheel' ? <Target className="h-5 w-5 text-orange-700" /> :
                       <Lightbulb className="h-5 w-5 text-rose-700" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <p className="text-sm font-bold text-gray-900">
                          {activity.type === 'dot' ? 'New Dot Created' :
                           activity.type === 'wheel' ? 'New Wheel Created' :
                           'New Thought Shared'}
                        </p>
                        <p className="text-xs font-medium text-gray-400 shrink-0">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {activity.type === 'dot' ? activity.data.summary :
                         activity.type === 'wheel' ? activity.data.heading :
                         activity.data.heading}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 mb-4">
                  <Sparkles className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No recent activity</p>
                <p className="text-gray-400 text-sm mt-1">Start creating to see your progress here</p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </SharedAuthLayout>
  );
}
