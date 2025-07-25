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
import { isMobileBrowser } from '@/lib/mobileDetection';
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
  const { user, isLoading, logout } = useAuth();
  
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
        content: 'I\'ll help you organize your thoughts into structured Dots, Wheels and Chakras for sparking actionable insights.',
        isUser: false,
        timestamp: new Date(),
        isNewMessage: false, // Welcome message should not use typewriter
      },
    ];
  };
  
  const [messages, setMessages] = useState<Message[]>(loadMessages());
  const [sessionId] = useState<string>(() => Date.now().toString());
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatInputLoading, setIsChatInputLoading] = useState(false);
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

  // Static welcome message - no authentication checks needed

  // Show back button when user has started a conversation
  useEffect(() => {
    setShowBackButton(messages.length > 1);
  }, [messages]);

  // State declarations first
  const [inputValue, setInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false);
  const [isNeuraActive, setIsNeuraActive] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4o');
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with correct mobile detection to avoid re-render delay
    if (typeof window !== 'undefined') {
      return isMobileBrowser();
    }
    return false;
  });

  const isRegistered = !!user;
  const isActivated = neuraStorage.isActivated();
  const isFirstTime = isFirstChat();

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

  // Set sidebar state for mobile browsers
  useEffect(() => {
    // Default to collapsed sidebar for mobile browsers
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);
  
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
    if (!inputValue.trim() || isChatInputLoading) return;

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
    setIsChatInputLoading(true);

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
      setIsChatInputLoading(false);
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
    setIsChatLoading(false);
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
    setIsChatLoading(true);
    
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
      setIsChatLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-950">
      {/* Enhanced ChatGPT-style Collapsible Sidebar */}
      <div className={`${isSidebarOpen ? (isMobile ? 'w-48' : 'w-64') : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-amber-200/40 dark:border-amber-700/40 shadow-xl`}>
        <div className={`flex flex-col h-full ${isMobile ? 'w-48' : 'w-64'}`}>
          {/* Enhanced Sidebar Header */}
          <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-amber-200/30 dark:border-amber-700/30 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30`}>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <img 
                src="/dotspark-logo-icon.jpeg" 
                alt="DotSpark" 
                className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full`}
              />
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-amber-700 dark:text-amber-400 tracking-tight`}>DotSpark</h2>
            </div>
          </div>
          
          {/* Enhanced Navigation */}
          <nav className={`flex-1 ${isMobile ? 'p-3' : 'p-4'}`}>
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

              {/* Profile button - moved higher for mobile */}
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

              {/* Mobile-only AI Model Selector in Sidebar */}
              {isMobile && (
                <div className="mt-4 pt-4 border-t border-amber-200/30 dark:border-amber-700/30">
                  <div className="px-2 mb-3">
                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">AI Model</h3>
                  </div>
                  <ModelSelector 
                    selectedModel={selectedModel} 
                    onModelChange={setSelectedModel}
                    className="w-full"
                  />
                </div>
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
      <div className={`${!isSidebarOpen ? (isMobile ? 'w-12' : 'w-16') : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-amber-200/40 dark:border-amber-700/40 shadow-xl`}>
        <div className={`flex flex-col h-full ${isMobile ? 'w-12' : 'w-16'} items-center ${isMobile ? 'py-3' : 'py-4'}`}>
          {/* Brand Logo at Top */}
          <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
            <img 
              src="/dotspark-logo-icon.jpeg" 
              alt="DotSpark" 
              className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} rounded-full`}
            />
          </div>
          
          {/* Navigation Icons */}
          <div className={`flex flex-col items-center ${isMobile ? 'space-y-2 justify-center' : 'space-y-3'} flex-1`}>
            {/* New Chat Icon */}
            {messages.length > 1 && (
              <Button 
                onClick={handleRefreshChat}
                variant="ghost" 
                size="icon"
                title="New Chat"
                className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} bg-gradient-to-r from-amber-100/80 to-orange-100/80 dark:from-amber-950/50 dark:to-orange-950/50 text-amber-800 dark:text-amber-300 hover:from-amber-200 hover:to-orange-200 dark:hover:from-amber-900/70 dark:hover:to-orange-900/70 shadow-sm rounded-xl transition-all duration-300 border border-amber-200/50 dark:border-amber-700/50`}
              >
                <RefreshCw className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
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
        {/* Enhanced Header - Mobile sticky */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-amber-200/30 dark:border-amber-700/30 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 backdrop-blur-sm shadow-lg md:relative md:top-0 fixed top-0 left-0 right-0 z-40">
          {/* Left: Sidebar Toggle, Back Button and Logo */}
          <div className="flex items-center gap-4">
            {/* Enhanced Sidebar Toggle Icon */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-3 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 rounded-xl transition-all duration-300 hover:scale-105"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </Button>

            {/* Enhanced Back Button */}
            {showBackButton && (
              <Link href="/about">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-3 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 rounded-xl transition-all duration-300 hover:scale-105"
                  title="Back to Landing Page"
                >
                  <ArrowLeft className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                </Button>
              </Link>
            )}

            {/* Model Selector - Desktop only */}
            {!isMobile && (
              <ModelSelector 
                selectedModel={selectedModel} 
                onModelChange={setSelectedModel} 
              />
            )}
          </div>
          
          {/* Enhanced Center: Empty space for centered logo */}
          <div className="flex-1"></div>

          {/* Right: Header Icons and User Actions */}
          <div className="flex items-center gap-3">
            {/* Brain Icon - Navigate to Dashboard with Active Status */}
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-3 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
                title="My Neura"
              >
                <Brain className="h-5 w-5 text-white transition-all duration-300" />
                {isNeuraActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg border-2 border-white"></div>
                )}
              </Button>
            </Link>

            {/* Social Icon */}
            <Link href="/social">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-3 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
                title="DotSpark Social"
              >
                <Users className="h-5 w-5 text-white" />
              </Button>
            </Link>

            {/* WhatsApp Icon */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-3 bg-[#25D366] hover:bg-[#20BA5A] dark:bg-[#25D366] dark:hover:bg-[#20BA5A] rounded-xl transition-all duration-300 hover:scale-105 shadow-sm"
              title="WhatsApp Contact"
              onClick={async () => {
                try {
                  const response = await fetch('/api/whatsapp/contact');
                  const data = await response.json();
                  const message = 'Hi DotSpark, I would need your assistance in saving a dot';
                  const url = `https://wa.me/${data.phoneNumber}?text=${encodeURIComponent(message)}`;
                  window.open(url, '_blank');
                } catch (error) {
                  // Fallback to existing number if API fails
                  window.open('https://wa.me/16067157733?text=Hi%20DotSpark%2C%20I%20would%20need%20your%20assistance%20in%20saving%20a%20dot', '_blank');
                }
              }}
            >
              <SiWhatsapp className="h-5 w-5 text-white" />
            </Button>

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
                        onClick={async () => {
                          try {
                            await logout();
                            toast({
                              title: "Signed Out",
                              description: "You have been successfully signed out.",
                            });
                          } catch (error) {
                            toast({
                              title: "Sign Out Error",
                              description: "There was an issue signing you out. Please try again.",
                              variant: "destructive",
                            });
                          }
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
        <div className={`flex-1 flex flex-col overflow-hidden ${isMobile && messages.length === 1 ? 'justify-between' : ''}`}>
          {limitExceeded && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <UsageLimitMessage message={limitMessage} isLimitExceeded={limitExceeded} />
            </div>
          )}
          
          {/* Messages Container - Mobile header offset */}
          <div className={`${isMobile && messages.length === 1 ? 'flex-none' : 'flex-1'} overflow-y-auto ${isMobile ? 'pt-14' : ''}`}>
            {messages.length === 1 ? (
              /* Welcome Screen */
              <div className={`${isMobile ? 'flex flex-col items-center justify-start pt-6 pb-2 px-3' : 'h-full flex flex-col items-center justify-center p-8'} max-w-2xl mx-auto`}>
                <div className={`text-center ${isMobile ? 'mb-2' : 'mb-8'}`}>
                  {/* Logo - Mobile specific above heading, Desktop original position */}
                  {isMobile ? (
                    <img 
                      src="/dotspark-logo-header.png" 
                      alt="DotSpark" 
                      className="w-12 h-12 mx-auto mb-4 rounded-2xl"
                    />
                  ) : (
                    <img 
                      src="/dotspark-logo-header.png" 
                      alt="DotSpark" 
                      className="w-16 h-16 mx-auto mb-6 rounded-2xl"
                    />
                  )}
                  
                  {/* Dynamic heading like About page */}
                  <div className={`${isMobile ? 'mb-2' : 'mb-6'}`}>
                    <div className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl lg:text-5xl'} font-bold tracking-tight ${isMobile ? 'mb-1' : 'mb-2'}`}>
                      <span className="font-sans tracking-normal text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200">
                        For the OG Thin<span className={`relative inline-block ${isMobile ? 'px-2 py-1' : 'px-3 py-2'} bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 text-white font-bold rounded-lg shadow-lg border-2 border-amber-500/20`}>Q</span>ers
                      </span>
                    </div>
                    

                  </div>
                  
                  <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm mb-6' : 'text-lg'}`}>
                    I'll help you organize your thoughts into structured Dots, Wheels and Chakras for sparking actionable insights.
                  </p>
                </div>
                
                {/* Quick Action Cards */}
                <div className={`grid grid-cols-1 md:grid-cols-2 ${isMobile ? 'gap-1.5' : 'gap-4'} w-full max-w-2xl ${isMobile ? 'mb-6' : 'mb-8'}`}>
                  <Button 
                    variant="outline" 
                    className={`${isMobile ? 'h-8 p-1.5 justify-center' : 'h-24 p-4 flex flex-col items-start justify-between text-left'} hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 active:bg-amber-100 dark:active:bg-amber-900/30 active:text-amber-900 dark:active:text-amber-100 transition-all duration-200`}
                    onClick={() => setInputValue("Organize Thoughts")}
                  >
                    <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
                      <Brain className={`${isMobile ? 'w-3 h-3 flex-shrink-0' : 'w-5 h-5'} text-orange-600`} />
                      <span className={`${isMobile ? 'font-medium text-xs' : 'font-semibold'}`}>Organize Thoughts</span>
                    </div>
                    {!isMobile && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight mt-1">
                        Transform insights into structured dots,<br />wheels & chakras automatically
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`${isMobile ? 'h-8 p-1.5 justify-center' : 'h-24 p-4 flex flex-col items-start justify-between text-left'} hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 active:bg-amber-100 dark:active:bg-amber-900/30 active:text-amber-900 dark:active:text-amber-100 transition-all duration-200`}
                    onClick={() => setInputValue("Generate and spark ideas using my thoughts or social thoughts")}
                  >
                    <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
                      <Sparkles className={`${isMobile ? 'w-3 h-3 flex-shrink-0' : 'w-4 h-4'} text-orange-600`} />
                      <span className={`${isMobile ? 'font-medium text-xs' : 'font-medium'}`}>Spark Ideas</span>
                    </div>
                    {!isMobile && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight mt-1">
                        Generate and spark ideas using my thoughts
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`${isMobile ? 'h-8 p-1.5 justify-center' : 'h-24 p-4 flex flex-col items-start justify-between text-left'} hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 active:bg-amber-100 dark:active:bg-amber-900/30 active:text-amber-900 dark:active:text-amber-100 transition-all duration-200`}
                    onClick={() => setInputValue("Visualize this summary for me: ")}
                  >
                    <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
                      <Target className={`${isMobile ? 'w-3 h-3 flex-shrink-0' : 'w-4 h-4'} text-orange-600`} />
                      <span className={`${isMobile ? 'font-medium text-xs' : 'font-medium'}`}>Visualize Anything</span>
                    </div>
                    {!isMobile && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight mt-1">
                        Ask anything and I'll help you visualize
                      </span>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`${isMobile ? 'h-8 p-1.5 justify-center' : 'h-24 p-4 flex flex-col items-start justify-between text-left'} hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-800 dark:hover:text-amber-200 hover:border-amber-300 dark:hover:border-amber-700 active:bg-amber-100 dark:active:bg-amber-900/30 active:text-amber-900 dark:active:text-amber-100 transition-all duration-200`}
                    onClick={() => setInputValue("Seek wisdom from ancient Indian knowledge about: ")}
                  >
                    <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
                      <Brain className={`${isMobile ? 'w-3 h-3 flex-shrink-0' : 'w-4 h-4'} text-orange-600`} />
                      <span className={`${isMobile ? 'font-medium text-xs' : 'font-medium'}`}>Ancient Wisdom</span>
                    </div>
                    {!isMobile && (
                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-tight mt-1">
                        Seek answers from ancient Indian wisdom
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Chat Messages - Mobile header offset */
              <div className={`${isMobile ? 'space-y-2 p-2 pb-2' : 'space-y-3 p-3 pb-16'}`}>
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${message.isUser ? (isMobile ? 'ml-4' : 'ml-8') : (isMobile ? 'mr-4' : 'mr-8')}`}>
                      <div className={`rounded-3xl ${
                        message.isUser 
                          ? `${isMobile ? 'px-3 py-2' : 'px-4 py-3'} bg-orange-600 text-white shadow-lg` 
                          : `${isMobile ? 'px-4 py-3' : 'px-5 py-4'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200/50 dark:border-gray-600/50`
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
                                    disabled={isChatInputLoading}
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

          {/* Input Area */}
          <div className={`border-t bg-white dark:bg-gray-900 ${isMobile ? 'p-3' : 'p-4'}`}>
            <div className="max-w-4xl mx-auto">
              <div className={`flex items-end ${isMobile ? 'gap-2' : 'gap-3'}`}>
                {/* Input Field */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Anything to DotSpark"
                    disabled={isChatInputLoading || limitExceeded}
                    rows={1}
                    className={`w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 ${isMobile ? 'px-3 py-2 pr-10' : 'px-4 py-3 pr-12'} text-sm placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none disabled:opacity-50 ${isMobile ? 'min-h-[44px] max-h-[120px]' : 'min-h-[52px] max-h-[200px]'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600`}
                    style={{
                      lineHeight: '1.5',
                      height: 'auto',
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      const minHeight = isMobile ? 44 : 52;
                      const maxHeight = isMobile ? 120 : 200;
                      target.style.height = minHeight + 'px';
                      target.style.height = Math.min(target.scrollHeight, maxHeight) + 'px';
                    }}
                  />
                  
                  {/* Voice Button inside input */}
                  {!inputValue.trim() && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                      onClick={() => {
                        // Voice functionality to be implemented
                        console.log('Voice recording clicked');
                      }}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Send Button */}
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isChatInputLoading || limitExceeded}
                  size="icon"
                  className={`shrink-0 ${isMobile ? 'h-[44px] w-[44px]' : 'h-[52px] w-[52px]'} bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 rounded-xl`}
                >
                  {isChatInputLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
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