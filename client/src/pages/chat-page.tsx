import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { UsageLimitMessage } from '@/components/ui/usage-limit-message';
import { hasExceededLimit, getLimitMessage, incrementUsageCount, isFirstChat, markFirstChatDone } from '@/lib/usageLimits';
import { neuraStorage } from '@/lib/neuraStorage';
import axios from 'axios';

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! I\'m DotSpark Chat. Please let me know how I can help you?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [predictiveResponse, setPredictiveResponse] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isRegistered = !!user;
  const isActivated = neuraStorage.isActivated();
  const isFirstTime = isFirstChat();
  
  // Set default message only for first-time users
  const [inputValue, setInputValue] = useState(
    isFirstTime ? "Hey DotSpark, I've got a few things on my mind - need your assistance" : ""
  );
  
  // Check if user has exceeded their limit
  const limitExceeded = hasExceededLimit(isRegistered, isActivated);
  const limitMessage = getLimitMessage(isRegistered, isActivated);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extensive instant response patterns for WhatsApp-level speed
  const predictInstantResponse = (input: string): string | null => {
    const trimmed = input.trim().toLowerCase();
    
    // Greetings
    if (/^(hi|hello|hey|hiya|howdy)$/i.test(trimmed)) return "Hi there! What's on your mind?";
    if (/^(good morning|morning)$/i.test(trimmed)) return "Good morning! How can I help you today?";
    if (/^(good afternoon|afternoon)$/i.test(trimmed)) return "Good afternoon! What would you like to explore?";
    if (/^(good evening|evening)$/i.test(trimmed)) return "Good evening! How can I assist you?";
    
    // Acknowledgments
    if (/^(thanks|thank you|ty|thx)$/i.test(trimmed)) return "You're welcome! Anything else?";
    if (/^(yes|yeah|yep|yup|sure)$/i.test(trimmed)) return "Great! Tell me more.";
    if (/^(no|nope|nah)$/i.test(trimmed)) return "No problem! What else can I help with?";
    if (/^(ok|okay|alright|cool)$/i.test(trimmed)) return "Perfect! What's next?";
    
    // Farewells
    if (/^(bye|goodbye|see you|later|cya)$/i.test(trimmed)) return "See you later! Feel free to reach out anytime.";
    
    // Status/Identity
    if (/^(how are you|how's it going|what's up)$/i.test(trimmed)) return "I'm doing well! How can I assist you?";
    if (/^(what.*your name|who are you)$/i.test(trimmed)) return "I'm DotSpark, your AI companion. What can I help you with?";
    
    // Quick questions
    if (/^(help|what can you do)$/i.test(trimmed)) return "I can help with learning, questions, and conversations. What's on your mind?";
    if (/^(test|testing|hello world)$/i.test(trimmed)) return "I'm here and ready to help! What would you like to know?";
    
    // Common short responses
    if (/^(wow|amazing|nice|great|awesome)$/i.test(trimmed)) return "Glad you think so! Want to explore more?";
    if (/^(hmm|interesting)$/i.test(trimmed)) return "What's got you thinking? I'd love to hear more.";
    
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || limitExceeded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Check for instant response first
    const instantResponse = predictInstantResponse(inputValue);
    setInputValue('');

    if (instantResponse) {
      // Immediate response for common patterns
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: instantResponse,
        isUser: false,
        timestamp: new Date(),
      };
      
      // Add response immediately without any delay
      setMessages((prev) => [...prev, botMessage]);
      
      if (isFirstTime) markFirstChatDone();
      incrementUsageCount();
      return;
    }

    setIsLoading(true);

    try {
      if (isFirstTime) markFirstChatDone();
      incrementUsageCount();

      // Start showing response immediately while API processes
      const responseId = (Date.now() + 1).toString();
      
      // Add a partial response immediately for instant feedback
      const partialMessage: Message = {
        id: responseId,
        content: '',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, partialMessage]);

      // Simulate typing effect while waiting for API
      const typingWords = ['I', 'understand.', 'Let', 'me', 'help', 'you', 'with', 'that.'];
      let wordIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (wordIndex < typingWords.length) {
          const currentText = typingWords.slice(0, wordIndex + 1).join(' ');
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === responseId 
                ? { ...msg, content: currentText }
                : msg
            )
          );
          wordIndex++;
        }
      }, 200); // Fast typing simulation

      try {
        const response = await axios.post('/api/chat', {
          message: userMessage.content,
        });

        // Clear typing simulation and show real response
        clearInterval(typingInterval);
        
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === responseId 
              ? { ...msg, content: response.data.reply || "I'm here to help you." }
              : msg
          )
        );
      } catch (error) {
        clearInterval(typingInterval);
        throw error;
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove typing indicator on error
      setMessages((prev) => prev.filter(msg => msg.id !== 'typing'));
      
      toast({
        title: 'Connection Issue',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <Card className="flex-1 flex flex-col mx-auto w-full max-w-3xl border-none shadow-none">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()} 
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <CardTitle className="text-xl">DotSpark Chat</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-sm"
          >
            <Link href="/">Home</Link>
          </Button>
        </CardHeader>
        
        <UsageLimitMessage isLimitExceeded={limitExceeded} message={limitMessage} />
        
        <CardContent className="flex-1 overflow-y-auto pb-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start gap-2 max-w-[80%]">
                  {!message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/icons/ai-assistant.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.isUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || undefined} alt="User" />
                      <AvatarFallback>
                        {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter className="pt-4">
          <div className="flex w-full items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading || limitExceeded}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || limitExceeded}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}