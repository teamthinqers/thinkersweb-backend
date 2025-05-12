import React, { useState, useEffect } from 'react';
import { CheckCircle, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { showInstallPrompt, isPWAInstalled, AddToHomeScreenProps } from '@/lib/pwaUtils';

/**
 * A component that prompts the user to install the app
 */
export function InstallPrompt({ onInstall, onDismiss }: AddToHomeScreenProps) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isPWAInstalled());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    setIsInstalled(isPWAInstalled());

    // Listen for installability
    const handleInstallable = () => {
      setIsInstallable(true);
      // Show the prompt after a short delay
      setTimeout(() => setIsVisible(true), 3000);
    };

    // Listen for installation
    const handleInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      
      // Show success message briefly
      setTimeout(() => {
        if (onInstall) {
          onInstall();
        }
      }, 2000);
    };

    window.addEventListener('pwaInstallable', handleInstallable);
    window.addEventListener('pwaInstalled', handleInstalled);

    // Clean up
    return () => {
      window.removeEventListener('pwaInstallable', handleInstallable);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, [onInstall]);

  // Don't show if not installable or already installed
  if (!isVisible || !isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await showInstallPrompt();
    if (success) {
      setIsInstalled(true);
      if (onInstall) {
        onInstall();
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <Card className="mx-auto max-w-md shadow-lg border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Install DotSpark
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <CardDescription>
            Add DotSpark to your home screen for the full neural extension tuning experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-700 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">DS</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Benefits:</h4>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Advanced neural extension tuning</span>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Offline access to your neural settings</span>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Customized thought pattern analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-1">
          <Button 
            className="w-full" 
            onClick={handleInstall}
            variant="default"
          >
            <Download className="mr-2 h-4 w-4" />
            Install Neural Extension
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * A smaller, more subtle version of the install prompt for use in menus
 */
export function CompactInstallPrompt({ onInstall, onDismiss }: AddToHomeScreenProps) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isPWAInstalled());

  useEffect(() => {
    // Check if the app is already installed
    setIsInstalled(isPWAInstalled());

    // Listen for installability
    const handleInstallable = () => {
      setIsInstallable(true);
    };

    // Listen for installation
    const handleInstalled = () => {
      setIsInstalled(true);
      if (onInstall) {
        onInstall();
      }
    };

    window.addEventListener('pwaInstallable', handleInstallable);
    window.addEventListener('pwaInstalled', handleInstalled);

    // Clean up
    return () => {
      window.removeEventListener('pwaInstallable', handleInstallable);
      window.removeEventListener('pwaInstalled', handleInstalled);
    };
  }, [onInstall]);

  // Don't show if not installable or already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await showInstallPrompt();
    if (success) {
      setIsInstalled(true);
      if (onInstall) {
        onInstall();
      }
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full justify-start mt-2" 
      onClick={handleInstall}
    >
      <Download className="mr-2 h-4 w-4" />
      Install Neural Extension
    </Button>
  );
}