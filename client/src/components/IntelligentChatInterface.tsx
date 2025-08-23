import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, Lightbulb, Brain, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    confidenceScore?: number;
    emotionalTone?: string;
    cognitiveDepth?: number;
    personalRelevance?: number;
  };
}

interface StructuredContent {
  type: 'dot' | 'wheel' | 'chakra';
  data: any;
  confidence: number;
}

interface ConversationState {
  depth: number;
  readyToOrganize: boolean;
  suggestedNextSteps: string[];
}

interface IntelligentChatInterfaceProps {
  onClose?: () => void;
  userId?: string;
  initialMessage?: string;
}

export function IntelligentChatInterface({ 
  onClose, 
  userId = '5', 
  initialMessage 
}: IntelligentChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [conversationState, setConversationState] = useState<ConversationState>({
    depth: 0,
    readyToOrganize: false,
    suggestedNextSteps: []
  });
  const [structuredContent, setStructuredContent] = useState<StructuredContent | null>(null);
  const [showStructurePreview, setShowStructurePreview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Add initial intelligent greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hello! I'm your intelligent thought partner with advanced memory and context awareness. I remember our conversations, understand your patterns, and adapt to your unique thinking style. What's on your mind today? I'm here to help you explore, organize, and develop your thoughts with exceptional intelligence.",
        timestamp: new Date(),
        metadata: {
          emotionalTone: 'intelligent and welcoming',
          cognitiveDepth: 8,
          personalRelevance: 0.9
        }
      }]);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/organize-thoughts/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userInput: inputMessage,
          sessionId,
          action: 'continue'
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get response');
      }

      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        metadata: result.metadata
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationState(result.conversationState || conversationState);

      // Handle structured content presentation
      if (result.action === 'present_structure' && result.structuredContent) {
        setStructuredContent(result.structuredContent);
        setShowStructurePreview(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again, and I'll continue helping you organize your thoughts.",
        timestamp: new Date(),
        metadata: {
          emotionalTone: 'apologetic'
        }
      };
      setMessages(prev => [...prev, errorMessage]);
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

  const saveStructuredContent = async () => {
    if (!structuredContent) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/organize-thoughts/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          action: 'save',
          structuredContent,
          confirmed: true
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save content');
      }

      toast({
        title: 'Success!',
        description: result.message || `Your ${structuredContent.type} has been saved successfully!`,
      });

      // Add success message
      const successMessage: Message = {
        role: 'assistant',
        content: `Perfect! I've saved your ${structuredContent.type} to your DotSpark grid. Is there anything else you'd like to explore or organize?`,
        timestamp: new Date(),
        metadata: {
          emotionalTone: 'celebratory'
        }
      };

      setMessages(prev => [...prev, successMessage]);
      setShowStructurePreview(false);
      setStructuredContent(null);

    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your organized content. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dismissStructure = () => {
    setShowStructurePreview(false);
    
    const dismissMessage: Message = {
      role: 'assistant',
      content: "No problem! Let's continue exploring your thoughts. What else would you like to discuss or organize?",
      timestamp: new Date(),
      metadata: {
        emotionalTone: 'understanding'
      }
    };
    
    setMessages(prev => [...prev, dismissMessage]);
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    const confidence = message.metadata?.confidenceScore || 0;
    const tone = message.metadata?.emotionalTone;
    const depth = message.metadata?.cognitiveDepth || 1;

    return (
      <div key={index} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
        )}
        
        <div className={`max-w-[80%] rounded-lg p-3 ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-800'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {!isUser && message.metadata && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {confidence > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Confidence: {Math.round(confidence * 100)}%
                </Badge>
              )}
              {tone && (
                <Badge variant="outline" className="text-xs">
                  {tone}
                </Badge>
              )}
              {depth > 1 && (
                <Badge variant="outline" className="text-xs">
                  Depth: {depth}/10
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    );
  };

  const renderStructurePreview = () => {
    if (!structuredContent) return null;

    const { type, data, confidence } = structuredContent;

    return (
      <Card className="mb-4 border-2 border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Organized {type.charAt(0).toUpperCase() + type.slice(1)}
            </CardTitle>
            <Badge variant="secondary">
              {Math.round(confidence * 100)}% confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {type === 'dot' && (
            <div className="space-y-3">
              <div>
                <strong className="text-amber-800">Summary:</strong>
                <p className="text-gray-700 mt-1">{data.summary}</p>
              </div>
              <div>
                <strong className="text-amber-800">Anchor:</strong>
                <p className="text-gray-700 mt-1">{data.anchor}</p>
              </div>
              <div>
                <strong className="text-amber-800">Pulse:</strong>
                <p className="text-gray-700 mt-1">{data.pulse}</p>
              </div>
            </div>
          )}
          
          {type === 'wheel' && (
            <div className="space-y-3">
              <div>
                <strong className="text-amber-800">Name:</strong>
                <p className="text-gray-700 mt-1">{data.name}</p>
              </div>
              <div>
                <strong className="text-amber-800">Heading:</strong>
                <p className="text-gray-700 mt-1">{data.heading}</p>
              </div>
              <div>
                <strong className="text-amber-800">Goals:</strong>
                <p className="text-gray-700 mt-1">{data.goals}</p>
              </div>
              <div>
                <strong className="text-amber-800">Timeline:</strong>
                <p className="text-gray-700 mt-1">{data.timeline}</p>
              </div>
            </div>
          )}
          
          {type === 'chakra' && (
            <div className="space-y-3">
              <div>
                <strong className="text-amber-800">Name:</strong>
                <p className="text-gray-700 mt-1">{data.name}</p>
              </div>
              <div>
                <strong className="text-amber-800">Philosophy:</strong>
                <p className="text-gray-700 mt-1">{data.heading}</p>
              </div>
              <div>
                <strong className="text-amber-800">Description:</strong>
                <p className="text-gray-700 mt-1">{data.description}</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={saveStructuredContent}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Save to Grid
            </Button>
            <Button 
              variant="outline" 
              onClick={dismissStructure}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Continue Exploring
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-amber-800">Advanced AI Assistant</h2>
            <p className="text-sm text-gray-600">
              ChatGPT-level intelligence with perfect memory and context awareness
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(renderMessage)}
          {showStructurePreview && renderStructurePreview()}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking deeply about your thoughts...
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        {conversationState.suggestedNextSteps.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Suggested next steps:</p>
            <div className="flex gap-2 flex-wrap">
              {conversationState.suggestedNextSteps.slice(0, 3).map((step, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(step)}
                  className="text-xs"
                >
                  {step}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="h-[60px] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default IntelligentChatInterface;