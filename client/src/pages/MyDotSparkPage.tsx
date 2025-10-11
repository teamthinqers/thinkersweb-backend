import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Trophy, Target, Lightbulb, TrendingUp, ArrowRight, Brain, Users, Plus, FileText, Circle, Hexagon } from 'lucide-react';
import { Link } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth-new';
import { formatDistanceToNow } from 'date-fns';

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

  const { data: dashboardData, isLoading } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ['/api/dashboard'],
    enabled: !!user,
  });

  const dashboard = dashboardData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your DotSpark...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage src={(user as any)?.avatar || (user as any)?.linkedinPhotoUrl || (user as any)?.photoURL || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl">
                {(user as any)?.displayName?.[0]?.toUpperCase() || (user as any)?.fullName?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {(user as any)?.displayName || (user as any)?.fullName || 'there'}!
              </h1>
              <p className="text-gray-600 mt-1">Your Personal Intelligence Hub</p>
            </div>
          </div>

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

        {/* Quick Actions Banner */}
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl shadow-xl text-white">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold mb-2">Ready to grow your intelligence?</h3>
            <p className="text-amber-50">Capture insights, set goals, and connect with the community</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant="secondary" 
              className="bg-white text-amber-600 hover:bg-amber-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Dot
            </Button>
            <Button 
              variant="secondary" 
              className="bg-white text-orange-600 hover:bg-orange-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Wheel
            </Button>
            <Link href="/social">
              <Button 
                variant="secondary" 
                className="bg-white text-red-600 hover:bg-red-50"
              >
                <Brain className="h-4 w-4 mr-2" />
                Share Thought
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
