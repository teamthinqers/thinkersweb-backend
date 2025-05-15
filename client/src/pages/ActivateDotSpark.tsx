import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useWhatsAppStatus } from '@/hooks/useWhatsAppStatus';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Brain, Check, LogIn, LayoutDashboard, MessageCircle, Sparkles, RefreshCw, Wrench } from 'lucide-react';
import { DotSparkWhatsAppLinking } from '@/components/dotspark/DotSparkWhatsAppLinking';
import Header from '@/components/layout/Header';

export default function ActivateDotSpark() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const { 
    isWhatsAppConnected, 
    isLoading: isWhatsAppStatusLoading, 
    isActiveInLocalStorage,
    repairActivationStatus 
  } = useWhatsAppStatus();
  
  const [activeTab, setActiveTab] = useState<string>('step1');
  const [whatsAppDirectLink, setWhatsAppDirectLink] = useState('');
  
  // Combined activation status
  const isActivated = isWhatsAppConnected || isActiveInLocalStorage;
  
  // Progress based on activation status
  const progress = user ? (isActivated ? 100 : 50) : 0;
  
  // Empty search handler for header
  const handleSearch = () => {};
  
  // Get WhatsApp direct link
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
  
  // Update active tab when auth state changes
  useEffect(() => {
    if (user) {
      setActiveTab('step2');
    } else {
      setActiveTab('step1');
    }
  }, [user]);
  
  // Handle Google login
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "There was a problem logging you in. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Determine if we're currently checking activation status
  const isChecking = isWhatsAppStatusLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Include header component */}
      <Header onSearch={handleSearch} />
      
      <div className="flex-1 container mx-auto px-4 py-6 md:py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Activate Your <span className="text-primary">DotSpark</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect WhatsApp to activate your personal DotSpark and start capturing your thoughts and learnings.
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Activation Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Main activation content */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="step1">Step 1: Connect Account</TabsTrigger>
            <TabsTrigger value="step2">Step 2: Link WhatsApp</TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Account Connection */}
          <TabsContent value="step1" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Your DotSpark Account</CardTitle>
                <CardDescription>
                  Sign in to continue the activation process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Personal DotSpark</h3>
                      <p className="text-muted-foreground text-sm">
                        Your DotSpark adapts to your unique thought patterns
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Enhanced Thinking</h3>
                      <p className="text-muted-foreground text-sm">
                        Connect related ideas and develop deeper insights
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Accessible Anywhere</h3>
                      <p className="text-muted-foreground text-sm">
                        Capture thoughts via WhatsApp, even when offline
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  size="lg"
                  disabled={!!user || isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : user ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in with Google
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tab 2: WhatsApp Linking */}
          <TabsContent value="step2" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isActivated ? 
                    "DotSpark Activated" : 
                    "Link WhatsApp to DotSpark"
                  }
                </CardTitle>
                <CardDescription>
                  {isActivated ? 
                    "Your WhatsApp is connected and DotSpark is active." : 
                    "Send a WhatsApp message to activate your DotSpark."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-6">
                  {!user ? (
                    <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-amber-800">Account Required</h3>
                          <p className="text-amber-700 text-sm mt-1">
                            Please complete Step 1 by signing in first.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-3 text-amber-800 border-amber-300 hover:bg-amber-100"
                            onClick={() => setActiveTab('step1')}
                          >
                            Go to Step 1
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* WhatsApp linking components */}
                      <DotSparkWhatsAppLinking 
                        isActivated={isActivated} 
                        isChecking={isChecking}
                        directLink={whatsAppDirectLink}
                      />
                      
                      {/* Status display */}
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-card border">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${isActivated ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                            <span>WhatsApp Connection</span>
                          </div>
                          <span className="text-sm font-medium">
                            {isActivated ? 'Active' : isChecking ? 'Checking...' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                {isActivated ? (
                  <>
                    <Button 
                      onClick={() => setLocation('/dashboard')} 
                      size="lg" 
                      className="w-full"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Open Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={repairActivationStatus}
                      size="sm"
                      className="w-full"
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      Repair Connection (if issues occur)
                    </Button>
                  </>
                ) : (
                  user && (
                    <Button 
                      variant="outline" 
                      onClick={repairActivationStatus}
                      disabled={isChecking}
                      className="w-full"
                    >
                      {isChecking ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Check Connection Status
                        </>
                      )}
                    </Button>
                  )
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
