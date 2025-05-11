import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus';
import { useMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowRight, Brain, Check, CheckCircle2, LogIn, LayoutDashboard, MessageCircle, Sparkles, MessageSquare, Zap } from 'lucide-react';
import { NeuralWhatsAppLinking } from '@/components/neural/NeuralWhatsAppLinking';
import Header from '@/components/layout/Header';

export default function ActivateNeuralExtension() {
  // Hook declarations need to be in the same order in every render
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const { isWhatsAppConnected, phoneNumber, isLoading: isWhatsAppStatusLoading, 
          showActivationSuccess, justActivated } = useWhatsAppStatus();
  
  // All useState hooks must be in the same order each render
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('step1'); // Initialize to default, we'll update in useEffect
  const [whatsAppDirectLink, setWhatsAppDirectLink] = useState('');
  
  // All useRef hooks after state hooks
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Function for header search (empty implementation as it's not used on this page)
  const handleSearch = () => {};
  
  // Function to navigate back to the home page
  const goToHome = () => setLocation("/");
  
  // Get WhatsApp direct link with prefilled message
  useEffect(() => {
    fetch('/api/whatsapp/contact')
      .then(res => res.json())
      .then(data => {
        if (data && data.directLink) {
          setWhatsAppDirectLink(data.directLink);
          console.log("Got WhatsApp direct link:", data.directLink);
        }
      })
      .catch(err => console.error("Error fetching WhatsApp contact:", err));
  }, []);

  // Calculate progress percentage - make sure it's 100% when activated in localStorage
  const isActiveInLocalStorage = localStorage.getItem('whatsapp_activated') === 'true';
  const progress = user ? (isWhatsAppConnected || isActiveInLocalStorage ? 100 : 50) : 0;
  
  // Effect 1: Force synchronization of activation status on page load
  useEffect(() => {
    // Check if there's a WhatsApp activation in localStorage and force the UI to update
    if (localStorage.getItem('whatsapp_activated') === 'true' && user) {
      // Set global and local activation flags
      localStorage.setItem('whatsapp_activated', 'true');
      sessionStorage.setItem('show_activation_success', 'true');
      
      // Force to step 2 since this is an activated user
      setActiveTab('step2');
    }
  }, [user]);
  
  // Effect 2: Update tab when auth changes (primary tab control)
  useEffect(() => {
    if (user) {
      setActiveTab('step2');
    } else {
      setActiveTab('step1');
    }
  }, [user]);
  
  // Effect 3: Check for activation success flag and handle status updates
  useEffect(() => {
    // Check for a specific flag to avoid duplicate notifications
    const hasBeenActivatedBefore = localStorage.getItem('neural_extension_seen') === 'true';
    // Check if returning from WhatsApp
    const returningFromWhatsApp = sessionStorage.getItem('returningFromWhatsApp') === 'true';
    
    // For users returning from WhatsApp, we want to force check their activation status
    if (returningFromWhatsApp && user) {
      console.log("User returned from WhatsApp, checking connection status");
      sessionStorage.removeItem('returningFromWhatsApp');
      
      // Start tab at the second step
      setActiveTab('step2');
      
      // Add a flag to trigger automatic polling
      localStorage.setItem('check_whatsapp_status', 'true');
      
      // If they are already connected, show success
      if (isWhatsAppConnected) {
        toast({
          title: "Neural Extension Activated!",
          description: "Your WhatsApp message was received and your neural extension is now active.",
          duration: 5000,
        });
        localStorage.setItem('whatsapp_activated', 'true');
      } else {
        // If they're not connected yet, show a waiting message 
        toast({
          title: "Message Sent!",
          description: "Waiting for WhatsApp activation confirmation...",
          duration: 3000,
        });
        
        // Set a polling check for activation status
        const checkActivation = setInterval(() => {
          // Force a status check
          fetch('/api/whatsapp/status')
            .then(res => res.json())
            .then(data => {
              console.log("WhatsApp status check result:", data);
              if (data.isConnected) {
                clearInterval(checkActivation);
                localStorage.setItem('whatsapp_activated', 'true');
                toast({
                  title: "Neural Extension Activated!",
                  description: "Your WhatsApp message was received and your neural extension is now active.",
                  duration: 5000,
                });
              }
            })
            .catch(err => console.error("Error checking WhatsApp status:", err));
        }, 3000); // Check every 3 seconds
        
        // Clear the interval after 30 seconds to avoid excessive polling
        setTimeout(() => {
          clearInterval(checkActivation);
          // Final reminder if not activated
          if (!isWhatsAppConnected) {
            toast({
              title: "Still Waiting...",
              description: "It may take a moment to receive your WhatsApp message. The page will update automatically when your neural extension is activated.",
              duration: 5000,
            });
          }
        }, 30000);
      }
    }
    
    // Only show toast if this is a new activation and we have an explicit success flag
    else if (showActivationSuccess && user && !hasBeenActivatedBefore) {
      // Success toast with longer duration - only for first-time activations
      toast({
        title: "Neural Extension Activated!",
        description: "WhatsApp connection completed successfully.",
        duration: 5000,
      });
      
      // Mark that we've shown the activation notification
      localStorage.setItem('neural_extension_seen', 'true');
    }
    
    // If WhatsApp is connected or we have an activation success flag
    if ((showActivationSuccess || isWhatsAppConnected) && user) {
      // We no longer automatically redirect to dashboard
      // This lets the user see the activation status on the activation page
      setActiveTab('step2');
      
      // Also set activation in localStorage to ensure persistence across devices
      localStorage.setItem('whatsapp_activated', 'true');
    }
  }, [showActivationSuccess, isWhatsAppConnected, user, toast]);
  
  // Neural network visualization setup
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
    
    // Neural network nodes
    const nodes: {x: number, y: number, radius: number, vx: number, vy: number, color: string}[] = [];
    const numNodes = 30;
    const connectionDistance = 150;
    
    // Create nodes with random positions
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: i % 3 === 0 ? '#6366f1' : // indigo
               i % 3 === 1 ? '#3b82f6' : // blue
               '#10b981'  // emerald
      });
    }
    
    // Animation function
    let animationFrameId: number;
    const animate = () => {
      if (!isAnimating) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections between nodes
      ctx.lineWidth = 0.3;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            
            // Create gradient with opacity based on distance
            const opacity = 1 - distance / connectionDistance;
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.5})`;
            ctx.stroke();
          }
        }
      }
      
      // Draw and update nodes
      for (const node of nodes) {
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // Update position with boundary checks
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      }
      
      // Occasionally add "spark" effect (brighter pulse)
      if (Math.random() < 0.02) {
        const randomNodeIndex = Math.floor(Math.random() * nodes.length);
        const randomNode = nodes[randomNodeIndex];
        
        ctx.beginPath();
        ctx.arc(randomNode.x, randomNode.y, randomNode.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef, isAnimating]);

  // We already handle tab changes in the other useEffect

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // After login, automatically move to step 2
      setActiveTab('step2');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Skeleton loader for the page
  if (isAuthLoading || isWhatsAppStatusLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onSearch={handleSearch} />
        <div className="container max-w-6xl mx-auto px-4 py-10 flex-1">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-secondary rounded w-1/3"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
            <div className="h-64 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <Header onSearch={handleSearch} />
      
      <div className="container max-w-4xl mx-auto px-4 pt-0 pb-2 flex-1 flex flex-col items-center justify-center">
        {/* Neural network canvas - covering entire background */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background/95"></div>
        </div>
        
        {/* Content centered in viewport */}
        <div className="relative z-10 w-full max-w-3xl">
          {/* Hero section with title */}
          <div className="text-center mb-3">
            <div className="inline-block h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-1 relative">
              <Brain className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping"></div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-0.5">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-primary to-blue-600">Neural Extension</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Unlock your cognitive potential with DotSpark
            </p>
          </div>
          
          {/* Gamified progress path */}
          <div className="relative w-full max-w-md mx-auto mb-3">
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full relative z-0">
              <div className={`h-1.5 bg-gradient-to-r from-indigo-600 to-primary rounded-full absolute top-0 left-0 transition-all duration-1000 ease-out`} 
                   style={{width: `${progress}%`}}></div>
              
              {/* Step points */}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between transform translate-y-[-50%]">
                {/* Step 1 indicator */}
                <div className="relative flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                    progress >= 50 ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {progress >= 50 ? <Check className="h-3.5 w-3.5" /> : '1'}
                  </div>
                  <span className={`absolute top-7 text-[10px] whitespace-nowrap font-medium ${progress >= 50 ? 'text-primary' : 'text-slate-500'}`}>
                    Create Account
                  </span>
                  
                  {/* Animation dots for active state */}
                  {progress < 50 && !user && (
                    <div className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-ping"></div>
                  )}
                </div>
                
                {/* Midpoint decoration */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border-t-2 border-r-2 border-slate-300 dark:border-slate-700"></div>
                
                {/* Step 2 indicator */}
                <div className="relative flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                    progress === 100 ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white relative' : user ? 'bg-primary/20 text-primary border-2 border-primary/50 pulse-border' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {progress === 100 ? <Check className="h-3.5 w-3.5" /> : '2'}
                    {/* Add a glowing effect around completed status */}
                    {progress === 100 && (
                      <div className="absolute -inset-1 rounded-full border-2 border-primary/40 animate-pulse"></div>
                    )}
                  </div>
                  <span className={`absolute top-7 text-[10px] whitespace-nowrap font-medium ${progress === 100 ? 'text-primary' : user ? 'text-primary/80' : 'text-slate-500'}`}>
                    {progress === 100 ? 'Successfully Activated' : 'Authenticate WhatsApp'}
                  </span>
                  
                  {/* Animation dots for active state */}
                  {user && progress !== 100 && (
                    <div className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-ping"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Success message that shows on both web and mobile views when activated */}
          {isWhatsAppConnected && user && (
            <div className="w-full max-w-md mx-auto mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
              <div className="bg-green-100 dark:bg-green-800/30 rounded-full p-2 mr-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Neural Extension Successfully Activated!</h3>
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-2">
              <TabsTrigger value="step1" disabled={!!user} className="text-xs py-1">Account Setup</TabsTrigger>
              <TabsTrigger value="step2" disabled={!user} className="text-xs py-1">Sync WhatsApp</TabsTrigger>
            </TabsList>

            {/* Step 1: Create Account */}
            <TabsContent value="step1" className="mt-4">
              <Card className="border-2 border-primary/20 shadow-lg overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <div className="absolute right-0 top-0 w-40 h-40 bg-gradient-to-br from-indigo-600/10 to-indigo-600/5 rounded-bl-full"></div>
                <div className="absolute left-0 bottom-0 w-40 h-40 bg-gradient-to-tr from-blue-600/10 to-blue-600/5 rounded-tr-full"></div>
                
                <CardHeader className="text-center relative z-10 pt-4 pb-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                    <Brain className="h-8 w-8 text-primary" />
                    <div className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-pulse"></div>
                    <div className="absolute top-1 right-1 h-3 w-3 bg-indigo-600 rounded-full animate-ping"></div>
                  </div>
                  <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-primary">
                    Activate Your Neural Account
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your personal cognitive extension awaits
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative z-10 px-4 sm:px-6 pt-0">
                  <div className="flex flex-col md:flex-row gap-3 items-center">
                    {/* Visual brain enhancement graphic */}
                    <div className="relative w-32 h-32 mx-auto flex-shrink-0 hidden md:block">
                      <div className="absolute w-14 h-14 bg-gradient-to-br from-indigo-200/70 to-indigo-100/70 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-full top-2 left-2 animate-pulse-slow"></div>
                      <div className="absolute w-9 h-9 bg-gradient-to-br from-indigo-300/70 to-indigo-200/70 dark:from-indigo-800/30 dark:to-indigo-700/30 rounded-full top-1 right-8 animate-pulse-slow animation-delay-1000"></div>
                      <div className="absolute w-11 h-11 bg-gradient-to-br from-blue-200/70 to-blue-100/70 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full bottom-5 left-5 animate-pulse-slow animation-delay-1500"></div>
                      <div className="absolute w-7 h-7 bg-gradient-to-br from-blue-300/70 to-blue-200/70 dark:from-blue-800/30 dark:to-blue-700/30 rounded-full bottom-2 right-4 animate-pulse-slow animation-delay-2000"></div>
                      
                      {/* Connection lines */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
                        <path d="M32 32 L96 96" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1" strokeDasharray="4 2" />
                        <path d="M96 32 L32 96" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1" strokeDasharray="4 2" />
                        <path d="M64 16 L64 112" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1" strokeDasharray="4 2" />
                      </svg>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="h-12 w-12 text-indigo-600/30" />
                      </div>
                    </div>
                    
                    {/* Benefits */}
                    <div className="flex-1">
                      <h3 className="font-bold flex items-center justify-center md:justify-start mb-2 text-sm text-indigo-800 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4 mr-1 text-indigo-600" />
                        Extension Benefits
                      </h3>
                      <ul className="text-xs space-y-2">
                        <li className="flex items-start p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-2">
                            <Zap className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <span className="font-medium text-indigo-800 dark:text-indigo-300">Cognitive Extension</span>
                            <p className="text-[10px] mt-0.5 text-slate-600 dark:text-slate-400">Tune your neural system to professional needs</p>
                          </div>
                        </li>
                        <li className="flex items-start p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-2">
                            <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="font-medium text-blue-800 dark:text-blue-300">Unified Messaging</span>
                            <p className="text-[10px] mt-0.5 text-slate-600 dark:text-slate-400">Access neural insights from WhatsApp</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button 
                      onClick={handleGoogleLogin}
                      className="w-full sm:w-auto px-6 py-3 h-auto text-base font-medium relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white shadow-lg"
                      size="default"
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-indigo-600/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10 flex items-center justify-center">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Activate with Google</span>
                      </div>
                      <div className="absolute -inset-1 blur-xl bg-gradient-to-r from-indigo-600/20 to-primary/20 group-hover:opacity-100 opacity-0 transition-opacity"></div>
                    </Button>
                    
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Have an account? Your progress will be detected automatically.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Link WhatsApp */}
            <TabsContent value="step2" className="mt-4">
              {isWhatsAppConnected ? (
                <Card className="border-2 border-green-400/30 shadow-lg overflow-hidden bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-slate-900">
                  <div className="absolute left-0 top-0 w-40 h-40 bg-gradient-to-br from-green-400/10 to-emerald-300/10 rounded-br-full"></div>
                  <div className="absolute right-0 bottom-0 w-40 h-40 bg-gradient-to-tl from-green-400/10 to-emerald-300/10 rounded-tl-full"></div>
                  
                  <CardHeader className="text-center relative z-10 pt-4 pb-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                      <div className="absolute inset-0 rounded-full animate-ping bg-white/10"></div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <Sparkles className="h-3 w-3 absolute top-2 right-2 text-green-400" />
                    </div>
                    <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                      Neural Extension Activated
                    </CardTitle>
                    <CardDescription className="text-sm text-green-700 dark:text-green-400">
                      Your cognitive extension is fully operational
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 pt-0">
                    <div className="p-4 bg-gradient-to-br from-green-50/70 to-emerald-50/70 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800/30 mb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-green-900/30 shadow-sm flex items-center justify-center mr-3">
                          <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-green-800 dark:text-green-300">WhatsApp Connected</h4>
                          <p className="text-xs text-green-600 dark:text-green-500">{phoneNumber || 'Your phone'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center p-2 rounded-lg bg-white/70 dark:bg-green-900/20 border border-green-100 dark:border-green-800/20">
                          <Zap className="h-3.5 w-3.5 mr-2 text-green-500 dark:text-green-400" />
                          <span className="text-xs text-green-700 dark:text-green-400">Send messages to your neural extension</span>
                        </div>
                        <div className="flex items-center p-2 rounded-lg bg-white/70 dark:bg-green-900/20 border border-green-100 dark:border-green-800/20">
                          <Zap className="h-3.5 w-3.5 mr-2 text-green-500 dark:text-green-400" />
                          <span className="text-xs text-green-700 dark:text-green-400">View insights in the dashboard</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                      <Button
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        onClick={() => window.open(whatsAppDirectLink || `https://wa.me/16067157733?text=${encodeURIComponent("Hey DotSpark, I've got a few things on my mind — need your thoughts")}`, '_blank')}
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Open WhatsApp
                      </Button>
                      
                      <Button
                        className="bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-700 hover:to-primary/90 text-white"
                        onClick={() => setLocation('/dashboard')}
                        size="sm"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-[#25D366]/20 shadow-lg overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                  <div className="absolute left-0 top-0 w-40 h-40 bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 rounded-br-full"></div>
                  <div className="absolute right-0 bottom-0 w-40 h-40 bg-gradient-to-tl from-[#128C7E]/10 to-[#25D366]/5 rounded-tl-full"></div>
                  
                  <CardHeader className="text-center relative z-10 pt-4 pb-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/20 rounded-full flex items-center justify-center mx-auto mb-2 relative">
                      <MessageSquare className="h-8 w-8 text-[#25D366]" />
                      <div className="absolute -inset-1 rounded-full border-2 border-[#25D366]/20 animate-pulse"></div>
                    </div>
                    <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#25D366] to-[#128C7E]">
                      Authenticate WhatsApp
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Complete your neural extension activation
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 pt-0">
                    <NeuralWhatsAppLinking />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}