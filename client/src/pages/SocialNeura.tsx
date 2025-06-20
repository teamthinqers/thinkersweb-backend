import { ArrowLeft, Brain, Users, Zap, Network, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';

export default function SocialNeura() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Check if user came from PWA dot interface
    const fromDotInterface = localStorage.getItem('dotSocialNavigation');
    
    if (fromDotInterface === 'true') {
      // Clear the flag
      localStorage.removeItem('dotSocialNavigation');
      // Navigate back to dot interface
      setLocation('/dot');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-red-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Social Neura
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Neural intelligence component within the DotSpark social ecosystem
          </p>
        </div>

        {/* Coming Soon Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Network className="w-5 h-5" />
                Neural Networks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect with other neural extensions and share cognitive patterns across the network.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Zap className="w-5 h-5" />
                Collective Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Participate in collective problem-solving and collaborative thinking processes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-5 h-5" />
                Neural Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access shared insights and cognitive enhancements from the neural community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Section */}
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="text-purple-100 mb-6">
              Social Neura is currently in development. This neural intelligence component will enhance 
              collaborative thinking and shared cognitive experiences within DotSpark.
            </p>
            <Button
              onClick={() => window.open("https://www.dotspark.in/social", "_blank")}
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Users className="w-4 h-4 mr-2" />
              Visit DotSpark Social
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}