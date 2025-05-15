import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus';
import { useMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowRight, Brain, Check, CheckCircle2, LogIn, LayoutDashboard, MessageCircle, Sparkles, MessageSquare, Zap, RefreshCw, Activity, Wrench } from 'lucide-react';
import { NeuralWhatsAppLinking } from '@/components/neural/NeuralWhatsAppLinking'; // This will need to be replaced when the component is renamed
import Header from '@/components/layout/Header';

export default function ActivateDotSpark() {
  // Hook declarations need to be in the same order in every render
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const { isWhatsAppConnected, phoneNumber, isLoading: isWhatsAppStatusLoading, 
          showActivationSuccess, justActivated, isActiveInLocalStorage,
          repairActivationStatus } = useWhatsAppStatus();
  
  // All useState hooks must be in the same order each render
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('step1'); // Initialize to default, we'll update in useEffect
  const [whatsAppDirectLink, setWhatsAppDirectLink] = useState('');
  
  // Additional state for tracking activation status with more details
  const [activationStatus, setActivationStatus] = useState({
    isConnected: isWhatsAppConnected || localStorage.getItem('dotspark_activated') === 'true',
    isCheckingStatus: false,
    lastChecked: Date.now()
  });
  
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

  // Combined activation check - either source confirms activation
  const isActivated = isWhatsAppConnected || isActiveInLocalStorage;
  
  // Progress based on activation status
  const progress = user ? (isActivated ? 100 : 50) : 0;
  
  // Ensure activation status is synced across localStorage and server
  useEffect(() => {
    // Function to fix activation status when needed
    const fixActivationStatus = async () => {
      try {
        // Get stored phone number if available
        const storedPhone = localStorage.getItem('whatsapp_phone');
        
        console.log("🔄 Checking if activation fix is needed. Current status:", { 
          isWhatsAppConnected, 
          isActiveInLocalStorage,
          storedPhone 
        });
        
        // If localStorage says activated but server doesn't confirm, try to fix it
        if (isActiveInLocalStorage && !isWhatsAppConnected) {
          console.log("🔄 Activation status mismatch - attempting to fix");
          
          const fixRes = await fetch('/api/whatsapp/fix-activation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              phoneNumber: storedPhone || undefined
            }),
          });
          
          if (fixRes.ok) {
            const fixData = await fixRes.json();
            console.log("🔄 Activation fixed successfully:", fixData);
            
            // Update activation status
            setActivationStatus(prev => ({
              ...prev,
              isConnected: true,
              isCheckingStatus: false
            }));
            
            // Force UI to show 100% completion if needed
            setActiveTab('step2');
          } else {
            console.error("Failed to fix activation:", await fixRes.text());
          }
        }
        // If server confirms activation but localStorage doesn't have it, update localStorage
        else if (isWhatsAppConnected && !isActiveInLocalStorage) {
          console.log("Server confirms WhatsApp activation - setting localStorage flag");
          localStorage.setItem('dotspark_activated', 'true');
          
          // Add stored phone number if we know it
          if (phoneNumber) {
            localStorage.setItem('whatsapp_phone', phoneNumber);
          }
        }
      } catch (error) {
        console.error("Error fixing activation status:", error);
      }
    };
    
    // Only run check when user is logged in
    if (user) {
      fixActivationStatus();
    }
  }, [isWhatsAppConnected, isActiveInLocalStorage, user, phoneNumber]);
  
  // Effect 1: Force synchronization of activation status on page load
  useEffect(() => {
    // Check if there's a WhatsApp activation in localStorage and force the UI to update
    if ((localStorage.getItem('dotspark_activated') === 'true' || isWhatsAppConnected) && user) {
      // Set global and local activation flags
      localStorage.setItem('dotspark_activated', 'true');
      sessionStorage.setItem('show_activation_success', 'true');
      
      // Force to step 2 since this is an activated user
      setActiveTab('step2');
      
      // Also set the activation status in local state for UI
      setActivationStatus(prev => ({
        ...prev,
        isConnected: true,
        isCheckingStatus: false
      }));
    }
  }, [user, isWhatsAppConnected]);
  
  // Effect 2: Update tab when auth changes (primary tab control)
  useEffect(() => {
    if (user) {
      setActiveTab('step2');
    } else {
      setActiveTab('step1');
    }
  }, [user]);
  
  // Effect 3: Listen for WhatsApp status updates from any source
  useEffect(() => {
    const handleWhatsAppStatusUpdate = (event: Event) => {
      // Cast to CustomEvent to access detail
      const customEvent = event as CustomEvent<{isActivated: boolean, source: string}>;
      console.log("Received WhatsApp status update event:", customEvent.detail);
      
      if (customEvent.detail.isActivated) {
        // Update our local state
        setActivationStatus(prev => ({
          ...prev,
          isConnected: true,
          isCheckingStatus: false
        }));
        
        // Show success notification if this isn't a duplicate
        const hasSeenSuccess = sessionStorage.getItem('shown_whatsapp_success') === 'true';
        if (!hasSeenSuccess) {
          toast({
            title: "DotSpark Activated!",
            description: "Your WhatsApp is connected and your DotSpark is now active.",
            duration: 5000,
          });
          sessionStorage.setItem('shown_whatsapp_success', 'true');
        }
      }
    };
    
    // Register event listener for status updates
    window.addEventListener('whatsapp-status-updated', handleWhatsAppStatusUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('whatsapp-status-updated', handleWhatsAppStatusUpdate);
    };
  }, [toast]);

  // Effect 4: Check for activation success flag and handle status updates
  useEffect(() => {
    // Check for a specific flag to avoid duplicate notifications
    const hasBeenActivatedBefore = localStorage.getItem('dotspark_seen') === 'true';
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
          title: "DotSpark Activated!",
          description: "Your WhatsApp message was received and your DotSpark is now active.",
          duration: 5000,
        });
        localStorage.setItem('dotspark_activated', 'true');
      } else {
        // If they're not connected yet, show a waiting message 
        toast({
          title: "Message Sent!",
          description: "Waiting for WhatsApp activation confirmation...",
          duration: 3000,
        });
        
        // For UI responsiveness, we'll add an immediate state update
        setActivationStatus(prev => ({
          ...prev,
          isCheckingStatus: true
        }));
        
        // Store all timeout IDs for proper cleanup
        const timeoutIds: number[] = [];
        
        // Define exact check times for better control
        const checkTimes = [
          { delay: 1000, label: 'Immediate check' },
          { delay: 3000, label: 'Check #1' }, 
          { delay: 6000, label: 'Check #2' },
          { delay: 9000, label: 'Check #3' },
          { delay: 12000, label: 'Check #4' },
          { delay: 15000, label: 'Check #5' },
          { delay: 20000, label: 'Slower check #1' },
          { delay: 25000, label: 'Slower check #2' }
        ];
        
        // Create a function that both makes API calls and checks localStorage
        const checkActivation = (checkLabel: string): Promise<boolean> => {
          console.log(`${checkLabel} for WhatsApp activation`);
          
          // First check if localStorage was updated by another component (including the hook)
          const isActiveInStorage = localStorage.getItem('dotspark_activated') === 'true';
          if (isActiveInStorage) {
            console.log(`${checkLabel}: Found activation in localStorage`);
            handleActivationSuccess('localStorage');
            return Promise.resolve(true);
          }
          
          // If not in localStorage, make direct API request with credentials
          return fetch('/api/whatsapp/status', { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          })
            .then(res => res.json())
            .then(data => {
              console.log(`${checkLabel} API result:`, data);
              
              // Check if the API reports activation (either isRegistered or isConnected)
              if (data.isRegistered || data.isConnected) {
                handleActivationSuccess('api', data);
                return true;
              }
              return false;
            })
            .catch(err => {
              console.error(`${checkLabel} error:`, err);
              return false;
            });
        };
        
        // Common handler for successful activation from any source
        const handleActivationSuccess = (source: string, data?: any) => {
          console.log(`Activation confirmed from ${source}`, data);
          
          // Clear all pending timeouts to stop further checks
          timeoutIds.forEach(id => window.clearTimeout(id));
          
          // Update localStorage
          localStorage.setItem('dotspark_activated', 'true');
          if (data?.phoneNumber) {
            localStorage.setItem('whatsapp_phone', data.phoneNumber);
          }
          
          // Update UI state
          setActivationStatus(prev => ({
            ...prev,
            isConnected: true,
            isCheckingStatus: false
          }));
          
          // Dispatch event for other components
          window.dispatchEvent(new CustomEvent('whatsapp-status-updated', { 
            detail: { isActivated: true, source }
          }));
          
          // Only show toast once
          if (!sessionStorage.getItem('activation_success_shown')) {
            toast({
              title: "DotSpark Activated!",
              description: "Your WhatsApp message was received and your DotSpark is now active.",
              duration: 5000,
            });
            sessionStorage.setItem('activation_success_shown', 'true');
          }
        };
        
        // Schedule each check at the appropriate time
        checkTimes.forEach(({ delay, label }) => {
          const timeoutId = window.setTimeout(() => {
            checkActivation(label)
              .then((success: boolean) => {
                // If not successful and this is the last check, show reminder
                if (!success && delay === checkTimes[checkTimes.length - 1].delay) {
                  setActivationStatus(prev => ({ ...prev, isCheckingStatus: false }));
                  toast({
                    title: "Still Waiting...",
                    description: "It may take a moment to receive your WhatsApp message. The page will update automatically when your DotSpark is activated.",
                    duration: 5000,
                  });
                }
              });
          }, delay);
          
          timeoutIds.push(timeoutId);
        });
        
        // Return cleanup function that clears all scheduled checks
        return () => {
          timeoutIds.forEach(id => window.clearTimeout(id));
        };
      }
    }
    
    // Only show toast if this is a new activation and we have an explicit success flag
    else if (showActivationSuccess && user && !hasBeenActivatedBefore) {
      // Success toast with longer duration - only for first-time activations
      toast({
        title: "DotSpark Activated!",
        description: "WhatsApp connection completed successfully.",
        duration: 5000,
      });
      
      // Mark that we've shown the activation notification
      localStorage.setItem('dotspark_seen', 'true');
    }
    
    // If WhatsApp is connected or we have an activation success flag
    if ((showActivationSuccess || isWhatsAppConnected) && user) {
      // We no longer automatically redirect to dashboard
      // This lets the user see the activation status on the activation page
      setActiveTab('step2');
      
      // Also set activation in localStorage to ensure persistence across devices
      localStorage.setItem('dotspark_activated', 'true');
    }
  }, [showActivationSuccess, isWhatsAppConnected, user, toast]);
  
  // DotSpark network visualization setup
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
    
    // DotSpark network nodes
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
               i % 3 === 1 ? '#a855f7' : // purple
               '#ec4899'                  // pink
      });
    }
    
    // Animation loop
    let animationFrame: number;
    
    const animate = () => {
      // Only continue animating if the component is still mounted
      if (!canvasRef.current) return;
      
      // Clear canvas for next frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections between nodes that are close
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            // Opacity based on distance (closer = more visible)
            const opacity = 1 - (distance / connectionDistance);
            
            // Gradient between node colors
            const gradient = ctx.createLinearGradient(
              nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y
            );
            gradient.addColorStop(0, nodes[i].color + Math.floor(opacity * 40).toString(16));
            gradient.addColorStop(1, nodes[j].color + Math.floor(opacity * 40).toString(16));
            
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Update positions and draw nodes
      nodes.forEach(node => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off walls
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        // Draw node
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Schedule next frame if still animating
      if (isAnimating) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animationFrame = requestAnimationFrame(animate);
    
    // Clean up animation on unmount
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrame);
      setIsAnimating(false);
    };
  }, [isAnimating]);
  
  // Render functions for different UI states
  
  // Render the login prompt (first step for non-logged in users)
  const renderLoginPrompt = () => (
    <TabsContent value="step1" className="space-y-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome to DotSpark</CardTitle>
          <CardDescription>
            Sign in to activate your personal DotSpark and unlock the full knowledge management experience
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <Button 
            className="w-full text-md" 
            size="lg" 
            onClick={() => loginWithGoogle()}
            disabled={isAuthLoading}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-sm text-muted-foreground mt-2 text-center">
            It takes less than a minute to activate your DotSpark with WhatsApp, and you'll immediately be able to start capturing learning moments.
          </div>
        </CardFooter>
      </Card>
    </TabsContent>
  );
  
  // Render WhatsApp activation step (second step after login)
  const renderWhatsAppActivation = () => (
    <TabsContent value="step2" className="space-y-4">
      {isActivated ? (
        // Already activated state
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">DotSpark Activated!</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <CardDescription>
              Your WhatsApp connection is active and your DotSpark is ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-md bg-primary/5 p-4 border border-primary/10">
              <div className="flex gap-3 items-start">
                <div className="mt-0.5">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Start Using WhatsApp</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    You can now send messages to DotSpark via WhatsApp to capture knowledge on the go.
                  </p>
                  
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(whatsAppDirectLink, '_blank')}
                      className="h-9 px-4"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message Now
                    </Button>
                    
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => setLocation('/dashboard')}
                      className="h-9 px-4"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Phone info */}
            {phoneNumber && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Connected phone:</span> {phoneNumber}
              </div>
            )}
            
            {/* Repair option - subtle and at the bottom */}
            <div className="border-t pt-3 mt-4">
              <div 
                className="flex items-center text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => {
                  toast({
                    title: "Repairing Connection",
                    description: "Attempting to reconnect your DotSpark...",
                    duration: 3000,
                  });
                  repairActivationStatus();
                }}
              >
                <Wrench className="h-3.5 w-3.5 mr-1 opacity-70" />
                <span>If your DotSpark isn't working properly, you can repair the connection.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Not yet activated state
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              Activate Your DotSpark Account
            </CardTitle>
            <CardDescription>
              Connect with WhatsApp to activate your DotSpark and start capturing knowledge anywhere
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* WhatsApp Activation Component */}
            <NeuralWhatsAppLinking />
            
            {activationStatus.isCheckingStatus && (
              <div className="flex items-center gap-2 text-sm mt-4">
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Checking activation status...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* What is DotSpark - info card */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">
            DotSpark
          </CardTitle>
          <CardDescription className="text-base">
            What is a DotSpark?
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p className="text-sm mb-4">
            Your personal DotSpark functions as a cognitive enhancer that:
          </p>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Learns from your inputs</span> — adapting
                to your unique thought patterns over time
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Makes connections</span> — identifies
                relationships between concepts across all your notes
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Zap className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Generates insights</span> — provides
                personalized recommendations based on your knowledge patterns
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="mt-0.5">
                <Activity className="h-4 w-4 text-pink-500" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Evolves with you</span> — grows more
                powerful as you interact with it, unlocking new capabilities
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with navigation */}
      <Header onSearch={handleSearch} />
      
      {/* Main content with background animation */}
      <div className="flex-1 relative">
        {/* DotSpark network canvas - covering entire background */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full bg-background z-0"
        />
        
        {/* Main content */}
        <div className="container relative z-10 py-8 md:py-12">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Activate DotSpark
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              DotSpark enhances your cognitive abilities by learning from your interactions and providing personal insights.
            </p>
            
            {/* Progress indicator */}
            <div className="w-full max-w-md mt-6">
              <div className="flex justify-between mb-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className={`flex h-2 w-2 rounded-full ${progress >= 0 ? 'bg-primary' : 'bg-muted'}`}></span>
                  <span className={progress >= 0 ? 'text-foreground' : 'text-muted-foreground'}>
                    Sign In
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className={`flex h-2 w-2 rounded-full ${progress >= 50 ? 'bg-primary' : 'bg-muted'}`}></span>
                  <span className={progress >= 50 ? 'text-foreground' : 'text-muted-foreground'}>
                    Connect WhatsApp
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className={`flex h-2 w-2 rounded-full ${progress >= 100 ? 'bg-primary' : 'bg-muted'}`}></span>
                  <span className={progress >= 100 ? 'text-foreground' : 'text-muted-foreground'}>
                    DotSpark Activated
                  </span>
                </div>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </div>
          
          {/* Main content */}
          <div className="max-w-3xl mx-auto">
            <Tabs 
              defaultValue={activeTab} 
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="hidden">
                <TabsTrigger value="step1">Step 1</TabsTrigger>
                <TabsTrigger value="step2">Step 2</TabsTrigger>
              </TabsList>
              
              {renderLoginPrompt()}
              {renderWhatsAppActivation()}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}