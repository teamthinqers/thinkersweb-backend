import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Share, PlusCircle } from 'lucide-react';
import { isRunningAsStandalone } from '@/lib/pwaUtils';

export function IosPwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Only show for iOS devices not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if we have a debug parameter to force showing the prompt
    const showDebug = window.location.search.includes('debug_ios_install=true');
    
    // For testing purposes, always show when the debug parameter is present
    if (showDebug) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    // Normal behavior: show for iOS devices that aren't in standalone mode
    // Instead of using a session flag, check if the user has dismissed the prompt
    const hasDismissedPrompt = sessionStorage.getItem('ios-install-prompt-dismissed');
    
    // If it's iOS and not running as standalone, show the prompt (even if they've installed and deleted)
    if (isIOS && !isStandalone && !hasDismissedPrompt) {
      // Delay showing the prompt to avoid interrupting initial app usage
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const closePrompt = () => {
    setShowPrompt(false);
    // Store dismissal in session storage
    sessionStorage.setItem('ios-install-prompt-dismissed', 'true');
  };
  
  // Add a link to the full install guide
  const viewInstallGuide = () => {
    window.location.href = '/install-guide';
    setShowPrompt(false);
  };
  
  if (!showPrompt) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <h3 className="font-bold text-lg mb-1">How to Install DotSpark</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Add this app to your home screen for a better experience.
          </p>
          <div className="flex space-x-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                <span className="text-sm">Tap <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs"><Share className="h-3 w-3 mr-1" /> Share</span> icon</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                <span className="text-sm">Choose <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs"><PlusCircle className="h-3 w-3 mr-1" /> Add to Home Screen</span></span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={closePrompt}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3">
        <Button 
          variant="default" 
          onClick={viewInstallGuide}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600"
        >
          <Download className="mr-2 h-4 w-4" />
          View Full Guide
        </Button>
      </div>
    </div>
  );
}