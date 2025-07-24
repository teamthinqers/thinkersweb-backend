import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, ArrowLeft, Menu, Brain, Users, Settings, BarChart2, User, MessageSquare, Home, Sparkles, Mic, MicOff, Info, Lightbulb, Target, Puzzle, RotateCcw, Plus, RefreshCw, Phone } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { UsageLimitMessage } from '@/components/ui/usage-limit-message';
import { hasExceededLimit, getLimitMessage, incrementUsageCount, isFirstChat, markFirstChatDone } from '@/lib/usageLimits';
import { neuraStorage } from '@/lib/neuraStorage';
import { ModelSelector, type AIModel } from '@/components/chat/ModelSelector';
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

// ChatGPT-style typewriter effect component with fast typing and skip option
const TypewriterText = ({ text, onComplete, onProgress }: { 
  text: string; 
  onComplete?: () => void; 
  onProgress?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [chunkSize, setChunkSize] = useState(1);

  useEffect(() => {
    if (isSkipped || currentIndex >= text.length) {
      if (!isComplete) {
        setDisplayedText(text);
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      // Start with single characters, then accelerate to chunks for faster completion
      const nextIndex = Math.min(currentIndex + chunkSize, text.length);
      setDisplayedText(text.slice(0, nextIndex));
      setCurrentIndex(nextIndex);
      
      // Accelerate after initial characters for faster completion
      if (currentIndex > 20) {
        setChunkSize(Math.min(5, Math.ceil(text.length / 50))); // Adaptive chunk size
      }
      
      onProgress?.(); // Trigger scroll
    }, chunkSize === 1 ? 8 : 3); // Faster timing for chunks
    
    return () => clearTimeout(timer);
  }, [currentIndex, text, isComplete, onComplete, onProgress, isSkipped, chunkSize]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
    setIsSkipped(false);
    setChunkSize(1);
  }, [text]);

  // Skip typing on click
  const handleSkip = () => {
    setIsSkipped(true);
  };

  return (
    <span 
      className="whitespace-pre-wrap text-sm leading-7 text-gray-800 dark:text-gray-100 cursor-pointer"
      onClick={handleSkip}
      title="Click to show full message instantly"
    >
      {displayedText}
      {!isComplete && <span className="inline-block w-2 h-5 bg-gray-800 dark:bg-gray-100 animate-pulse ml-0.5"></span>}
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
  isTyping?: boolean;
  isNewMessage?: boolean; // Flag to control typewriter effect
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
  
  // Load messages from localStorage or use default welcome message
  const loadMessages = (): Message[] => {
    const savedMessages = localStorage.getItem('dotspark-chat-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          isNewMessage: false // Prevent typewriter effect for saved messages
        }));
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
    
    return [
      {
        id: '1',
        content: 'Welcome to DotSpark! 🌟 I\'m your thinking companion. Share your thoughts with me and I\'ll help you organize them into structured insights. Try "Organize Thoughts" to get started - no signup required!',
        isUser: false,
        timestamp: new Date(),
        isNewMessage: false, // Welcome message should not use typewriter
      },
    ];
  };
  
  const [messages, setMessages] = useState<Message[]>(loadMessages());
  const [sessionId] = useState<string>(() => Date.now().toString());
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [predictiveResponse, setPredictiveResponse] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    // Remove isNewMessage flag before saving to prevent typewriter on reload
    const messagesToSave = messages.map(msg => ({
      ...msg,
      isNewMessage: false
    }));
    localStorage.setItem('dotspark-chat-messages', JSON.stringify(messagesToSave));
  }, [messages]);

  // Update welcome message based on authentication status
  useEffect(() => {
    const welcomeMessage = user 
      ? 'Welcome back to DotSpark! 🌟 I\'m your thinking companion, ready to help you capture, organize, and transform your thoughts into powerful insights. What\'s on your mind today?'
      : 'Welcome to DotSpark! 🌟 I\'m your thinking companion. Share your thoughts with me and I\'ll help you organize them into structured insights. Try me out - no signup required!';
    
    setMessages(prev => prev.map(msg => 
      msg.id === '1' ? { ...msg, content: welcomeMessage } : msg
    ));
  }, [user]);

  // Show back button when user has started a conversation
  useEffect(() => {
    setShowBackButton(messages.length > 1);
  }, [messages]);

  // Check Neura activation status
  useEffect(() => {
    const checkActivation = () => {
      const activated = neuraStorage.isActivated();
      setIsNeuraActive(activated);
    };

    checkActivation();
    const interval = setInterval(checkActivation, 5000);

    return () => clearInterval(interval);
  }, []);
  const isRegistered = !!user;
  const isActivated = neuraStorage.isActivated();
  const isFirstTime = isFirstChat();
  
  // Set default message only for first-time users
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false);
  const [isNeuraActive, setIsNeuraActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o');
  
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

    // Show typing indicator with faster feedback
    const typingMessage: Message = {
      id: 'typing',
      content: 'DotSpark is thinking...',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      let apiEndpoint = '/api/chat/intelligent';
      const requestBody = { message: inputValue, model: selectedModel };

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
        isNewMessage: true, // Enable typewriter for new AI messages
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

  const handleRefreshChat = () => {
    const defaultMessage = {
      id: '1',
      content: user 
        ? 'Welcome back to DotSpark! 🌟 I\'m your AI companion, ready to help you capture, organize, and transform your thoughts into powerful insights. What\'s on your mind today?'
        : 'Welcome to DotSpark! 🌟 I\'m your AI companion. Share your thoughts with me and I\'ll help you organize them into structured insights. Try me out - no signup required!',
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages([defaultMessage]);
    setInputValue('');
    setIsLoading(false);
    localStorage.removeItem('dotspark-chat-messages');
    
    toast({
      title: 'Chat Refreshed',
      description: 'Starting a new conversation',
      duration: 2000,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        action: 'dot_saved',
        isNewMessage: true
      };

      setMessages(prev => [...prev, confirmationMessage]);

    } catch (error) {
      console.error('Error confirming dot:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I had trouble saving your dot. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isNewMessage: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-950">
      {/* Enhanced ChatGPT-style Collapsible Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-amber-200/40 dark:border-amber-700/40 shadow-xl`}>
        <div className="flex flex-col h-full w-64">
          {/* Enhanced Sidebar Header */}
          <div className="p-6 border-b border-amber-200/30 dark:border-amber-700/30 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30">
            <div className="flex items-center gap-3">
              <img 
                src="/dotspark-logo-icon.jpeg" 
                alt="DotSpark" 
                className="w-10 h-10 rounded-full"
              />
              <h2 className="text-xl font-bold text-amber-700 dark:text-amber-400 tracking-tight">DotSpark</h2>
            </div>
          </div>
          
          {/* Enhanced Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {/* New Chat button - visible when messages exist */}
              {messages.length > 1 && (
                <Button 
                  onClick={handleRefreshChat}
                  variant="ghost" 
                  className="w-full justify-start text-sm h-10 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-950/50 dark:to-orange-950/50 text-amber-800 dark:text-amber-300 hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/70 dark:hover:to-orange-900/70 shadow-sm rounded-xl transition-all duration-300 border border-amber-200/50 dark:border-amber-700/50"
                >
                  <RefreshCw className="w-4 h-4 mr-3" />
                  <span className="font-medium">New Chat</span>
                </Button>
              )}
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start text-sm h-10 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-950/30 dark:to-orange-950/30 text-amber-800 dark:text-amber-300 hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 shadow-sm rounded-xl transition-all duration-300">
                  <MessageSquare className="w-4 h-4 mr-3" />
                  <span className="font-medium">Chat</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start text-sm h-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                  <Brain className="w-4 h-4 mr-3" />
                  <span className="font-medium">My Neura</span>
                </Button>
              </Link>
              <Link href="/my-neura">
                <Button variant="ghost" className="w-full justify-start text-sm h-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                  <img 
                    src="/dotspark-logo-icon.jpeg" 
                    alt="DotSpark" 
                    className="w-4 h-4 mr-3 rounded-sm"
                  />
                  <span className="font-medium">My DotSpark</span>
                </Button>
              </Link>
              <Link href="/social">
                <Button variant="ghost" className="w-full justify-start text-sm h-10 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300 rounded-xl transition-all duration-300">
                  <Users className="w-4 h-4 mr-3" />
                  <span className="font-medium">Social</span>
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" className="w-full justify-start text-sm h-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                  <Info className="w-4 h-4 mr-3" />
                  <span className="font-medium">About DotSpark</span>
                </Button>
              </Link>
              {user ? (
                <Link href="/profile">
                  <Button variant="ghost" className="w-full justify-start text-sm h-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                    <User className="w-4 h-4 mr-3" />
                    <span className="font-medium">Profile</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" className="w-full justify-start text-sm h-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                    <User className="w-4 h-4 mr-3" />
                    <span className="font-medium">Sign In</span>
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

      {/* Collapsed Icon Sidebar - ChatGPT Style */}
      <div className={`${!isSidebarOpen ? 'w-16' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-amber-200/40 dark:border-amber-700/40 shadow-xl`}>
        <div className="flex flex-col h-full w-16 items-center py-4">
          {/* Brand Logo at Top */}
          <div className="mb-6">
            <img 
              src="/dotspark-logo-icon.jpeg" 
              alt="DotSpark" 
              className="w-8 h-8 rounded-full"
            />
          </div>
          
          {/* Navigation Icons */}
          <div className="flex flex-col items-center space-y-3 flex-1">
            {/* New Chat Icon */}
            {messages.length > 1 && (
              <Button 
                onClick={handleRefreshChat}
                variant="ghost" 
                size="icon"
                title="New Chat"
                className="h-10 w-10 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-950/50 dark:to-orange-950/50 text-amber-800 dark:text-amber-300 hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/70 dark:hover:to-orange-900/70 shadow-sm rounded-xl transition-all duration-300 border border-amber-200/50 dark:border-amber-700/50"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            
            <Link href="/" title="Chat">
              <Button variant="ghost" size="icon" className="h-10 w-10 bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-950/30 dark:to-orange-950/30 text-amber-800 dark:text-amber-300 hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 shadow-sm rounded-xl transition-all duration-300">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link href="/dashboard" title="My Neura">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                <Brain className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link href="/my-neura" title="My DotSpark">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                <img 
                  src="/dotspark-logo-icon.jpeg" 
                  alt="DotSpark" 
                  className="w-4 h-4 rounded-sm"
                />
              </Button>
            </Link>
            
            <Link href="/social" title="Social">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300 rounded-xl transition-all duration-300">
                <Users className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link href="/about" title="About DotSpark">
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                <Info className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* User Avatar at Bottom */}
          {user ? (
            <div className="mt-auto">
              <Link href="/profile" title={user.displayName || 'Profile'}>
                <Avatar className="h-8 w-8 hover:ring-2 hover:ring-amber-400 transition-all duration-300">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="text-xs">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <div className="mt-auto">
              <Link href="/auth" title="Sign In">
                <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-950/20 dark:hover:to-orange-950/20 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl transition-all duration-300">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile-First ChatGPT Style Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between h-14 px-3 md:px-6">
            {/* Left: Menu + Model (Mobile: Sheet Menu, Desktop: Sidebar Toggle) */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <img 
                          src="/dotspark-logo-icon.jpeg" 
                          alt="DotSpark" 
                          className="w-8 h-8 rounded-full"
                        />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">DotSpark</h2>
                      </div>
                    </div>
                    
                    {/* AI Model Selector in Mobile Menu */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">AI Model</label>
                      <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        className="w-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                      />
                    </div>
                    
                    {/* Mobile Navigation */}
                    <nav className="flex-1 p-4">
                      <div className="space-y-2">
                        {messages.length > 1 && (
                          <SheetClose asChild>
                            <Button 
                              onClick={handleRefreshChat}
                              variant="ghost" 
                              className="w-full justify-start h-12 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <RefreshCw className="w-5 h-5 mr-3" />
                              New Chat
                            </Button>
                          </SheetClose>
                        )}
                        <SheetClose asChild>
                          <Link href="/dashboard" className="block">
                            <Button variant="ghost" className="w-full justify-start h-12 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                              <Brain className="w-5 h-5 mr-3" />
                              My Neura
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/social" className="block">
                            <Button variant="ghost" className="w-full justify-start h-12 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                              <Users className="w-5 h-5 mr-3" />
                              Social
                            </Button>
                          </Link>
                        </SheetClose>
                        {user ? (
                          <SheetClose asChild>
                            <Link href="/profile" className="block">
                              <Button variant="ghost" className="w-full justify-start h-12 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <User className="w-5 h-5 mr-3" />
                                Profile
                              </Button>
                            </Link>
                          </SheetClose>
                        ) : (
                          <SheetClose asChild>
                            <Link href="/auth" className="block">
                              <Button variant="ghost" className="w-full justify-start h-12 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <User className="w-5 h-5 mr-3" />
                                Sign In
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                      </div>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hidden md:flex"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Desktop Model Selector */}
              <div className="hidden md:block">
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                />
              </div>
            </div>
          
            {/* Center: Logo/Title (Mobile) */}
            <div className="flex items-center gap-2 md:hidden">
              <img 
                src="/dotspark-logo-icon.jpeg" 
                alt="DotSpark" 
                className="w-6 h-6 rounded-full"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">DotSpark</span>
            </div>

            {/* Right: User Actions (Desktop Only) */}
            <div className="hidden md:flex items-center gap-2">
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
                          <SheetClose asChild>
                            <Link href="/profile" className="block">
                              <Button variant="ghost" className="w-full justify-start text-sm h-9">
                                <User className="w-4 h-4 mr-3" />
                                Profile
                              </Button>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link href="/dashboard" className="block">
                              <Button variant="ghost" className="w-full justify-start text-sm h-9">
                                <Brain className="w-4 h-4 mr-3" />
                                My Neura
                              </Button>
                            </Link>
                          </SheetClose>
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
                    

                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {user 
                      ? "I'll help you organize your thoughts into structured Dots, Wheels and Chakras for sparking actionable insights."
                      : "Start chatting to see how I can help organize your thoughts. No signup required!"
                    }
                  </p>
                </div>
                
                {/* Mobile-First Compact Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 w-full max-w-2xl mb-8">
                  <Button 
                    variant="outline" 
                    className="h-16 md:h-20 p-3 flex flex-col items-center justify-center text-center hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
                    onClick={() => setInputValue("Organize Thoughts: Help me structure my thoughts on the following topic: ")}
                  >
                    <Brain className="w-4 h-4 text-orange-600 mb-1" />
                    <span className="font-medium text-xs md:text-sm">Organize</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-16 md:h-20 p-3 flex flex-col items-center justify-center text-center hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
                    onClick={() => setInputValue("Generate and spark ideas using my thoughts about: ")}
                  >
                    <Sparkles className="w-4 h-4 text-orange-600 mb-1" />
                    <span className="font-medium text-xs md:text-sm">Ideas</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-16 md:h-20 p-3 flex flex-col items-center justify-center text-center hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
                    onClick={() => setInputValue("Visualize this summary for me: ")}
                  >
                    <Target className="w-4 h-4 text-orange-600 mb-1" />
                    <span className="font-medium text-xs md:text-sm">Visualize</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-16 md:h-20 p-3 flex flex-col items-center justify-center text-center hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
                    onClick={() => setInputValue("Seek wisdom from ancient Indian knowledge about: ")}
                  >
                    <Brain className="w-4 h-4 text-orange-600 mb-1" />
                    <span className="font-medium text-xs md:text-sm">Wisdom</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="space-y-3 p-3 pb-16">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${message.isUser ? 'ml-8' : 'mr-8'}`}>
                      <div className={`rounded-3xl ${
                        message.isUser 
                          ? 'px-4 py-3 bg-orange-600 text-white shadow-lg' 
                          : 'px-5 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200/50 dark:border-gray-600/50'
                      }`}>
                        {message.id === 'typing' ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm italic">DotSpark is thinking...</span>
                          </div>
                        ) : (
                          <>
                            <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:leading-7 [&_p]:mb-3 [&_p:last-child]:mb-0">
                              {message.isUser ? (
                                <div className="whitespace-pre-wrap text-sm leading-7 text-white">{message.content}</div>
                              ) : (
                                // Only use typewriter for new messages
                                message.isNewMessage ? (
                                  <TypewriterText 
                                    text={message.content} 
                                    onProgress={() => scrollToBottom()}
                                  />
                                ) : (
                                  <div className="whitespace-pre-wrap text-sm leading-7 text-gray-800 dark:text-gray-100">
                                    {message.content}
                                  </div>
                                )
                              )}
                            </div>
                            {message.dotProposal && message.needsConfirmation && (
                              <div className="mt-3 p-3 bg-white/10 rounded-xl border border-white/20">
                                <h4 className="font-semibold mb-2 text-sm">{message.dotProposal.heading}</h4>
                                <div className="space-y-1 text-xs">
                                  <div><strong>Summary:</strong> {message.dotProposal.summary}</div>
                                  <div><strong>Anchor:</strong> {message.dotProposal.anchor}</div>
                                  <div><strong>Pulse:</strong> {message.dotProposal.pulse}</div>
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleConfirmDot(message.dotProposal!)}
                                    disabled={isLoading}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                                  >
                                    Save Dot
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setInputValue("Please revise the dot: ")}
                                    className="text-white border-white/30 hover:bg-white/10 text-xs h-7"
                                  >
                                    Revise
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 px-2 flex items-center gap-1">
                        {!message.isUser && (
                          <img src="/dotspark-logo-icon.jpeg" alt="DS" className="w-3 h-3 rounded-full" />
                        )}
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Mobile-Optimized Input Area */}
          <div className="border-t bg-white dark:bg-gray-900 p-3 md:p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-2 md:gap-3">
                {/* Input Field */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message DotSpark"
                    disabled={isLoading || limitExceeded}
                    rows={1}
                    className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-sm placeholder:text-gray-500 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none disabled:opacity-50 min-h-[48px] max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                    style={{
                      lineHeight: '1.4',
                      height: 'auto',
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = '48px';
                      target.style.height = Math.min(target.scrollHeight, 150) + 'px';
                    }}
                  />
                  
                  {/* Voice/Send Button inside input */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {!inputValue.trim() ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full"
                        onClick={() => {
                          // Voice functionality to be implemented
                          console.log('Voice recording clicked');
                        }}
                        disabled={isLoading || limitExceeded}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        className="h-8 w-8 bg-gray-700 hover:bg-gray-800 dark:bg-gray-300 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-full disabled:opacity-50"
                        onClick={handleSendMessage}
                        disabled={isLoading || limitExceeded}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}