import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Sparkles,
  MessageSquare,
  BarChart3,
  Eye,
  Zap
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: any;
  metadata?: any;
}

interface ConversationAnalysis {
  cognitiveComplexity: number;
  emotionalIntelligence: number;
  contextualRelevance: number;
  creativityIndex: number;
  logicalCoherence: number;
  conversationStrategy: string;
  userEngagementPrediction: number;
  topicTransitionReadiness: number;
}

interface SmartSuggestion {
  type: 'question' | 'clarification' | 'expansion' | 'action';
  content: string;
  confidence: number;
  reasoning: string;
}

export default function EnhancedChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [currentAnalysis, setCurrentAnalysis] = useState<ConversationAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Advanced chat mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { 
      message: string; 
      sessionId: string; 
      previousMessages: any[];
      model?: string;
    }) => {
      return apiRequest(`/api/chat/advanced`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      const response = data.data;
      
      // Add assistant message
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.response.content,
        timestamp: new Date(),
        analysis: response.analysis,
        metadata: response.metadata
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentAnalysis(response.analysis);
      setIsTyping(false);
      
      // Generate suggestions for next interaction
      generateSuggestions(response.response.content);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsTyping(false);
    }
  });

  // Generate smart suggestions
  const suggestionsMutation = useMutation({
    mutationFn: async (data: {
      message: string;
      conversationHistory: any[];
      context: any;
    }) => {
      return apiRequest(`/api/chat/suggestions`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setSuggestions(data.data.suggestions || []);
    }
  });

  const generateSuggestions = (lastMessage: string) => {
    suggestionsMutation.mutate({
      message: lastMessage,
      conversationHistory: messages.slice(-5),
      context: { sessionId, analysis: currentAnalysis }
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setInputValue('');

    // Prepare conversation history
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    chatMutation.mutate({
      message: userMessage.content,
      sessionId,
      previousMessages: conversationHistory,
      model: 'claude-sonnet-4'
    });
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    setInputValue(suggestion.content);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Calculate overall conversation quality score
  const getQualityScore = (): number => {
    if (!currentAnalysis) return 0;
    const {
      cognitiveComplexity,
      emotionalIntelligence,
      contextualRelevance,
      creativityIndex,
      logicalCoherence
    } = currentAnalysis;
    
    return Math.round((cognitiveComplexity + emotionalIntelligence + contextualRelevance + creativityIndex + logicalCoherence) / 5);
  };

  const getEngagementLevel = (): string => {
    const score = currentAnalysis?.userEngagementPrediction || 0;
    if (score >= 80) return 'Highly Engaged';
    if (score >= 60) return 'Engaged';
    if (score >= 40) return 'Moderately Engaged';
    return 'Low Engagement';
  };

  const getStrategyDescription = (strategy: string): string => {
    const strategies: Record<string, string> = {
      exploration: 'Exploring new ideas and concepts',
      clarification: 'Seeking clarity and understanding',
      deepening: 'Diving deeper into topics',
      synthesis: 'Connecting and synthesizing ideas',
      action: 'Focusing on actionable outcomes'
    };
    return strategies[strategy] || 'Adaptive conversation flow';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-amber-600" />
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Enhanced DotSpark AI
                </h1>
              </div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                ChatGPT-Level Intelligence
              </Badge>
            </div>
            
            {currentAnalysis && (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Quality Score: </span>
                  <span className="font-semibold text-amber-600">{getQualityScore()}%</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Engagement: </span>
                  <span className="font-semibold text-green-600">{getEngagementLevel()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Welcome to Enhanced DotSpark AI
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Experience ChatGPT-level intelligence with sophisticated conversation analysis and cognitive insights.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left"
                    onClick={() => setInputValue("Help me organize my thoughts about a complex project I'm working on")}
                  >
                    <div>
                      <div className="font-medium">Organize Complex Thoughts</div>
                      <div className="text-sm text-slate-500 mt-1">Get structured insights for complex topics</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left"
                    onClick={() => setInputValue("I need help making a difficult decision between multiple options")}
                  >
                    <div>
                      <div className="font-medium">Decision Support</div>
                      <div className="text-sm text-slate-500 mt-1">Receive analytical guidance for choices</div>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="text-sm leading-relaxed">{message.content}</div>
                  {message.analysis && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="h-3 w-3 text-blue-500" />
                          <span>Complexity: {message.analysis.cognitiveComplexity}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span>Engagement: {message.analysis.userEngagementPrediction}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-3 w-3 text-purple-500" />
                          <span>{getStrategyDescription(message.analysis.conversationStrategy)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Smart Suggestions
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3 hover:bg-amber-50 hover:border-amber-200"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{suggestion.content}</span>
                      <Badge variant="secondary" className="text-xs ml-1">
                        {suggestion.confidence}%
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything to DotSpark AI..."
                className="flex-1 h-12 text-base"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || chatMutation.isPending}
                className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Sidebar */}
      {currentAnalysis && (
        <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Eye className="h-5 w-5 text-amber-600" />
                <span>Conversation Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quality Metrics */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Cognitive Complexity</span>
                  <span className="text-sm text-slate-600">{currentAnalysis.cognitiveComplexity}%</span>
                </div>
                <Progress value={currentAnalysis.cognitiveComplexity} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Emotional Intelligence</span>
                  <span className="text-sm text-slate-600">{currentAnalysis.emotionalIntelligence}%</span>
                </div>
                <Progress value={currentAnalysis.emotionalIntelligence} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Contextual Relevance</span>
                  <span className="text-sm text-slate-600">{currentAnalysis.contextualRelevance}%</span>
                </div>
                <Progress value={currentAnalysis.contextualRelevance} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Creativity Index</span>
                  <span className="text-sm text-slate-600">{currentAnalysis.creativityIndex}%</span>
                </div>
                <Progress value={currentAnalysis.creativityIndex} className="h-2" />
              </div>

              <Separator />

              {/* Conversation Insights */}
              <div>
                <h4 className="font-medium mb-2 flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span>Current Strategy</span>
                </h4>
                <Badge variant="outline" className="text-xs">
                  {getStrategyDescription(currentAnalysis.conversationStrategy)}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Engagement Level</h4>
                <div className="flex items-center space-x-2">
                  <Progress value={currentAnalysis.userEngagementPrediction} className="h-2 flex-1" />
                  <span className="text-sm font-medium text-green-600">
                    {getEngagementLevel()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Topic Transition</h4>
                <div className="flex items-center space-x-2">
                  <Progress value={currentAnalysis.topicTransitionReadiness} className="h-2 flex-1" />
                  <span className="text-xs text-slate-600">
                    {currentAnalysis.topicTransitionReadiness}% Ready
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}