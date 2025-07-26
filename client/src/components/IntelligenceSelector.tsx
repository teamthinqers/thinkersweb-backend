import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  Brain, 
  MessageCircle, 
  Sparkles, 
  Network, 
  Settings, 
  Target,
  Zap,
  Bot,
  ChevronRight
} from 'lucide-react';

interface IntelligenceMode {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  level: 'Basic' | 'Advanced' | 'Experimental';
  color: string;
}

const intelligenceModes: IntelligenceMode[] = [
  {
    id: 'standard',
    title: 'Standard Chat',
    description: 'Classic AI conversation with GPT-4 and DeepSeek models',
    path: '/chat',
    icon: MessageCircle,
    features: ['Multi-model support', 'Fast responses', 'Voice input'],
    level: 'Basic',
    color: 'bg-blue-50 border-blue-200 text-blue-900'
  },
  {
    id: 'advanced',
    title: 'Advanced DotSpark',
    description: 'Sophisticated cognitive processing with Python backend integration',
    path: '/advanced-chat',
    icon: Brain,
    features: ['Dot/Wheel/Chakra structure', 'Vector memory', 'Pattern recognition', 'Python backend'],
    level: 'Advanced',
    color: 'bg-amber-50 border-amber-200 text-amber-900'
  },
  {
    id: 'vector',
    title: 'Vector Intelligence',
    description: 'Semantic search with Pinecone database and contextual memory',
    path: '/vector-chat',
    icon: Network,
    features: ['Semantic search', 'Context memory', 'Content enhancement'],
    level: 'Advanced',
    color: 'bg-purple-50 border-purple-200 text-purple-900'
  },
  {
    id: 'conversational',
    title: 'Conversational Intelligence',
    description: 'Smart conversation flow with reference detection and context awareness',
    path: '/intelligent-chat',
    icon: Sparkles,
    features: ['Reference detection', 'Context tracking', 'Follow-up suggestions'],
    level: 'Advanced',
    color: 'bg-green-50 border-green-200 text-green-900'
  },
  {
    id: 'cognitive',
    title: 'Cognitive Analysis',
    description: 'Deep cognitive structure analysis and intelligent classification',
    path: '/cognitive-analysis',
    icon: Target,
    features: ['Structure classification', 'Confidence scoring', 'Entity extraction'],
    level: 'Experimental',
    color: 'bg-rose-50 border-rose-200 text-rose-900'
  },
  {
    id: 'enhanced',
    title: 'Enhanced Coaching',
    description: 'AI-powered cognitive coaching with structure proposals',
    path: '/enhanced-chat',
    icon: Settings,
    features: ['Cognitive coaching', 'Structure proposals', 'Conversation quality'],
    level: 'Experimental',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-900'
  }
];

const IntelligenceSelector: React.FC = () => {
  const getLevelBadge = (level: string) => {
    const colors = {
      'Basic': 'bg-gray-100 text-gray-700',
      'Advanced': 'bg-orange-100 text-orange-700',
      'Experimental': 'bg-purple-100 text-purple-700'
    };

    return (
      <Badge variant="outline" className={`text-xs ${colors[level as keyof typeof colors]}`}>
        {level}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">DotSpark Intelligence</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your AI experience level. Each mode offers different capabilities for organizing thoughts and generating insights.
          </p>
        </div>

        {/* Intelligence Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {intelligenceModes.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <Link key={mode.id} href={mode.path}>
                <Card className={`${mode.color} hover:shadow-lg transition-all duration-200 cursor-pointer group h-full`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <IconComponent className="h-8 w-8 group-hover:scale-110 transition-transform" />
                      {getLevelBadge(mode.level)}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 group-hover:text-current">
                      {mode.title}
                    </h3>
                    
                    <p className="text-sm opacity-80 mb-4 line-clamp-2">
                      {mode.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {mode.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                          <span className="opacity-80">{feature}</span>
                        </div>
                      ))}
                      {mode.features.length > 3 && (
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                          <span className="opacity-80">+{mode.features.length - 3} more features</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Start Experience</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Access */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Quick Access</h3>
                <p className="text-gray-600 text-sm">
                  Go directly to your preferred intelligence level or explore all features
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href="/advanced-chat">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Zap className="h-4 w-4 mr-2" />
                    Advanced DotSpark
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline">
                    <Bot className="h-4 w-4 mr-2" />
                    Standard Chat
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Intelligence Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col items-center space-y-2">
              <Network className="h-6 w-6 text-purple-600" />
              <span>Vector Database</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Brain className="h-6 w-6 text-amber-600" />
              <span>Python Backend</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Target className="h-6 w-6 text-blue-600" />
              <span>Cognitive Mapping</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Sparkles className="h-6 w-6 text-green-600" />
              <span>Context Memory</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceSelector;