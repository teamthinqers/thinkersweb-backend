import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowRight, Brain, Check, CheckCircle2, LogIn, MessageCircle, Sparkles, MessageSquare } from 'lucide-react';
import { NeuralWhatsAppLinking } from '@/components/neural/NeuralWhatsAppLinking';

export default function ActivateNeuralExtension() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading, loginWithGoogle } = useAuth();
  
  // Function to navigate back to the home page
  const goToHome = () => setLocation("/");
  const { isWhatsAppConnected, isLoading: isWhatsAppStatusLoading } = useWhatsAppStatus();
  const [activeTab, setActiveTab] = useState<string>(user ? 'step2' : 'step1');

  // Calculate progress percentage
  const progress = user ? (isWhatsAppConnected ? 100 : 50) : 0;

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
      <div className="flex justify-end mb-4">
        <Button variant="ghost" onClick={goToHome} className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Home
        </Button>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Activate Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-primary to-blue-600">Neural Extension</span>
        </h1>
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
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Create Your Neural Account</CardTitle>
                <CardDescription>
                  Personalize your neural extension with a secure account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="space-y-6">
                  <div className="rounded-lg bg-primary/5 p-4">
                    <h3 className="font-medium flex items-center justify-center mb-2">
                      <Sparkles className="h-4 w-4 mr-2 text-primary" />
                      Why create an account?
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left list-disc list-inside">
                      <li>Store your personalized neural preferences</li>
                      <li>Access your synchronized insights dashboard</li>
                      <li>Enhance your neural extension with your data</li>
                      <li>Securely link your WhatsApp for seamless interaction</li>
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
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground border-t pt-4">
                Already have an account? Your progress will be automatically detected.
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Step 2: Link WhatsApp */}
          <TabsContent value="step2" className="mt-6">
            <Card className="border-2 border-[#25D366]/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-[#25D366]" />
                </div>
                <CardTitle className="text-2xl">Link Your WhatsApp</CardTitle>
                <CardDescription>
                  Connect WhatsApp to fully activate your neural extension
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* WhatsApp linking component */}
                <NeuralWhatsAppLinking />
                
                {/* Success message if already connected */}
                {isWhatsAppConnected && (
                  <div className="mt-4 p-6 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800/30 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-bold text-xl text-green-800 dark:text-green-300 mb-2">Neural Extension Activated!</h4>
                    <div className="w-full max-w-xs mx-auto mb-3">
                      <div className="w-full max-w-xs bg-green-200 dark:bg-green-900/20 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-green-600 dark:bg-green-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-green-700 dark:text-green-400 mb-4">
                      Your neural extension is now fully activated and synchronized. You can interact with it via WhatsApp or use your personalized dashboard.
                    </p>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                      <Button 
                        variant="outline" 
                        className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                        onClick={() => window.open(`https://wa.me/16067157733`, "_blank")}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Open WhatsApp
                      </Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setLocation('/dashboard')}
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                {isWhatsAppConnected ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary"
                    onClick={() => setLocation('/dashboard')}
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="w-full text-sm text-muted-foreground text-center">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">Your neural extension is not fully active yet</span>
                    </div>
                    <p>Complete WhatsApp linking to unlock all capabilities</p>
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