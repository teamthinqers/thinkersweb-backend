import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Download, RefreshCw, Smartphone, Terminal } from "lucide-react";
import { promptInstall } from "@/lib/pwaUtils";
import { useLocation } from "wouter";

export default function PwaDebugger() {
  const [, setLocation] = useLocation();
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState("Checking...");
  const [manifestStatus, setManifestStatus] = useState("Checking...");
  const [displayMode, setDisplayMode] = useState("browser");
  const [iconsStatus, setIconsStatus] = useState("Checking...");
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone || 
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Check display mode
    if (standalone) {
      setDisplayMode("standalone");
    } else if (window.navigator.userAgent.includes("Mobile")) {
      setDisplayMode("mobile browser");
    } else {
      setDisplayMode("desktop browser");
    }

    // Check if installation is possible
    setCanInstall(Boolean((window as any).deferredPrompt));

    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          if (registrations.length > 0) {
            setServiceWorkerStatus(`Active (${registrations.length} registration${registrations.length > 1 ? 's' : ''})`);
          } else {
            setServiceWorkerStatus("Not registered");
          }
        })
        .catch(error => {
          setServiceWorkerStatus(`Error: ${error.message}`);
        });
    } else {
      setServiceWorkerStatus("Not supported");
    }

    // Check manifest
    fetch('/manifest.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setManifestStatus(`Valid (${data.name})`);
      })
      .catch(error => {
        setManifestStatus(`Error: ${error.message}`);
      });

    // Check icons
    const iconPromises = [
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png',
      '/icons/apple-touch-icon.png'
    ].map(iconPath => 
      fetch(iconPath)
        .then(response => ({ path: iconPath, status: response.ok ? 'OK' : `Error ${response.status}` }))
        .catch(() => ({ path: iconPath, status: 'Failed' }))
    );

    Promise.all(iconPromises)
      .then(results => {
        const allOk = results.every(r => r.status === 'OK');
        setIconsStatus(allOk ? 'All icons available' : 'Some icons missing');
      });

    // Check online status
    setIsOnline(navigator.onLine);
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const refreshStatus = () => {
    setRefreshing(true);
    window.location.reload();
  };

  const handleInstallClick = () => {
    promptInstall();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text mb-2">
          DotSpark Neura PWA Debugger
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 max-w-md">
          This tool helps diagnose Progressive Web App functionality issues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-purple-500" />
              Installation Status
            </CardTitle>
            <CardDescription>
              Current application installation mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Display Mode:</span>
                <Badge variant={isStandalone ? "default" : "outline"} className={isStandalone ? "bg-green-600" : ""}>
                  {displayMode}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Can Be Installed:</span>
                <Badge variant={canInstall ? "default" : "outline"} className={canInstall ? "bg-green-600" : ""}>
                  {canInstall ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Online:</span>
                <Badge variant={isOnline ? "default" : "outline"} className={isOnline ? "bg-green-600" : "bg-red-600"}>
                  {isOnline ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {canInstall && (
              <Button onClick={handleInstallClick} className="flex items-center gap-2">
                <Download size={16} />
                Install App
              </Button>
            )}
            <Button variant="outline" onClick={refreshStatus} disabled={refreshing}>
              <RefreshCw size={16} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              PWA Requirements
            </CardTitle>
            <CardDescription>
              Status of required PWA components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Service Worker:</span>
                <Badge variant={serviceWorkerStatus.includes("Active") ? "default" : "outline"} 
                      className={serviceWorkerStatus.includes("Active") ? "bg-green-600" : 
                              serviceWorkerStatus.includes("Error") ? "bg-red-600" : ""}>
                  {serviceWorkerStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Manifest:</span>
                <Badge variant={manifestStatus.includes("Valid") ? "default" : "outline"}
                      className={manifestStatus.includes("Valid") ? "bg-green-600" : 
                              manifestStatus.includes("Error") ? "bg-red-600" : ""}>
                  {manifestStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Icons:</span>
                <Badge variant={iconsStatus.includes("All icons available") ? "default" : "outline"}
                      className={iconsStatus.includes("All icons available") ? "bg-green-600" : 
                              iconsStatus.includes("Some") ? "bg-yellow-600" : ""}>
                  {iconsStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="ml-auto" onClick={() => setLocation("/")}>
              Return to App
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              PWA Installation Steps
            </CardTitle>
            <CardDescription>
              Follow these steps to install DotSpark Neura as an app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium mb-2">Chrome on Android:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Tap the three dots in the top right corner</li>
                  <li>Select "Add to Home screen"</li>
                  <li>Confirm by tapping "Add"</li>
                </ol>
              </div>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium mb-2">Safari on iOS:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Tap the share icon at the bottom of the screen</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                </ol>
              </div>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium mb-2">Chrome on Desktop:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click the install icon in the address bar (➕)</li>
                  <li>Click "Install" in the prompt that appears</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              Troubleshooting Tools
            </CardTitle>
            <CardDescription>
              Advanced tools to fix PWA issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium mb-2">Clear Service Worker and Cache:</h3>
                <p className="text-sm mb-2">If you're experiencing issues, try clearing the cache:</p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => {
                    try {
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(registrations => {
                          for (const registration of registrations) {
                            registration.unregister();
                          }
                          console.log('Service workers unregistered');
                        });
                      }
                      if ('caches' in window) {
                        caches.keys().then(keyList => {
                          return Promise.all(
                            keyList.map(key => {
                              return caches.delete(key);
                            })
                          );
                        });
                        console.log('Caches cleared');
                      }
                      alert('Service worker and caches cleared. Please refresh the page.');
                    } catch (e) {
                      console.error('Error clearing:', e);
                      alert('Error clearing cache. See console for details.');
                    }
                  }}
                >
                  Clear Cache
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Force Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}