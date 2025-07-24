import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, ArrowLeft, Menu, Brain, Users, Settings, BarChart2, User, MessageSquare, Home, Sparkles, Mic, MicOff, Info, Lightbulb, Target, Puzzle } from 'lucide-react';
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
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to DotSpark! 🌟 I\'m your AI companion. Share your thoughts with me and I\'ll help you organize them into structured insights. Try me out - no signup required!',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [predictiveResponse, setPredictiveResponse] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message based on authentication status
  useEffect(() => {
    const welcomeMessage = user 
      ? 'Welcome back to DotSpark! 🌟 I\'m your AI companion, ready to help you capture, organize, and transform your thoughts into powerful insights. What\'s on your mind today?'
      : 'Welcome to DotSpark! 🌟 I\'m your AI companion. Share your thoughts with me and I\'ll help you organize them into structured insights. Try me out - no signup required!';
    
    setMessages(prev => prev.map(msg => 
      msg.id === '1' ? { ...msg, content: welcomeMessage } : msg
    ));
  }, [user]);
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
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* ChatGPT-style Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {/* Left: Sidebar Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <img 
                    src="/dotspark-logo-icon.jpeg" 
                    alt="DotSpark" 
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">DotSpark</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 p-2">
                <div className="space-y-1">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start text-sm h-9">
                      <BarChart2 className="w-4 h-4 mr-3" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/my-neura">
                    <Button variant="ghost" className="w-full justify-start text-sm h-9">
                      <Brain className="w-4 h-4 mr-3" />
                      My Neura
                    </Button>
                  </Link>
                  <Link href="/social">
                    <Button variant="ghost" className="w-full justify-start text-sm h-9">
                      <Users className="w-4 h-4 mr-3" />
                      Social
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="ghost" className="w-full justify-start text-sm h-9">
                      <Info className="w-4 h-4 mr-3" />
                      About
                    </Button>
                  </Link>
                </div>
              </nav>
              
              {/* User Section */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="text-xs">
                        {user.displayName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <Link href="/auth">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Logo and Title */}
        <div className="flex items-center gap-3">
          <img 
            src="/dotspark-logo-icon.jpeg" 
            alt="DotSpark" 
            className="w-8 h-8 rounded-full"
          />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">DotSpark</h1>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback className="text-xs">
                      {user.displayName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
                  {/* Profile Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>
                          {user.displayName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{user.displayName || 'User'}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Actions */}
                  <nav className="flex-1 p-2">
                    <div className="space-y-1">
                      <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start text-sm h-9">
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start text-sm h-9">
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Button>
                      </Link>
                    </div>
                  </nav>
                  
                  {/* Sign Out */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      variant="outline" 
                      className="w-full text-sm"
                      onClick={() => {
                        // Add sign out logic here
                        console.log('Sign out clicked');
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Link href="/auth">
              <Button variant="outline" size="sm" className="text-sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {limitExceeded && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <UsageLimitMessage message={limitMessage} isLimitExceeded={limitExceeded} />
          </div>
        )}
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 1 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <img 
                  src="/dotspark-logo-header.png" 
                  alt="DotSpark" 
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl"
                />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {user 
                    ? "I'll help you organize your thoughts into structured insights and actionable knowledge."
                    : "Start chatting to see how I can help organize your thoughts. No signup required!"
                  }
                </p>
              </div>
              
              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                <Button 
                  variant="outline" 
                  className="h-20 p-4 flex flex-col items-start justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setInputValue("Help me organize my thoughts about ")}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Organize thoughts</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Structure ideas into clear insights
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 p-4 flex flex-col items-start justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setInputValue("I want to brainstorm ideas for ")}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Brainstorm ideas</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Generate and explore new concepts
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 p-4 flex flex-col items-start justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setInputValue("Help me plan and set goals for ")}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Plan & Goals</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Create actionable plans and objectives
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 p-4 flex flex-col items-start justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setInputValue("I need help with problem-solving for ")}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Puzzle className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">Problem solving</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Find solutions and overcome challenges
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-4xl mx-auto p-4">
              <div className="space-y-6">
                {messages.slice(1).map((message) => (
                  <div key={message.id} className="group">
                    <div className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                      {!message.isUser && (
                        <div className="flex-shrink-0">
                          <img 
                            src="/dotspark-logo-icon.jpeg" 
                            alt="DotSpark AI" 
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                      )}
                      
                      <div className={`flex flex-col max-w-[70%] ${message.isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.isUser 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                    
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
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              {/* Voice Input */}
              <Button
                variant="outline"
                size="icon"
                disabled={isLoading || limitExceeded}
                onClick={() => setIsRecording(!isRecording)}
                className="shrink-0"
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              {/* Text Input */}
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message DotSpark..."
                  disabled={isLoading || limitExceeded}
                  className="min-h-[44px] resize-none border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || limitExceeded}
                size="icon"
                className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}