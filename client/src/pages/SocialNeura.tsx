import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function SocialNeura() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/social")}
            className="mr-4 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to DotSpark Social
          </Button>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-full shadow-lg">
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                      N
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
              Social Neura
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Neural intelligence component for social insights and collaborative thinking
            </p>
          </div>

          {/* Neural Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Neural Pattern Detection</h3>
              <p className="text-gray-600">
                Identify thinking patterns and cognitive connections across your social network
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-indigo-500">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Collaborative Intelligence</h3>
              <p className="text-gray-600">
                Enhance group thinking and decision-making through neural insights
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-purple-600">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Cognitive Mapping</h3>
              <p className="text-gray-600">
                Visualize thought networks and intellectual connections in your community
              </p>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Neural Features Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              Advanced neural intelligence capabilities for social collaboration are currently in development.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">
                Mind Sync
              </span>
              <span className="px-4 py-2 bg-indigo-200 text-indigo-800 rounded-full text-sm font-medium">
                Collective Intelligence
              </span>
              <span className="px-4 py-2 bg-purple-300 text-purple-900 rounded-full text-sm font-medium">
                Neural Networks
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}