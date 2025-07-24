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

// Dynamic word animation component
const DynamicWord = ({ words }: { words: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span className="inline-block min-w-[120px] text-left bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
      {words[currentIndex]}
    </span>
  );
};

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
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Check if user has exceeded their limit
  const limitExceeded = hasExceededLimit(isRegistered, isActivated);
  const limitMessage = getLimitMessage(isRegistered, isActivated);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Increment usage count
    incrementUsageCount();

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    // Show typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: 'AI is thinking...',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      let apiEndpoint = '/api/chat/intelligent';
      const requestBody = { message: inputValue };

      const response = await axios.post(apiEndpoint, requestBody);

      // Remove typing indicator
      setMessages((prev) => prev.filter(msg => msg.id !== 'typing'));

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.reply,
        isUser: false,
        timestamp: new Date(),
        dotProposal: response.data.dotProposal,
        needsConfirmation: response.data.needsConfirmation,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Mark first chat as done if this was the first chat
      if (isFirstTime) {
        markFirstChatDone();
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Remove typing indicator on rate limit
        setMessages((prev) => prev.filter(msg => msg.id !== 'typing'));
        
        toast({
          title: 'Daily Limit Reached',
          description: error.response.data.error || 'You have reached your daily limit. Please sign up for unlimited access.',
          variant: 'destructive',
          duration: 5000,
        });
        throw error;
      } else {
        console.error('Error sending message:', error);
        // Remove typing indicator on error
        setMessages((prev) => prev.filter(msg => msg.id !== 'typing'));
        
        toast({
          title: 'Connection Issue',
          description: 'Please try again in a moment.',
          variant: 'destructive',
        });
      }
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
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* ChatGPT-style Collapsible Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700`}>
        <div className="flex flex-col h-full w-64">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img 
                src="/dotspark-logo-icon.jpeg" 
                alt="DotSpark" 
                className="w-8 h-8 rounded-full"
              />
              <h2 className="font-semibold bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent">DotSpark</h2>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start text-sm h-9">
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Chat
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start text-sm h-9">
                  <BarChart2 className="w-4 h-4 mr-3" />
                  My Neura
                </Button>
              </Link>
              <Link href="/my-neura">
                <Button variant="ghost" className="w-full justify-start text-sm h-9">
                  <Brain className="w-4 h-4 mr-3" />
                  My DotSpark
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
              {user ? (
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start text-sm h-9">
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" className="w-full justify-start text-sm h-9">
                    <User className="w-4 h-4 mr-3" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </nav>

          {/* User Info */}
          {user && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
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
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          {/* Left: Sidebar Toggle and Logo */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Icon */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/20"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <img 
              src="/dotspark-logo-icon.jpeg" 
              alt="DotSpark" 
              className="w-8 h-8 rounded-full"
            />
            <h1 className="text-xl font-semibold bg-gradient-to-r from-amber-700 to-amber-600 bg-clip-text text-transparent">DotSpark</h1>
          </div>
          
          {/* Center: Spacer */}
          <div className="flex-1"></div>

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
                          // Sign out logic
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
                    className="w-16 h-16 mx-auto mb-6 rounded-2xl"
                  />
                  
                  {/* Dynamic heading like About page */}
                  <div className="mb-6">
                    <div className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
                      <span className="font-sans tracking-normal text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200">
                        For the OG Thin<span className="relative inline-block px-3 py-2 bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white font-bold rounded-lg shadow-lg border-2 border-amber-500/20">Q</span>ers
                      </span>
                    </div>
                    
                    <div className="text-lg md:text-xl font-bold tracking-tight text-foreground mb-4">
                      Your Natural Intelligence. <DynamicWord words={['Preserved', 'Enhanced', 'Amplified', 'Protected']} />
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {user 
                      ? "I'll help you organize your thoughts into structured Dots, Wheels and Chakras for sparking actionable insights."
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
                    onClick={() => setInputValue("Help me set clear goals for ")}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">Set goals</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Define clear objectives and milestones
                    </span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 p-4 flex flex-col items-start justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setInputValue("I need help solving the problem of ")}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Puzzle className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">Solve problems</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Break down challenges systematically
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="space-y-4 p-4 pb-20">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl ${message.isUser ? 'ml-12' : 'mr-12'}`}>
                      <div className={`rounded-lg p-4 ${
                        message.isUser 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}>
                        {message.id === 'typing' ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm italic">DotSpark is thinking...</span>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.dotProposal && message.needsConfirmation && (
                              <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
                                <h4 className="font-semibold mb-2">{message.dotProposal.heading}</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Summary:</strong> {message.dotProposal.summary}</div>
                                  <div><strong>Anchor:</strong> {message.dotProposal.anchor}</div>
                                  <div><strong>Pulse:</strong> {message.dotProposal.pulse}</div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleConfirmDot(message.dotProposal!)}
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Save Dot
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setInputValue("Please revise the dot: ")}
                                    className="text-white border-white/30 hover:bg-white/10"
                                  >
                                    Revise
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-white dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                {/* Input Field */}
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
    </div>
  );
}