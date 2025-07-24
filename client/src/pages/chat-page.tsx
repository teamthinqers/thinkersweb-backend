import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, ArrowLeft, Menu, Brain, Users, Settings, BarChart2, User, MessageSquare, Home, Sparkles, Mic, MicOff } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { UsageLimitMessage } from '@/components/ui/usage-limit-message';
import { hasExceededLimit, getLimitMessage, incrementUsageCount, isFirstChat, markFirstChatDone } from '@/lib/usageLimits';
import { neuraStorage } from '@/lib/neuraStorage';
import axios from 'axios';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose 
} from "@/components/ui/sheet";

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  dotProposal?: DotProposal;
  needsConfirmation?: boolean;
  action?: string;
};

type DotProposal = {
  heading: string;
  summary: string;
  anchor: string;
  pulse: string;
  needsConfirmation: boolean;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to DotSpark! 🌟 I\'m your AI companion, ready to help you capture, organize, and transform your thoughts into powerful insights. What\'s on your mind today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [predictiveResponse, setPredictiveResponse] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isRegistered = !!user;
  const isActivated = neuraStorage.isActivated();
  const isFirstTime = isFirstChat();
  
  // Set default message only for first-time users
  const [inputValue, setInputValue] = useState(
    isFirstTime ? "Hi DotSpark, I would need your assistance in saving a dot" : ""
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
        const response = await axios.post('/api/chat/intelligent', {
          message: userMessage.content,
          messages: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          })),
          action: 'chat'
        });

        // Clear typing simulation and show real response
        clearInterval(typingInterval);
        
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === responseId 
              ? { 
                  ...msg, 
                  content: response.data.reply || "I'm here to help you.",
                  dotProposal: response.data.dotProposal,
                  needsConfirmation: response.data.needsConfirmation,
                  action: response.data.action
                }
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

  const handleConfirmDot = async (dotProposal: DotProposal) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/chat/intelligent', {
        message: 'yes',
        dotProposal,
        action: 'confirm_dot'
      });

      const confirmationMessage: Message = {
        id: Date.now().toString(),
        content: response.data.reply,
        isUser: false,
        timestamp: new Date(),
        action: 'dot_saved'
      };

      setMessages(prev => [...prev, confirmationMessage]);

    } catch (error) {
      console.error('Error confirming dot:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I had trouble saving your dot. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:to-slate-800">
      {/* Enhanced Header with Hamburger Menu */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-amber-200/50 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-amber-100 dark:hover:bg-slate-800">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-6 border-b border-amber-200 dark:border-slate-700">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-gray-900 dark:text-white">DotSpark</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">AI Companion</p>
                    </div>
                  </div>
                  
                  {/* Navigation Menu */}
                  <nav className="flex-1 pt-6">
                    <div className="space-y-2">
                      <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-100 dark:hover:bg-slate-800">
                          <BarChart2 className="w-5 h-5" />
                          <span>Dashboard</span>
                        </Button>
                      </Link>
                      <Link href="/my-neura">
                        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-100 dark:hover:bg-slate-800">
                          <Brain className="w-5 h-5" />
                          <span>My Neura</span>
                        </Button>
                      </Link>
                      <Link href="/social">
                        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-100 dark:hover:bg-slate-800">
                          <Users className="w-5 h-5" />
                          <span>Social</span>
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-100 dark:hover:bg-slate-800">
                          <User className="w-5 h-5" />
                          <span>Profile</span>
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-100 dark:hover:bg-slate-800">
                          <Settings className="w-5 h-5" />
                          <span>Settings</span>
                        </Button>
                      </Link>
                      <Link href="/about">
                        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-100 dark:hover:bg-slate-800">
                          <Home className="w-5 h-5" />
                          <span>About</span>
                        </Button>
                      </Link>
                    </div>
                  </nav>
                  
                  {/* User Info */}
                  {user && (
                    <div className="pt-6 border-t border-amber-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.photoURL || undefined} alt="User" />
                          <AvatarFallback>
                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Center: DotSpark Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                DotSpark
              </h1>
            </div>

            {/* Right: User Avatar */}
            {user && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || undefined} alt="User" />
                <AvatarFallback>
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {limitExceeded && (
          <UsageLimitMessage 
            message={limitMessage}
            className="mb-6"
          />
        )}
        
        <Card className="min-h-[calc(100vh-200px)] shadow-2xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <CardHeader className="pb-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-t-lg">
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Your AI Companion is Ready
            </CardTitle>
            <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
              Share your thoughts, and I'll help you organize them into powerful insights
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto pb-0 max-h-[60vh]">
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
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Show dot proposal if available */}
                    {message.dotProposal && message.needsConfirmation && (
                      <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                              {message.dotProposal.heading}
                            </h4>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Summary:</span>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">{message.dotProposal.summary}</p>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Anchor:</span>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">{message.dotProposal.anchor}</p>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Pulse:</span>
                              <span className="inline-block ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                                {message.dotProposal.pulse}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={() => handleConfirmDot(message.dotProposal!)}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save This Dot'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setInputValue("I'd like to modify this dot");
                              }}
                              className="text-sm px-4 py-2"
                            >
                              Modify
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Show success message for saved dots */}
                    {message.action === 'dot_saved' && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                            Dot saved successfully!
                          </span>
                        </div>
                      </div>
                    )}
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
        
          <CardFooter className="pt-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-b-lg">
            <div className="flex w-full items-center space-x-3">
              {/* Voice Input Button */}
              <Button
                variant="outline"
                size="icon"
                disabled={isLoading || limitExceeded}
                className="shrink-0 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              {/* Text Input */}
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts, ideas, or insights..."
                disabled={isLoading || limitExceeded}
                className="flex-1 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-200"
              />
              
              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || limitExceeded}
                className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-amber-600">
                💡 Ideas
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-amber-600">
                📚 Learning
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-amber-600">
                🎯 Goals
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-amber-600">
                💼 Business
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}