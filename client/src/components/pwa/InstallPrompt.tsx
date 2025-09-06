import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { CheckCircle, Download, BrainCircuit } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
    'appinstalled': Event;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the prompt to user after 3 seconds if they've used the app for a bit
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      // App is installed, hide the prompt
      setShowPrompt(false);
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We no longer need the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Don't render anything if no prompt is available or already installed
  if (!showPrompt || !deferredPrompt || installed) {
    return null;
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-600" />
            <span>Install <img src="/dotspark-logo-wordmark.png?v=2" alt="DotSpark" className="h-6 w-auto object-contain" /></span>
          </DialogTitle>
          <DialogDescription>
            Install DotSpark as an app on your device for the best neural tuning experience. You'll be able to access your DotSpark even when offline.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Offline Access</h4>
              <p className="text-sm text-gray-500">Continue neural tuning even without an internet connection</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Enhanced Performance</h4>
              <p className="text-sm text-gray-500">Faster loading times and smoother experience</p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => setShowPrompt(false)}>
            Not Now
          </Button>
          <Button onClick={handleInstallClick} className="gap-1.5 bg-gradient-to-r from-purple-700 to-purple-500">
            <Download className="h-4 w-4" />
            Install App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}