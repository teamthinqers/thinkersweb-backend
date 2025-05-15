import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function PwaDebugger() {
  const { toast } = useToast();
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [pwaStatus, setPwaStatus] = useState<{
    installable: boolean;
    installed: boolean;
    standalone: boolean;
    offlineReady: boolean;
    deferredPrompt: boolean;
    serviceWorker: boolean;
    manifestFound: boolean;
    networkPolyfillWorking: boolean;
  }>({
    installable: false,
    installed: false,
    standalone: false,
    offlineReady: false,
    deferredPrompt: false,
    serviceWorker: false,
    manifestFound: false,
    networkPolyfillWorking: false,
  });

  useEffect(() => {
    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    // Check if manifest is linked
    const manifestLink = document.querySelector('link[rel="manifest"]');
    
    // Check if service worker is registered
    const serviceWorkerRegistered = 'serviceWorker' in navigator;
    
    // Check if we can prompt for installation
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setPwaStatus(prev => ({...prev, deferredPrompt: true, installable: true}));
    });
    
    // Check offline capabilities
    const offlineCapable = 'caches' in window;
    
    // Test network polyfill
    const networkPolyfillWorking = window.Network !== undefined;
    
    setPwaStatus({
      installable: false, // Will be set by the beforeinstallprompt event
      installed: isStandalone,
      standalone: isStandalone,
      offlineReady: offlineCapable,
      deferredPrompt: false, // Will be set by the beforeinstallprompt event
      serviceWorker: serviceWorkerRegistered,
      manifestFound: manifestLink !== null,
      networkPolyfillWorking: networkPolyfillWorking,
    });
    
    // Check if currently installed by display mode
    window.addEventListener('appinstalled', () => {
      setPwaStatus(prev => ({...prev, installed: true}));
      toast({
        title: "Installation successful",
        description: "DotSpark Neura has been successfully installed",
      });
    });
    
  }, [toast]);

  const promptInstall = async () => {
    if (!installPromptEvent) {
      toast({
        title: "Cannot install",
        description: "The app is not installable at this moment",
        variant: "destructive",
      });
      return;
    }
    
    // Show installation prompt
    installPromptEvent.prompt();
    
    // Wait for user to respond to prompt
    const choiceResult = await installPromptEvent.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      toast({
        title: "Installation started",
        description: "DotSpark Neura is being installed",
      });
    } else {
      toast({
        title: "Installation declined",
        description: "You can install the app later from the PWA Debug page",
      });
    }
    
    // Clear the saved prompt since it can't be used twice
    setInstallPromptEvent(null);
    setPwaStatus(prev => ({...prev, deferredPrompt: false}));
  };

  const uninstallServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      let successCount = 0;
      
      for (const registration of registrations) {
        const unregistered = await registration.unregister();
        if (unregistered) successCount++;
      }
      
      if (successCount > 0) {
        toast({
          title: "Service worker removed",
          description: `Successfully removed ${successCount} service worker registration(s)`,
        });
        setPwaStatus(prev => ({...prev, serviceWorker: false}));
      } else {
        toast({
          title: "No service workers to remove",
          description: "No registered service workers were found",
        });
      }
    } else {
      toast({
        title: "Service workers not supported",
        description: "Your browser does not support service workers",
        variant: "destructive",
      });
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map(name => window.caches.delete(name)));
        toast({
          title: "Cache cleared",
          description: `Successfully cleared ${cacheNames.length} cache entries`,
        });
      } catch (error) {
        toast({
          title: "Error clearing cache",
          description: "Failed to clear cache: " + (error as Error).message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cache API not supported",
        description: "Your browser does not support the Cache API",
        variant: "destructive",
      });
    }
  };

  const diagnostics = [
    { 
      name: "Standalone Mode", 
      status: pwaStatus.standalone, 
      message: pwaStatus.standalone ? "Running as installed app" : "Not running in standalone mode",
      icon: pwaStatus.standalone ? CheckCircle2 : XCircle
    },
    { 
      name: "Installation", 
      status: pwaStatus.installable, 
      message: pwaStatus.installable ? "App can be installed" : "Not installable at this moment",
      icon: pwaStatus.installable ? CheckCircle2 : AlertCircle
    },
    { 
      name: "Offline Capability", 
      status: pwaStatus.offlineReady, 
      message: pwaStatus.offlineReady ? "Basic offline capability available" : "No offline capability",
      icon: pwaStatus.offlineReady ? CheckCircle2 : AlertCircle
    },
    { 
      name: "Service Worker", 
      status: null, 
      message: pwaStatus.serviceWorker ? "Service worker API available" : "Service worker API not available",
      icon: HelpCircle
    },
    { 
      name: "Web Manifest", 
      status: pwaStatus.manifestFound, 
      message: pwaStatus.manifestFound ? "Web manifest found" : "Web manifest not found",
      icon: pwaStatus.manifestFound ? CheckCircle2 : XCircle
    },
    { 
      name: "Network Polyfill", 
      status: pwaStatus.networkPolyfillWorking, 
      message: pwaStatus.networkPolyfillWorking ? "Network polyfill working" : "Network polyfill not working",
      icon: pwaStatus.networkPolyfillWorking ? CheckCircle2 : XCircle
    }
  ];

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-violet-500 text-transparent bg-clip-text">
          DotSpark Neura PWA Debugger
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Diagnose and fix Progressive Web App functionality
        </p>
      </div>

      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="info">Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnostics">
          <div className="grid gap-4 md:grid-cols-2">
            {diagnostics.map((item, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <item.icon 
                      className={`h-5 w-5 ${
                        item.status === true ? 'text-green-500' : 
                        item.status === false ? 'text-red-500' : 'text-amber-500'
                      }`} 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Available Actions</CardTitle>
              <CardDescription>
                Manage your PWA installation and troubleshoot issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Installation</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    onClick={promptInstall} 
                    disabled={!pwaStatus.deferredPrompt}
                    className="bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600"
                  >
                    Install App
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Troubleshooting</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    onClick={uninstallServiceWorker}
                  >
                    Remove Service Worker
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearCache}
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                Changes may require a page reload to take effect
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>PWA Information</CardTitle>
              <CardDescription>
                Details about Progressive Web Apps and how they work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">What is a PWA?</h3>
                <p className="text-sm text-muted-foreground">
                  Progressive Web Apps (PWAs) provide an app-like experience in the browser. They can work offline, 
                  be installed on your device, and send notifications.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Installation</h3>
                <p className="text-sm text-muted-foreground">
                  Most modern browsers allow you to install PWAs. Look for an "Install" option in your browser's address bar or menu.
                  Once installed, DotSpark Neura will appear as an app on your device.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Offline Use</h3>
                <p className="text-sm text-muted-foreground">
                  DotSpark Neura includes basic offline functionality. While you'll need an internet connection for most features,
                  we provide an offline page when you lose connection.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Troubleshooting</h3>
                <p className="text-sm text-muted-foreground">
                  If you experience issues with the app, try using the troubleshooting actions on the Actions tab.
                  Clearing the cache and removing service workers can often resolve problems.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}