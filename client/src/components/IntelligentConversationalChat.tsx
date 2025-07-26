import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Brain, 
  Lightbulb, 
  Clock,
  ArrowRight,
  Sparkles,
  User,
  Bot
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  conversationContext?: {
    detectedIntent: string;
    referencedPoint?: string;
    contextUsed: boolean;
    suggestedFollowUps: string[];
  };
}

interface ConversationSummary {
  topicsDiscussed: string[];
  keyPoints: string[];
  userInterests: string[];
  conversationFlow: string[];
}

const IntelligentConversationalChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId] = useState(`session_${Date.now()}`);
  const [conversationSummary, setConversationSummary] = useState<ConversationSummary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat/conversational', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          }))
        })
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.data.response,
          timestamp: data.data.metadata.timestamp,
          conversationContext: data.data.conversationContext
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setConversationSummary(data.data.conversationSummary);
      }
    }
  });

  // Continue with point mutation
  const continueWithPointMutation = useMutation({
    mutationFn: async ({ pointReference, followUpQuestion }: { pointReference: string; followUpQuestion: string }) => {
      const response = await fetch('/api/chat/continue-point', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pointReference,
          followUpQuestion,
          sessionId,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          }))
        })
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.data.response,
          timestamp: data.data.timestamp,
          conversationContext: {
            detectedIntent: 'point_continuation',
            referencedPoint: data.data.originalPoint,
            contextUsed: data.data.contextUsed,
            suggestedFollowUps: data.data.suggestedFollowUps
          }
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage('');
  };

  const handleFollowUp = (followUpText: string) => {
    const userMessage: Message = {
      role: 'user',
      content: followUpText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(followUpText);
  };

  const handleContinueWithPoint = (point: string) => {
    const followUpQuestion = `Tell me more about this point: "${point}"`;
    continueWithPointMutation.mutate({
      pointReference: point,
      followUpQuestion
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            <Brain className="inline h-8 w-8 mr-2 text-blue-600" />
            Intelligent Conversational Chat
          </h1>
          <p className="text-gray-600">
            AI with conversational memory and context awareness - no more "what point?" questions!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Conversation</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Session: {sessionId.slice(-8)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                {/* Messages Area */}
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Start a conversation! I'll remember context and maintain continuity.</p>
                        <p className="text-sm mt-2">Try asking about multiple topics, then reference specific points later.</p>
                      </div>
                    )}
                    
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-4 space-y-2 ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center space-x-2">
                            {message.role === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            <span className="text-xs opacity-75">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          
                          <div className="whitespace-pre-wrap">
                            {message.content}
                          </div>

                          {/* Context Information */}
                          {message.conversationContext && (
                            <div className="text-xs space-y-1 opacity-75">
                              {message.conversationContext.contextUsed && (
                                <div className="flex items-center space-x-1">
                                  <Sparkles className="h-3 w-3" />
                                  <span>Used conversation context</span>
                                </div>
                              )}
                              {message.conversationContext.referencedPoint && (
                                <div className="flex items-center space-x-1">
                                  <ArrowRight className="h-3 w-3" />
                                  <span>Referenced: {message.conversationContext.referencedPoint}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Suggested Follow-ups */}
                          {message.role === 'assistant' && message.conversationContext?.suggestedFollowUps && (
                            <div className="space-y-1 pt-2 border-t border-gray-200">
                              <div className="text-xs font-medium">Suggested follow-ups:</div>
                              <div className="flex flex-wrap gap-1">
                                {message.conversationContext.suggestedFollowUps.slice(0, 3).map((followUp, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6 px-2"
                                    onClick={() => handleFollowUp(followUp)}
                                    disabled={sendMessageMutation.isPending}
                                  >
                                    {followUp}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(sendMessageMutation.isPending || continueWithPointMutation.isPending) && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4" />
                            <div className="animate-pulse">AI is thinking with context...</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Input Area */}
                <div className="flex space-x-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything... I'll remember our conversation context!"
                    className="flex-1 min-h-[50px] max-h-[120px] resize-none"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Context Sidebar */}
          <div className="space-y-4">
            {/* Conversation Summary */}
            {conversationSummary && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Lightbulb className="h-4 w-4" />
                    <span>Conversation Context</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {conversationSummary.topicsDiscussed.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Topics Discussed</div>
                      <div className="flex flex-wrap gap-1">
                        {conversationSummary.topicsDiscussed.slice(0, 5).map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {conversationSummary.keyPoints.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Key Points</div>
                      <div className="space-y-1">
                        {conversationSummary.keyPoints.slice(0, 5).map((point, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto p-1 justify-start text-left w-full"
                            onClick={() => handleContinueWithPoint(point)}
                            disabled={continueWithPointMutation.isPending}
                          >
                            <ArrowRight className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{point}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {conversationSummary.userInterests.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Your Interests</div>
                      <div className="space-y-1">
                        {conversationSummary.userInterests.slice(0, 3).map((interest, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 text-xs block">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Demo Examples */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Try These Examples</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    "Tell me about 5 key principles of effective leadership",
                    "Explain the pros and cons of remote work", 
                    "What are the main challenges in AI development?"
                  ].map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto p-2 text-left w-full justify-start"
                      onClick={() => {
                        setInputMessage(example);
                        handleSendMessage();
                      }}
                      disabled={sendMessageMutation.isPending}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="text-xs text-gray-500">
                  After getting a response with multiple points, try saying:
                  <br />
                  • "Tell me more about the first point"
                  • "Expand on that leadership principle"
                  • "Can you elaborate on the remote work benefits?"
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Brain className="h-4 w-4" />
                  <span>Intelligence Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Context memory across conversation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Automatic point reference detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Smart follow-up suggestions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Topic and interest tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligentConversationalChat;