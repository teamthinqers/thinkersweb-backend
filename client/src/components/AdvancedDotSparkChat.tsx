import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Loader2, 
  Brain, 
  Sparkles, 
  Target, 
  Lightbulb,
  Network,
  Zap,
  MessageCircle,
  Settings
} from 'lucide-react';
import { ModelSelector, type AIModel } from '@/components/chat/ModelSelector';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    processingTime?: number;
    features?: string[];
  };
  structuredOutput?: {
    dot?: {
      summary: string;
      context: string;
      pulse: string;
    };
    wheel?: {
      heading: string;
      summary: string;
      timeline: string;
    };
    chakra?: {
      heading: string;
      purpose: string;
      timeline: string;
    };
    suggested_linkages?: string[];
  };
}

interface AdvancedDotSparkChatProps {
  className?: string;
}

const AdvancedDotSparkChat: React.FC<AdvancedDotSparkChatProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o');
  const [sessionId, setSessionId] = useState(`advanced_${Date.now()}`);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/dotspark/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          model: selectedModel === 'gpt-4o' ? 'gpt-4' : 'deepseek',
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          metadata: {
            model: data.data.metadata?.model,
            processingTime: data.data.metadata?.processingTime,
            features: data.data.features ? Object.keys(data.data.features).filter(k => data.data.features[k]) : []
          },
          structuredOutput: data.data.structuredOutput
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Show toast for structured output
        if (data.data.structuredOutput) {
          toast({
            title: "Thought Organized",
            description: "Your thought has been structured into Dots, Wheels, and Chakras",
          });
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const organizeThoughts = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/dotspark/organize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thoughts: input.trim(),
          model: selectedModel === 'gpt-4o' ? 'gpt-4' : 'deepseek'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to organize thoughts');
      }

      const data = await response.json();

      if (data.success) {
        const userMessage: Message = {
          role: 'user',
          content: `Organize: ${input.trim()}`,
          timestamp: new Date()
        };

        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          metadata: {
            model: data.data.metadata?.model,
            processingTime: data.data.metadata?.processingTime,
            features: ['structured_organization']
          },
          structuredOutput: data.data.structuredOutput
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setInput('');

        toast({
          title: "Thoughts Organized",
          description: "Your thoughts have been structured into cognitive framework",
        });
      }
    } catch (error) {
      console.error('Organization error:', error);
      toast({
        title: "Error",
        description: "Failed to organize thoughts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-amber-600" />
              <span>Advanced DotSpark Intelligence</span>
            </CardTitle>
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Network className="h-3 w-3 mr-1" />
              Vector Memory
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Target className="h-3 w-3 mr-1" />
              Cognitive Mapping
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Pattern Recognition
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Zap className="h-3 w-3 mr-1" />
              Python Backend
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-4">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Brain className="h-16 w-16 text-amber-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced DotSpark Intelligence</h3>
                <p className="text-gray-600 mb-4">
                  Experience sophisticated cognitive processing with Python backend integration
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <Lightbulb className="h-3 w-3" />
                    <span>Dot/Wheel/Chakra Structure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Network className="h-3 w-3" />
                    <span>Vector Memory</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>GPT-4 + DeepSeek</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Settings className="h-3 w-3" />
                    <span>Context Awareness</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] space-y-2 ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      {/* Message bubble */}
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white ml-auto'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Metadata */}
                        {message.metadata && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.metadata.model && (
                              <Badge variant="outline" className="text-xs">
                                {message.metadata.model}
                              </Badge>
                            )}
                            {message.metadata.processingTime && (
                              <Badge variant="outline" className="text-xs">
                                {message.metadata.processingTime}ms
                              </Badge>
                            )}
                            {message.metadata.features?.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Structured output */}
                      {message.structuredOutput && (
                        <div className="space-y-2">
                          {message.structuredOutput.dot && (
                            <Card className="bg-amber-50 border-amber-200">
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                  <span className="text-xs font-semibold text-amber-700">DOT</span>
                                </div>
                                <p className="text-sm font-medium">{message.structuredOutput.dot.summary}</p>
                                <p className="text-xs text-gray-600 mt-1">{message.structuredOutput.dot.context}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {message.structuredOutput.dot.pulse}
                                </Badge>
                              </CardContent>
                            </Card>
                          )}

                          {message.structuredOutput.wheel && (
                            <Card className="bg-orange-50 border-orange-200">
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                  <span className="text-xs font-semibold text-orange-700">WHEEL</span>
                                </div>
                                <p className="text-sm font-medium">{message.structuredOutput.wheel.heading}</p>
                                <p className="text-xs text-gray-600 mt-1">{message.structuredOutput.wheel.summary}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {message.structuredOutput.wheel.timeline}
                                </Badge>
                              </CardContent>
                            </Card>
                          )}

                          {message.structuredOutput.chakra && (
                            <Card className="bg-purple-50 border-purple-200">
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  <span className="text-xs font-semibold text-purple-700">CHAKRA</span>
                                </div>
                                <p className="text-sm font-medium">{message.structuredOutput.chakra.heading}</p>
                                <p className="text-xs text-gray-600 mt-1">{message.structuredOutput.chakra.purpose}</p>
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {message.structuredOutput.chakra.timeline}
                                </Badge>
                              </CardContent>
                            </Card>
                          )}

                          {message.structuredOutput.suggested_linkages && message.structuredOutput.suggested_linkages.length > 0 && (
                            <Card className="bg-blue-50 border-blue-200">
                              <CardContent className="p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Network className="h-3 w-3 text-blue-500" />
                                  <span className="text-xs font-semibold text-blue-700">LINKAGES</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {message.structuredOutput.suggested_linkages.map((link, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {link}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Processing with advanced intelligence...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {/* Input area */}
        <CardContent className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts for advanced cognitive processing..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={organizeThoughts}
              disabled={isLoading || !input.trim()}
              variant="outline"
              size="sm"
            >
              <Lightbulb className="h-4 w-4" />
            </Button>
            <Button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Press Enter to send • Lightbulb to organize thoughts</span>
            <span>Session: {sessionId.slice(-8)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedDotSparkChat;