import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Trophy, Target, Lightbulb, TrendingUp } from 'lucide-react';

export default function MyDotSparkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              My DotSpark
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Your Personal Intelligence Dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Total Dots</CardTitle>
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">128</div>
              <p className="text-sm text-gray-500 mt-1">+12 this week</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Active Wheels</CardTitle>
                <Target className="h-5 w-5 text-indigo-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">8</div>
              <p className="text-sm text-gray-500 mt-1">3 in progress</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Chakras</CardTitle>
                <Lightbulb className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">3</div>
              <p className="text-sm text-gray-500 mt-1">Life goals</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Growth</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">+24%</div>
              <p className="text-sm text-gray-500 mt-1">vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest insights and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New Dot Created</p>
                    <p className="text-xs text-gray-500">Understanding quantum mechanics basics</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Wheel Progress</p>
                    <p className="text-xs text-gray-500">Machine Learning Mastery - 60% complete</p>
                    <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Chakra Milestone</p>
                    <p className="text-xs text-gray-500">Career Growth chakra activated</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-indigo-500" />
                AI Insights
              </CardTitle>
              <CardDescription>Personalized recommendations for growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">🎯 Focus Recommendation</p>
                  <p className="text-sm text-gray-600">
                    You've created 5 dots on AI this week. Consider connecting them to your "Machine Learning Mastery" wheel.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">💡 Knowledge Gap</p>
                  <p className="text-sm text-gray-600">
                    Your learning pattern suggests exploring neural networks next to complete your AI foundation.
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">🚀 Next Steps</p>
                  <p className="text-sm text-gray-600">
                    3 saved social thoughts are ready to be integrated into your personal knowledge base.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="h-6 w-6 animate-pulse" />
            <h3 className="text-xl font-bold">More Features Coming Soon</h3>
          </div>
          <p className="text-center text-purple-100">
            Advanced analytics, knowledge graphs, AI-powered insights, and much more...
          </p>
        </div>
      </div>
    </div>
  );
}
