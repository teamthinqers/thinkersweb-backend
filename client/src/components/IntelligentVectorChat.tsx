import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Search, Lightbulb, MessageCircle, Database, Sparkles } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VectorContext {
  source: string;
  relevance: number;
  excerpt: string;
}

interface RelatedThought {
  id: string;
  content: string;
  similarity: number;
  type: string;
}

interface ConversationInsights {
  themes: string[];
  mood: string;
  complexity: number;
  readinessForDotCreation: boolean;
}

interface IntelligentChatResponse {
  contextualResponse: string;
  relatedThoughts: RelatedThought[];
  suggestedActions: string[];
  conversationInsights: ConversationInsights;
  vectorContext: VectorContext[];
}

export default function IntelligentVectorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sessionId] = useState(`session_${Date.now()}`);

  // Get intelligent search suggestions
  const { data: searchSuggestions } = useQuery({
    queryKey: ['/api/search/suggestions'],
    enabled: messages.length === 0, // Only show initially
  });

  // Test vector database functionality
  const { data: vectorTest, isLoading: testLoading } = useQuery({
    queryKey: ['/api/vector/test'],
  });

  // Send intelligent chat message
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/chat/intelligent', {
        method: 'POST',
        body: {
          message,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          sessionId
        }
      });
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        const userMessage: ChatMessage = {
          role: 'user',
          content: currentMessage,
          timestamp: new Date()
        };
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.data?.contextualResponse || 'Response received',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setCurrentMessage('');
      }
    }
  });

  const handleSendMessage = () => {
    if (currentMessage.trim() && !chatMutation.isPending) {
      chatMutation.mutate(currentMessage);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const lastResponse = chatMutation.data?.data as IntelligentChatResponse | undefined;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-amber-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Intelligent Vector Chat
          </h1>
        </div>
        <p className="text-gray-600">
          Experience contextual AI conversations powered by your thought history
        </p>
      </div>

      {/* Vector Database Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span>Vector Database Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testLoading ? (
            <div className="text-gray-500">Testing vector database connection...</div>
          ) : vectorTest?.success ? (
            <div className="flex items-center space-x-4">
              <Badge variant="default" className="bg-green-100 text-green-800">
                {(vectorTest as any)?.data?.systemStatus || 'operational'}
              </Badge>
              <span className="text-sm text-gray-600">
                {(vectorTest as any)?.data?.message || 'Vector database connected'}
              </span>
            </div>
          ) : (
            <Badge variant="destructive">
              Vector database unavailable
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-amber-600" />
                <span>Intelligent Conversation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              {/* Messages */}
              <ScrollArea className="flex-1 border rounded-lg p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 text-amber-400" />
                    <p>Start a conversation to experience intelligent contextual responses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                              : 'bg-white border shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-amber-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Share your thoughts for intelligent contextual responses..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={chatMutation.isPending}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || chatMutation.isPending}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {chatMutation.isPending ? 'Thinking...' : 'Send'}
                  </Button>
                </div>

                {/* Smart Suggestions */}
                {messages.length === 0 && searchSuggestions?.success && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Intelligent suggestions based on your content:</p>
                    <div className="flex flex-wrap gap-2">
                      {((searchSuggestions as any)?.data?.suggestions || []).slice(0, 3).map((suggestion: string, index: number) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs hover:bg-amber-50 hover:border-amber-300"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intelligence Panel */}
        <div className="space-y-4">
          {/* Conversation Insights */}
          {lastResponse && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Conversation Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Mood</p>
                  <Badge variant="secondary" className="mt-1">
                    {lastResponse.conversationInsights.mood}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Complexity</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                        style={{ width: `${lastResponse.conversationInsights.complexity * 10}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {lastResponse.conversationInsights.complexity}/10
                    </span>
                  </div>
                </div>

                {lastResponse.conversationInsights.themes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Themes</p>
                    <div className="flex flex-wrap gap-1">
                      {lastResponse.conversationInsights.themes.map((theme, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {lastResponse.conversationInsights.readinessForDotCreation && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Ready for dot creation!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Related Thoughts */}
          {lastResponse && lastResponse.relatedThoughts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  <span>Related Thoughts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lastResponse.relatedThoughts.slice(0, 3).map((thought, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {thought.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {Math.round(thought.similarity * 100)}% similar
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {thought.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggested Actions */}
          {lastResponse && lastResponse.suggestedActions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  <span>Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lastResponse.suggestedActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => handleSuggestionClick(action)}
                    >
                      <span className="text-sm">{action}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vector Context */}
          {lastResponse && lastResponse.vectorContext.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <span>Context Sources</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lastResponse.vectorContext.slice(0, 3).map((context, index) => (
                    <div key={index} className="text-xs bg-purple-50 border border-purple-200 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-purple-800">
                          {context.source}
                        </span>
                        <span className="text-purple-600">
                          {Math.round(context.relevance * 100)}%
                        </span>
                      </div>
                      <p className="text-purple-700">
                        {context.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}