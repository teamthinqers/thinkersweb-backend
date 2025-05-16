import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { isRunningAsStandalone } from '@/lib/pwaUtils';

export function IosPwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    // Only show for iOS devices not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    
    // Create a session storage flag to prevent showing the prompt more than once per session
    const hasShownPrompt = sessionStorage.getItem('ios-install-prompt-shown');
    
    if (isIOS && !isStandalone && !hasShownPrompt) {
      // Delay showing the prompt to avoid interrupting initial app usage
      const timer = setTimeout(() => {
        setShowPrompt(true);
        sessionStorage.setItem('ios-install-prompt-shown', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const closePrompt = () => {
    setShowPrompt(false);
  };
  
  if (!showPrompt) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <h3 className="font-bold text-lg mb-1">Install DotSpark</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Add this app to your home screen for a better experience.
          </p>
          <div className="flex space-x-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                <span className="text-sm">Tap <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">Share</span> icon</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                <span className="text-sm">Choose <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">Add to Home Screen</span></span>
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
      <Button 
        variant="default" 
        onClick={closePrompt}
        className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-violet-600"
      >
        <Download className="mr-2 h-4 w-4" />
        Install Now
      </Button>
    </div>
  );
}