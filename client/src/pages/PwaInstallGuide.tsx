import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, Download, Share, PlusCircle, Menu, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function PwaInstallGuide() {
  const [, setLocation] = useLocation();
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');
  
  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-black">
      <div className="container px-4 py-8 mx-auto max-w-md">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        
        <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
          Install DotSpark App
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Follow these simple steps to install DotSpark as an app on your device for the best experience.
        </p>
        
        {deviceType === 'ios' && (
          <Card className="mb-8 overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50">
              <CardTitle className="flex items-center">
                <Smartphone className="mr-2 h-5 w-5 text-indigo-600" />
                iOS Installation Guide
              </CardTitle>
              <CardDescription>
                For iPhone and iPad users
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="space-y-6">
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Tap the Share button</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Find the Share icon <Share className="inline-block h-4 w-4" /> at the bottom of your browser.
                    </p>
                    <div className="mt-3 rounded-lg border overflow-hidden">
                      <img src="/images/ios-share-button.webp" alt="iOS Share Button" className="w-full" />
                    </div>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Select "Add to Home Screen"</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Scroll down until you see the "Add to Home Screen" option.
                    </p>
                    <div className="mt-3 rounded-lg border overflow-hidden">
                      <img src="/images/ios-add-to-home.webp" alt="iOS Add to Home Screen" className="w-full" />
                    </div>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Tap "Add"</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The app name and icon will appear. Simply tap "Add" to install.
                    </p>
                    <div className="mt-3 rounded-lg border overflow-hidden">
                      <img src="/images/ios-add-confirmation.webp" alt="iOS Add Confirmation" className="w-full" />
                    </div>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Launch DotSpark</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The DotSpark app icon will appear on your home screen. Tap to launch.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}
        
        {deviceType === 'android' && (
          <Card className="mb-8 overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50">
              <CardTitle className="flex items-center">
                <Smartphone className="mr-2 h-5 w-5 text-indigo-600" />
                Android Installation Guide
              </CardTitle>
              <CardDescription>
                For Android phone and tablet users
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="space-y-6">
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Tap the Menu button</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Open the browser menu <Menu className="inline-block h-4 w-4" /> (three dots) in the top right corner.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Select "Install app" or "Add to Home screen"</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Look for the install option in the dropdown menu.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Tap "Install" or "Add"</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Confirm the installation when prompted.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Launch DotSpark</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The DotSpark app icon will appear on your home screen. Tap to launch.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}
        
        {deviceType === 'desktop' && (
          <Card className="mb-8 overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50">
              <CardTitle className="flex items-center">
                <Download className="mr-2 h-5 w-5 text-indigo-600" />
                Desktop Installation Guide
              </CardTitle>
              <CardDescription>
                For Chrome, Edge, and other desktop browsers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="space-y-6">
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Look for the Install icon</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Find the install icon <PlusCircle className="inline-block h-4 w-4" /> in your browser's address bar.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Click "Install"</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Follow the prompts to install DotSpark on your computer.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Launch DotSpark</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      The DotSpark app will open in its own window, separate from your browser.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}
        
        <div className="text-center">
          <Button 
            variant="default" 
            className="mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            onClick={() => setLocation('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Return to DotSpark
          </Button>
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at support@dotspark.in
          </p>
        </div>
      </div>
    </div>
  );
}