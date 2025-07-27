import React from 'react';
import { Zap, Brain, Lightbulb, Sparkles, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

const Spark: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLocation('/')}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
                <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-200 rounded-full animate-bounce"></div>
              </div>
              <h1 className="text-xl font-bold text-amber-800">DotSpark Intelligence</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-2xl shadow-2xl">
              <Zap className="w-12 h-12 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-300 rounded-full animate-bounce"></div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-amber-800 mb-4">
            DotSpark Intelligence
          </h1>
          <p className="text-xl text-amber-700 mb-8 max-w-2xl mx-auto">
            Advanced AI-powered cognitive enhancement system for organizing thoughts into actionable insights
          </p>
          
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full border border-amber-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Neural Processing</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              Advanced cognitive pattern recognition and intelligent thought organization using state-of-the-art AI models.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Insight Generation</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              Automatic discovery of connections between ideas, generating actionable insights from your thoughts and experiences.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur rounded-xl p-6 border border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Spark Activation</h3>
            <p className="text-amber-700 text-sm leading-relaxed">
              Dynamic activation of cognitive sparks that enhance creativity, problem-solving, and strategic thinking.
            </p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 border border-amber-300 text-center">
          <div className="relative mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-xl">
              <Zap className="w-8 h-8 text-white" />
              <div className="absolute inset-0 animate-ping opacity-40">
                <div className="w-16 h-16 bg-yellow-400 rounded-xl"></div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-amber-800 mb-4">
            Intelligence System in Development
          </h2>
          <p className="text-amber-700 mb-6 max-w-2xl mx-auto">
            We're building an advanced AI system that will revolutionize how you organize, connect, and derive insights from your thoughts. 
            The DotSpark Intelligence will integrate seamlessly with your existing Dots, Wheels, and Chakras.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-amber-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Advanced Pattern Recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Contextual Intelligence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>Predictive Insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spark;