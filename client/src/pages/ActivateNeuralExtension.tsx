import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowRight, Brain, Check, CheckCircle2, LogIn, MessageCircle, Sparkles, MessageSquare, Zap } from 'lucide-react';
import { NeuralWhatsAppLinking } from '@/components/neural/NeuralWhatsAppLinking';

export default function ActivateNeuralExtension() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading, loginWithGoogle } = useAuth();
  
  // Neural network visualization state
  const [isAnimating, setIsAnimating] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Function to navigate back to the home page
  const goToHome = () => setLocation("/");
  const { isWhatsAppConnected, isLoading: isWhatsAppStatusLoading } = useWhatsAppStatus();
  const [activeTab, setActiveTab] = useState<string>(user ? 'step2' : 'step1');

  // Calculate progress percentage
  const progress = user ? (isWhatsAppConnected ? 100 : 50) : 0;
  
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

  // Set the active tab based on auth state
  useEffect(() => {
    if (user && !isWhatsAppConnected) {
      setActiveTab('step2');
    }
  }, [user, isWhatsAppConnected]);

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
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-secondary rounded w-1/3"></div>
          <div className="h-4 bg-secondary rounded w-1/2"></div>
          <div className="h-64 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      {/* Neural network canvas - positioned absolutely to fill the top portion */}
      <div className="relative w-full h-64 mb-8 overflow-hidden rounded-xl">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90"></div>
        
        {/* Content overlay on the canvas */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="relative z-10 text-center">
            <div className="inline-block h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping"></div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-primary to-blue-600">Neural Extension</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Extend your cognitive capabilities with DotSpark
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button variant="ghost" onClick={goToHome} className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Home
        </Button>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Activation Process
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Complete these two steps to fully personalize your neural extension
        </p>

        {/* Progress status */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="flex justify-between mb-2 text-sm font-medium">
            <div className="flex items-center">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                progress >= 50 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {progress >= 50 ? <Check className="h-4 w-4" /> : '1'}
              </span>
              <span className={progress >= 50 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Create Account
              </span>
            </div>
            <div className="flex items-center">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                progress === 100 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {progress === 100 ? <Check className="h-4 w-4" /> : '2'}
              </span>
              <span className={progress === 100 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Link WhatsApp
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="step1" disabled={!!user}>Step 1: Create Account</TabsTrigger>
            <TabsTrigger value="step2" disabled={!user}>Step 2: Link WhatsApp</TabsTrigger>
          </TabsList>

          {/* Step 1: Create Account */}
          <TabsContent value="step1" className="mt-6">
            <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-indigo-600/10 to-indigo-600/5 rounded-bl-full"></div>
              
              <CardHeader className="text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <Brain className="h-10 w-10 text-primary" />
                  <div className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-pulse"></div>
                  <div className="absolute top-0 right-0 h-4 w-4 bg-indigo-600 rounded-full animate-ping"></div>
                </div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-primary">
                  Create Your Neural Account
                </CardTitle>
                <CardDescription className="text-base">
                  Personalize your neural extension with a secure account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 text-center relative z-10">
                <div className="space-y-6">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-6 shadow-sm">
                    <h3 className="font-medium flex items-center justify-center mb-3 text-lg">
                      <Sparkles className="h-5 w-5 mr-2 text-indigo-600" />
                      Why create an account?
                    </h3>
                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-3 text-left">
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 mr-2 mt-0.5 text-indigo-600" />
                        <span>Store your personalized neural preferences</span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 mr-2 mt-0.5 text-indigo-600" />
                        <span>Access your synchronized insights dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 mr-2 mt-0.5 text-indigo-600" />
                        <span>Enhance your neural extension with your data</span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-4 w-4 mr-2 mt-0.5 text-indigo-600" />
                        <span>Securely link your WhatsApp for seamless interaction</span>
                      </li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={handleGoogleLogin}
                    className="w-full max-w-xs mx-auto relative overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-primary opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <LogIn className="mr-2 h-5 w-5" />
                      <span>Sign in with Google</span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-primary/20 rounded-lg blur-xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
                  </Button>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center text-sm text-muted-foreground border-t pt-4 relative z-10">
                Already have an account? Your progress will be automatically detected.
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Step 2: Link WhatsApp */}
          <TabsContent value="step2" className="mt-6">
            <Card className="border-2 border-[#25D366]/20 shadow-lg overflow-hidden">
              <div className="absolute left-0 top-0 w-32 h-32 bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 rounded-br-full"></div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tl from-[#128C7E]/10 to-[#25D366]/5 rounded-tl-full"></div>
              
              <CardHeader className="text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <MessageSquare className="h-10 w-10 text-[#25D366]" />
                  <div className="absolute -inset-1 rounded-full border-2 border-[#25D366]/20 animate-pulse"></div>
                </div>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#25D366] to-[#128C7E]">
                  Link Your WhatsApp
                </CardTitle>
                <CardDescription className="text-base">
                  Connect WhatsApp to fully activate your neural extension
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                {/* WhatsApp linking component */}
                <NeuralWhatsAppLinking />
                
                {/* Success message if already connected */}
                {isWhatsAppConnected && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800/30 flex flex-col items-center text-center relative overflow-hidden">
                    {/* Animated success elements */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-0 left-1/4 w-1 h-20 bg-green-400/20 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="absolute top-10 left-1/3 w-1 h-16 bg-green-400/20 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="absolute top-5 left-1/2 w-1 h-24 bg-green-400/20 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                      <div className="absolute top-8 left-2/3 w-1 h-20 bg-green-400/20 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <div className="absolute top-2 left-3/4 w-1 h-16 bg-green-400/20 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    </div>
                    
                    {/* Main content */}
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-500/30 rounded-full flex items-center justify-center mb-4 relative">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                        <div className="absolute -inset-1 rounded-full border-2 border-green-500/30 animate-pulse"></div>
                      </div>
                      <h4 className="font-bold text-2xl text-green-800 dark:text-green-300 mb-3">Neural Extension Activated!</h4>
                      
                      <div className="w-full max-w-xs mx-auto mb-4">
                        <div className="w-full max-w-xs bg-green-200 dark:bg-green-900/20 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-500 dark:to-green-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </div>
                      
                      <p className="text-green-700 dark:text-green-400 mb-6 max-w-md mx-auto">
                        Your neural extension is now fully activated and synchronized. You can interact with it via WhatsApp or use your personalized dashboard.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        <Button 
                          variant="outline" 
                          className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20 relative group"
                          onClick={() => window.open(`https://wa.me/16067157733`, "_blank")}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Open WhatsApp</span>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-green-500/10 rounded-md transition-opacity"></div>
                        </Button>
                        
                        <Button 
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 text-white relative group overflow-hidden"
                          onClick={() => setLocation('/dashboard')}
                        >
                          <span className="relative z-10">Dashboard</span>
                          <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between border-t pt-4 relative z-10">
                {isWhatsAppConnected ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary relative group overflow-hidden"
                    onClick={() => setLocation('/dashboard')}
                  >
                    <span className="relative z-10">Go to Dashboard</span>
                    <ArrowRight className="ml-2 h-4 w-4 relative z-10" />
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  </Button>
                ) : (
                  <div className="w-full text-sm text-center relative">
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
                      <div className="flex items-center justify-center mb-2">
                        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-amber-700 dark:text-amber-400 font-medium">Your neural extension is not fully active yet</span>
                      </div>
                      <p className="text-amber-600 dark:text-amber-500">Complete WhatsApp linking to unlock all capabilities</p>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}